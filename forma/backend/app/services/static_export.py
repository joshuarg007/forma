"""Static Export Service for Forma Hosting

Generates deployable static sites from projects.
This extends the basic export service with:
- Next.js static export configuration
- Multi-page support
- Canvas component rendering
- SPA routing support
"""
import json
import re
from typing import Dict, List, Any, Optional
from pathlib import Path

from app.db.models import Project, Page


class StaticExportService:
    """
    Generate deployable static sites from Forma projects.

    This service creates a complete static site that can be deployed
    to Cloudflare Pages or any static hosting provider.
    """

    def generate_files(
        self,
        project: Project,
        pages: List[Page],
        design_system: Optional[Dict] = None,
        env_vars: Optional[Dict[str, str]] = None
    ) -> Dict[str, bytes]:
        """
        Generate all files needed for a static deployment.

        Args:
            project: The project to export
            pages: List of pages to include
            design_system: Design system settings (optional, uses project.design_system if not provided)
            env_vars: Environment variables to embed

        Returns:
            Dict mapping file paths to file contents (as bytes)
        """
        files: Dict[str, bytes] = {}
        design = design_system or project.design_system or {}
        project_slug = self._slugify(project.name)

        # Package.json
        files["package.json"] = self._generate_package_json(project_slug).encode()

        # Next.js config with static export
        files["next.config.js"] = self._generate_next_config().encode()

        # TypeScript config
        files["tsconfig.json"] = self._generate_tsconfig().encode()

        # Tailwind config
        files["tailwind.config.ts"] = self._generate_tailwind_config(design).encode()

        # PostCSS config
        files["postcss.config.js"] = b'module.exports = {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n}\n'

        # Global CSS
        files["src/app/globals.css"] = self._generate_global_css().encode()

        # Root layout
        files["src/app/layout.tsx"] = self._generate_root_layout(project, pages).encode()

        # Generate pages
        for page in pages:
            if page.is_homepage:
                # Homepage goes to src/app/page.tsx
                files["src/app/page.tsx"] = self._generate_page_component(page, design).encode()
            else:
                # Other pages go to src/app/[slug]/page.tsx
                slug = page.slug or self._slugify(page.name)
                files[f"src/app/{slug}/page.tsx"] = self._generate_page_component(page, design).encode()

        # Generate component library (reusable components from canvas)
        component_registry = self._generate_component_registry()
        files["src/components/registry.tsx"] = component_registry.encode()

        # Environment file (if any)
        if env_vars:
            env_content = "\n".join([f"{k}={v}" for k, v in env_vars.items()])
            files[".env.local"] = env_content.encode()

        # _redirects for SPA routing (Cloudflare Pages)
        files["public/_redirects"] = self._generate_redirects(pages).encode()

        # Robots.txt
        files["public/robots.txt"] = b"User-agent: *\nAllow: /\n"

        return files

    def _slugify(self, text: str) -> str:
        """Convert text to URL-safe slug."""
        slug = text.lower()
        slug = re.sub(r'[^a-z0-9]+', '-', slug)
        slug = slug.strip('-')
        return slug or 'untitled'

    def _generate_package_json(self, name: str) -> str:
        """Generate package.json for the static site."""
        package = {
            "name": name,
            "version": "0.1.0",
            "private": True,
            "scripts": {
                "dev": "next dev",
                "build": "next build",
                "start": "next start",
                "lint": "next lint"
            },
            "dependencies": {
                "next": "14.1.0",
                "react": "^18",
                "react-dom": "^18",
                "framer-motion": "^11.0.0",
                "lucide-react": "^0.300.0"
            },
            "devDependencies": {
                "@types/node": "^20",
                "@types/react": "^18",
                "@types/react-dom": "^18",
                "autoprefixer": "^10.0.1",
                "postcss": "^8",
                "tailwindcss": "^3.3.0",
                "typescript": "^5"
            }
        }
        return json.dumps(package, indent=2)

    def _generate_next_config(self) -> str:
        """Generate Next.js config for static export."""
        return '''/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig
'''

    def _generate_tsconfig(self) -> str:
        """Generate TypeScript configuration."""
        tsconfig = {
            "compilerOptions": {
                "target": "es5",
                "lib": ["dom", "dom.iterable", "esnext"],
                "allowJs": True,
                "skipLibCheck": True,
                "strict": True,
                "noEmit": True,
                "esModuleInterop": True,
                "module": "esnext",
                "moduleResolution": "bundler",
                "resolveJsonModule": True,
                "isolatedModules": True,
                "jsx": "preserve",
                "incremental": True,
                "paths": {"@/*": ["./src/*"]}
            },
            "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
            "exclude": ["node_modules"]
        }
        return json.dumps(tsconfig, indent=2)

    def _generate_tailwind_config(self, design_system: Dict) -> str:
        """Generate Tailwind config from design system."""
        colors = design_system.get("colors", {})

        # Build extended colors object
        extended_colors = {}
        for key, value in colors.items():
            if isinstance(value, str):
                extended_colors[key] = value
            elif isinstance(value, dict):
                extended_colors[key] = value

        return f'''import type {{ Config }} from 'tailwindcss'

const config: Config = {{
  content: [
    './src/**/*.{{js,ts,jsx,tsx,mdx}}',
    './app/**/*.{{js,ts,jsx,tsx,mdx}}',
  ],
  theme: {{
    extend: {{
      colors: {json.dumps(extended_colors, indent=8) if extended_colors else '{}'},
    }},
  }},
  plugins: [],
}}

export default config
'''

    def _generate_global_css(self) -> str:
        """Generate global CSS with Tailwind directives."""
        return '''@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
'''

    def _generate_root_layout(self, project: Project, pages: List[Page]) -> str:
        """Generate the root layout with navigation."""
        # Find homepage for metadata
        homepage = next((p for p in pages if p.is_homepage), pages[0] if pages else None)

        meta_title = homepage.meta_title if homepage and homepage.meta_title else project.name
        meta_description = homepage.meta_description if homepage and homepage.meta_description else f"Built with FORMA"

        # Generate navigation links
        nav_pages = [p for p in pages if p.show_in_nav]
        nav_links = []
        for p in nav_pages:
            label = p.nav_label or p.name
            href = "/" if p.is_homepage else f"/{p.slug or self._slugify(p.name)}"
            nav_links.append(f'            <a href="{href}" className="text-gray-600 hover:text-gray-900 transition">{label}</a>')

        nav_html = "\n".join(nav_links) if nav_links else ""

        return f'''import './globals.css'
import type {{ Metadata }} from 'next'
import Link from 'next/link'

export const metadata: Metadata = {{
  title: '{meta_title}',
  description: '{meta_description}',
}}

export default function RootLayout({{
  children,
}}: {{
  children: React.ReactNode
}}) {{
  return (
    <html lang="en">
      <body>
        {{/* Navigation */}}
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <a href="/" className="text-xl font-bold text-gray-900">{project.name}</a>
              <div className="flex gap-6">
{nav_html}
              </div>
            </div>
          </div>
        </nav>

        {{/* Main content */}}
        <main>
          {{children}}
        </main>
      </body>
    </html>
  )
}}
'''

    def _generate_page_component(self, page: Page, design_system: Dict) -> str:
        """Generate a page component from canvas components."""
        canvas_components = page.canvas_components or []

        # Generate metadata
        meta_title = page.meta_title or page.name
        meta_description = page.meta_description or ""

        metadata_export = f'''export const metadata = {{
  title: '{meta_title}',
  description: '{meta_description}',
}}

'''

        # Generate component rendering
        if not canvas_components:
            return f'''{metadata_export}export default function Page() {{
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">This page is empty</p>
    </div>
  )
}}
'''

        # Render canvas components
        rendered_components = self._render_canvas_components(canvas_components, design_system)

        return f'''{metadata_export}export default function Page() {{
  return (
    <div className="min-h-screen">
{rendered_components}
    </div>
  )
}}
'''

    def _render_canvas_components(
        self,
        components: List[Dict],
        design_system: Dict,
        indent: int = 6
    ) -> str:
        """Render canvas components to JSX."""
        rendered = []
        spacing = " " * indent

        for comp in components:
            comp_type = comp.get("type", "unknown")
            comp_id = comp.get("id", "")
            styles = comp.get("styles", {})
            content = comp.get("content", {})
            children = comp.get("children", [])

            # Get component HTML/JSX based on type
            jsx = self._render_component(comp_type, comp_id, styles, content, design_system)

            # Handle nested children
            if children:
                child_jsx = self._render_canvas_components(children, design_system, indent + 2)
                # Insert children into component
                if "{children}" in jsx:
                    jsx = jsx.replace("{children}", child_jsx)

            rendered.append(f"{spacing}{jsx}")

        return "\n".join(rendered)

    def _render_component(
        self,
        comp_type: str,
        comp_id: str,
        styles: Dict,
        content: Dict,
        design_system: Dict
    ) -> str:
        """Render a single component to JSX based on its type."""
        # Build className from styles
        classes = self._styles_to_classes(styles)

        # Component type mapping
        component_map = {
            # Layout
            "section": f'<section key="{comp_id}" className="py-16 px-4 {classes}">{{children}}</section>',
            "container": f'<div key="{comp_id}" className="max-w-7xl mx-auto px-4 {classes}">{{children}}</div>',
            "grid-2col": f'<div key="{comp_id}" className="grid grid-cols-1 md:grid-cols-2 gap-8 {classes}">{{children}}</div>',
            "grid-3col": f'<div key="{comp_id}" className="grid grid-cols-1 md:grid-cols-3 gap-6 {classes}">{{children}}</div>',
            "grid-4col": f'<div key="{comp_id}" className="grid grid-cols-1 md:grid-cols-4 gap-4 {classes}">{{children}}</div>',
            "flex-row": f'<div key="{comp_id}" className="flex flex-row gap-4 {classes}">{{children}}</div>',
            "flex-col": f'<div key="{comp_id}" className="flex flex-col gap-4 {classes}">{{children}}</div>',

            # Text
            "heading": f'<h2 key="{comp_id}" className="text-3xl font-bold {classes}">{content.get("text", "Heading")}</h2>',
            "subheading": f'<h3 key="{comp_id}" className="text-xl font-semibold {classes}">{content.get("text", "Subheading")}</h3>',
            "paragraph": f'<p key="{comp_id}" className="text-gray-600 {classes}">{content.get("text", "Paragraph text")}</p>',
            "text": f'<span key="{comp_id}" className="{classes}">{content.get("text", "Text")}</span>',

            # Interactive
            "button": f'<button key="{comp_id}" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition {classes}">{content.get("text", "Button")}</button>',
            "link": f'<a key="{comp_id}" href="{content.get("href", "#")}" className="text-blue-600 hover:underline {classes}">{content.get("text", "Link")}</a>',

            # Media
            "image": f'<img key="{comp_id}" src="{content.get("src", "/placeholder.jpg")}" alt="{content.get("alt", "")}" className="w-full h-auto {classes}" />',

            # Cards
            "card": f'''<div key="{comp_id}" className="bg-white rounded-xl shadow-lg p-6 {classes}">
        <h3 className="text-xl font-semibold mb-2">{content.get("title", "Card Title")}</h3>
        <p className="text-gray-600">{content.get("description", "Card description")}</p>
      </div>''',

            # Hero sections
            "hero-simple": f'''<section key="{comp_id}" className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white {classes}">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">{content.get("title", "Welcome")}</h1>
          <p className="text-xl text-gray-600 mb-8">{content.get("subtitle", "Your subtitle here")}</p>
          <button className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            {content.get("cta", "Get Started")}
          </button>
        </div>
      </section>''',

            # Spacers
            "spacer-sm": f'<div key="{comp_id}" className="h-4 {classes}"></div>',
            "spacer-md": f'<div key="{comp_id}" className="h-8 {classes}"></div>',
            "spacer-lg": f'<div key="{comp_id}" className="h-16 {classes}"></div>',
            "spacer-xl": f'<div key="{comp_id}" className="h-32 {classes}"></div>',

            # Dividers
            "divider": f'<hr key="{comp_id}" className="border-gray-200 my-8 {classes}" />',
        }

        # Return mapped component or generic div
        return component_map.get(
            comp_type,
            f'<div key="{comp_id}" className="p-4 {classes}">{{children}}</div>'
        )

    def _styles_to_classes(self, styles: Dict) -> str:
        """Convert style object to Tailwind classes."""
        classes = []

        # Background
        if bg := styles.get("backgroundColor"):
            if bg.startswith("#"):
                classes.append(f"bg-[{bg}]")
            else:
                classes.append(f"bg-{bg}")

        # Text color
        if color := styles.get("color"):
            if color.startswith("#"):
                classes.append(f"text-[{color}]")
            else:
                classes.append(f"text-{color}")

        # Padding
        if padding := styles.get("padding"):
            classes.append(f"p-{padding}")
        if pt := styles.get("paddingTop"):
            classes.append(f"pt-{pt}")
        if pb := styles.get("paddingBottom"):
            classes.append(f"pb-{pb}")
        if pl := styles.get("paddingLeft"):
            classes.append(f"pl-{pl}")
        if pr := styles.get("paddingRight"):
            classes.append(f"pr-{pr}")

        # Margin
        if margin := styles.get("margin"):
            classes.append(f"m-{margin}")

        # Border radius
        if radius := styles.get("borderRadius"):
            classes.append(f"rounded-{radius}")

        # Width
        if width := styles.get("width"):
            if width == "full":
                classes.append("w-full")
            else:
                classes.append(f"w-[{width}]")

        return " ".join(classes)

    def _generate_component_registry(self) -> str:
        """Generate a component registry for dynamic rendering."""
        return '''// Component Registry
// This file provides reusable component definitions

export const componentStyles = {
  heading: "text-3xl font-bold",
  subheading: "text-xl font-semibold",
  paragraph: "text-gray-600 leading-relaxed",
  button: "px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition",
  card: "bg-white rounded-xl shadow-lg p-6",
  section: "py-16 px-4",
  container: "max-w-7xl mx-auto px-4",
}

export const containerTypes = [
  "section",
  "container",
  "grid-2col",
  "grid-3col",
  "grid-4col",
  "flex-row",
  "flex-col",
]
'''

    def _generate_redirects(self, pages: List[Page]) -> str:
        """Generate _redirects file for SPA routing."""
        # For static export, we don't need complex redirects
        # Just handle 404 -> index for SPA fallback
        return "/* /index.html 200\n"


# Singleton instance
static_export_service = StaticExportService()
