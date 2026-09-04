# Consilium — WebMCP Recovery Edition

Consilium is a personal operating system in which lived history changes today’s plan. This Challenge Edition adapts the pre-existing Brain2/Consilium interaction architecture to one Cloudflare Worker: six life areas (physical, mental, spiritual, social, financial and vocational), cross-horizon missions, progress and outcomes, full six-question evening reflection and per-goal review, a history-grounded morning brief, an appointed council, inspectable sources, and proposal-before-commit control.

The persona and personal history are clearly synthetic. D1 is canonical state; Vectorize retrieves candidates; Workers AI supplies BGE embeddings and attempts one bounded structured council response in production. Invalid output fails closed to a visibly labelled deterministic fallback. The actual run mode and evidence are inspectable; deployed configuration alone does not prove successful generation. Reflection synthesis and morning briefs are deterministic transformations of canonical records. Citations establish provenance, not a guarantee that advice is true.

WebMCP exposes twelve normally available tools and a thirteenth one-use commit tool while a proposal is pending. The same interface and records serve human and agent interactions. [SUBMISSION.md](SUBMISSION.md) provides current submission copy; [DEMO.md](DEMO.md) contains the recording script and proof boundaries.

## Golden journey

1. Open **Home / Today** and inspect active areas, missions, recent evidence, and the latest adaptation.
2. In **Missions**, create a project or goal and log progress, an outcome, or a failure.
3. In **Journal / Reflection**, complete the concise CAAR form and name the Version-2 adaptation.
4. Refresh **Morning Brief**. The newest reflection ID and tomorrow implication must visibly change priority rationale.
5. In **Library / Advisors**, appoint up to three advisors from verified public-domain packs.
6. Ask any typed question in **Council**. Inspect advisor reports and the canonical personal/source IDs.
7. Open **Transparency / Trace** for source title, locator, exact excerpt, evidence score, uncertainty, and preserved disagreement.
8. Stage the recommendation as a proposal. Only the explicit commit control creates an action; replay is rejected.

The UI and WebMCP tools use the same endpoints and session-scoped D1 records. The in-product inspector names every tool and shows the most recent mutating call.

## Verify

```bash
npm ci
npm run check
npm test
npm run deploy:check
```

See [ARCHITECTURE.md](ARCHITECTURE.md), [RECOVERY_STATUS.md](RECOVERY_STATUS.md), [docs/DATA_PROVENANCE.md](docs/DATA_PROVENANCE.md), [docs/TEST_STRATEGY.md](docs/TEST_STRATEGY.md), [PREEXISTING.md](PREEXISTING.md), and [DEMO.md](DEMO.md).
