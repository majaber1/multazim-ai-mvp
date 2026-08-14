# Product Audit

Baseline captured on 2026-08-11 from `feat/bilingual-ux-production-hardening`, based on commit `da8c028`.

## Architecture

- Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 3 frontend.
- FastAPI/Pydantic backend with SQLite single-instance persistence and an optional PostgreSQL 16/pgvector schema.
- Development header authentication; production OIDC/JWKS validation and tenant-aware RBAC.
- Local evidence object store with integrity/type/signature checks; S3-compatible production provider not provisioned.
- Vercel web and FastAPI demo deployments; Docker Compose is the complete local runtime.

## Baseline verification

The inherited branch passed 12 API tests, five catalog validations, TypeScript, and a Next.js production build. The live frontend was available behind Vercel Standard Protection. Page-level English coverage, action-state consistency, and several primary actions remained incomplete.

| Module | User purpose | Baseline status | Missing or broken behavior | Root cause | Selected resolution | Verification evidence |
|---|---|---|---|---|---|---|
| Product shell | Navigate and understand context | Partial | Fixed-width navigation, no command search, incomplete header hierarchy | Bespoke early MVP shell | Tokenized collapsible shell, breadcrumbs, search, notifications, user context | TypeScript + browser viewports |
| Localization | Use the product in Arabic or English | Partial | Shell translated but page content mixed | Small exact-string dictionary | Pair-based `tr`, localized dates/numbers, document `lang/dir`, bilingual critical workflows | Arabic/English browser pass |
| Assessment | Record readiness answers | Broken primary action | Save button did nothing | UI-only MVP | Real local API request with disabled/loading/success/error states | Route smoke test |
| Audit room | Prepare evidence package | Broken primary action | Export button did nothing | API was not wired to UI | Download tenant audit JSON with visible failure state | API test + browser smoke |
| Website audit | Check public website readiness | Misleading | Generated fixed findings without scanner integration | Placeholder UI | Validate request through API and explicitly report connector limitation; no fake findings | Browser/API smoke |
| Compliance scope | Determine applicable frameworks | Working with dependency | Requires running/authenticated API | External deployment protection/OIDC | Preserve secure behavior and surface actionable error | API tests |
| Evidence | Upload and reuse artifacts | Working locally | Hosted object storage and deep AV absent | External provider not provisioned | Durable local store plus explicit production limitation | Upload test |
| Gaps/actions | Track remediation | Working with fallback | Cloud writes blocked when API protection/auth unavailable | External identity/provider configuration | Preserve transparent fallback; never report fake save | API tests |
| Reports | Export management evidence | Working | Public Vercel API protected | Hobby Standard Protection | PDF/XLSX/CSV locally and authenticated deployment; document custom-domain/backend requirement | Export tests |
| Authentication | Secure tenants and roles | Implemented, not provisioned | No registration/recovery UI or real IdP tenant | Missing external issuer/client credentials | Keep production fail-closed OIDC; document Clerk/Entra/Auth0/Keycloak inputs | Unauthorized/RBAC tests |
| Regulatory content | Explain source and applicability | Starter catalog | Detailed licensed control text incomplete | Source/licensing verification required | Preserve five validated source records and explicit verification state | Catalog validator |
| AI analysis | Suggest evidence adequacy | Scaffolded | No model/document extraction provider | Missing key and OCR/extraction pipeline | Retain human-approval contract; no fabricated AI result | API safety test |

## Security and dependency note

`npm audit` reports three high-severity transitive advisories in Next.js-bundled PostCSS and Sharp. npm only offers Next.js 16.3 as a semver-major fix. This release does not perform that unscoped framework migration; it is a documented follow-up requiring its own compatibility test cycle.
