# Rehearsal repair — 3 September 2026

## Outcome

Repair implementation commit: `e0fb400` (based on the safely fast-forwarded documentation commit `e33c509`). The patch is tested and deployment-ready, but it is **not live and not generation-ready proof**: Debian Wrangler OAuth expired and its refresh request received a Cloudflare bot challenge, so no login was restarted and no deployment or Workers AI inference was attempted.

The public health endpoint still returned HTTP 200 in Cloudflare mode with D1, Vectorize, and `@cf/meta/llama-3.1-8b-instruct-fast`. Wrangler could not read the current version list. The last repository-recorded version (`5faff90a-47b2-4edc-83b9-38c2f9e655e3`) predates later passes and is not claimed as the current deployment.

## Root cause and repair

- Official Cloudflare documentation and generated bindings confirm this model accepts `AI.run(model, { messages, response_format })` and returns `{ response, usage? }`. The observed live failure therefore was not shown to be an SDK wrapper mismatch. Its `response` existed but was not valid JSON. The old code discarded envelope/usage/length information, so the evidence cannot distinguish ordinary malformed JSON from token truncation after the fact.
- Model config v14 retains the existing 15,000 ms timeout and 1,600-token ceiling. Every generated string and collection is now bounded. Only the documented Workers AI envelope and an object or exact JSON response body are accepted. Safe diagnostics record wrapper type/keys, response type, output length, completion tokens, finish reason when present, truncation status, and exact parse stage—never prompt, raw output, credentials, or exception text. JSON Mode errors, refusals, run errors, wrapper mismatch, schema failure, semantic failure, and truncation are distinct.
- Every generated advisor report must select one advisor-owned canonical passage, reproduce a 2–10 word exact phrase, and explain its application and limitation. Quote mismatch, cross-lane slots, malformed output, and scope violations fail closed. The fallback remains explicitly labelled and is never presented as generated reasoning.
- Human submit and WebMCP `consult_council` now call the same `consultAndRender` path. The WebMCP question is returned by the server and rendered from the result, not from the textbox. In-progress state is genuine; completed question/reports/evidence/unknowns/model/fallback/trace/staged-only status render after the single request. The full validated result is session-persisted and hydrates on navigation/reload without replay or animation.
- Proposal targeting is server-owned and scored against active goals plus six life-area vocabularies. Equivalent pending, committed, or active-goal actions are rejected. Commit links the action to the selected existing goal rather than creating a duplicate goal; D1 batch, unique proposal/action/audit constraints, ownership checks, and status transition preserve one-use atomicity and replay rejection. WebMCP refreshes state after propose/commit so its commit capability appears only while pending and disappears after use.
- Nightly reflection no longer attaches the unrelated `marcus-b2-15` passage (or any appointed passage) without semantic proof. Its synthesis names only reflection/goal evidence and explicitly explains the citation omission. The UI also explains that Today is a frozen 2 September scripted journey while the separate fictional longitudinal evaluation corpus extends through 6 October; no history was silently rewritten.

## Exact verification

- Focused tests: `npx vitest run test/model.test.ts test/worker-seed.test.ts test/proposals.test.ts test/pass5-loop.test.ts test/atomic-commit.test.ts test/ui-fidelity.test.ts test/pass10-adversarial.test.ts` — 7 files, 45 tests passed.
- Final `npm run check` — TypeScript and ESLint passed.
- Final `npm run deploy:check` — production-shaped bundle dry-run passed; 884.28 KiB, gzip 153.56 KiB.
- Isolated headless Chromium/WebMCP rehearsal: one Council POST; exact input fidelity; three fixture reports; reload hydration without replay; `SOC` target; no pre-approval action; commit capability removed; replay 409; one action; mission count stayed 12. Fixture trace: `trace-9cc0d25f-c728-4e77-ad74-a7d844d41658`.

## Inference and browser proof boundary

- New council/model attempts used: **0 of 3**; remaining: **3**.
- Genuine live proof this pass: public health HTTP 200 only.
- Browser proof this pass: real Chromium DOM and injected `document.modelContext`, against the local deterministic fixture Worker. It proves browser state/render/capability behavior, not Workers AI generation or production transport.
- Supervisor next step after deploying the final documentation commit: run one fictional diagnostic consultation first and inspect `providerDiagnostic`; only if structured generation succeeds should the separate real rehearsal be run. Do not retry a fallback merely to paint the UI, and do not approve Patrick’s staged action through automation.
