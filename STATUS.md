# Hetzner release-candidate status

Updated: 2026-09-01 UTC

## Checkpoint and scope

- Authoritative start: clean `cede147620c65b14fa0b76ea9ed2a485b50a82d3` on `main` (verified before edits).
- This sprint preserves the Phase 2 design and all P0 capabilities. It fixes one demonstrated WebMCP defect: browser schemas expected obsolete 12-hex IDs while the runtime issues UUID-shaped trace/proposal IDs.
- No deployment, public resource, paid OpenAI application call, OAuth credential inspection/reuse, or out-of-scope service change occurred. `OPENAI_API_KEY` was not created or used.

## Readiness matrix

| Evidence level | Status | Exact evidence |
|---|---|---|
| Implemented | Ready | Longitudinal memory, causal patterning, dual grounding, appointed-source fidelity, signed session ownership, atomic one-action commit, safe trace, proposal/commit separation, eight WebMCP tools, fixture/live label, isolated acceptance and release scripts |
| Tested in-process | Passed | Final suite: 10 files, 42 meaningful tests; fresh-migration Worker seed integration proves context plus 96 events, 3 patterns, 6 source chunks, and 3 appointments |
| Built locally | Passed | Final `npm run release:check -- --skip-install --skip-http`: 3 assets, 3903.40 KiB raw / 687.18 KiB gzip; no deployment |
| Tested through real local HTTP | Passed | Supervisor `npm run acceptance:hetzner` passed all nine checkpoints using the hardened ephemeral-port/run-identity harness. Result explicitly reported no OpenAI or remote Cloudflare calls. |
| Externally tested | Not claimed | No Cloudflare resources/deployment, deployed browser T4, production Workers AI/Vectorize retrieval, or live URL was exercised |
| Intentionally blocked by missing authorization | Not claimed | OpenAI Agents/Responses application T3: real adapter remains fail-closed without separately authorized `OPENAI_API_KEY` |

Hetzner release-candidate readiness means the repository is reproducible and ready for the supervising SSH HTTP command and later publication. It does not mean externally deployed or live-model proven.

## Hardening audit

`docs/HARDENING_EVIDENCE.md` maps accepted behavior to behavioral proof: the `/api/memory` production branch now invokes the Workers AI BGE boundary, applies pre-query Vectorize filters, and hydrates only canonical/pipeline-compatible D1 rows; the immutable manifest/order; HMAC cookie attacks/rotation/replay; cross-session trace/proposal isolation; D1 conditional batch plus unique indexes for one action/audit; both-lane injection red teams; unrelated-citation and score-floor rejection; pipeline hash schema/write paths; operating limits; and exact public-domain provenance/hashes. Repository runtime reads only packaged synthetic/public sources; there are no further Brain2 reads.

## Finalization evidence

- Fixture acceptance config omits Workers AI and Vectorize bindings, supplies a random signing secret only through the Wrangler process, uses unique `/tmp` D1 state, applies migrations 0001+0002, binds `127.0.0.1`, and traps cleanup.
- Fresh checkout entry point: `npm run release:check` (`npm ci`, static checks, tests, no-deploy build, diff hygiene, local HTTP acceptance—each once).
- `.gitignore` excludes environment/secret files, Wrangler state, DB journals, logs, coverage/build output, and generated proof artifacts while source manifests remain trackable.
- Publication commands and rollback are staged but unexecuted in `docs/CLOUDFLARE_PUBLICATION.md`.
- Final successful sandbox RC sequence passed TypeScript/ESLint, all 42 tests, Wrangler dry-run, and diff hygiene. HTTP was skipped because this sandbox reproduces `listen EPERM`.
- Worktree and every tracked Git revision produced no filenames matching API-key/private-key/token value signatures. Git object paths produced no Brain2, Next Shift, private journal database, Chroma, `.env`, or `.dev.vars` matches.
- Supervisor HTTP evidence first found a pattern INSERT arity defect; removing its surplus placeholder was necessary but a rerun still returned 500. An exact fresh-migration SQLite integration then proved every SQL value/constraint while exposing the remaining D1-only issue: statement-per-row seeding required 143 D1 statements in one request, incompatible with the configured 40-subrequest budget. Seven `json_each` bulk inserts reduce the complete first-context path to 14 statements while preserving 96 canonical events, 3 patterns with evidence, 3 packs/6 chunks, and 3 appointments.
- Acceptance-only diagnostics are enabled only in `wrangler.acceptance.jsonc`. A seed failure returns/logs `SEED_FAILURE` plus one fixed stage name; it never includes the underlying exception, SQL, parameters, records, cookies, or secrets. Harness failures additionally cap/redact the response and Wrangler tail; cleanup removes all temporary state.
- Direct fresh local D1 commands proved both identity INSERTs succeed. The exact D1-specific failure was acceptance ordering under Wrangler 4.127.1: pre-start migration state was not visible in the Worker’s newly initialized D1 object. The harness now starts dev, waits for stateless health, applies 0001+0002 to that live persistence directory, and only then begins authenticated/stateful proof.
- The former fixed-port readiness check could accept a stale Worker after its newly spawned Wrangler failed to bind. It is removed. The OS now selects a free ephemeral loopback port; readiness requires the exact child PID to remain alive, its own log to contain no bind/start failure, and `/api/health` to echo a random non-secret instance ID supplied only to that run. Wrangler runs in a dedicated process group that cleanup terminates recursively.
- The random signing key is no longer present in process argv. It is written under umask 077 to a temporary Wrangler env file, redacted from bounded diagnostics, and deleted with the entire temporary directory.
- Current supervisor proof is green: fixture health/signed cookie; longitudinal context/patterns; canonical support/counterevidence; appointed council/source provenance; dual-grounded advice/pipeline identity; cross-session/header/cookie forgery rejection; proposal separation with owner-only atomic commit and replay rejection; session-owned reset; and visible UI/WebMCP assets all passed through real local HTTP.

## Remaining external actions

1. With separate Cloudflare authority, create isolated resources in manifest order, configure a new session secret, deploy, and run one T4 browser journey.
2. Only with separate paid-API authorization, configure the application’s OpenAI key and run T3. Codex-assisted evaluation is not T3.
