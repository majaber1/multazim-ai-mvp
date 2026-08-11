# Implementation Status

Status is intentionally conservative.

| Module | Status | Notes |
|---|---|---|
| Executive dashboard | IMPLEMENTED & TESTED | Responsive command center with typed FastAPI summary, explicit offline fallback, executive trends, risk/workstream views, and fictional demo labeling |
| Applicability engine | IMPLEMENTED & TESTED | Profile save + recalculation for initial DGA/PDPL/NCA/SAMA/ISO rules |
| Versioned regulatory data model | IMPLEMENTED NOT FULLY TESTED | SQL schema, immutable version structure, and controlled migration runner; hosted database provisioning pending |
| Catalog files and validator | IMPLEMENTED & TESTED | Five starter records; detailed control imports pending |
| Universal control/evidence reuse model | IMPLEMENTED NOT FULLY TESTED | Schema, UI and tenant-aware API create/list/read metadata path; binary storage pending |
| RBAC | IMPLEMENTED NOT FULLY TESTED | Role enforcement plus configurable OIDC/JWKS bearer validation; external identity tenant still requires provisioning |
| Tenant isolation | IMPLEMENTED & TESTED | API IDOR test plus PostgreSQL RLS policy definitions |
| Assessment scoring | IMPLEMENTED NOT FULLY TESTED | Weighted strategies for initial DGA/PDPL/NCA/ISO answer domains plus equal-weight fallback |
| Gap/action workflow | IMPLEMENTED & TESTED | Tenant-scoped list/create/status API and interactive completion; database repository pending |
| Audit room | IMPLEMENTED NOT FULLY TESTED | Read-only UI plus tenant-scoped JSON audit package; signed archive/PDF export pending |
| AI evidence analysis | SCAFFOLDED | Provider-neutral endpoint enforces human approval; document/model provider pending |
| Evidence upload/storage/scanning | IMPLEMENTED NOT FULLY TESTED | Validated binary upload, size/type limits and SHA-256 integrity; hosted object storage and malware scanner provisioning pending |
| Reports | IMPLEMENTED NOT FULLY TESTED | Tenant-scoped executive CSV export; PDF/Excel templates pending |
| Regulatory monitoring worker | PLANNED | Workflow documented; scheduler/connectors absent |
| Notifications/calendar | IMPLEMENTED NOT FULLY TESTED | Corrective-action calendar plus overdue/upcoming notification API; outbound email/SMS provider pending |
| Arabic/English switching | IMPLEMENTED NOT FULLY TESTED | Persistent language/direction switch and bilingual application shell; page-level English copy remains partial |
| Production authentication | IMPLEMENTED NOT PROVISIONED | Production rejects demo headers and validates OIDC/JWKS bearer tokens; issuer/audience and provider tenant must be configured |
