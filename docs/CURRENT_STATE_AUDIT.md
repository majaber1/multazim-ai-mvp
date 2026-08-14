# Current State Audit

Date: 2026-08-08  
Baseline commit: `6e37e37 Initial commit`

## Summary

The inherited repository was a small Arabic-first visual MVP. Its stack was sound enough to preserve: Next.js 15, TypeScript, Tailwind CSS, FastAPI, PostgreSQL/pgvector, Redis, Docker Compose, and GitHub Actions. It had 26 tracked files, no authentication implementation, no migrations, no automated tests, and no persistent application services.

## Inventory at baseline

| Area | Baseline state | Decision |
|---|---|---|
| Frontend | Static landing, dashboard, six-question assessment, website audit, documents | Preserve App Router/Tailwind; extend product navigation and domain views |
| Backend | FastAPI health, arithmetic score, fixed website-audit response | Preserve FastAPI; add domain models, applicability, RBAC and tenant enforcement foundation |
| Database | Five tables: organizations, assessments, findings, documents, tasks | Replace prototype schema with normalized versioned catalog and tenant-owned operational entities |
| Authentication | None | Demo header context only; production identity integration remains required |
| Assessment | Boolean percentage only | Keep endpoint compatibility and label as estimated; framework scoring strategies remain planned |
| Dashboard | Static 64% card and tasks | Replace with executive compliance demo, explicit fictional-data labels |
| Documents | Static policy cards | Retained as a compatibility route; evidence center introduced separately |
| APIs | Three endpoints across Next.js and FastAPI | FastAPI becomes intended domain boundary; Next route remains compatibility-only |
| Tests | None | Add API tests for applicability, security headers, RBAC, and tenant isolation |
| Docker | Web/API/Postgres/Redis | Preserve; database schema initialization added to compose separately if configured |
| CI | Web build and Python compile | Extend to backend tests and catalog validation |

## Key risks found

- CORS allowed every origin.
- No identity, authorization, tenant scoping, rate limiting, file scanning, or signed storage.
- Static UI suggested compliance results without sufficient estimate/demo labeling.
- Frameworks and evidence were not modeled.
- Regulatory source provenance and version history were absent.

## Reuse rationale

The monorepo layout and selected runtimes are appropriate for the requested architecture. Rebuilding them would add risk without product value. This release therefore refactors and extends the existing system while keeping its history and local commands recognizable.
