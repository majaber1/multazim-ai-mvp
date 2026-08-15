# Architecture

Multazim uses a Next.js 16 bilingual frontend, a FastAPI service/business boundary, a durable SQLite repository for the zero-configuration single-server demo, and a PostgreSQL production schema with tenant RLS. Evidence binaries use a storage abstraction with local durable storage in the demo edition. OIDC/JWKS is mandatory in production; development-only identity headers are rejected when `APP_ENV=production`.

Core compliance state is persisted as typed records: organizations, applicability overrides, assessment campaigns/responses, evidence, canonical mappings, gaps, corrective actions, policies, notifications, compliance snapshots, approved knowledge sources, and append-only audit events. `DATABASE_URL` selects PostgreSQL as the application repository; absence of that variable selects SQLite for lightweight development/tests. API authorization checks both role and organization ownership; unknown or cross-tenant resources return 404.

The normalized PostgreSQL model enforces tenant RLS for users, assessments/responses, evidence, gaps, actions, mappings, policies, reports, notifications, snapshots, knowledge sources/chunks, and audit records. Automated tests use a `NOSUPERUSER NOBYPASSRLS` role for SELECT/INSERT/UPDATE/DELETE. The FastAPI service connection is a privileged business-layer boundary and therefore must not be exposed to customers or user-supplied SQL; tenant context is enforced again at the API layer.

External boundaries remain provider-neutral: OIDC, hosted PostgreSQL, hosted object storage/deep malware scanning, notifications, and AI/RAG. Their absence does not silently change compliance state.
