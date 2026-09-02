# Test and evaluation strategy

Tests protect material behavior; there is no target count.

| Risk | Protected behavior | Test / eval | Trigger | Cost | Last validated SHA |
|---|---|---|---|---|---|
| Schema/code drift | Worker types, bindings, lint | `npm run check` | affected TS/config | T0 free | pending |
| Timeline flattening | 60+ days, typed history, supersession | D1 seed contract | schema/seed change | T1 free | pending |
| False personalization | Relevant history changes advice; irrelevant does not | counterfactual fixture eval | memory/pipeline/release | T2 free | pending |
| Pattern overclaim | Support, counterevidence, temporal confidence | pattern inference eval | pattern/seed change | T2 free | pending |
| Decorative citations | Dual grounding and canonical equality | citation validator tests | retrieval/validator/source | T1/T2 free | pending |
| Councillor drift | Own doctrine only; cross-pack leakage blocked | fidelity golden/forbidden cases | pack/prompt/model | T2 free | pending |
| Unsafe mutations | proposal/commit once and session isolation | D1 API integration | mutation code | T1 free | pending |
| Forgeable ownership | Signed-cookie tamper, expiry, version, omission, forged header, replay | session/API ownership contracts | session/cookie/key rotation | T1 free | hardening worktree |
| Commit race | DB unique invariants + two racing commit attempts leave one action/audit | in-memory SQLite migration behavior | migration/commit SQL | T1 free | hardening worktree |
| Retrieval injection | Personal/source poison cannot alter appointments, invoked agents, evidence ownership, recommendation fields, or mutation authority | red-team fixture eval | retrieval/prompt/validator | T2 free | hardening worktree |
| Semantically irrelevant citation | Correct-lane/correct-advisor but unrelated passage fails | per-pack positive/negative support calibration | source/claim/threshold | T2 free | hardening worktree |
| Pipeline mixing | Manifest hash binds runtime config and immutable vector schema | manifest/hash contract | any pipeline component | T0/T1 free | hardening worktree |
| Unbounded operation | Councillor/top-k/body/output/rate/timeout/subrequest caps | limit and cancellation contracts | limits/runtime | T1 free | hardening worktree |
| SDK incompatibility | Worker bundle/import succeeds | Wrangler dry-run + Miniflare import | dependency/runtime change | T0/T1 free | pending |
| Model regression | Live distinct agents + structured output | fixed OpenAI smoke set | authorized credential + phase boundary | T3 paid | blocked |
| Browser integration | Real WebMCP journey/state reconciliation | deployed golden journey | each deployed SHA | T4 | blocked |
| Recovered operating loop | Four-area seed; mission → failure → reflection → brief evidence influence; shared tool audit | Worker/D1 integration + local HTTP marker journey | product/schema change | T1 | recovery build |

Unchanged green suites are not rerun for reassurance. Paid tests require explicit credential authorization.
