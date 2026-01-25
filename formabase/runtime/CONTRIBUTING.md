# Contributing to Forma Runtime

Thank you for your interest in contributing to Forma Runtime! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## Getting Started

### Prerequisites

- Python 3.11 or higher
- Git

### Development Setup

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/forma.git
   cd forma/formabase/runtime
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install development dependencies:
   ```bash
   pip install -e ".[dev]"
   pip install "bcrypt>=4.0.0,<4.1.0"  # Pin for passlib compatibility
   ```

4. Run tests to verify setup:
   ```bash
   pytest tests/ -v
   ```

## Development Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation changes
- `refactor/description` - Code refactoring
- `test/description` - Test additions or changes

### Making Changes

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature
   ```

2. Make your changes, following the code style guidelines below.

3. Add tests for new functionality.

4. Run the test suite:
   ```bash
   pytest tests/ -v
   ```

5. Run linting:
   ```bash
   ruff check forma_runtime/
   ruff format forma_runtime/
   ```

6. Commit your changes:
   ```bash
   git commit -m "feat: add your feature description"
   ```

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Code style (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Pull Requests

1. Push your branch:
   ```bash
   git push origin feature/your-feature
   ```

2. Open a Pull Request against `main`.

3. Fill out the PR template with:
   - Description of changes
   - Related issues
   - Testing performed

4. Wait for CI checks to pass.

5. Address review feedback.

## Code Style

### Python

- Follow PEP 8
- Use type hints
- Maximum line length: 100 characters
- Use ruff for formatting and linting

### Documentation

- Add docstrings to all public functions and classes
- Update README.md if adding new features
- Update CHANGELOG.md for notable changes

### Testing

- Write tests for new functionality
- Maintain or improve test coverage
- Use pytest fixtures for test setup
- Use meaningful test names that describe the expected behavior

## Project Structure

```
forma_runtime/
├── api/              # REST API router generation
├── auth/             # Authentication (JWT, OAuth)
├── cli/              # Command-line interface
├── db/               # Database models and migrations
├── graphql/          # GraphQL schema generation
├── hooks/            # Hook system for CRUD customization
├── schema/           # Schema parsing and types
├── storage/          # File storage backends
├── ai/               # AI-powered schema validation
├── admin/            # Admin UI routes
├── config.py         # Configuration settings
├── main.py           # FastAPI application
└── registry.py       # Multi-tenant registry
```

## Testing

### Running Tests

```bash
# All tests
pytest tests/ -v

# Specific test file
pytest tests/test_schema/test_parser.py -v

# With coverage
pytest tests/ --cov=forma_runtime --cov-report=term
```

### Writing Tests

- Place tests in the `tests/` directory
- Mirror the source structure (e.g., `forma_runtime/api/` -> `tests/test_api/`)
- Use fixtures from `conftest.py` for common setup
- Mark async tests with `@pytest.mark.asyncio`

## Reporting Issues

### Bug Reports

Include:
- Python version
- Operating system
- Steps to reproduce
- Expected behavior
- Actual behavior
- Error messages/stack traces

### Feature Requests

Include:
- Use case description
- Proposed solution (if any)
- Alternatives considered

## Getting Help

- Open a GitHub issue for bugs or feature requests
- Check existing issues before creating new ones
- Join discussions in issue comments

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
