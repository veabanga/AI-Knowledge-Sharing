# Nexus Knowledge

Nexus Knowledge is a browser-only MVP demonstrating cross-project engineering knowledge discovery and reuse. Its main workflow searches a curated fictional Auron Mobility dataset for prior problems, root causes, solutions, validation evidence and lessons.

All people, projects, issue identifiers, documents and engineering examples in the frontend demo are fictional. Search is a local prototype retrieval engine; it does not call an LLM, backend, database, external API or paid service.

## MVP architecture

- **Frontend:** SvelteKit, TypeScript, Tailwind CSS, Lucide icons and Cytoscape.js.
- **Demo knowledge:** Static JSON at `apps/frontend/src/lib/data/knowledge.json`.
- **Retrieval:** Browser-side weighted token search and synonym expansion in `apps/frontend/src/lib/search.ts`.
- **Saved investigation:** Browser LocalStorage.
- **Concept previews:** Knowledge Graph, Sprint Intelligence, People & Handover and planned integrations.
- **Future services retained:** `services/backend` (Spring Boot) and `services/ai` (FastAPI) remain in the repository but are not required to run or deploy this MVP. Database and Docker assets are likewise not used by the static frontend.

## Run locally

Requirements: Node.js 20.17 or newer and npm.

```powershell
cd apps/frontend
npm ci
npm run check
npm run dev
```

Open `http://localhost:4173`. No `.env` file, API key, database, Docker, Spring Boot or Python service is needed. To verify the production output locally:

```powershell
npm run build
npm run preview
```

## Deploy to GitHub Pages

The Git remote identifies this repository as `veabanga/AI-Knowledge-Sharing`; the Pages project base is `/AI-Knowledge-Sharing/`. The `deploy-pages.yml` workflow builds the site with that base and publishes `apps/frontend/build` when changes reach `main`.

1. Push the repository to GitHub.
2. In **Settings → Pages**, set **Build and deployment → Source** to **GitHub Actions**.
3. Ensure Actions are allowed to write Pages deployments (workflow permissions are declared in `.github/workflows/deploy-pages.yml`).
4. Push to `main` or run the **Deploy Nexus Knowledge to GitHub Pages** workflow manually.
5. Open `https://veabanga.github.io/AI-Knowledge-Sharing/`.

For a local build using the exact Pages base, set `GITHUB_PAGES=true` in the build environment. The workflow does this automatically. Client-side navigation and assets use SvelteKit's configured base path.

## Routes

- `/` — MVP overview and demo entry point.
- `/discovery/` — interactive knowledge search, filters, details, related records and saved investigation.
- `/graph/` — sample interactive knowledge graph.
- `/sprint-intelligence/` — fixed retrospective concept preview.
- `/people/` — fictional expertise and handover preview.
- `/integrations/` — planned integration concepts, not live connectors.

Legacy `/explorer/`, `/projects/` and `/assistant/` routes remain static and do not call backend services.
