# Final Hetzner handoff

## Outcome

The repository is a reviewable Cloudflare-backed release candidate based on clean checkpoint `cede147620c65b14fa0b76ea9ed2a485b50a82d3`. Supervisor local/server live acceptance remains green. After two browser-found contract repairs, the Browser/WebMCP rerun passed bounded personal-memory search, canonical dual-grounded council consultation, and visible honest UI/trace/guardrail state on the current Worker. Paid OpenAI application T3 remains separately unclaimed.

## What changed

- Corrected WebMCP trace/proposal input schemas to match runtime UUID IDs, restoring dynamic inspect/commit usability.
- Added a visible fixture-versus-live reasoning label sourced from `/api/health`.
- Added a dedicated local acceptance configuration with no AI/Vectorize bindings and scripts proving the full HTTP ownership and golden journey.
- Added a fresh-checkout release command, runtime artifact ignores, supervisor acceptance guide, and unexecuted publication/rollback plan.
- Corrected stale checkpoint/pending-commit/“partially ready” documentation and added explicit evidence levels.
- Repaired the supervisor-discovered first-seed D1 pattern INSERT arity defect. Acceptance failures now include bounded, redacted response and Wrangler diagnostics without retaining temporary state.
- Replaced 143 statement-per-row seed operations with bounded bulk inserts and added a fresh-migration Worker integration test that verifies canonical row counts. Acceptance-only failures expose only a fixed seed-stage code.
- Removed fixed-port/stale-process ambiguity and argv secret exposure from the acceptance wrapper; cleanup now owns the full Wrangler process group.

## Exact commands

```bash
cd /home/patadmin/consilium-webmcp
npm run acceptance:hetzner
```

For a fresh checkout, `npm run release:check` installs from `package-lock.json` and then runs every release check once. Full acceptance behavior and expected output are in `docs/HETZNER_ACCEPTANCE.md`.

## Evidence separation

| Category | Result |
|---|---|
| Implemented | All P0 capabilities plus final acceptance/reproducibility packaging |
| Tested in-process | Strict TypeScript/ESLint passed; 10 test files / 42 tests passed |
| Built/no-deploy | Wrangler 4.127.1 dry-run passed: 3 assets; 3903.40 KiB raw / 687.18 KiB gzip |
| Tested via real local HTTP | Passed all nine supervisor checkpoints: health/cookie, memory/patterns, canonical evidence, council provenance, dual grounding, forgery isolation, atomic commit/replay rejection, reset ownership, and UI/WebMCP assets |
| Externally tested | Browser/WebMCP memory search, 3/3 validated dual-grounded council consultation, canonical evidence, and visible honest UI/trace/guardrail passed on the current Worker |
| Server-live corroboration only | Proposal creation, owner-only atomic commit, replay rejection, and reset ownership |
| Externally untested | OpenAI application runtime/Agents SDK, custom domain/Access |
| Intentionally blocked | OpenAI application T3/Agents runtime without separately authorized paid credential |

## Publication boundary

No GitHub push, custom DNS/route change, Hallermann change, or OpenAI application call occurred. Cloudflare mutations were limited to the named Consilium Worker, D1 database, Vectorize index/metadata indexes, and Worker session secret. The temporary ingestion secret was removed. Do not configure `OPENAI_API_KEY` without distinct authorization.

## P0 cut policy

Never cut append-oriented memory, memory-shaped advice, causal/counterevidence proof, dual grounding, appointed source fidelity, canonical/semantic citation rejection, session ownership, atomic commit, injection resistance, safe trace, or the eight-tool WebMCP lifecycle.

## Cloudflare handoff

The isolated deployment is live at `https://consilium-webmcp.patrickhallermann.workers.dev`, current version `1cdcd452-4a55-443a-98fa-058ee35260be`. D1 `consilium-webmcp-prod` and Vectorize `consilium-evidence-bge768-v2` contain only synthetic demo memory and packaged public-domain evidence. The supervisor Browser/WebMCP rerun passed exact `limit: 5` memory behavior and the exact 45-minute council question with 3 reports, 3 validated reports, canonical personal/advisor IDs, a non-abstained dual-grounded decision, honest pipeline identity, and visible passing trace/guardrail state. Mutation controls remain server-live corroborated rather than browser-proven. Exact evidence and boundaries: `docs/CLOUDFLARE_LIVE_EVIDENCE.md`.
