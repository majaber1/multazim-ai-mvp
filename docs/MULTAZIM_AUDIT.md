# Multazim Repository Audit

Audit date: 2026-08-11  
Scope: current `feat/bilingual-ux-production-hardening` implementation  
Product: **ملتزم | Multazim — منصة الامتثال والحوكمة والقياس السعودية**

## Executive conclusion

The repository is a credible bilingual MVP foundation, not a complete GRC platform. It already contains a usable dashboard shell, explainable applicability rules, tenant-aware API paths, evidence upload/hashing, remediation actions, exports, a five-record official-source catalog, a normalized PostgreSQL target schema, and automated API/build checks. The most important architectural issue is a gap between the broad relational target schema and the smaller set of models/workflows actually implemented by FastAPI and the UI.

No useful work should be replaced. Expansion should proceed through versioned migrations and tested API/UI slices, beginning with catalog normalization and unified controls, then assessments/measurements, then risks/governance.

## Repository and architecture

- Frontend: Next.js 15 App Router, React 19, TypeScript, Tailwind; Arabic-first locale context and shared application shell.
- Backend: FastAPI with Pydantic validation, role checks, tenant headers in development, OIDC validation path for production.
- Local persistence: SQLite model/event stores and filesystem evidence storage.
- Production target: PostgreSQL/pgvector schema, S3-compatible object storage, external OIDC.
- Catalog: version-controlled JSON records validated by `scripts/validate_catalog.py`.
- Deployment: separate Vercel frontend and FastAPI projects; Docker Compose also supports local/full-stack operation.
- Tests: API integration suite covers tenant isolation, RBAC, applicability, evidence, scoring, exports, and audit behavior. Frontend currently relies on typecheck/build plus manual browser QA.

## Architecture coverage

| Product layer | Current implementation | Status | Principal gap |
|---|---|---|---|
| Regulatory Catalog | Five validated metadata records; catalog API | Partial | Normalized CRUD/version workflow, categories, domains/requirements, broader verified coverage |
| Measurements & Indicators | DGA metadata and dashboard score examples | Missing workflow | Separate measurement model, weighted criteria, submissions, score history |
| Assessments | Simple six-question web assessment and scoring endpoint | Partial | Persisted reusable assessments/responses, reviewers, approvals, evidence links |
| Evidence | Metadata creation, secure file allowlist/size limit, hashing, storage abstraction, tenant isolation | Partial | Rich evidence types, validity/review history, multiple relationship links, duplicate/expiry workflows |
| Gaps & Remediation | Tenant-scoped corrective actions and status updates | Partial | Persisted findings/gaps, tasks, dependencies, review workflow, overdue dashboard |
| Risk & Governance | Target SQL tables; draft policy endpoint | Mostly missing | Risk register/treatment, policy/procedure lifecycle, exceptions, approvals, ownership UI/API |
| AI Intelligence | Honest evidence suggestion stub requiring human approval | Blocked | Authorized model, grounded retrieval, source citations, failure/rate-limit tests |
| Dashboards | Strong executive dashboard and operator navigation | Partial | Role-specific operator/auditor workspaces backed by live persisted aggregates |
| Licenses & Regulatory Journeys | Sourced pilot journey, checklist API and readiness UI | Partial | Persisted organization journeys, ownership/evidence links, additional verified business activities |

## GRC hierarchy assessment

The PostgreSQL target distinguishes regulators, frameworks, versions, domains, controls, evidence requirements, universal controls, assessments, responses, evidence, risks, gaps, corrective actions, audits, snapshots, business activities, licenses, regulatory journeys, journey requirements and organization journey progress. It does **not yet fully model** laws, regulations, standards as distinct typed resources, policies, procedures, assets, findings, measurements, indicators, KPIs, certifications, exceptions, approvals, remediation tasks, or relationship history.

Recommended hierarchy additions:

1. `regulatory_instruments` with typed `law | regulation | policy | framework | standard` and parent/version relationships.
2. `requirements` separated from implementation-oriented `controls`.
3. `measurements`, `measurement_sections`, `measurement_dimensions`, `measurement_criteria`, `measurement_results` and score snapshots.
4. `policies`, `procedures`, `assets`, `findings`, `certifications`, `exceptions`, `approvals`, `kpis`, `remediation_tasks`.
5. Typed link tables with source, rationale, confidence, approval state, created-by and reviewed-by history.

## Current modules and verified gaps

### Regulatory catalog

Current: NCA ECC, NCA CCC, DGA Qiyas, SDAIA PDPL and ISO 27001 metadata from official URLs. JSON schema and uniqueness/source validation exist.

Gap found and fixed during this audit: the API read nonexistent `source_url` and `verification_status` keys instead of the catalog's `official_source` and `status`. The endpoint now returns correct official sources, facts, control counts, and supports bounded search plus regulator/status filtering.

Still missing: NDMO, CST, SAMA, CMA, HCIS, sector-specific catalogs and Saudi Aramco requirements where legitimately applicable. They must be added only from verified/licensed material; names alone are not evidence of coverage.

### Applicability

Current: explainable rules for government/DGA, PDPL, SAMA, CMA, cloud and selected frameworks. Results distinguish mandatory, likely, conditional, voluntary, not applicable and needs review.

Gaps: organization size, service inventory, healthcare/telecom/financial activities and geographic scope are not first-class profile fields; no persisted human confirmation/override history is exposed through UI.

### Unified controls

Current: SQL model and three frontend examples (`UC-*`), with framework mapping and confidence concept in the schema.

