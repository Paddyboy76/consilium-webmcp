# Hetzner local HTTP acceptance

Run from a supervising Debian SSH shell outside the Codex sandbox:

```bash
cd /home/patadmin/consilium-webmcp
npm ci
npm run acceptance:hetzner
```

The command asks the OS for a currently free ephemeral port and binds Wrangler only to `127.0.0.1`; no fixed port or user override is used. It creates a uniquely named directory below `/tmp` under a restrictive umask and writes the random test-only session key to a mode-0600 Wrangler `--env-file`, so the key is absent from process argv. It starts fixture mode using `wrangler.acceptance.jsonc`, verifies the exact spawned process group remains alive, rejects bind/start errors in its own bounded log, and accepts health only when the response contains that run's random non-secret instance identifier. It then applies D1 migrations `0001_initial.sql` and `0002_hardening.sql` to the initialized local persistence directory before any stateful assertion.

Cleanup terminates the entire dedicated Wrangler process group (including descendants), waits, escalates to group KILL only if required, and removes the env file, D1 state, and log on every normal, error, interrupt, or termination exit. The acceptance config deliberately has no Workers AI or Vectorize binding. It does not read repository `.env`/`.dev.vars`, call OpenAI, contact remote Cloudflare services, or deploy.

Expected final line:

```text
RESULT Hetzner HTTP acceptance passed: no OpenAI or remote Cloudflare calls.
```

The preceding `PASS` lines prove through real HTTP: fixture health; secure signed-cookie attributes and distinct sessions; 67-day context; pattern support and counterevidence; appointed council and exact source records; dual-grounded consultation and pipeline identity; owner-only safe trace; rejection of cross-session, forged-cookie, and forged-header trace access; proposal without persistence; cross-session commit rejection; exactly one successful commit; repeated-commit rejection; reset ownership; and visible UI/WebMCP assets.

On any HTTP assertion failure, the client prints only the method/path label, expected and actual status, and at most 500 characters of a response preview with cookie/test-secret forms redacted. The wrapper then prints at most the final 120 Wrangler log lines and truncates each to 500 columns after redacting the exact process-only signing secret and cookie values. Its exit trap kills Wrangler and deletes the entire temporary directory even on failure.

Earlier supervisor runs exposed and drove repair of a pattern-seed SQL value-count defect and an over-budget 143-statement row-at-a-time seed. The repaired bulk path uses 14 statements for the complete context request, below the configured 40 budget. Those earlier partial runs are not counted as passes.

A later safe diagnostic identified `identity-user/schema-missing`. Direct local D1 execution proved both identity statements succeed after migrations. A bounded Wrangler reproduction confirmed the orchestration defect: applying migrations before Wrangler dev startup left the Worker with an empty initialized D1 object, while starting dev first and applying the same migrations to its live persistence directory returned context HTTP 200 with 96 events. The harness uses that proven order.

A later supervisor attempt exposed a harness ownership defect rather than application evidence: a stale prior acceptance Wrangler still owned fixed port 18765, the new child failed to bind, and health reached the stale process. That run is invalid and is not counted. The fixed-port path is removed; per-run instance identity, child liveness, child-log startup checks, ephemeral port selection, and process-group cleanup now fail closed on ambiguity.

## Current supervisor evidence

The current `npm run acceptance:hetzner` run passed all nine checkpoints:

1. Fixture health and server-issued signed-cookie attributes.
2. Longitudinal context and inferred patterns.
3. Canonical pattern support and counterevidence.
4. Appointed council and exact source provenance.
5. Dual-grounded consultation advice and pipeline identity.
6. Cross-session trace isolation plus header and cookie forgery rejection.
7. Proposal-without-commit, owner-only atomic commit, and replay rejection.
8. Session-owned reset.
9. Visible UI and WebMCP asset delivery.

Final result: `Hetzner HTTP acceptance passed: no OpenAI or remote Cloudflare calls.` This is real local fixture HTTP evidence, not deployed browser T4, production Workers AI/Vectorize, or OpenAI application-runtime proof.

Only this acceptance configuration sets `ACCEPTANCE_DIAGNOSTICS=safe-seed-stage`. If bulk seeding still differs under D1, the response/log contains only `SEED_FAILURE`, one fixed phase name (`identity-user`, `identity-session`, `seed-check`, `project-goal`, `events`, `patterns`, `pattern-evidence`, `source-packs`, `source-chunks`, or `appointments`), and a fixed error category. It never serializes the caught exception, SQL, bound values, or source records.

For the complete fresh-checkout release sequence, use `npm run release:check`. `scripts/release-check.sh --skip-install` is only for an already lockfile-installed workspace; `--skip-http` is only for a socket-restricted sandbox and is not final HTTP evidence.
