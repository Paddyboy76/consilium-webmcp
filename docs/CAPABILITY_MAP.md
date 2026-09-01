# Capability preservation map

Baseline checkpoint: `be5b4f1` (Python prototype retained intact).

| Capability | Reference behavior | Phase 2 design | Status / proof | Gaps |
|---|---|---|---|---|
| Autobiographical memory | Journal/history recall | Append-only events + typed observations | Implemented; 67-day causal eval passes | Real HTTP harness ready; sandbox socket-blocked |
| Projects/goals/checkpoints/commitments | Planner state | Identity rows + transition events | Migration covers all | UI detail pending |
| Reflections/friction/wins/failures/adaptations | Mixed memory | Typed timeline events with outcomes | Fresh D1 seed and supervisor HTTP context passed | Deployed browser proof pending |
| Pattern and temporal synthesis | Historical patterns | Versioned patterns with support/counterevidence | In-process eval and supervisor HTTP support/counterevidence passed | Deployed browser proof pending |
| Recommendations/feedback/outcomes | Advice and follow-through | Recommendation→response→action→outcome links | Seed + behavioral proof implemented | Outcome-recording UI pending |
| Appointed councillors | Advisor selection | Versioned appointment records controlled by user | D1 appointment seed/API/WebMCP implemented | Appointment mutation UI pending |
| Advisor-specific RAG | Private advisor corpus | Verified public-domain packs, filtered lane | Three packs + metadata-filter contract pass | Live embeddings blocked |
| Citation provenance | Source-backed advice | Canonical D1 hydration + byte validator | Exact excerpt/locator/SHA tests pass | Deployed D1 hydration proof pending |
| Consultation history/traceability | Consultation records | Evidence bundles, reports, traces, validation events | Supervisor HTTP dual-grounding, trace ownership, and forgery rejection passed | Deployed browser proof pending |
| Proposal versus commit | Two-stage mutation | Session-bound, idempotent commit + audit | In-process race plus supervisor owner-only commit/replay/reset lifecycle passed | Deployed browser proof pending |

The Python prototype must remain until every row is implemented and backed by behavioral proof.
