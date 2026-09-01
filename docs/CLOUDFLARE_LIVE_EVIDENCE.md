# Cloudflare live deployment evidence

Verified: 2026-09-01 UTC

## Isolated resources

- Account ID: `9ff4685afd71fb353eb179a43033f1f9` (patadmin OAuth-verified account).
- Worker: `consilium-webmcp` at `https://consilium-webmcp.patrickhallermann.workers.dev`.
- Current Worker version: `daca3fa4-a2e7-4dfb-87b1-e588b3f2496d`.
- D1: `consilium-webmcp-prod`, ID `c8152314-29a6-49f4-8007-eba51b2a2b9e`, region WEUR.
- Vectorize: `consilium-evidence-bge768-v2`, 768 dimensions, cosine. Vectorize exposes the name rather than a separate index UUID in Wrangler output.
- Workers AI embedding model: `@cf/baai/bge-base-en-v1.5`.
- No custom route or DNS record exists in `wrangler.production.jsonc`; `workers_dev` is enabled and preview URLs are disabled.

No Hallermann resource, route, DNS record, Worker, database, index, service, or private data was modified.

## Provisioning and canonical data

Vectorize metadata indexes were created before insertion in immutable manifest order: `corpus_kind`, `user_id`, `advisor_id`, `pack_version`, `pipeline_version`. Remote D1 migrations completed as `0001_initial.sql` then `0002_hardening.sql`.

The one-time bootstrap used a secret-gated endpoint, two batched Workers AI calls (96 personal texts and 6 advisor texts), and one Vectorize upsert. Aggregate remote proof after bootstrap: 96 synthetic events, 6 verified public-domain source chunks, and 102 D1 vector-manifest rows. The final deployment has `INGESTION_ENABLED=false`; the ingestion secret was removed, and `wrangler secret list` shows only `SESSION_SIGNING_KEY`.

## Runtime identity

Live `/api/health` reports:

- `mode: cloudflare`
- `reasoningMode: deterministic-dual-grounded`
- `retrievalMode: workers-ai-vectorize`
- `openaiConfigured: false`

The UI displays **CLOUDFLARE RETRIEVAL · DETERMINISTIC COUNCIL**. This is not claimed as genuine OpenAI Agents SDK runtime proof. OpenAI application mode remains separately gated and fail-closed.

## Bounded live acceptance

Command:

```bash
CONSILIUM_LIVE_URL='https://consilium-webmcp.patrickhallermann.workers.dev' node scripts/cloudflare-live-proof.mjs
```

The first live attempt passed real retrieval but correctly abstained because fixture-calibrated similarity floors did not match raw BGE cosine scale. D1 inspection showed the exact pre-reviewed passages were retrieved at Marcus `0.45934996`, Epictetus `0.50033593`, and Sun Tzu `0.4861423`. Provider-specific BGE floors (`0.42`, `0.46`, `0.44`) were added without changing fixture floors; a focused test proves a low production score still fails. The necessary post-repair journey passed:

1. Cloudflare health, honest mode identity, and signed cookies.
2. Durable longitudinal D1 context and inferred patterns.
3. Canonical pattern support and counterevidence.
4. Appointed council and canonical public-domain provenance.
5. Real Workers AI embedding, metadata-filtered Vectorize retrieval, and canonical D1 hydration.
6. Dual-grounded deterministic advice with honest retrieval and pipeline identity.
7. Cross-session, forged-header, and forged-cookie rejection.
8. Proposal separation, owner-only atomic commit, and replay rejection.
9. Session-owned reset.
10. Visible UI and WebMCP assets.

Result: `Cloudflare live acceptance passed: Workers AI + Vectorize + D1; deterministic dual-grounded council; no OpenAI application call.` The two acceptance attempts each made only the intended memory and consultation embedding requests; the repeat was required by the fail-closed calibration repair, not sampling.

## Tested and untested boundaries

- Passed: strict TypeScript/ESLint; 24 focused tests across production orchestration, seed behavior, retrieval filters, longitudinal causality, semantic support, injection resistance, and provider-specific score rejection; production Wrangler dry-run; remote D1/Vectorize/Workers AI journey; final health and asset-label check.
- Not tested or claimed: OpenAI application reasoning/T3, genuine Agents SDK execution, a WebMCP-capable browser T4 interaction, custom-domain routing, Cloudflare Access, or GitHub publication.
- Production Free plan rejected custom Wrangler CPU/subrequest `limits` configuration. The production config therefore uses platform Free-plan limits while preserving all application-level caps; local and acceptance configs retain explicit 30,000 ms/40 settings.
