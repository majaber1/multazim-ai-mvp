# Architecture

Multazim uses a Next.js 16 bilingual frontend, a FastAPI service/business boundary, a durable SQLite repository for the zero-configuration single-server demo, and a PostgreSQL production schema with tenant RLS. Evidence binaries use a storage abstraction with local durable storage in the demo edition. OIDC/JWKS is mandatory in production; development-only identity headers are rejected when `APP_ENV=production`.

Core compliance state is persisted as typed records: organizations, applicability overrides, assessment campaigns/responses, evidence, canonical mappings, gaps, corrective actions, and append-only audit events. API authorization checks both role and organization ownership; unknown or cross-tenant resources return 404.

External boundaries remain provider-neutral: OIDC, hosted PostgreSQL, hosted object storage/deep malware scanning, notifications, and AI/RAG. Their absence does not silently change compliance state.