Gaps: no unified-control CRUD API, no mapping rationale, no approval workflow, no authoritative/expert/AI mapping review UI, and no persisted evidence-reuse calculation.

### Licenses and regulatory journeys

Current: a separate relational journey model, validated JSON source format, listing/detail/readiness APIs, and bilingual checklist UI now exist. The first pilot covers electronic mediation in taxi passenger transportation using the current TGA regulation, TGA license-service page and Logisti channel. Confirmed items retain article/service references; PDPL linkage is explicitly suggested, and cybersecurity/Nafath scope is explicitly marked for expert verification.

Gaps: checklist progress is calculated but not yet persisted per tenant; owners, blockers and evidence links exist only in the target schema; no submission API or regulator integration is claimed. Additional journeys require the same official-source review before publication.

### Evidence

Current: PDF/PNG/JPEG/CSV/XLSX upload, 10 MB limit, SHA-256, classification, storage/scanner abstraction, tenant isolation and human-review state.

Gaps: Word support, owner/source/type/validity/expiry fields in the active API model, review history, links to assessments/risks/remediation, duplicate detection workflow, expiry alerts, quality review UI. Production object storage and malware scanning are external blockers.

### Assessments and measurements

Current: browser questionnaire and framework-aware score method; target SQL has assessments/responses.

Gaps: active API does not persist assessment instances/responses. Measurements are not separated from controls and lack weighted hierarchy, evidence readiness and trend storage. These are the next major data-model slice after catalog/unified controls.

### Gaps, risks and governance

Current: corrective actions and status transitions; basic draft-policy response; SQL placeholders for risks and gaps.

Gaps: findings are not first-class; risk register and treatments have no API/UI; policies/procedures/exceptions/approvals and governance responsibilities are absent; action tasks/dependencies/expected improvement are absent.

### Dashboards and UX

Current: premium shared shell, executive dashboard, mobile navigation, command search, notifications, clear demo labels, Arabic RTL and persistent English LTR shell/primary workflows.

Gaps: several secondary pages remain Arabic-first in English mode; no complete operator/auditor role switch; limited empty/skeleton states; no automated accessibility suite. Catalog UI is currently static and not driven by the catalog API. Dark mode is not supported (not a blocker unless product scope adds it).

## Security concerns

- Production OIDC cannot be considered complete until issuer/audience, callback behavior, session expiry and real role accounts are tested.
- Development identity headers must never be trusted in production; current environment guard must remain enforced.
- PostgreSQL RLS policies exist in schema but are not exercised by the SQLite test suite.
- Evidence scanning defaults must fail safely in production; external malware scanning is not provisioned.
- Vercel Standard Protection currently prevents anonymous access and also complicates frontend-to-API calls.
- Three high npm advisories remain; npm's automatic remediation requires a major Next.js upgrade and a separate regression-tested change.

## Database and migration gaps

- `infra/schema.sql` is an initial schema, not a numbered reversible migration chain.
- No migration ledger/version table or CI application against a disposable PostgreSQL instance.
- SQLite and PostgreSQL implementations do not yet prove behavioral parity.
- Relationship history, soft deletion/retention rules and optimistic concurrency are not modeled.
- Several target tables have RLS enabled without explicit insert/update policies documented.

## API gaps

- No CRUD/version endpoints for regulators, instruments, frameworks, domains, requirements or unified controls.
- No persisted assessment/measurement lifecycle endpoints.
- No first-class findings, risks, treatments, policies, procedures, approvals or certifications endpoints.
- No pagination contract for growing collections.
- No idempotency keys for mutation retries.
- No formal OpenAPI error envelope or request correlation ID.

## Test gaps

- No frontend unit/component test runner and no committed end-to-end browser suite.
- No disposable PostgreSQL migration/RLS integration tests.
- No real OIDC provider, object storage, scanner, email, AI/OCR or timeout/rate-limit tests.
- No automated WCAG/axe test.
- Catalog validator checks metadata structure but not JSON Schema conformance or official-domain allowlists.

## Technical debt and dead-code review

- Many page components are compressed into single lines, reducing maintainability and reviewability.
- UI data is duplicated between frontend demo fixtures, FastAPI seeds and catalog JSON.
- Catalog API previously had a silent field-name mismatch; typed response models should replace untyped dictionaries.
- `AI_PROVIDER=mock` in Compose is acceptable only because current responses are explicitly draft/demo and do not claim a real model result.
- No destructive or clearly dead production code was found; existing fallback data is deliberately labeled demo data and should remain until live services are reliable.

## Recommended implementation order

1. Persist organization journey instances, requirement ownership and evidence links using versioned migrations.
2. Normalize catalog API and build data-driven catalog UI with pagination/filtering/version details.
3. Add the complete regulatory-instrument/requirement hierarchy and unified-control CRUD with reviewed mappings.
4. Expand organization profile and persist applicability confirmation/overrides.
5. Complete evidence metadata, relationships, review/expiry/duplicate workflows and hosted storage.
6. Persist reusable assessments and responses.
7. Add a separate weighted measurement engine and history.
8. Add findings, gaps, remediation tasks/dependencies and overdue reporting.
9. Implement risk register/treatment and policy/procedure/exception/approval governance.
10. Add grounded AI only after the preceding data foundation is queryable and source-citable.
11. Complete role-based operator/auditor experiences and remaining English translations.
12. Add PostgreSQL/RLS, browser E2E and accessibility CI before public production launch.

## Completion rule

Only the workflows directly covered by tests and browser verification are labeled implemented. SQL tables or rendered demo cards alone are not counted as completed modules.
