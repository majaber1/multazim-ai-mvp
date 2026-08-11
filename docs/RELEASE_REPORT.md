# Release Report

## Summary

This release establishes a formal bilingual product shell and fixes the highest-risk misleading or dead workflows without replacing Multazim's compliance logic. The design draws on shadcn's open-code composition, logical RTL properties, and the referenced admin dashboard's compact navigation hierarchy.

## UX and design improvements

- Central brand, semantic status, surface, border, focus, radius, shadow, and motion tokens.
- Geist for Latin UI and IBM Plex Sans Arabic for Arabic UI through `next/font`.
- Responsive collapsible desktop sidebar, mobile bottom navigation, breadcrumbs, keyboard command search, notifications, and user context.
- Locale-aware document direction, numbers, dates, and pair-based Arabic/English copy.
- Reduced-motion support, stronger focus rings, LTR technical-value islands, and accessible dialog/status semantics.

## Functional fixes

- Assessment save now calls a real application route and reports loading, success, error, and disabled states.
- Audit package export now calls FastAPI and downloads the actual tenant-scoped JSON package.
- Website audit no longer invents findings when its external scanner is unavailable.
- Existing SQLite persistence, upload safety, reports, RBAC, catalog validation, and human AI approval contract were preserved.

## Verification

- `npm run lint`
- `npm run build`
- `python -m pytest apps/api/tests -q`
- `python scripts/validate_catalog.py`
- Local FastAPI `/health` and Next.js route smoke checks
- Arabic and English visual checks at mobile, tablet, and desktop widths
- Browser console and Next.js overlay checks

Final results: TypeScript passed; Next.js produced all 16 routes; 12 API tests passed; five catalog records validated; API health returned `status: ok`; dashboard/assessment browser checks passed at 1440×900, 820×1180, and 390×844; Arabic RTL and English LTR switching passed; the assessment save journey passed; no browser console errors or Next.js error overlay were detected.

## Known limitations

- Production OIDC needs an issuer, audience/client, and organization/role claim mapping.
- Hosted object storage, deep malware scanning, outbound messaging, website-scanner, OCR, and model credentials are external dependencies.
- Vercel Hobby Standard Protection guards `.vercel.app` aliases; a custom domain or alternate backend host is required for an unrestricted public API.
- Detailed control text remains subject to official-source availability and licensing verification.
- Three npm high advisories require a separately scoped Next.js 16 migration.
- Arabic-first content-heavy secondary pages still require a final editorial English pass; critical shell and fixed workflows are bilingual.

## Before/after product score

| Area | Before | After |
|---|---:|---:|
| Design-system consistency | 55/100 | 86/100 |
| Navigation and responsive shell | 68/100 | 91/100 |
| Bilingual/RTL foundation | 52/100 | 82/100 |
| Workflow honesty and states | 63/100 | 88/100 |
| Production readiness | 58/100 | 76/100 |

Scores are an internal release rubric, not regulator or certification results.

## Local run

```bash
npm install
python -m pip install -r apps/api/requirements.txt
python -m uvicorn app.main:app --app-dir apps/api --reload
npm run dev
```

Web: `http://localhost:3000` — API docs: `http://localhost:8000/docs`.

## Deployment readiness

The web application and authenticated demo API are deployable. A public multi-user production release remains conditional on external identity, persistent hosted PostgreSQL/object storage, and removal or custom-domain configuration of Vercel deployment protection.

## Branch and changed areas

- Branch: `feat/bilingual-ux-production-hardening`
- Shared UI: design tokens, fonts, locale utilities, logo, sidebar, application shell, command search.
- Fixed workflows: assessment, audit package, website audit.
- Documentation: product audit, release report, README localization/design guidance.
- Package changes: Lucide icons plus the small `clsx`/`tailwind-merge` class utility.
