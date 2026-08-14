# Disclosed limitations

## External blockers

- Production OIDC tenant/issuer/audience credentials are not provisioned.
- Hosted PostgreSQL, object storage, deep antivirus, outbound email/SMS, public deployment, and authoritative AI/RAG provider are not provisioned or live-verified.
- Official/licensed detailed Saudi control text requires regulator-source review and content approval. Metadata-only/demo records remain labeled by verification status.
- Arabic PDF uses a safe report export but needs visual acceptance testing with an approved Arabic font in the target deployment.

## Product limits

- The zero-configuration edition uses SQLite; the PostgreSQL schema/RLS has not been exercised against a live production database in this run.
- Browser E2E across Arabic/English, mobile, upload, and report download is not yet automated in CI.
- Policy drafting is a guarded draft workflow, not a complete approval/version UI.
- AI analysis is deterministic/provider-neutral and never authoritative; retrieval against an approved source library awaits provider provisioning.

These limitations prevent a production-ready or certification-ready claim, but do not break the bounded fictional accelerator demo.
