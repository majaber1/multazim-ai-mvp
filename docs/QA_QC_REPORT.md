# QA/QC report — 2026-08-14

| Check | Result |
|---|---|
| `npm ci --prefer-offline --no-audit` | PASS, 105 packages |
| `npm run verify` | PASS, TypeScript and production build (16 routes) |
| `python -m pytest -q --basetemp=.pytest-tmp` | PASS, 12 tests |
| `python scripts/validate_catalog.py` | PASS, 5 records |

Not executed: production database migration, real object storage, external identity provider, public browser E2E, or live official regulatory feeds.
