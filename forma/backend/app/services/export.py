"""Project Export Service"""
import io
import zipfile
import json
from typing import List

from app.db.models import Project, Component


class ExportService:
    """Export projects as downloadable code."""

    def export_nextjs(self, project: Project, components: List[Component]) -> bytes:
        """Export project as Next.js app."""
        buffer = io.BytesIO()

        with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
            # Package.json
            package_json = {
                "name": project.name.lower().replace(" ", "-"),
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
                    "react-dom": "^18"
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
            zf.writestr("package.json", json.dumps(package_json, indent=2))

            # next.config.js
            zf.writestr("next.config.js", "/** @type {import('next').NextConfig} */\nmodule.exports = {}\n")

            # tsconfig.json
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
            zf.writestr("tsconfig.json", json.dumps(tsconfig, indent=2))

            # Tailwind config
            tailwind_config = self._generate_tailwind_config(project.design_system)
            zf.writestr("tailwind.config.ts", tailwind_config)

            # PostCSS config
            zf.writestr("postcss.config.js", "module.exports = {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n}\n")

            # Global CSS
            zf.writestr("src/app/globals.css", "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n")

            # Layout
            layout = """import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '""" + project.name + """',
  description: 'Built with FORMA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
"""
            zf.writestr("src/app/layout.tsx", layout)

            # Page with components
            page = self._generate_page(components)
            zf.writestr("src/app/page.tsx", page)

            # Components
            for component in components:
                if component.code:
                    filename = f"src/components/{component.name}.tsx"
                    zf.writestr(filename, component.code)

        buffer.seek(0)
        return buffer.getvalue()

    def export_vite(self, project: Project, components: List[Component]) -> bytes:
        """Export project as Vite + React app."""
        buffer = io.BytesIO()

        with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
            # Package.json
            package_json = {
                "name": project.name.lower().replace(" ", "-"),
                "private": True,
                "version": "0.0.0",
                "type": "module",
                "scripts": {
                    "dev": "vite",
                    "build": "tsc && vite build",
                    "preview": "vite preview"
                },
                "dependencies": {
                    "react": "^18.2.0",
                    "react-dom": "^18.2.0"
                },
                "devDependencies": {
                    "@types/react": "^18.2.0",
                    "@types/react-dom": "^18.2.0",
                    "@vitejs/plugin-react": "^4.2.0",
                    "autoprefixer": "^10.4.16",
                    "postcss": "^8.4.32",
                    "tailwindcss": "^3.4.0",
                    "typescript": "^5.2.2",
                    "vite": "^5.0.0"
                }
            }
            zf.writestr("package.json", json.dumps(package_json, indent=2))

            # Vite config
            vite_config = """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
"""
            zf.writestr("vite.config.ts", vite_config)

            # index.html
            index_html = """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>""" + project.name + """</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
"""
            zf.writestr("index.html", index_html)

            # Main entry
            main_tsx = """import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
"""
            zf.writestr("src/main.tsx", main_tsx)

            # CSS
            zf.writestr("src/index.css", "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n")

            # Tailwind config
            tailwind_config = self._generate_tailwind_config(project.design_system)
            zf.writestr("tailwind.config.ts", tailwind_config)

            # PostCSS config
            zf.writestr("postcss.config.js", "export default {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n}\n")

            # App component
            app = self._generate_app(components)
            zf.writestr("src/App.tsx", app)

            # Components
            for component in components:
                if component.code:
                    filename = f"src/components/{component.name}.tsx"
                    zf.writestr(filename, component.code)

        buffer.seek(0)
        return buffer.getvalue()

    def _generate_tailwind_config(self, design_system: dict) -> str:
        """Generate Tailwind config from design system."""
        colors = design_system.get("colors", {})
        config = f"""import type {{ Config }} from 'tailwindcss'

const config: Config = {{
  content: [
    './src/**/*.{{js,ts,jsx,tsx,mdx}}',
    './app/**/*.{{js,ts,jsx,tsx,mdx}}',
  ],
  theme: {{
    extend: {{
      colors: {json.dumps(colors) if colors else '{}'},
    }},
  }},
  plugins: [],
}}

export default config
"""
        return config

    def _generate_page(self, components: List[Component]) -> str:
        """Generate Next.js page with components."""
        imports = []
        usage = []

        for comp in components:
            if comp.code:
                imports.append(f"import {comp.name} from '@/components/{comp.name}'")
                usage.append(f"      <{comp.name} />")

        return f"""{chr(10).join(imports)}

export default function Home() {{
  return (
    <main className="min-h-screen p-8">
{chr(10).join(usage) if usage else '      <p>No components yet</p>'}
    </main>
  )
}}
"""

    def _generate_app(self, components: List[Component]) -> str:
        """Generate Vite App component."""
        imports = []
        usage = []

        for comp in components:
            if comp.code:
                imports.append(f"import {comp.name} from './components/{comp.name}'")
                usage.append(f"      <{comp.name} />")

        return f"""{chr(10).join(imports)}

function App() {{
  return (
    <div className="min-h-screen p-8">
{chr(10).join(usage) if usage else '      <p>No components yet</p>'}
    </div>
  )
}}

export default App
"""


export_service = ExportService()
