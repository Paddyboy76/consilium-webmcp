# Pre-existing work disclosure and recovery map

Consilium existed before August 25, 2026 as a private personal planning/memory application, also known internally as Brain2. This public repository remains a fresh Cloudflare adaptation with its own history, synthetic data, public-domain sources, and challenge-specific Worker/WebMCP implementation. No Brain2 Git history, credentials, production database, private journals, Chroma data, or private/copyrighted books were copied.

| Brain2 source | Recovery treatment |
|---|---|
| `frontend/src/index.css` | Adapted: black/graphite tokens, mono typography, square borders, orange/semantic accents, dense hierarchy, responsive behavior. |
| `components/layout/AppShell.jsx`, `Sidebar.jsx` | Adapted: persistent shell and product-level navigation; implementation simplified to framework-free Worker assets. |
| `components/layout/HomeView.jsx`, `dashboard/MorningBrief.jsx` | Adapted: cross-horizon overview and priority/evidence hierarchy, backed by new D1 routes. |
| `pages/GoalsDashboardPage.jsx`, `components/goals/GoalCard.jsx` | Adapted: life-area grouping, horizon/status/progress, mission creation, evidence logging. |
| `pages/EveningReflectionPage.jsx`, nightly modal and six `caarQuestions` in `components/layout/AppShell.jsx` | Pass 3 ports the original biometrics, anchor journal, exact six keyed prompts, per-Today-goal review semantics, missed-goal validation, synthesis, and directives. API/state boundaries are D1/WebMCP-native. |
| `components/ui/EnsoLoader.jsx` | Pass 3 ports the exact Enso SVG path, rotation, stroke identity, draw timing, mono labels, and adds reduced-motion handling plus truthful named stages. |
| `pages/JournalPage.jsx` | Adapted: linked chronological reflection/progress history with exact IDs. |
| `pages/ConsultPage.jsx`, `components/ui/CouncilBriefRenderer.jsx`, `SourceCitation.jsx` | Adapted: arbitrary question form, per-advisor reports, synthesis, source expansion, proposal control. |
| `pages/LibraryPage.jsx` | Adapted: advisor/source-pack inspection and explicit appointment; private upload/PDF pipeline intentionally omitted. |
| `pages/TransparencyPage.jsx` | Adapted: safe trace rather than hidden reasoning; canonical evidence, confidence, uncertainty, and validation. |
| FastAPI/Postgres/Chroma services | Intentionally omitted. Concepts and boundaries were reimplemented through D1, Vectorize, Workers AI embeddings, and Worker bindings. |

Pass 2 expands this into the complete navigable demo-scale experience: Today, areas/projects/goals, progress/patterns with counterevidence, journal/reflection, morning brief, council, library/appointments, and transparency/analytics. The exact file-level mapping, adapters, and deliberate reductions are recorded in `docs/BRAIN2_REUSE_MAP.md`. It claims direct reuse of Brain2's interaction structure and design system—not copied private data or pixel identity with every historical screen.
