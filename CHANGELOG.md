# Changelog

## 0.2.1 — 2026-08-11

- Added durable zero-configuration SQLite repositories for organizations, actions, evidence metadata, and audit events.
- Added local object storage with upload integrity and basic malware/executable signature rejection.
- Added PDF and formatted Excel executive reports alongside CSV and JSON exports.
- Added a source-status regulatory catalog API and bilingual report controls.
- Made PostgreSQL and Redis optional Docker Compose profiles for the single-container edition.

## 0.2.0 - 2026-08-08

- Repositioned the MVP as Multazim Saudi Compliance Intelligence Platform.
- Added explainable organization applicability API and UI.
- Added versioned regulatory knowledge, universal controls, evidence, gaps, risks, actions, audits, snapshots, audit log, and tenant RLS schema.
- Added structured regulatory catalog with official-source metadata and validation.
- Added executive, frameworks, evidence, gaps, compliance matrix, audit room, and regulatory updates views.
- Added RBAC/tenant isolation API tests and security response headers.
- Added current-state audit, source register, catalog, research backlog, and truthful implementation status.

### Operational workflow update

- Connected the executive dashboard to a typed FastAPI summary endpoint with an explicit offline demo fallback.
- Added organization profile update and saved applicability retrieval.
- Added tenant-scoped corrective-action list/create/status-update endpoints.
- Added evidence list API and interactive evidence metadata creation.
- Added live gap/action completion workflow and API connectivity indicators.
- Added executive CSV export, policy draft workflow, compliance calendar, tenant audit log, and human-gated evidence-analysis endpoint.
- Added production OIDC enforcement, environment-driven CORS/security configuration, binary evidence uploads with integrity hashes, framework-weighted scoring, notification and audit-package endpoints, a migration runner, and persistent Arabic/English navigation.
- Upgraded Next.js from vulnerable 15.2.4 to patched 15.5.23 and added a standalone web lockfile for deterministic Vercel builds.
- Rebuilt the executive dashboard as a responsive compliance command center with trend, framework, risk, workstream, priority-action, and production-readiness views; added active desktop navigation and a mobile navigation bar.
