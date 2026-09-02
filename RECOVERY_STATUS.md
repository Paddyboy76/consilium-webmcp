# Recovery status — Pass 11 production seed reconciliation release blocker

Updated: 2026-09-02 UTC

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
