# Recovery status — Pass 2

Updated: 2026-09-02 UTC

## Identity and release

- Pass 2 starting SHA: `eb55fb6f468f590f2b37113785a602eca1b862ed` (clean and pushed).
- Pass 2 implementation/evidence SHA: `fcd78e889bdca93748977ddf27e09b675167b3c6`; this status-only closure follows it.
- Origin parity: both implementation and status closure are pushed to `origin/main` (verify final closure SHA with `git rev-parse HEAD`).
- Live Worker: intentionally unchanged during local work.

## Recognizable Consilium breadth

- Direct Brain2 reuse/adaptation is mapped in `docs/BRAIN2_REUSE_MAP.md`, including exact original paths, API adapters, and omissions.
- The shell uses Brain2's Sovereign identity and exact core mono/black/graphite/orange design language.
- Complete navigation: Today; areas/projects/goals; progress/patterns; morning brief; journal/reflection; council; library/advisors; transparency/analytics.
- D1-backed demo functions: mission creation, progress/outcomes, CAAR reflection, history-influenced brief, appointments, consultations/traces/recommendations, proposal, atomic commit, replay rejection, and audit.
- Approved plan changes visibly appear in Today, Missions, and Morning Brief. Pending proposals are separately labelled as application-unchanged.

## WebMCP and council

- 12 always-visible typed tool contracts: four state/evidence reads, four persisted planning/reflection workflows, trace-only consultation and inspection, proposal staging, and approval-gated commit.
- Ordinary browsers say “browser agent discovery unavailable” without suggesting the implementation is absent. The catalogue, read/write class, matching UI, and last tool call/result remain visible.
- Production council model/config: `@cf/meta/llama-3.1-8b-instruct-fast`, `workers-ai-json-council-v2`, one non-streaming `response_format.type=json_schema` call for three advisors plus synthesis.
- Only canonical retrieved personal items and appointed source passages enter the prompt. Server hydration rejects malformed output, the wrong advisor set, unknown personal IDs, and cross-advisor/unknown source IDs. Every report exposes reasoning, recommendation, uncertainty, confidence rationale, disagreement, both citation lanes, and counterevidence.
- Deterministic wording remains only `deterministic-test-fixture` locally or clearly labelled `deterministic-fallback` after production generation/validation failure. No OpenAI package, key, or provider remains.

## Corpus and derived index

- 3 narrow public-domain source packs; 6 passages each; 18 canonical advisor passages total. This is not full-book grounding and count is not a quality claim.
- Expected production derived index: 96 synthetic personal vectors + 18 advisor vectors = 114, Workers AI BGE base English v1.5, 768 dimensions.
- Canonical text, edition provenance, source hashes, stable IDs, and locators remain in D1/source manifests; Vectorize contains embeddings and lookup metadata.

## Local evidence

- Final local gate: `npm run check` passed; `npm test` passed (11 files / 53 tests); production-config Wrangler dry run passed with D1, Vectorize, Workers AI, and 3 static assets.
- Local Chromium contract: zero console/page errors; 1440 px body width equals viewport; 12 catalogue rows present.
- Screenshots: `artifacts/pass2/today-1440x900.png`, `missions-768x1024.png`, `journal-390x844.png`, `council-before-1440x900.png`, `council-after-1440x900.png`, and `transparency-1440x900.png`.
- Local browser golden contract (`deterministic-test-fixture`): proposal persisted with zero actions; explicit commit produced one action; same-proposal replay returned 409; approved change visible in Today, Missions, and Brief.
- This is local contract evidence only. A WebMCP-capable browser has not exercised the deployed journey, so no live golden-pass claim is made.

## Remaining release blocker

Final `npx wrangler whoami` returned Cloudflare HTTP 403 (bot-challenge HTML), then confirmed the OAuth token is expired and cannot refresh in this non-interactive environment. Per instruction, no API-token workaround was used. The sole remaining blocker is interactive Cloudflare reauthentication followed by:

```bash
npx wrangler d1 migrations apply consilium-webmcp-prod --remote --config wrangler.production.jsonc
npm run deploy:production
```

Then run at most two real Workers AI consultations, the WebMCP-capable browser golden journey, and live trace/proposal/commit/replay verification.
