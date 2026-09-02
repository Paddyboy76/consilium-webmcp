# Recovery status — Pass 15 Cloudflare-hosted OpenAI structured council

Updated: 2026-09-02 UTC

## Pass 15 result

- Pass 14 is deployed as Cloudflare Worker version `5faff90a-47b2-4edc-83b9-38c2f9e655e3`. Exactly one serious live WebMCP consultation completed end to end in 23,184 ms. Trace `trace-99f5b746-d2b4-48a6-bf0f-197836d98f4a` proves model `@cf/meta/llama-3.1-8b-instruct-fast`, config `workers-ai-json-council-v6-fast-interactive`, `modelMode=deterministic-fallback`, `fallbackReason=AI_JSON_SCHEMA_INVALID`, `modelElapsedMs=11229`, `validation.valid=true`, `dualGrounded=true`, and `persistent_mutation=false`. The humane grounded fallback and 11,229 ms attempt prove the Pass 14 latency correction; schema conformance is the remaining primary-path defect.
- Only council inference changes to Cloudflare Workers AI `@cf/openai/gpt-oss-20b`, under `workers-ai-json-council-v8-gpt-oss-low-reasoning`. Cloudflare describes it as a Cloudflare-hosted OpenAI open-weight reasoning model intended for lower latency, with a 128,000-token context window and `response_format`. The Workers binding also types `reasoning_effort`, now fixed to `low` after the first production v7 call safely timed out at 15 seconds. It uses the existing Workers AI binding and no OpenAI API, SDK, separate provider key, or `OPENAI_API_KEY` path. This is the final interactive interpreter choice because it directly targets structured reasoning while retaining the already-proven interactive envelope.
- The one-call contract remains temperature 0.1, strict JSON Schema, 1,600 output tokens, and a 15,000 ms application timeout. There is no retry, cascade, or timeout increase. Server-owned qualified slots, full hydration, semantic validation, deterministic fallback, and every Pass 10–14 reasoning, clinical, provenance, evidence-lane, counterevidence, and no-plan-mutation protection remain intact.
- Object and whole-body JSON-string responses still normalize through the identical full schema and hydration path; prose and brace-substring extraction remain forbidden. Zod failures now return and audit at most the first eight issue paths and codes, without values or messages. Whole-body parse failure uses only `response_body`/`invalid_json`; other failures expose no arbitrary exception text. Prompts, model prose, private journal text beyond authorized consultation storage, credentials, and secrets are never diagnostic fields.
- Focused tests cover the exact model/config, strict `response_format`, unchanged timeout/token ceiling, full schema/hydration, object/string normalization, bounded malformed-schema and parse diagnostics, and zero action/proposal mutation on structured success and fallback.
- No D1 migration or Vectorize reindex is required. Storage schema, embedding model, 768 dimensions, pipeline hash, canonical corpus, and retrieval configuration are unchanged.

