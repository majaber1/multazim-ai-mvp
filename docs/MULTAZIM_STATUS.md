# Multazim Implementation Status

Updated: 2026-08-11

## Current release position

Multazim is a tested bilingual compliance MVP foundation. It is suitable for controlled demonstration, not yet for real multi-tenant production. See [MULTAZIM_AUDIT.md](MULTAZIM_AUDIT.md) for the evidence-backed gap analysis.

## Completed and verified workflows

- Arabic-first application shell with persistent English LTR mode.
- Executive dashboard and direct navigation across the current product routes.
- Explainable applicability results with non-authoritative classifications.
- Tenant-isolated evidence metadata/upload, hashing and role restrictions.
- Corrective-action listing/creation/status update in the API.
- Framework scoring strategy and assessment save flow.
- PDF, XLSX, CSV and audit-package exports.
- Catalog JSON validation and searchable/filterable catalog API metadata.
- Validated TGA transportation-app pilot journey with official source links, classified requirements and readiness calculation.
- Bilingual business-facing regulatory journey checklist with loading/error states and responsive layout.
- Docker configuration, production web build, API integration tests and GitHub CI.

## Partially implemented

- Regulatory catalog: five verified metadata records; broad Saudi/sector coverage and detailed licensed controls remain.
- Unified controls: schema and demo mappings exist; CRUD/review workflow remains.
- Assessments: scoring exists; persisted lifecycle and evidence/reviewer workflow remain.
- Evidence: secure basic workflow exists; rich metadata/history/relationship intelligence remain.
- Gaps/remediation: actions exist; findings, tasks, dependencies and review workflow remain.
- Dashboards: executive view exists; live role-based operator/auditor views remain.
- Bilingual UI: shell and primary workflows work; secondary module bodies need full English parity.

## Missing or externally blocked

- Persisted tenant journey progress, ownership, evidence links and regulator submission integration.
- Separate measurements/indicators engine and score history.
- Risk register/treatment and governance lifecycle modules.
- Policies, procedures, exceptions, approvals, certifications, KPIs and assets.
- Real OIDC identity and production user/session workflows.
- Hosted PostgreSQL, object storage and malware scanning.
- Real grounded AI/OCR, email, background jobs and regulatory ingestion.
- PostgreSQL RLS integration tests, browser E2E CI and automated accessibility testing.

## Technical architecture

- Web: Next.js App Router, React, TypeScript and Tailwind.
- API: FastAPI/Pydantic with tenant- and role-aware dependencies.
- Local data: SQLite and filesystem object storage.
- Production target: PostgreSQL/pgvector, S3-compatible object storage and external OIDC.
- Regulatory sources: version-controlled validated JSON metadata referencing official URLs.

## Latest test scope

- API: 14 integration tests after catalog and transportation-journey regression coverage.
- Web: TypeScript typecheck and optimized production build.
- Catalog: five JSON records validated.
- Configuration: Docker Compose validation and diff integrity.

## Deployment status

- Frontend production alias: https://multazim-ai-mvp-20262031.vercel.app
- API alias: https://multazim-api-20262031.vercel.app
- Vercel Standard Protection is enabled; URLs are not anonymously public.
- The feature branch remains unmerged to `main` pending explicit release authorization.

## Next priorities

1. Persist journey progress and evidence links per organization.
2. Data-driven catalog UI and typed catalog response contract.
3. Versioned migrations and regulatory instrument/requirement hierarchy.
4. Unified control library with reviewed mappings.
5. Persisted assessments and separate measurements engine.
6. Evidence lifecycle completion, then findings/remediation and risks/governance.
