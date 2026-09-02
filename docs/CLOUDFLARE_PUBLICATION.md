# Cloudflare publication record and remaining plan

Provisioning through workers.dev is complete on the verified patadmin account. The exact executed resource IDs and proof are in `docs/CLOUDFLARE_LIVE_EVIDENCE.md`. No Hallermann Worker, route, DNS record, database, index, or service was touched. The steps below remain the rollback/reference plan; custom-domain publication and GitHub publication are not authorized or executed.

1. Create a production D1 database and replace only the placeholder production `database_id` in a publication-specific Wrangler config: `npx wrangler d1 create consilium-webmcp-prod`.
2. Create the immutable index: `npx wrangler vectorize create consilium-evidence-bge768-v2 --dimensions=768 --metric=cosine`.
3. Before any vectors are inserted, create string metadata indexes in this exact order:
   - `npx wrangler vectorize create-metadata-index consilium-evidence-bge768-v2 --property-name=corpus_kind --type=string`
   - repeat for `user_id`, `advisor_id`, `pack_version`, then `pipeline_version`.
4. Poll `npx wrangler vectorize list-metadata-index consilium-evidence-bge768-v2` until all mutations complete. Generate/upsert BGE vectors only through the Worker AI binding and the immutable `config/vectorize.production.json` manifest; validate canonical D1 hydration and hashes before cutover.
5. Apply schema in numbered order: `npx wrangler d1 migrations apply consilium-webmcp-prod --remote` (must report 0001 then 0002).
6. Generate a new high-entropy value locally and enter it interactively with `npx wrangler secret put SESSION_SIGNING_KEY`. Do not store it in a file or shell history. No external model-provider secret is used; council generation uses the `AI` binding.
7. Run `npm run release:check`, review `npx wrangler deploy --dry-run`, then—only with deployment authority—run `npx wrangler deploy` against the isolated publication config.
8. Perform one T4 browser journey: verify HTTPS health/mode, WebMCP discovery, history-shaped advice, exact source provenance, safe trace, pending proposal, explicit one-use commit, and session isolation. Record deployed SHA/config/pipeline hash.

Rollback: retain the previous Worker version and Vectorize index; use `npx wrangler rollback` only after identifying the intended deployment. D1 migrations are forward-only: do not destructively reverse 0002; disable traffic or roll Worker code forward. Never delete the old index/database during the validation window.
