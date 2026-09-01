# Phase 2 hardening completion evidence

Accepted hardening checkpoint: `cede147` (built from Phase 2 checkpoint `2dfb0b2`). No deployment or paid OpenAI call is part of this evidence.

| Item | Machine/command-backed criterion | Current evidence |
|---|---|---|
| Workers AI embedding lane | `/api/memory` production branch invokes the Workers AI BGE embedder, pre-filters Vectorize, and hydrates only canonical/pipeline-compatible D1 rows; fixture mode stays explicit | `worker/index.ts`, `test/pipeline-manifest.test.ts`, `test/retrieval.test.ts` |
| Server-owned sessions | Signed/expired/versioned/tampered/omitted/forged-header/rotation/replay behavior | `test/session.test.ts` |
| Atomic commit | Migration unique indexes + racing attempts yield exactly one action/audit | `test/atomic-commit.test.ts` |
| Hostile retrieval | Both injected lanes preserve appointments, invoked agents, evidence ownership, decision fields, and no mutation | `test/domain.test.ts` red-team cases |
| Semantic claim support | Correct-owner but unrelated citations fail; per-pack positive/negative and score-floor cases | `test/domain.test.ts` support calibration |
| Reproducibility | SHA-256 binds pipeline JSON to Wrangler; schema records hash on derived rows | `test/pipeline-manifest.test.ts`, migration 0002 |
| Operating limits | Three councillors, top-k 8/6, 8 KiB body, 600-char question, output schemas, 25s cancellation, six consultations/hour, 30s CPU/40 subrequests | `worker/limits.ts`, `test/limits.test.ts`, Wrangler dry-run |
| First-request seed budget | Seven bulk JSON inserts keep the full fresh-context path to 14 D1 statements; migrated integration checks canonical counts | `worker/index.ts`, `test/worker-seed.test.ts` |
| Sources | Separate raw-acquisition and normalized hashes plus exact runtime equality | `sources/provenance.json`, `test/source-integrity.test.ts` |

Release-candidate command: `npm run release:check`. The socket-restricted Codex run uses `scripts/release-check.sh --skip-install --skip-http`; the supervising SSH shell must run the default command for real HTTP evidence.

The final dry run reports 3 static assets and a Worker upload of 3898.56 KiB raw / 685.97 KiB gzip. Configured CPU is 30,000 ms, configured subrequests 40, and the golden journey budget is 18 expected subrequests. The current platform startup limit is one second; actual workerd startup cannot be measured here because sandbox socket creation returns `EPERM`. This is untested, not inferred.
