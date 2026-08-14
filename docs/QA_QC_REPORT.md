# QA/QC report — 2026-08-14

| Check | Result |
|---|---|
| `npm ci --prefer-offline --no-audit` | PASS, 105 packages |
| `npm run verify` | PASS, TypeScript and production build (16 routes) |
| `python -m pytest -q --basetemp=.pytest-tmp` | PASS, 12 tests |
| `python scripts/validate_catalog.py` | PASS, 5 records |

Not executed: production database migration, real object storage, external identity provider, public browser E2E, or live official regulatory feeds.

## Completion verification

| Check | Result |
|---|---|
| `python -m pytest apps/api/tests -q --basetemp=.pytest-completion` | PASS, 16 tests; one third-party ReportLab deprecation warning |
| `npm ci --prefer-offline --no-audit` | PASS, 108 packages |
| `npm run lint` | PASS, TypeScript no-emit check |
| `npm run build` | PASS, Next.js 16.3.1 Turbopack production build, 16 routes |
| `npm audit --audit-level=high` | PASS, 0 vulnerabilities |

The added tests cover assessment persistence/scoring, mandatory-control penalty, incomplete/N/A treatment, applicability override audit metadata, gap overdue filtering, human-reviewed mapping coverage, and cross-tenant denial.

## Product-readiness pass

| Check | Result |
|---|---|
| Backend unit/security suite | PASS, 20 tests; PostgreSQL tests intentionally skipped without `POSTGRES_TEST_URL` |
| PostgreSQL integration | PASS, 2 tests against PostgreSQL 16 + pgvector |
| Clean migration + second run | PASS; second run reports `Migration already applied` |
| API process-restart persistence | PASS |
| RLS CRUD | PASS: SELECT, INSERT, UPDATE, DELETE; tenant A/B isolation |
| Next.js production build | PASS, Next.js 16.3.1, 18 routes |
| Playwright full suite | PASS, 4/4: AR/EN desktop and mobile |
| Playwright CI smoke | PASS locally, EN desktop |
| Arabic PDF | PASS, generated, rendered at 150 DPI, visually accepted |
| English PDF | PASS, generated, rendered at 150 DPI, visually accepted |
| Catalog/journey validators | PASS, 5 catalog records and 1 journey |
| npm audit | PASS, 0 vulnerabilities; a later repeat received transient registry `ECONNRESET` |
| Compose API/PostgreSQL/migration | PASS; PostgreSQL healthy, migration exit 0, API health 200 |
| Corrected final web image | Build succeeded before entrypoint correction; isolated rebuild blocked by disconnected approval review, rerun required |
