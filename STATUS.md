# Phase 2 status

Updated: 2026-09-01 UTC

## Current phase
Worker architecture, longitudinal domain, source-fidelity, retrieval, and council foundation implemented. Local D1/Miniflare integration and external activation remain blocked.

## Preserved checkpoint
- Baseline: `be5b4f10fcfa25286cf8e27f4649f6da701291af` on `main`.
- Python prototype remains intact under `app/` and `tests/`; it has not been weakened or removed.

## Completed evidence
- Four ADRs: runtime/storage, append-oriented history, dual-lane RAG/citations, Agents SDK compatibility.
- One Worker serves API/assets with D1, Vectorize, and explicit fixture/OpenAI adapter boundary.
- D1 migration models users/sessions, projects/goals/commitments, immutable timeline events, recommendation responses/outcomes, versioned patterns and counterevidence, source packs/chunks, appointments, consultations/reports, proposals/commits, vector metadata, and audit events.
- Synthetic 67-day history includes supported overload, rejected false morning pattern, successful adaptation, rejected advice, accepted failure, accepted success, goal changes, constraints, and recency shift.
- Counterfactual evaluation proves relevant history changes advice; negative control proves irrelevant memory does not.
- Three public-domain source packs with exact edition/translator metadata, canonical URLs, doctrine/anti-drift profiles, stable locators, and SHA-256 verified excerpt files.
- Personal and advisor Vectorize query contracts filter before top-k; advisor lane filters advisor + appointed pack version.
- Every accepted personalized claim is dual-grounded. Invalid/polluted citations are excluded and force chair abstention.
- Agents SDK graph constructs three distinct `gpt-5.6-terra` specialists as tools for a `gpt-5.6-sol` chair; Wrangler dry-run bundles it successfully without a paid call.
- WebMCP exposes seven stable capabilities plus dynamic single-use commit, including pattern explanation and appointed-source provenance.

## Test triggers and results
- T0 triggered by Worker/config/dependency changes: `npm run check` passed after final affected changes.
- T1/T2 triggered by timeline, source, retrieval, validation, and mutation changes: **19 meaningful Vitest cases passed across 5 files**.
- Worker dry-run passed with Wrangler 4.127.1; bundle sees D1, Vectorize, assets, and config.
- Python baseline tests were not rerun because the Python implementation was unchanged.
- T3 blocked: no authorized application API credential.
- T4 blocked: no authorized deployment/native WebMCP browser preview.

## Blockers / untested boundary
- Wrangler local D1 migration/Miniflare attempts fail with sandbox `listen EPERM 127.0.0.1`. No bypass attempted. D1 API integration and browser journey therefore lack runtime proof here.
- `wrangler types` generated the binding header but could not complete runtime types because the same socket restriction applies; the project uses published Workers types and strict T0 checks meanwhile.
- Git writes are blocked: `.git/index.lock` cannot be created because `.git` is read-only. Phase 2 work remains an uncommitted worktree on preserved baseline `be5b4f1`.
- No authorized `OPENAI_API_KEY`; live Responses/Agents and embeddings fail closed by design.
- No deployment, DNS, Cloudflare resource creation, or publication attempted.
- Vectorize index metadata-index creation and real D1/Vectorize hydration require authorized Cloudflare resources.

## Next safe action
Commit the verified Phase 2 work in an environment where `.git` is writable. External next step is an authorized Wrangler/Miniflare environment or deployment preview, then T4; T3 only after an explicitly supplied Worker secret.
