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
