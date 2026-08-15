# Production readiness

## Locally verified

- Clean PostgreSQL 16 + pgvector bootstrap and repeated checksum migration.
- Transaction persistence and process-restart API persistence.
- Database RLS SELECT/INSERT/UPDATE/DELETE using a non-superuser, non-bypass role.
- Foreign keys, uniqueness/check constraints, and tenant-oriented indexes.
- Twenty backend tests plus two PostgreSQL integration tests.
- Next.js production build with 18 routes.
- Arabic/English desktop/mobile Playwright golden path (4/4).
- Arabic and English A4 reports rendered with Poppler and visually inspected.
- npm dependency audit returned zero vulnerabilities before a later transient registry reset.

## Production credentials required

- OIDC issuer/audience/client provisioning.
- Managed PostgreSQL and S3-compatible object-storage credentials.
- Optional SMTP/webhook and paid AI-provider credentials.
- Final domain, hosting, networking, monitoring, backups, and secrets platform.

## External approval required

- Certified penetration test.
- Legal/regulatory approval of content, applicability interpretations, scoring weights, and detailed mappings.

The application never treats demo content, automated website indicators, deterministic retrieval, or internal readiness scores as regulator-issued conclusions.
