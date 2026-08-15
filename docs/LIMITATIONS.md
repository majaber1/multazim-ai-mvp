# Disclosed limitations

## External blockers

- Production OIDC tenant/issuer/audience credentials are not provisioned.
- Hosted PostgreSQL, object storage, deep antivirus, outbound email/SMS, public deployment, and paid AI providers are not provisioned. Local PostgreSQL is verified; deterministic retrieval works without paid AI.
- Official/licensed detailed Saudi control text requires regulator-source review and content approval. Metadata-only/demo records remain labeled by verification status.
- Final production fonts/rendering still require deployment acceptance, although local and container DejaVu Arabic generation was rendered and visually accepted.

## Product limits

- SQLite remains only a lightweight fallback. Local PostgreSQL bootstrap, repeat migration, RLS, constraints, transactions, and process-restart persistence are verified.
- The complete browser suite runs four locale/device projects; CI runs the English desktop critical subset.
- AI analysis remains non-authoritative by design. Deterministic approved-source retrieval returns citations without provider credentials.
- The final corrected web-container entrypoint rebuild could not be rerun because the execution approval stream disconnected; run `docker compose build web && docker compose up -d web && docker compose up --wait web`.

These limitations prevent a production-ready or certification-ready claim, but do not break the bounded fictional accelerator demo.
