# Functional fidelity matrix — Pass 5

Checked 2026-09-02 against the read-only Brain2 frontend and backend inventories. Status means: **Present** (already proven before this pass), **Adapted demo** (same workflow with synthetic/public-domain limits), **Restored Pass 5**, or **Excluded** (stated reason). Documentation here records implementation; it does not stand in for it.

| Original capability | Status | Consilium WebMCP proof |
|---|---|---|
| Consilium shell, black/orange mono hierarchy, desktop sidebar, mobile drawer | Present | `web/index.html`, `web/styles.css`, 1440px and 390px browser captures |
| Home/Today command view and intelligence summary | Present | Active Today goals, latest adaptation, history, staged/committed state, morning-brief entry |
| Exact PHY/MNT/SPR/SOC/FIN/VOC areas | Present | Six D1 areas, purposes, projects, Today goals, progress/reflection history in each |
| Projects/missions/goals with why, horizon, target and progress | Present | Mission form and generic D1 mission model |
| Explicit mission status and tracking | **Restored Pass 5** | Progress form/API changes active, paused or completed status with an audited outcome |
| Standalone journal linked to area/goal | **Restored Pass 5** | `journal_entries`, human form, `record_journal_entry`, area filters and chronology |
| Full longitudinal history | **Restored Pass 5** | Journal, legacy reflections, structured nightly records, extracted facts, goal outcomes, adaptations, directives and progress share one inspectable timeline |
| Nightly biometrics, anchor journal, exact six CAAR prompts | Present | Shared validator for UI and WebMCP; relational persistence |
| Review every active Today goal; missed reason and Version-2 adaptation | Present | Ownership/completeness validation and per-goal D1 rows |
| Morning brief derived from actual state | Present | Latest reflection, readiness, goals, outcomes, progress, counterevidence and prior recommendations select persisted priorities; fallback is labelled |
| Appointed advisors and source-pack visibility | Present | Explicit appointment UI, 18 canonical public-domain passages with work/edition/locator metadata |
| Distinct council voices, evidence/counterevidence, uncertainty/disagreement | Present | Per-advisor validated reports; two evidence lanes; canonical ID allowlist; abstention/fallback semantics |
| Transparent loading stages and flight recorder | Present | Genuine Brain2 Enso, named stages, stored consultation trace and tool input/result audit |
| Smallest plan change staged without mutation | Present | Pending proposal supersedes earlier pending state and reports `persistedAction:false` |
| Explicit one-time approval changes operational state | **Restored Pass 5** | Commit creates an audit-linked Today goal in the target area; Today, Missions and Brief render it; replay is 409 |
| WebMCP reads / structured writes / gated actions catalogue | **Restored Pass 5** | 13 contracts visibly grouped; ordinary browsers state discovery unavailable while keeping the full catalogue and human workflows |
| D1/Vectorize/Workers AI Cloudflare runtime | Present | Production config bindings and dry-run; local tests use deterministic fixtures and make no live AI call |
| Large private Brain2 history, Chroma DB and personal journals | **Excluded** | Privacy and public-demo boundary; deterministic synthetic history replaces it |
| Private/copyrighted uploaded library and PDF upload | **Excluded** | Legal/data boundary; only small attributed public-domain packs are shipped |
| Gemini/OpenAI runtime and provider-specific token UI | **Excluded** | Runtime constraint; Workers AI is the only production inference provider and provider-neutral audit is truthful |
| Debian/FastAPI/Postgres production stack | **Excluded** | Cloudflare-native Worker + D1 + Vectorize + Workers AI requirement |
| Brain2 multi-screen AI project-generation wizard | **Adapted demo** | The complete persisted planning semantics are retained in a direct mission form; speculative generation is omitted, not goal/project capability |

Browser evidence is in `artifacts/pass5/`; the executable journey is `scripts/capture-pass5.mjs`.
