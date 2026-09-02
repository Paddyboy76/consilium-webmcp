# Pre-existing work disclosure and recovery map

Consilium existed before August 25, 2026 as a private personal planning/memory application, also known internally as Brain2. This public repository remains a fresh Cloudflare adaptation with its own history, synthetic data, public-domain sources, and challenge-specific Worker/WebMCP implementation. No Brain2 Git history, credentials, production database, private journals, Chroma data, or private/copyrighted books were copied.

| Brain2 source | Recovery treatment |
|---|---|
| `frontend/src/index.css` | Adapted: black/graphite tokens, mono typography, square borders, orange/semantic accents, dense hierarchy, responsive behavior. |
| `components/layout/AppShell.jsx`, `Sidebar.jsx` | Adapted: persistent shell and product-level navigation; implementation simplified to framework-free Worker assets. |
| `components/layout/HomeView.jsx`, `dashboard/MorningBrief.jsx` | Adapted: cross-horizon overview and priority/evidence hierarchy, backed by new D1 routes. |
| `pages/ProjectsPage.jsx`, `pages/GoalsDashboardPage.jsx`, `components/goals/GoalCard.jsx` | Adapted: exact `PHY/MNT/SPR/SOC/FIN/VOC` taxonomy, life-domain grouping, horizon/status/progress, mission creation, evidence logging. |
| `pages/EveningReflectionPage.jsx`, nightly modal and six `caarQuestions` in `components/layout/AppShell.jsx` | Pass 3 ports the original biometrics, anchor journal, exact six keyed prompts, per-Today-goal review semantics, missed-goal validation, synthesis, and directives. API/state boundaries are D1/WebMCP-native. |
| `public/enso.png`, `components/ui/EnsoLoader.jsx` | Pass 4 directly reuses the owner-created transparent painted Enso PNG (SHA-256 `296fe30c2ab7894564a46faed35bbba93742c6465aab61a5d9ae8b863be0916b`) and adapts its breathe behavior with a CSS conic alpha-mask reveal, truthful named stages, ledger, and reduced-motion state. The binary is copied unchanged to `web/enso.png`. |
| `pages/JournalPage.jsx` | Adapted: linked chronological reflection/progress history with exact IDs. |
| `pages/ConsultPage.jsx`, `components/ui/CouncilBriefRenderer.jsx`, `SourceCitation.jsx` | Adapted: arbitrary question form, per-advisor reports, synthesis, source expansion, proposal control. |
| `pages/LibraryPage.jsx` | Adapted: advisor/source-pack inspection and explicit appointment; private upload/PDF pipeline intentionally omitted. |
| `pages/TransparencyPage.jsx` | Adapted: safe trace rather than hidden reasoning; canonical evidence, confidence, uncertainty, and validation. |
| FastAPI/Postgres/Chroma services | Intentionally omitted. Concepts and boundaries were reimplemented through D1, Vectorize, Workers AI embeddings, and Worker bindings. |

Pass 4 presents this as Consilium WebMCP with synthetic demo data and a small public-domain corpus. The exact file-level mapping, adapters, and deliberate demo-scale reductions are recorded in `docs/BRAIN2_REUSE_MAP.md`; no private data or copyrighted source text was copied.
