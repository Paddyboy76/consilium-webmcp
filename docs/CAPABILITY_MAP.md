# Capability preservation map

Baseline checkpoint: `be5b4f1` (Python prototype retained intact).

| Capability | Reference behavior | Phase 2 design | Status / proof | Gaps |
|---|---|---|---|---|
| Autobiographical memory | Journal/history recall | Append-only events + typed observations | Implemented; 67-day causal eval passes | Local D1 runtime blocked by socket sandbox |
| Projects/goals/checkpoints/commitments | Planner state | Identity rows + transition events | Migration covers all | UI detail pending |
| Reflections/friction/wins/failures/adaptations | Mixed memory | Typed timeline events with outcomes | 60-day seed generator | D1 seed validation pending |
| Pattern and temporal synthesis | Historical patterns | Versioned patterns with support/counterevidence | Implemented; true/false/temporal eval passes | Browser proof pending |
| Recommendations/feedback/outcomes | Advice and follow-through | Recommendation→response→action→outcome links | Seed + behavioral proof implemented | Outcome-recording UI pending |
| Appointed councillors | Advisor selection | Versioned appointment records controlled by user | D1 appointment seed/API/WebMCP implemented | Appointment mutation UI pending |
| Advisor-specific RAG | Private advisor corpus | Verified public-domain packs, filtered lane | Three packs + metadata-filter contract pass | Live embeddings blocked |
| Citation provenance | Source-backed advice | Canonical D1 hydration + byte validator | Exact excerpt/locator/SHA tests pass | Deployed D1 hydration proof pending |
| Consultation history/traceability | Consultation records | Evidence bundles, reports, traces, validation events | D1 API implemented | Local integration blocked by socket sandbox |
| Proposal versus commit | Two-stage mutation | Session-bound, idempotent commit + audit | Authorization behavior passes; D1 API implemented | Miniflare integration blocked by socket sandbox |

The Python prototype must remain until every row is implemented and backed by behavioral proof.