Official rationale: [GPT-OSS 20B model page](https://developers.cloudflare.com/workers-ai/models/gpt-oss-20b/), [Workers AI JSON Mode](https://developers.cloudflare.com/workers-ai/features/json-mode/).

## Pass 15 verification

- Focused model and established consultation suite: `test/model.test.ts` plus `test/worker-seed.test.ts`, 21 tests pass.
- `npm run check`: pass.
- `npm test`: 16 files, 86 tests pass.
- `npm run deploy:check`: production bundle dry-run passes with Wrangler logging redirected to `/tmp` because the Debian home config path is read-only; no deployment occurs.
- No live Worker, Workers AI, OpenAI API, Vectorize, D1, Cloudflare configuration, or deployment is called or mutated from Debian.

## Pass 14 result

- Pass 13 is deployed as Cloudflare Worker version `81958600-fefd-4244-9c3d-63d3d1c9ba57`. Exactly one serious live WebMCP consultation was attempted after deployment and was not retried when the browser bridge exceeded its execution window. Production D1 audit row `trace-49a0295c-5417-41ef-942f-8e6b8824b5a7` proves `modelMode=deterministic-fallback`, `fallbackReason=AI_TIMEOUT`, `modelElapsedMs=21000`, and `persistentMutation=false`.
- Only council inference changes to `@cf/meta/llama-3.1-8b-instruct-fast`, under model config `workers-ai-json-council-v6-fast-interactive`. Cloudflare’s official model catalogue describes it as the fast Llama 3.1 variant with a 128,000-token context window, the JSON Mode documentation lists it as supporting JSON Schema structured output, and the current model catalogue continues to list it as active. This addresses the measured interactive latency failure without weakening retrieval, reasoning, provenance, validation, or fallback.
- The single-call contract remains temperature 0.1, strict `response_format.type=json_schema`, and 1,600 output tokens. The complete serialized fixture still proves at least 25% output margin. The application timeout is now 15,000 ms, leaving substantially more browser-bridge margin; it is not increased or retried.
- The full record is unchanged: situation summary, remembered facts, interpretations, central conflict, competing duties, unknowns, rejected inferences, three advisor reports, tensions, synthesis, one immediate action, one follow-up, and explicit unapproved status. Server-owned advisor-qualified slots, advisor-distinct best-four personal lanes, best-two appointed passages with locators, counterevidence, candidate-vs-selected trace, fail-closed lane ownership, Sun Tzu’s clinical boundary, dual grounding, and deterministic fallback remain intact.
- JSON Schema now advertises the same advisor limits as Zod: `personalSlots` maximum four, `counterPersonalSlots` maximum two, and `sourceSlots` maximum two. Workers AI response bodies are accepted only as an object or as a JSON string parsed in full; prose and brace-substring extraction are never accepted. Both forms pass through the same strict Zod, hydration, slot, scope, and semantic validation.
- Returned and audited safe diagnostics now include the exact model identifier and model-config version alongside bounded mode, reason, elapsed time, and `persistentMutation=false`. Raw prompts, model prose outside the validated body, exception text, credentials, and secrets are not audited. Structured success and fallback both leave actions and proposals unchanged.
- No D1 migration or Vectorize reindex is required. The embedding model, 768 dimensions, pipeline hash, canonical corpus, retrieval configuration, and storage schema are unchanged.

Official rationale: [fast model catalogue](https://developers.cloudflare.com/ai/models/%40cf/meta/llama-3.1-8b-instruct-fast/), [Workers AI JSON Mode](https://developers.cloudflare.com/workers-ai/features/json-mode/), and [active model catalogue](https://developers.cloudflare.com/workers-ai/models/).

## Pass 14 verification

- Focused model and established-production/consultation suite: `test/model.test.ts` plus `test/worker-seed.test.ts`, 19 tests pass.
- `npm run check`: pass.
- `npm test`: pass.
- `npm run deploy:check`: production bundle dry-run passes; no deployment occurs.
- No live Worker, Workers AI, Vectorize, D1, Cloudflare configuration, deployment, or OpenAI API was called or mutated.

## Pass 14 Windows handoff

From Windows PowerShell with OAuth:

1. Deploy the final Pass 14 code with `npm run deploy:production`. Do not run a migration or vector reindex.
2. Run at most one explicitly authorized serious live WebMCP consultation using the established question.
3. Inspect the returned response and `webmcp_calls.result_json`. Verify model `@cf/meta/llama-3.1-8b-instruct-fast`, config `workers-ai-json-council-v6-fast-interactive`, `modelMode`, bounded `fallbackReason`, `modelElapsedMs`, advisor-distinct capped lanes, canonical dual grounding, and `persistentMutation=false`.
4. Confirm no action or proposal was created. Do not retry merely to diagnose a timeout or model failure; use the safe persisted diagnostics.

Do not reindex, run a migration, enable ingestion, or deploy from Debian.

## Pass 13 result

- Pass 12 deployed, the corrected production reindex completed with exactly 114 personal and 18 advisor vectors under pipeline `0f7f47a4116e02d59f2622824e4535cda5c92ffa2eb0648deda04bd72309bed5`, and the five serious family IDs have canonical `vec-<id>` rows. The maintenance secret was removed, ingestion is disabled, and only `SESSION_SIGNING_KEY` remains.
- The exact serious WebMCP consultation retrieved the intended non-pilot evidence and persisted three valid, non-abstained, dual-source fallback reports. Audit trace `trace-7961f0ba-d5e8-4ab9-954d-ef95d23f2177` recorded `modelMode=deterministic-fallback`; the browser bridge ended at roughly 29 seconds. This timing is consistent with the former 25-second application race plus overhead and strongly suggests `AI_TIMEOUT`, but Pass 12 did not persist `fallbackReason`, so the cause is not claimed as proven.
- The primary remains `@cf/meta/llama-3.3-70b-instruct-fp8-fast` at temperature 0.1 with strict JSON Schema, advisor-qualified server-owned slots, full reasoning/synthesis fields, hydration, semantic validation, and validated deterministic fallback. No smaller model or alternate provider was introduced.
- Each advisor prompt lane now contains its scope-ranked best four canonical personal events and best two appointed-book passages. The full shared history is not repeated in the prompt. Candidate-vs-selected retrieval remains exact, selected lanes remain advisor-distinct, and a bounded `counterPersonalSlots` field preserves relevant contrary evidence using only the same server-owned personal lane.
- `max_tokens` is 1,600. The focused contract test serializes the complete fixture output and schema, applies a conservative four-characters-per-token estimate, and proves at least 25% output margin while hydrating every required field. The application timeout is 21,000 ms, leaving roughly nine seconds inside the 30-second browser/WebMCP envelope for retrieval, persistence, serialization, transport, and rendering; the timeout is injectable for a millisecond-scale regression.
- The response and `webmcp_calls.result_json` now carry `modelMode`, `fallbackReason` (or null), and `modelElapsedMs` for the council model attempt. Persisted reasons are bounded operational codes (`AI_TIMEOUT`, JSON-schema invalid, evidence-slot invalid, semantic-validation invalid, or model-call failed); raw exception text, prompts, and secrets are never audited.
- Consultation remains audit-only with respect to plans: tests prove no action or proposal mutation on structured success or fallback. The 114-record reconciliation, chunked embeddings, pipeline/version, six life areas, serious scopes, fail-closed evidence ownership, synthesis, and all 13 WebMCP lifecycle tools are unchanged. No migration or vector reindex is required.

## Pass 13 verification

- Focused model and established-production/consultation suite: `test/model.test.ts` plus `test/worker-seed.test.ts`, 17 tests pass.
- `npm run check`: pass.
- `npm test`: 16 files, 82 tests pass.
- `npm run deploy:check`: production bundle dry-run passes; no deployment occurs.
- No live Worker, Workers AI, Vectorize, D1, Cloudflare configuration, deployment, or OpenAI API was called or mutated.

## Pass 13 Windows handoff

From Windows PowerShell with OAuth:

1. Deploy the final Pass 13 code with `npm run deploy:production`. No migration or reindex is needed.
2. Run exactly one serious live WebMCP consultation using the established question.
3. Inspect both the returned response and audited `webmcp_calls.result_json`: verify `modelMode`, `fallbackReason`, and `modelElapsedMs`; confirm advisor-distinct capped selected lanes, the five serious family records across candidate/selected evidence as relevant, canonical dual grounding, a humane non-abstained result, and `persistentMutation=false`.
4. Confirm no action or proposal was created. Do not repeat the live call merely to diagnose a failure; use the persisted reason and elapsed time.

Do not reindex, run a migration, enable ingestion, or deploy from Debian.

## Pass 12 result

- Pass 11 deployed and safely reconciled the established production D1 corpus from 96 to 114 synthetic personal events, including `evt-07-mum-call`, `evt-18-house`, `evt-20-depression`, `evt-21-house-finance`, and `evt-38-mum-missed`. The authenticated reindex then returned `INTERNAL_ERROR`; the maintenance secret was removed and `INGESTION_ENABLED=false` was restored.
- The exact cause was local and deterministic: `WorkersAiEmbedder.embedMany()` rejected more than 100 texts with `INVALID_EMBEDDING_BATCH`, while `ingestProductionVectors()` supplied all 114 personal texts in one call.
- Production batch embedding now accepts a bounded total of 1,000 texts, preserves all existing empty/text-length/model/dimension/invalid-response guards, splits inputs into stable ordered chunks of at most 100, validates the returned row count and all 768 dimensions for every chunk, and concatenates without retries or sampling. `embed(text)` is unchanged.
- A focused regression proves 114 inputs use exactly two binding calls of 100 and 14, preserve output length and order, and fail closed when the second chunk is malformed. The established-production integration constructs the exact additive 114-personal + 18-advisor union, proves every personal event has one manifest row, advisor rows remain exactly 18, and no Workers AI embedding call exceeds 100 texts.
- Idempotent authenticated reruns retain canonical `vec-<id>` identifiers and the existing D1 `INSERT OR REPLACE`; counts remain 114 personal and 18 advisor, with no duplicate, deletion, or unrelated-record rewrite.
- The embedding model, 768 dimensions, Vectorize metadata/filter schema, pipeline hash, Pass 11 reconciliation, Pass 10 council safeguards, six life areas, and all 13 WebMCP lifecycle tools are unchanged.

## Pass 12 verification

- Focused embedding and established-production suite: `test/retrieval.test.ts` plus `test/worker-seed.test.ts`, 14 tests pass.
- `npm run check`: pass.
- `npm test`: 16 files, 80 tests pass.
- `npm run deploy:check`: production bundle dry-run passes; no deployment occurs.
- No live Worker, Workers AI, Vectorize, D1, Cloudflare configuration, deployment, or OpenAI API was called or mutated.

## Pass 12 Windows handoff

From Windows PowerShell with OAuth:

1. Deploy the Pass 12 code with `npm run deploy:production`.
2. Trigger safe canonical reconciliation with one authenticated read such as `/api/context`; do not run a consultation yet.
3. Temporarily enable the existing secret-gated ingestion endpoint and install a one-time secret.
4. Invoke `/api/admin/ingest-vectors` once. Verify exactly 114 personal and 18 advisor manifest rows under pipeline `0f7f47a4116e02d59f2622824e4535cda5c92ffa2eb0648deda04bd72309bed5`, and verify all five required IDs have canonical `vec-<id>` rows.
5. Delete the ingestion secret, restore `INGESTION_ENABLED=false`, and redeploy the disabled configuration.
6. Rerun the serious live council gate with the exact established question and verify non-empty advisor-distinct personal lanes, dual grounding, no fallback, and a non-abstained humane result.

Do not deploy or perform the secret/reindex handoff from Debian.

## Pass 11 result

- Reproduced the production upgrade failure: `ensureSession()` treated any non-empty `demo-user` event corpus as fully seeded, so a Pass 5 database with 96 older events never received canonical rows added in Pass 8. The payload-only reconciliation could not repair IDs that did not exist, and reindexing correctly indexed that incomplete D1 corpus.
- Added an always-safe canonical event reconciliation. Every session/seed pass inserts missing exact IDs from the current `buildSyntheticHistory()` as `demo-user`, `session_id=NULL`, with `synthetic-seed-v2` provenance. Only rows with an exact canonical ID, `demo-user` ownership, and that known synthetic provenance are updated to current canonical timestamps, types, subjects, valence, magnitude, and structured payload. No event is deleted; unrelated demo rows, user-authored rows, session records, and non-demo users are preserved.
- Proved `evt-07-mum-call`, `evt-18-house`, `evt-20-depression`, `evt-21-house-finance`, and `evt-38-mum-missed` are restored on an established non-empty database and retain text, tags, area, relationship, goal link, author, outcome, and provenance. A second reconciliation creates no duplicates.
- Corrected the canonical D1 loader to carry area, relationship, goal link, author, outcome, and provenance into production ingestion and retrieval. The authenticated local ingestion fixture proves every reconciled serious ID receives a personal vector manifest row under pipeline `0f7f47a4116e02d59f2622824e4535cda5c92ffa2eb0648deda04bd72309bed5`, while the appointed corpus remains exactly 18 chunks/vectors.
- Added an established-database integration regression using the exact reported serious question. Its reconciled, non-pilot candidate set produces three non-empty, advisor-distinct personal lanes, three structured dual-grounded reports, a non-abstained decision, and no fallback. Count assertions are additive for personal history and exact only for the five required IDs and 18 advisor chunks.
- The embedding model, Vectorize index/configuration, pipeline hash, source packs, public-domain provenance, six life areas, qualified slots, selected-vs-candidate trace, fail-closed validation/fallback, synthesis, CAAR handling, and proposal/commit boundary are unchanged.

## Pass 11 verification

- Focused upgrade/ingestion/consultation suite: `test/worker-seed.test.ts`, 9 tests pass.
- `npm run check`: pass.
- `npm test`: 16 files, 79 tests pass.
- `npm run deploy:check`: production bundle dry-run passes; no deployment occurs.
- No live Worker, Workers AI, Vectorize, D1, Cloudflare configuration, or OpenAI API was called or mutated.

## Pass 11 Windows handoff

From Windows PowerShell with OAuth:

1. Deploy the final code with `npm run deploy:production`.
2. Invoke one safe authenticated read such as `/api/context` to trigger canonical reconciliation; do not run a consultation yet.
3. Temporarily enable the existing secret-gated ingestion endpoint and install its one-time secret, then invoke `/api/admin/ingest-vectors` once. Verify the five required personal canonical/vector records and exactly 18 advisor records under pipeline `0f7f47a4116e02d59f2622824e4535cda5c92ffa2eb0648deda04bd72309bed5`; treat the personal total as additive rather than fixed.
4. Remove the ingestion secret, restore ingestion-disabled configuration, and redeploy.
5. Rerun one authorized live consultation with the exact serious question and verify non-empty advisor-distinct personal lanes, dual grounding, and a non-abstained humane result.

Do not deploy or perform the secret/reindex handoff from Debian.

## Pass 10 result

- Audited Pass 8/9 directly and reproduced all ten reported weaknesses. Repaired mechanically identical advisor memory lanes with a canonical shared situation set plus scope-ranked Marcus, Epictetus, and Sun Tzu lanes. Exact family and vocational ID-set tests prove question sensitivity, legitimate overlap, distinct sets, and exclusion of pilot evidence from the family consultation.
- Replaced bare `P1`/`S1` references with server-issued advisor-qualified slots such as `marcus-aurelius:P1` and `sun-tzu:S1`. Hydration now rejects bare, unknown, and cross-lane references and maps every accepted reference to one canonical record.
- Replaced pilot-hardcoded fallback advice with question-sensitive, source-grounded family and vocational reports. The family fallback keeps Sun Tzu strictly on workload/timing/capacity and explicitly outside emotional or medical counsel.
- Replaced recommendation concatenation with deterministic council synthesis that integrates duty, agency, conditions, the central conflict, disagreement, evidence, and limitations. The three-report adversarial test proves the result differs from every report and from their concatenation.
- Moved report validation ahead of decision acceptance and persistence. Invalid generated scope/evidence output is discarded, the labelled validated deterministic fallback is revalidated, and stored report validity, returned validity, decision, and persisted recommendation now agree. The adversarial Workers AI fixture proves invalid Sun Tzu counsel cannot reach the response or database.
- Split Vectorize `candidates` from authoritative `selected` supplied evidence. Selected personal/source IDs are the exact server-owned slot inventory; set assertions prove every later citation belongs to the corresponding selected advisor lane.
- Removed Pass 9’s runtime vocabulary regex gate. Reflection input retains meaningful length/shape checks and structural goal status, failure reason, and adaptation requirements. Natural paraphrases without “win”, “despite”, “pattern”, “but”, “tomorrow”, “if”, or “then” are accepted. The known swapped legacy fixture remains narrowly corrected and covered by seed-integrity tests.
- Proved all six CAAR meanings end to end: submitted JSON equals stored `caar_json`; `reflection_facts` map in order to progress, success, friction, misalignment, mission, and adaptation; and the brief exposes the intent/outcome, win/friction, failure/mechanism, pattern/counterevidence, priority, and if-then sections without swapping them.
- Browser fixture passed with the serious consultation presenting remembered facts, tentative understanding, unknowns, and rejected inference before advice. All 13 WebMCP contracts and explicit proposal → unchanged state → commit → replay rejection remain intact. Five fixture screenshots were refreshed under `artifacts/pass9`; desktop/mobile widths were exact, reflection and brief returned 201, and replay returned 409.
- No live AI call, Cloudflare mutation, Debian deployment, or UI redesign occurred.

## Pass 10 verification

- Focused adversarial suite: included in the full 16-file suite; 77 tests pass after the final source changes.
- `npm run check`: pass after the final change.
- `npm test`: 16 files, 77 tests pass after the final change.
- `npm run deploy:check`: production bundle dry-run passes; no deployment occurs.
- Local browser acceptance: 5 screenshots, no console/page errors, desktop `1440/1440`, mobile `390/390`, reflection `201`, brief `201`, commit replay `409`.

## Migration, reindex, and Windows OAuth handoff

No D1 migration is required. No Vectorize reindex is required: this pass changes post-retrieval selection, slot ownership, validation, fallback reasoning, and stored brief analysis, not canonical vector content or embedding configuration. The pipeline hash remains `0f7f47a4116e02d59f2622824e4535cda5c92ffa2eb0648deda04bd72309bed5`.

From Windows PowerShell with OAuth:

```powershell
npx wrangler login
npx wrangler d1 migrations apply consilium-webmcp-production --config wrangler.production.jsonc --remote
npm run deploy:production
```

Do not deploy from Debian. The migration command should report no pending migration; it remains in the handoff as a pre-deploy verification step. Run a live council proof only with explicit authorization because it invokes Workers AI and production retrieval.

## Pass 9 result

- Release base: Pass 8 commit `3e8cf44a65f107d68a2f676bd4ae689551792b7e`; the Pass 9 release commit is the clean `main` commit containing this file and is reported in the final handoff.
- Corrected all six seeded CAAR answers and their stored fact types. Q1 is intent/outcome, Q2 is win/friction overcome, Q3 is failure/mechanism without abuse, Q4 is a cautious pattern with counterevidence, Q5 is one priority, and Q6 is a concrete if–then plan. Exact legacy seeded values reconcile safely; arbitrary authored values are preserved.
- Reflection validation now rejects semantically misplaced answers even when every field is schema-valid and long enough. Q5 and Q6 flow into the morning brief as the stated priority and if–then plan.
- The UI exposes the same six meanings with explicit labels and keeps the whole Today → journal/reflection → accepted memory → morning brief journey visible.
- All six areas contain asymmetric, ordinary first-person scenes with linked people, goals, bodily/emotional state, consequences, authorship, outcomes, and provenance. The cross-area inference is calibrated: exposing actions often yield to tidy low-risk work, while urgency and a protected first action are recorded counterevidence.
- Production hydrates personal Vectorize matches from D1 before prompting. The returned retrieval trace now uses those canonical IDs—not vector-record IDs—and carries area, relationship, linked mission, authorship, time, outcome, provenance, score, pack, and locator where available.
- Removed fixed advisor-answer anchors. Advisor retrieval uses the actual question plus a bounded legitimate scope; passage relevance affects ordering. Stable prompt slots preserve server ownership of canonical IDs and hashes, and only explicitly selected slots are hydrated onto claims.
- Upgraded the single bounded call to Cloudflare `@cf/meta/llama-3.3-70b-instruct-fp8-fast`, temperature 0.1, strict JSON mode, 25-second timeout, structural/semantic scope checks, and labelled deterministic fallback. No OpenAI provider was introduced.
- The persisted reasoning record now separates remembered facts, interpretations, conflict/duties, unknowns, rejected inferences, advisor scope/application/limits/counsel/abstention, tensions, synthesis rationale, rejected alternative, clinical boundary, one immediate proposal, one follow-up, and the unchanged approval state.
- Added a genericized serious-advice fixture with dementia-clinic/family-home context, reported depression, workload, love/guilt/grief, financial and spiritual effects, and capacity counterevidence. Serious retrieval excludes pilot-only evidence. Deterministic reports keep Marcus on present/socially just conduct, Epictetus on agency/outcome without blame, and Sun Tzu on workload/conditions only.
- Explicit imminent-risk language takes the deterministic human-support path; depression alone does not. Philosophy is labelled as neither diagnosis nor treatment.
- The approval boundary was exercised against local D1: proposal leaves actions unchanged, owner commit creates one visible Today action, cross-session commit is rejected, and replay returns `409` with one action remaining.
- Council UI now follows: What I remember / What may be happening / What I cannot know / The council / Where they differ / Consilium’s synthesis / One proposed next move / Evidence and trace. Technical IDs, providers, locators, and hashes remain secondary and expandable.

## Verification

- `npm run check`: pass.
- `npm test`: 15 files, 73 tests pass.
- `npm run deploy:check`: production bundle succeeds; no deployment occurs.
- Local HTTP and browser acceptance pass without live Workers AI or remote services. Five screenshots have no console/page errors or horizontal overflow (`1440/1440` desktop, `390/390` mobile):
  - `artifacts/pass9/01-desktop-six-prompts.png`
  - `artifacts/pass9/02-desktop-morning-continuity.png`
  - `artifacts/pass9/03-desktop-serious-council.png`
  - `artifacts/pass9/04-desktop-webmcp-gate.png`
  - `artifacts/pass9/05-mobile-journey.png`
- No live Workers AI call, remote Vectorize/D1 mutation, or Debian deployment was made.

## Windows OAuth deployment handoff

No new D1 migration is required. No vector reindex is required for the CAAR correction because structured reflection rows are not in the Vectorize corpus; the production pipeline hash remains `0f7f47a4116e02d59f2622824e4535cda5c92ffa2eb0648deda04bd72309bed5`.

From Windows PowerShell with OAuth:

```powershell
npx wrangler login
npx wrangler d1 migrations apply consilium-webmcp-production --config wrangler.production.jsonc --remote
npm run deploy:production
```

Do not deploy from Debian. After the Windows deployment, run the existing bounded production proof only when a live consultation is explicitly authorized; this Pass made no live Workers AI call.
