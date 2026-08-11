# ملتزم | Multazim

Saudi Compliance, Governance & Measurement Platform — منصة الامتثال والحوكمة والقياس السعودية

Multazim is a bilingual foundation for determining which Saudi regulatory frameworks likely apply to an organization, measuring readiness, reusing evidence across mapped controls, tracking gaps and actions, and preparing for audits. It does not claim complete Saudi regulatory coverage and does not present internal scores as regulator-issued results.

## Implemented in v0.2.0

- Explainable organization onboarding/applicability engine.
- Versioned regulatory catalog and structured JSON import format.
- Normalized PostgreSQL model with tenant-owned resources and RLS policies.
- API RBAC and tenant-IDOR protection for the initial evidence workflow.
- Executive dashboard, compliance universe, frameworks, evidence reuse, gaps/actions, matrix, audit room, and coverage views.
- Official-source register and explicit pending-verification states.
- Business-facing regulatory journeys with sourced requirement classifications and readiness scoring.
- Fictional bilingual demo organization and clearly labeled estimated scores.

See [implementation status](docs/IMPLEMENTATION_STATUS.md) for exact limitations.
The current evidence-backed architecture and module gap analysis is maintained in
[the Multazim audit](docs/MULTAZIM_AUDIT.md), with the concise current roadmap in
[the Multazim status](docs/MULTAZIM_STATUS.md).

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

The default local API uses durable SQLite at `.data/multazim.db`; no database account or
separate database container is required. Uploaded evidence is stored under `.data/evidence`.
This is the simplest reliable setup for one server. For multiple API replicas, enable the
PostgreSQL profile or point `DATABASE_URL` at managed Neon/Supabase PostgreSQL.

Full stack:

```bash
docker compose up --build
```

Optional PostgreSQL/pgvector and Redis services:

```bash
docker compose --profile postgres --profile redis up --build
```

## Verification

```bash
npm run build
python scripts/validate_catalog.py
python scripts/validate_journeys.py
python -m pytest apps/api/tests
```

## Arabic, English, and RTL

The locale switch updates the document `lang` and `dir`, persists the choice locally, and uses Saudi locale formatting for dates and numbers. New interactive components should use `useLocale().tr(ar, en)`, logical CSS (`start/end`, `ms/me`, `ps/pe`, `border-e`), and `.technical-value` for URLs, identifiers, hashes, and code. Directional icons should only mirror when their meaning changes with reading direction.

The shared design tokens live in `apps/web/app/globals.css`. Product surfaces should use those brand, semantic status, border, focus, radius, shadow, and motion tokens rather than introducing new foundational hex colors.

## Production deployment

Build the web and API images from their Dockerfiles. SQLite plus a mounted volume is supported for a single API instance. Multi-instance production should use PostgreSQL 16 (Neon or Supabase free tiers are suitable starters), run `infra/schema.sql` through a controlled migration, and configure an external OIDC identity provider. Local object storage is supported for a single server; multi-instance deployments should use S3-compatible storage such as MinIO, Cloudflare R2, Supabase Storage, or Vercel Blob. Secrets must be supplied by the deployment platform and never committed.

Executive reports are available as PDF, Excel, and CSV from the Policies & Reports page and through `/v1/reports/executive.{pdf,xlsx,csv}`.

The first regulatory-journey pilot is available at `/journeys`. It models electronic taxi passenger-mediation as a TGA contract-based authorization, retains official source references, and deliberately marks unconfirmed PDPL, cybersecurity, and Nafath interpretations as suggested or requiring expert verification.

Before production, complete every item marked `BLOCKED` or security-sensitive `PLANNED` in the implementation status.

## Important disclaimer

Multazim output is decision support, not legal advice, certification, or an official regulator score. AI suggestions must be approved by authorized human assessors.
