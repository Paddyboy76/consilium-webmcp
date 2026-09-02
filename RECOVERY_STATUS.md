# Recovery status — Pass 8

Updated: 2026-09-02 UTC

## Pass 8 result

- Maya remains explicitly synthetic, but the seed now follows one life: she is testing a small accessibility-audit service while serving existing clients; Priya’s short message stays unsent while Maya polishes the website; weak boundaries expand client work; phone-free walking and focus genuinely help; Mum’s dementia and the family-house sale carry love, repeated loss, guilt, memories, and family friction; one unused design-app renewal is simply cancelled.
- All six areas contain asymmetric, ordinary first-person scenes with linked people, goals, bodily/emotional state, consequences, authorship, outcomes, and provenance. The cross-area inference is calibrated: exposing actions often yield to tidy low-risk work, while urgency and a protected first action are recorded counterevidence.
- Replaced global newest-positive/newest-negative evidence with question-sensitive personal selection and linked context. Production now hydrates the actual top personal Vectorize matches from canonical D1 records and supplies exactly those records to the council. Indexed documents are versioned with area, relationship, linked goal, authorship, time, outcome, and provenance.
- Removed fixed advisor-answer anchors. Advisor retrieval uses the actual question plus a bounded legitimate scope; passage relevance affects ordering. Stable prompt slots preserve server ownership of canonical IDs and hashes, and only explicitly selected slots are hydrated onto claims.
- Upgraded the single bounded call to Cloudflare `@cf/meta/llama-3.3-70b-instruct-fp8-fast`, temperature 0.1, strict JSON mode, 25-second timeout, structural/semantic scope checks, and labelled deterministic fallback. No OpenAI provider was introduced.
- The persisted reasoning record now separates remembered facts, interpretations, conflict/duties, unknowns, rejected inferences, advisor scope/application/limits/counsel/abstention, tensions, synthesis rationale, rejected alternative, clinical boundary, one immediate proposal, one follow-up, and the unchanged approval state.
- Added an explicit imminent-risk pre-model gate that suppresses philosophical/productivity coaching and directs the person to immediate human support. Depression without imminent-risk wording receives a clinical boundary rather than a diagnosis or crisis claim.
- Council UI now follows: What I remember / What may be happening / What I cannot know / The council / Where they differ / Consilium’s synthesis / One proposed next move / Evidence and trace. Technical IDs, providers, locators, and hashes remain secondary and expandable.

## Verification

- `npm run check`: pass.
- `npm test`: 15 files, 69 tests pass, including Pass 8 continuity, six-area reflection quality, query-sensitive evidence, advisor scope, slot ownership, model schema, and imminent-risk routing.
- `npm run deploy:check`: production bundle succeeds; no deployment occurs.
- Desktop/mobile browser capture passes with no horizontal overflow:
  - `artifacts/pass8/01-desktop-serious-council.png`
  - `artifacts/pass8/02-mobile-journal.png`
  - `artifacts/pass8/03-desktop-today.png`
- No live Workers AI call, remote Vectorize/D1 mutation, or Debian deployment was made.

## Windows OAuth deployment handoff

Deploy clean `main` with `wrangler.production.jsonc`. The new pipeline hash is `0f7f47a4116e02d59f2622824e4535cda5c92ffa2eb0648deda04bd72309bed5`; re-run the authenticated vector ingestion so personal documents use the enriched Pass 8 canonical form before production consultations. Then run the bounded production proof and verify `workers-ai-structured`, exact D1 hydration of the personal retrieval trace, per-advisor source slots, and persisted validation records.
