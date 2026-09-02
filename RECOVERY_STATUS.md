# Recovery status — Pass 6

Updated: 2026-09-02 UTC

## Observed production failure

Pass 5 commit `26fc3c780dbf66e45c674d59efab2d3d09f310c5` is deployed as Worker version `55647ce7-fd6f-4caa-95e1-781def5baa83`, with migrations 0003–0006 applied. The live 13-tool WebMCP journey works, but its one bounded `consult_council` call returned `modelMode: deterministic-fallback` and `fallbackReason: AI_UNKNOWN_PERSONAL_CITATION`. The canonical allowlist correctly rejected a model-invented personal identifier; the safety boundary held, but generated citation selection was not reliable enough for the final production proof.

## Pass 6 repair

- Removed every citation-identifier field from the Workers AI output contract. The model now returns a strict fixed-key object for exactly `marcus-aurelius`, `epictetus`, and `sun-tzu`, plus synthesis. Missing, wrong, duplicate-shaped, or extra advisor keys fail closed.
- Retrieval/server code now owns all evidence attachment. It selects canonical personal support, canonical counterevidence, and up to two passages from each advisor’s own retrieved appointed pack. The model receives those exact event and passage texts without their IDs and is asked only for bounded interpretation and prose.
- Added explicit provenance to output, persisted report validation, visible trace events, and the WebMCP audit record: evidence is `retrieval-server`; interpretation is `workers-ai-generated`; the model cannot select identifiers. No invented identifier is silently replaced.
- Preserved one bounded Workers AI call for all three reports and synthesis, the labelled deterministic fallback for genuine provider/schema failure, canonical D1/Vectorize allowlisting, non-mutation, durable trace, and proposal/approval gating.
- Updated `scripts/cloudflare-live-proof.mjs` for health mode `workers-ai-structured-with-labelled-fallback`. Final acceptance now requires `modelMode: workers-ai-structured`, `fallbackReason: null`, three distinct voices, retrieval-owned provenance, and membership of every personal/counter/source ID in the correct canonical lane and advisor pack; it no longer assumes one exact retrieved ID.
- Updated the production model configuration label to `workers-ai-json-council-v3-retrieval-owned-evidence`.

## Verification

- Targeted model-boundary and production-lane Worker tests cover a valid structured result, structurally impossible invented/cross-advisor IDs, malformed advisor sets, canonical hydration, persistence provenance, and non-mutation.
- The final full `npm run check`, `npm test`, and production-config dry-run are recorded at handoff after the final code change.
- No live Workers AI call, remote Cloudflare call, migration, or deployment was made in this pass.

## Deployment handoff

Deploy the clean committed `main` with `wrangler.production.jsonc`, then spend the single remaining live consultation only through `scripts/cloudflare-live-proof.mjs`. Acceptance requires the consultation to remain `workers-ai-structured` with no fallback. Stop and investigate without another consultation if any pre-consultation health, D1, Vectorize, source-pack, or session assertion fails.
