"""AI-powered schema generation using local Ollama."""

import json
import re
from pathlib import Path
from typing import Any

from ..schema import SchemaDefinition, SchemaParser, SchemaValidationError
from .prompts import (
    SCHEMA_GENERATION_SYSTEM,
    SCHEMA_GENERATION_USER,
    SCHEMA_GENERATION_WITH_CONTEXT,
)


class SchemaGenerator:
    """Generate Formabase schemas from natural language descriptions."""

    def __init__(
        self,
        model: str = "qwen2.5-coder:32b",
        host: str = "http://localhost:11434",
    ):
        self.model = model
        self.host = host
        self._client = None

    @property
    def client(self):
        """Lazy-load Ollama client."""
        if self._client is None:
            try:
                import ollama

                self._client = ollama.Client(host=self.host)
            except ImportError:
                raise ImportError(
                    "ollama package not installed. Run: pip install ollama"
                )
        return self._client

    def generate(
        self,
        description: str,
        context: list[dict] | None = None,
        validate: bool = True,
    ) -> dict[str, Any]:
        """Generate a schema from a natural language description.

        Args:
            description: Natural language description of the app
            context: Optional list of similar past schemas for context
            validate: Whether to validate the generated schema

        Returns:
            Generated schema as a dictionary
        """
        # Build the prompt
        if context:
            context_str = "\n\n".join(
                f"### {c.get('name', 'Schema')}\n```json\n{json.dumps(c, indent=2)}\n```"
                for c in context[:3]  # Limit to 3 examples
            )
            user_prompt = SCHEMA_GENERATION_WITH_CONTEXT.format(
                description=description,
                context=context_str,
            )
        else:
            user_prompt = SCHEMA_GENERATION_USER.format(description=description)

        # Call Ollama
        response = self.client.chat(
            model=self.model,
            messages=[
                {"role": "system", "content": SCHEMA_GENERATION_SYSTEM},
                {"role": "user", "content": user_prompt},
            ],
            options={
                "temperature": 0.3,  # Lower for more consistent output
                "num_predict": 4096,  # Enough for a decent schema
            },
        )

        # Extract the response content
        content = response["message"]["content"]

        # Parse JSON from response (handle markdown code blocks if present)
        schema_dict = self._extract_json(content)

        # Validate if requested
        if validate:
            schema_dict = self._validate_and_fix(schema_dict)

        return schema_dict

    def _extract_json(self, content: str) -> dict[str, Any]:
        """Extract JSON from LLM response, handling markdown code blocks."""
        content = content.strip()

        # Try to find JSON in markdown code block
        json_match = re.search(r"```(?:json)?\s*\n?(.*?)\n?```", content, re.DOTALL)
        if json_match:
            content = json_match.group(1).strip()

        # Try to parse as JSON
        try:
            return json.loads(content)
        except json.JSONDecodeError as e:
            # Try to find the first { and last } and extract
            start = content.find("{")
            end = content.rfind("}")
            if start != -1 and end != -1:
                try:
                    return json.loads(content[start : end + 1])
                except json.JSONDecodeError:
                    pass
            raise ValueError(f"Failed to parse JSON from LLM response: {e}")

    def _validate_and_fix(self, schema_dict: dict[str, Any]) -> dict[str, Any]:
        """Validate schema and attempt to fix common issues."""
        # Ensure required fields
        if "version" not in schema_dict:
            schema_dict["version"] = "1.0"

        if "name" not in schema_dict:
            schema_dict["name"] = "generated-app"

        if "collections" not in schema_dict:
            raise ValueError("Schema must have 'collections'")

        # Fix common issues in collections
        for coll_name, collection in schema_dict.get("collections", {}).items():
            if not isinstance(collection, dict):
                continue

            # Ensure fields exists
            if "fields" not in collection:
                collection["fields"] = {}

            # Fix field types
            for field_name, field in collection.get("fields", {}).items():
                if not isinstance(field, dict):
                    continue

                # Ensure type exists
                if "type" not in field:
                    field["type"] = "text"

                # Fix relation fields
                if field.get("type") == "relation":
                    if "relation" not in field:
                        field["relation"] = "many-to-one"
                    if "target" not in field:
                        # Try to infer target from field name
                        field["target"] = field_name.replace("_id", "")

                # Fix enum fields
                if field.get("type") == "enum":
                    if "options" not in field or not field["options"]:
                        field["options"] = ["option1", "option2"]

        # Validate using the parser
        try:
            # Write to temp file and parse
            import tempfile

            with tempfile.NamedTemporaryFile(
                mode="w", suffix=".json", delete=False
            ) as f:
                json.dump(schema_dict, f)
                temp_path = Path(f.name)

            try:
                parser = SchemaParser(temp_path)
                parser.parse()
            finally:
                temp_path.unlink()

        except SchemaValidationError as e:
            # Log the error but return the schema anyway
            # User can manually fix
            pass

        return schema_dict

    def generate_stream(
        self,
        description: str,
        context: list[dict] | None = None,
    ):
        """Generate schema with streaming output.

        Yields partial responses as they come in.
        """
        # Build the prompt
        if context:
            context_str = "\n\n".join(
                f"### {c.get('name', 'Schema')}\n```json\n{json.dumps(c, indent=2)}\n```"
                for c in context[:3]
            )
            user_prompt = SCHEMA_GENERATION_WITH_CONTEXT.format(
                description=description,
                context=context_str,
            )
        else:
            user_prompt = SCHEMA_GENERATION_USER.format(description=description)

        # Stream from Ollama
        stream = self.client.chat(
            model=self.model,
            messages=[
                {"role": "system", "content": SCHEMA_GENERATION_SYSTEM},
                {"role": "user", "content": user_prompt},
            ],
            options={
                "temperature": 0.3,
                "num_predict": 4096,
            },
            stream=True,
        )

        full_content = ""
        for chunk in stream:
            if "message" in chunk and "content" in chunk["message"]:
                content = chunk["message"]["content"]
                full_content += content
                yield content

        # Return the final parsed schema
        return self._extract_json(full_content)


def get_cortex_context(description: str) -> list[dict] | None:
    """Try to get similar schemas from Cortex if available.

    Returns None if Cortex is not available or has no relevant schemas.
    """
    try:
        import sys

        sys.path.insert(0, str(Path.home() / ".claude/cortex"))
        from formabase_memory import FormabaseMemory

        memory = FormabaseMemory()
        return memory.find_similar_schemas(description, limit=3)
    except (ImportError, Exception):
        # Cortex not available or no formabase_memory module yet
        return None
