# Implementation Status

Status is intentionally conservative.

| Module | Status | Notes |
|---|---|---|
| Executive dashboard | IMPLEMENTED & TESTED | Typed FastAPI summary with explicit offline fallback; fictional demo data labeled |
| Applicability engine | IMPLEMENTED & TESTED | Profile save + recalculation for initial DGA/PDPL/NCA/SAMA/ISO rules |
| Versioned regulatory data model | IMPLEMENTED NOT FULLY TESTED | SQL schema and immutable version structure; migration runner pending |
| Catalog files and validator | IMPLEMENTED & TESTED | Five starter records; detailed control imports pending |
| Universal control/evidence reuse model | IMPLEMENTED NOT FULLY TESTED | Schema, UI and tenant-aware API create/list/read metadata path; binary storage pending |
| RBAC | SCAFFOLDED | API role enforcement works; production identity provider absent |
| Tenant isolation | IMPLEMENTED & TESTED | API IDOR test plus PostgreSQL RLS policy definitions |
| Assessment scoring | SCAFFOLDED | Generic estimate only; framework-specific strategies pending |
| Gap/action workflow | IMPLEMENTED & TESTED | Tenant-scoped list/create/status API and interactive completion; database repository pending |
| Audit room | SCAFFOLDED | Read-only concept UI; export generation pending |
| AI evidence analysis | SCAFFOLDED | Provider-neutral endpoint enforces human approval; document/model provider pending |
| Evidence upload/storage/scanning | PLANNED | Metadata API only; no binary upload yet |
| Reports | IMPLEMENTED NOT FULLY TESTED | Tenant-scoped executive CSV export; PDF/Excel templates pending |
| Regulatory monitoring worker | PLANNED | Workflow documented; scheduler/connectors absent |
| Notifications/calendar | SCAFFOLDED | Corrective-action calendar UI/API; notifications and other event types pending |
| Arabic/English switching | SCAFFOLDED | Bilingual data model/UI labels; switch is not functional |
| Production authentication | BLOCKED | Identity provider and deployment choice required |
