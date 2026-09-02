# Recovery status — Pass 9 release gate

Updated: 2026-09-02 UTC

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
