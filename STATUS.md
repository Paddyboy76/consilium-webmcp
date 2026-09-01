# Phase 2 hardening status

Updated: 2026-09-01 UTC

## Checkpoint and scope
- Start checkpoint: `2dfb0b21b4908ad316c5549959ead9aa66824440` on `main`.
- Targeted hardening only; longitudinal memory, causal advice, dual grounding, appointed councillors, source fidelity, fail-closed validation, and eight-tool WebMCP flow are preserved.
- No redesign, deployment, resource creation, credential inspection, or paid OpenAI call occurred.

## Completion evidence

1. **Production embeddings corrected.** ADR 0005 and `config/vectorize.production.json` bind one `consilium-evidence-bge768-v2` cosine index to Workers AI `@cf/baai/bge-base-en-v1.5`, 768 dimensions. Five string metadata indexes precede insertion; filters cap at 1800 bytes versus the verified 2048-byte platform limit. `session_id` is absent. The offline embedder is named `deterministic-test-fixture`.
2. **Server-owned sessions.** `worker/session.ts` issues HMAC-signed, 24-hour, versioned `HttpOnly; Secure; SameSite=Strict` cookies using Worker secrets. Client session headers are ignored. Tamper, expiry, format/key version, omission, visible-header forgery, rotation, and cross-session replay contracts pass. This is demo session isolation, not identity authentication.
3. **Race-safe commit.** Migration 0002 creates unique action/audit-per-proposal indexes. The Worker uses one transactional D1 `batch()` with conditional ownership/status update and `INSERT ... SELECT ... ON CONFLICT DO NOTHING`, then decides from D1 `meta.changes`. The SQLite migration behavioral test runs two racing attempts and leaves exactly one action and one audit record; cross-session commit leaves zero.
4. **Both retrieval lanes hostile.** Model input is structurally delimited as untrusted data with no policy, appointment, secret, tool, evidence-ID, or mutation authority. Specialists contain the same contract; the chair sees validated reports only. Personal and source injection red teams preserve appointed/invoked agents, evidence ownership, decision fields, and empty mutation requests.
5. **Semantic support layered.** Validation now checks IDs, lane, advisor, pack/version, canonical hash/locator, calibrated per-pack retrieval floor, claim type/support relationship, and pre-reviewed fixture claim mappings. Correct-advisor but unrelated citations fail with `SEMANTIC_SUPPORT_NOT_PRE_REVIEWED`; below-floor evidence fails.
6. **Reproducibility.** `config/pipeline.json` hashes to `1f5efdc1c1ef895b221f8dba3ab9c6b64139eb4265eb33a154ba560aa761109f`. The hash is bound in Wrangler and recorded by pattern, vector, consultation, report, and recommendation schema/write paths. Incompatible pipelines require rebuild/supersession.
7. **Operating limits.** Maximum 3 councillors, top-k 8 personal/6 advisor, 8 KiB body, 600-character question, bounded structured outputs, 25-second cancellation contract, 6 consultations/session/hour, 30,000 ms configured CPU, 40 configured subrequests, and 18 expected golden-journey subrequests.
8. **Source/repository safeguards.** Per-edition US public-domain reasoning, separate raw acquisition and normalized hashes, normalization, and boilerplate/trademark exclusions are machine-readable in `sources/provenance.json` and tested.

Detailed commands and proof mapping: `docs/HARDENING_EVIDENCE.md`.

## Verification
- Affected T0/T1/T2 checks passed during implementation.
- Latest pre-final complete suite: `npm run check && npm test` → **9 files, 41 tests passed; 0 failed**.
- Final release-candidate T0/tests/Wrangler dry-run passed: **9 files, 41 tests, 0 failures**, 3 assets, 3898.56 KiB raw / 685.97 KiB gzip. Its combined shell then found only a trailing blank line in this status file; that was removed and `git diff --check` passed without rerunning unchanged suites.
- Worktree scan and full tracked-history scan found no API keys, OAuth/token patterns, or private-key blocks. Tracked object-path scan found no Brain2, Next Shift, `.env`, `.dev.vars`, Chroma, or journal database paths.
- Node SQLite applies migrations 0001+0002 and proves database uniqueness/ownership behavior without Miniflare.
- T3 intentionally not run: no authorized OpenAI application credential.
- T4 intentionally not run: no deployment/preview authority.

## Locally unprovable boundary
- Wrangler local D1/Miniflare and `wrangler types` runtime generation require localhost socket creation; this sandbox returns `listen EPERM 127.0.0.1`.
- Real Workers AI/Vectorize semantic retrieval requires authorized Cloudflare resources. Fixture embeddings are not claimed as production retrieval proof.
- Workerd startup is unmeasured because of the socket restriction. Current official startup limit is one second; dry-run bundle size is recorded separately.
- `SESSION_SIGNING_KEY` and optional previous rotation key must be supplied as Worker secrets before runtime; no secret is committed.

## Next action
The supervising shell should review and commit the clean hardening worktree if `.git` remains sandbox-read-only. In an authorized preview environment: create metadata indexes in manifest order, migrate D1, supply the session secret, run the browser T4 journey, and only later run T3 if an OpenAI reasoning secret is explicitly authorized.
