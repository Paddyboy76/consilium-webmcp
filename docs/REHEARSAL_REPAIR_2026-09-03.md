# Rehearsal repair — 3 September 2026

## Outcome

The supervisor correction is based on existing `main` commit `f9306bc`. It is tested and deployment-ready, but it is **not live and not generation-ready proof**: no deployment, OAuth flow, browser rehearsal, or Workers AI inference was attempted from Debian.

The public health endpoint still returned HTTP 200 in Cloudflare mode with D1, Vectorize, and `@cf/meta/llama-3.1-8b-instruct-fast`. Wrangler could not read the current version list. The last repository-recorded version (`5faff90a-47b2-4edc-83b9-38c2f9e655e3`) predates later passes and is not claimed as the current deployment.

## Root cause and repair

- Official Cloudflare documentation and generated bindings confirm this model accepts `AI.run(model, { messages, response_format })` and returns `{ response, usage? }`. The observed live failure therefore was not shown to be an SDK wrapper mismatch. Its `response` existed but was not valid JSON. The old code discarded envelope/usage/length information, so the evidence cannot distinguish ordinary malformed JSON from token truncation after the fact.
- Model config v15 retains the existing 15,000 ms timeout and 1,600-token ceiling. Every generated string and collection remains bounded. Only the documented Workers AI envelope and an object or exact JSON response body are accepted. Safe diagnostics record wrapper type/keys, response type, output length, completion tokens, finish reason when present, truncation status, and exact parse stage—never prompt, raw output, credentials, or exception text. JSON Mode errors, refusals, run errors, wrapper mismatch, schema failure, quote-identity failure, semantic scope failure, and truncation are distinct.
- Every generated advisor report must select one advisor-owned canonical passage, reproduce a 2–10 word exact phrase, and explain its application and limitation. Server validation now enforces both word-count bounds, including rejection of a single four-character word. Exact membership establishes quote identity and appointed-pack ownership only; it is not semantic entailment proof. The generated application remains an interpretation with an explicit limitation. Quote mismatch, cross-lane slots, malformed output, and scope violations fail closed, and fallback remains explicitly labelled.
- Human submit and WebMCP `consult_council` now call the same `consultAndRender` path. The WebMCP question is returned by the server and rendered from the result, not from the textbox. In-progress state is genuine; completed question/reports/evidence/unknowns/model/fallback/trace/staged-only status render after the single request. The full validated result is session-persisted and hydrates on navigation/reload without replay or animation.
- Proposal targeting remains server-owned and scored against active goals plus all six life areas. Conservative duplicate validation rejects normalized exact/near matches and the bounded brother/family-member paperwork paraphrase, while different actions or recipients merely sharing family, house, or paperwork topics remain distinct. Rejection occurs before proposal staging.
- An approved distinct action now atomically creates exactly one new active Today goal in the selected parent goal’s life area and one action linked to that new goal. The proposal retains `target_mission_id`, so the original association is not overwritten. A proposal-derived deterministic goal ID, the existing D1 batch, unique action/audit constraints, ownership checks, and conditional status transition make concurrent/replayed commits converge without duplicate or orphan goals. The new goal is included in the existing per-goal evening-reflection completeness contract.
- Nightly reflection does not attach the unrelated `marcus-b2-15` passage (or any appointed passage) without relevant support. Its synthesis names only reflection/goal evidence and explicitly explains the citation omission. The UI also explains that Today is a frozen 2 September scripted journey while the separate fictional longitudinal evaluation corpus extends through 6 October; no history was silently rewritten.

## Exact verification

- Focused correction tests: `npx vitest run test/model.test.ts test/worker-seed.test.ts test/proposals.test.ts test/pass5-loop.test.ts test/atomic-commit.test.ts test/ui-fidelity.test.ts test/pass4-domains.test.ts` — 7 files, 45 tests passed. They prove no mutation at proposal time; one action plus one same-area Today goal at commit; retained parent target; successful review of the new goal; 200/409 concurrent replay with no duplicate/orphan; recipient/action-sensitive negatives; the required paperwork paraphrase positive; all six areas; UI contract wording; and malformed/unsupported output fail-closed behavior.
- Final `npm run check` — TypeScript and ESLint passed.
- Final `npm run deploy:check` — bundle dry-run passed with exit 0; 885.74 KiB, gzip 153.93 KiB. Wrangler also emitted a non-fatal read-only warning while attempting to write its debug log under the Debian home config path; bundling itself completed and no deployment was attempted.
- No new browser or live model rehearsal was run for this bounded correction. Prior browser evidence predates the corrected new-goal behavior and is not claimed as proof of it.

## Inference and browser proof boundary

- New council/model attempts used: **0 of 3**; remaining: **3**.
- Genuine live proof this correction: none; the Windows supervisor owns deployment and live verification.
- Local fixture tests prove server contracts and persistence behavior, not browser discovery, Workers AI generation, production transport, OAuth, remote D1 concurrency, or deployed state.
- Supervisor next step after deployment: verify one distinct approved action yields one new same-area Today goal and one linked action, then include that goal in evening reflection. Any separate model diagnostic should inspect `providerDiagnostic`; exact quote membership must not be interpreted as proof that the passage entails the generated advice.
