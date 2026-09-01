# Evening handoff — Phase 2 hardening

## Executive status
**PARTIALLY READY — locally hardened.** All requested locally provable security, persistence, retrieval, provenance, and operating-limit changes are implemented without cutting any P0 capability. External Workers AI/Vectorize, workerd startup, browser, and OpenAI reasoning proof remain intentionally unclaimed.

## Repository
- Path: `/home/patadmin/consilium-webmcp`
- Branch: `main`
- Hardening base: `2dfb0b21b4908ad316c5549959ead9aa66824440`
- Hardening commit: pending supervising shell if sandbox Git remains read-only
- Deployment/publication: not attempted

## Production pipeline
- Runtime: one Cloudflare Worker, D1 canonical store, one Vectorize index.
- Embeddings: Workers AI `@cf/baai/bge-base-en-v1.5`, 768 dimensions, cosine.
- Index: `consilium-evidence-bge768-v2`.
- Filter indexes created before insertion: `corpus_kind`, `user_id`, `advisor_id`, `pack_version`, `pipeline_version`.
- Reasoning remains separate: `gpt-5.6-sol` chair and three distinct `gpt-5.6-terra` councillors through Agents SDK. No paid call made.
- Pipeline hash: `1f5efdc1c1ef895b221f8dba3ab9c6b64139eb4265eb33a154ba560aa761109f`.

## Security hardening
- Client-controlled `X-Consilium-Session` is no longer authoritative or emitted by the UI.
- Server issues signed/expiring/versioned strict secure cookies. Key rotation accepts one explicit previous version until natural expiry and issues only the current version.
- Consultation, trace, proposal, commit, reset, action, and audit ownership use the validated server session.
- Atomic conditional D1 batch plus unique indexes permits exactly one action and commit audit per proposal.
- Both retrieval lanes are untrusted and structurally delimited. The chair receives only validated structured reports.
- Claim support includes semantic mapping/score calibration, not ID membership alone.

## Tests and command evidence
- T0: strict TypeScript and typed ESLint.
- T1: signed-cookie attacks/replay/rotation, schema migration, racing commit, cross-session commit, filter bounds, cancellation/limits, manifest hash.
- T2: preserved longitudinal causality/negative control, per-pack positive/negative retrieval calibration, unrelated valid-ID rejection, two injection red teams, source raw/normalized integrity.
- Latest complete suite before final RC: **9 files, 41 passed, 0 failed**.
- Final release-candidate checks: strict T0 passed; **9 files, 41 tests passed, 0 failed**; Wrangler dry-run passed. The combined command then stopped at `git diff --check` solely for a trailing blank line in `STATUS.md`; that formatting defect was removed and the diff/scan tail was rerun without repeating unchanged suites.
- Final Wrangler dry-run: 3 assets; 3898.56 KiB raw / 685.97 KiB gzip; bindings include D1, one BGE768 Vectorize index, Workers AI, assets, pipeline version, consultation limit, and session key version.
- Configured CPU/subrequests: 30,000 ms / 40. Expected golden journey: 18 subrequests. Workerd startup unmeasured (`listen EPERM`).

## Completion commands
- `npm run check`
- `npm test`
- `XDG_CONFIG_HOME=/tmp/consilium-xdg npm run deploy:check`
- `git diff --check`
- Worktree/history secret and forbidden-path filename scans described in final status evidence.

## Remaining blockers
1. Sandbox prohibits localhost sockets, blocking Miniflare/D1/browser integration and startup measurement.
2. No authorized Cloudflare resource creation/deployment, so real Workers AI/Vectorize retrieval and T4 are untested.
3. No authorized OpenAI reasoning key, so T3 is untested.
4. Runtime needs a new `SESSION_SIGNING_KEY` Worker secret (and only during rotation, optional previous secret/version). No secret exists in the repository.

## Minimal authorized next steps
1. Review/commit the hardening worktree from base `2dfb0b2`.
2. Follow `docs/VECTORIZE_RUNBOOK.md`, apply D1 migrations, and add `SESSION_SIGNING_KEY` with `wrangler secret put` in an isolated preview.
3. Run T4 once for that deployed SHA. Run the fixed multi-sample T3 reasoning evaluation only if separately authorized.

## Cut policy
Never cut longitudinal event/outcome memory, memory-shaped advice, causal proof, dual grounding, appointed source fidelity, semantic/canonical citation rejection, session ownership, atomic commit, injection resistance, or the WebMCP golden path. Cut extra councillors, cosmetics, optional entailment sophistication, and deployment automation first.
