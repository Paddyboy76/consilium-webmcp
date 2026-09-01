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
| SDK incompatibility | Worker bundle/import succeeds | Wrangler dry-run + Miniflare import | dependency/runtime change | T0/T1 free | pending |
| Model regression | Live distinct agents + structured output | fixed OpenAI smoke set | authorized credential + phase boundary | T3 paid | blocked |
| Browser integration | Real WebMCP journey/state reconciliation | deployed golden journey | each deployed SHA | T4 | blocked |

Unchanged green suites are not rerun for reassurance. Paid tests require explicit credential authorization.
