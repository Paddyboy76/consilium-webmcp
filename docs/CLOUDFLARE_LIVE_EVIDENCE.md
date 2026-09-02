# Cloudflare live deployment evidence

Verified: 2026-09-02 UTC

## Isolated resources

- Account ID: `9ff4685afd71fb353eb179a43033f1f9` (patadmin OAuth-verified account).
- Worker: `consilium-webmcp` at `https://consilium-webmcp.patrickhallermann.workers.dev`.
- Current Worker version: `1cdcd452-4a55-443a-98fa-058ee35260be`.
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

The bounded journey was rerun once on September 2 during final submission preparation. All ten listed checkpoints passed, followed by an explicit reset and assertion that both synthetic proof sessions had no pending proposal or committed action. This left the judge journey clean. No runtime code or deployable asset changed, so no deployment was performed and the proven Worker version remains unchanged.

## Browser-found contract defects and verified rerun

A subsequent WebMCP-capable browser review found two real defects that invalidate any claim of completed browser acceptance for the current release:

1. `search_personal_memory` forwarded `limit=5`, but `/api/memory` ignored it and returned the hard maximum of eight. The route now validates/clamps the requested bound, passes it into Vectorize `topK`, and slices canonical D1 hydration to that same value. The focused regression proves five is honored and an oversized request remains capped at eight.
2. The exact question `What should I focus on in the next 45 minutes, and why?` produced three apparently grounded reports but an abstained aggregate decision. Trace analysis established that report construction precedes validation: the generic question vector retrieved canonical appointed chunks, but their raw similarity could fall below the preserved advisor-specific floors, so synthesis rejected every report afterward. No evidence ID was fabricated. The repair keeps the floors and metadata filters, batches one personal query plus three bounded advisor-specific semantic queries, then rehydrates every returned ID through `vector_records` into canonical D1 events or active appointed source chunks before synthesis.

The focused integration test requires the exact browser question to yield three validated, non-abstained reports, personal evidence `evt-64-adapt-success`, and advisor evidence `marcus-b4-03`, `epictetus-ench-01a`, and `suntzu-3-2`. It also proves those IDs exist in canonical D1 and belong to the active appointed packs. Static checks and the 24 focused tests passed.

The supervisor Browser/WebMCP rerun then passed against Worker version `1cdcd452-4a55-443a-98fa-058ee35260be`:

- `search_personal_memory` with query `protected pilot follow-through` and `limit: 5` returned exactly 5 results, `retrievalMode: workers-ai-bge768`, and `contentTrust: untrusted_data`.
- `consult_council` with exact question `What should I focus on in the next 45 minutes, and why?` returned trace `trace-bb6d6471-b75d-4d35-b92d-0d4f8c991352`, `modelMode: deterministic-cloudflare-dual-grounded`, and provider `cloudflare-workers-ai-vectorize`.
- The response contained 3 reports and 3 validated reports. `decision.abstained` was `false`; personal evidence was `[evt-64-adapt-success]`; advisor evidence was `[epictetus-ench-01a, marcus-b4-03, suntzu-3-2]`.
- Validation reported `allDisplayedEvidenceCanonical: true`, `dualGrounded: true`, and `persistent_mutation: false`; the dual-grounding guardrail passed.
- The visible UI showed **CLOUDFLARE RETRIEVAL · DETERMINISTIC COUNCIL**, the current trace, and the passing guardrail detail.

This proves the live browser tool and visible-UI scope above. Proposal creation, owner-only commit, replay rejection, and reset ownership remain corroborated by the separate server live-acceptance journey, not claimed as browser-proven.

## Tested and untested boundaries

- Passed: strict TypeScript/ESLint; 24 focused tests across production orchestration, bounded memory retrieval, canonical identity, seed behavior, retrieval filters, longitudinal causality, semantic support, injection resistance, and provider-specific score rejection. The earlier remote D1/Vectorize/Workers AI journey passed its then-current assertions.
- Passed in a WebMCP-capable browser: bounded personal-memory search, deterministic dual-grounded council consultation with canonical evidence, and visible honest runtime/trace/guardrail UI against version `1cdcd452-4a55-443a-98fa-058ee35260be`.
- Server-live corroboration only, not browser-proven: proposal creation, owner-only atomic commit, replay rejection, and reset ownership.
- Not tested or claimed: OpenAI application reasoning/T3, genuine Agents SDK execution, custom-domain routing, or Cloudflare Access.
- Public repository verified: `https://github.com/Paddyboy76/consilium-webmcp`, default branch `main`, MIT license detected. At final-run start its public head matched Hetzner at `cd3cb26576e707c688ea5999fd130c4b85368ead`.
- Production Free plan rejected custom Wrangler CPU/subrequest `limits` configuration. The production config therefore uses platform Free-plan limits while preserving all application-level caps; local and acceptance configs retain explicit 30,000 ms/40 settings.
