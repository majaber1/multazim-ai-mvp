# ملتزم | Multazim

Saudi Compliance Intelligence Platform — منصة الامتثال الذكية للمملكة

Multazim is a bilingual foundation for determining which Saudi regulatory frameworks likely apply to an organization, measuring readiness, reusing evidence across mapped controls, tracking gaps and actions, and preparing for audits. It does not claim complete Saudi regulatory coverage and does not present internal scores as regulator-issued results.

## Implemented in v0.2.0

- Explainable organization onboarding/applicability engine.
- Versioned regulatory catalog and structured JSON import format.
- Normalized PostgreSQL model with tenant-owned resources and RLS policies.
- API RBAC and tenant-IDOR protection for the initial evidence workflow.
- Executive dashboard, compliance universe, frameworks, evidence reuse, gaps/actions, matrix, audit room, and coverage views.
- Official-source register and explicit pending-verification states.
- Fictional bilingual demo organization and clearly labeled estimated scores.

See [implementation status](docs/IMPLEMENTATION_STATUS.md) for exact limitations.

## Local development

Requirements: Node.js 22+, Python 3.12+, or Docker Desktop.

```bash
npm install
npm run dev
```

Web: http://localhost:3000

API:

```bash
python -m venv .venv
.venv/Scripts/pip install -r apps/api/requirements.txt
.venv/Scripts/uvicorn app.main:app --app-dir apps/api --reload
```

API docs: http://localhost:8000/docs

Full stack:

```bash
docker compose up --build
```

## Verification

```bash
npm run build
python scripts/validate_catalog.py
python -m pytest apps/api/tests
```

## Production deployment

Build the web and API images from their Dockerfiles, provision PostgreSQL 16 with pgvector and Redis, run `infra/schema.sql` through a controlled migration process, configure an external OIDC identity provider, replace demo header authentication, configure strict origins and rate limits at the gateway, and connect S3-compatible storage with signed URLs plus malware scanning. Secrets must be supplied by the deployment platform and never committed.

Before production, complete every item marked `BLOCKED` or security-sensitive `PLANNED` in the implementation status.

## Important disclaimer

Multazim output is decision support, not legal advice, certification, or an official regulator score. AI suggestions must be approved by authorized human assessors.
