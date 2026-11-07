# Nexus Knowledge

Nexus Knowledge is a working MVP for an enterprise knowledge intelligence platform designed for Auron Mobility. The project is organized as a small monorepo with a SvelteKit frontend, a Spring Boot API layer, a FastAPI AI service, and Postgres-ready schema and seed assets.

## Architecture

- Frontend: SvelteKit + TypeScript + Tailwind + Lucide icons + Cytoscape-ready graph UI
- Backend: Spring Boot 3.3 + Java 21 + Spring Data JPA + REST API for projects, knowledge, and handover data
- AI Service: FastAPI + structured JSON extraction + deterministic mock LLM for demo mode
- Database: PostgreSQL + migration scripts and seed data
- Ops: Docker Compose for local orchestration and environment configuration

## Proposed structure

```text
.
├── apps/
│   └── frontend/             # SvelteKit UI
├── services/
│   ├── backend/              # Java Spring Boot REST API
│   └── ai/                   # Python FastAPI knowledge extraction service
├── db/
│   ├── migrations/           # SQL migration files
│   └── seed/                 # Seed SQL for demo data
├── scripts/
├── docker-compose.yml
├── .env.example
├── README.md
└── .gitignore
```

## Implementation phases

- Phase 1: project structure, data model, backend API, UI shell, dashboard, project explorer
- Phase 2: document upload, Jira mock connector, extraction AI service, sprint capture flow
- Phase 3: graph and RAG assistant, source-backed citations, knowledge explorer
- Phase 4: handover, gaps, security base and polished enterprise UX

## Local development

1. Copy `.env.example` to a real `.env` file and update credentials.
2. Start Postgres with Docker Compose.
3. Start the backend service.
4. Start the AI service.
5. Start the frontend app.

The demo is intentionally configured to work without hardcoded production secrets.
