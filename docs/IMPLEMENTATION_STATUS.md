# Implementation Status

Status is intentionally conservative.

| Module | Status | Notes |
|---|---|---|
| Executive dashboard | IMPLEMENTED & TESTED | Responsive command center with typed FastAPI summary, explicit offline fallback, executive trends, risk/workstream views, and fictional demo labeling |
| Applicability engine | IMPLEMENTED & TESTED | Profile save + recalculation for initial DGA/PDPL/NCA/SAMA/ISO rules |
| Versioned regulatory data model | IMPLEMENTED & TESTED | Durable zero-config SQLite workflow repository plus PostgreSQL 16 schema for multi-instance deployments |
| Catalog files and validator | IMPLEMENTED & TESTED | Five starter records; detailed control imports pending |
| Universal control/evidence reuse model | IMPLEMENTED & TESTED | Human-reviewed/authoritative mappings can contribute to tenant-scoped evidence coverage; AI/unverified mappings remain unapproved |
| RBAC | IMPLEMENTED NOT FULLY TESTED | Role enforcement plus configurable OIDC/JWKS bearer validation; external identity tenant still requires provisioning |
| Tenant isolation | IMPLEMENTED & TESTED | API IDOR test plus PostgreSQL RLS policy definitions |
| Assessment campaigns and scoring | IMPLEMENTED & TESTED | Persisted campaigns/responses plus weighted-status-v1 readiness, completeness, N/A exclusion, and explicit mandatory-control penalty |
| Gap/action workflow | IMPLEMENTED & TESTED | Tenant-scoped persisted gap lifecycle, overdue filter, linked action/dependency/completion-evidence fields, and audit events |
| Audit room | IMPLEMENTED NOT FULLY TESTED | Read-only UI plus tenant-scoped JSON audit package; signed archive/PDF export pending |
| AI evidence analysis | SCAFFOLDED | Provider-neutral endpoint enforces human approval; document/model provider pending |
| Evidence upload/storage/scanning | IMPLEMENTED & TESTED | Durable local object store, size/type limits, SHA-256 integrity, EICAR/executable rejection; deep ClamAV and hosted object storage remain optional production upgrades |
| Reports | IMPLEMENTED & TESTED | Tenant-scoped PDF, formatted Excel, CSV, and JSON audit exports |
| Regulatory monitoring worker | PLANNED | Workflow documented; scheduler/connectors absent |
| Notifications/calendar | IMPLEMENTED NOT FULLY TESTED | Corrective-action calendar plus overdue/upcoming notification API; outbound email/SMS provider pending |
| Arabic/English switching | IMPLEMENTED NOT FULLY TESTED | Persistent language/direction switch, bilingual shell, navigation, and reports workflow; remaining content-heavy pages still contain Arabic-first copy |
| Production authentication | IMPLEMENTED NOT PROVISIONED | Production rejects demo headers and validates OIDC/JWKS bearer tokens; issuer/audience and provider tenant must be configured |
