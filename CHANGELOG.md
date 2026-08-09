# Changelog

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
