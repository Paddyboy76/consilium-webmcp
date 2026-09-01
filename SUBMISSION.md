# Devpost submission draft

## Project title
Consilium — Persistent intelligence for your life

## Tagline
One human. One sovereign memory. Many evidence-backed agents.

## Short description
Consilium lets a human’s chosen browser agent collaborate with a persistent, evidence-bounded council through WebMCP—connecting lived history to specialist knowledge while keeping every write under explicit human control.

## Inspiration
General assistants are powerful but episodic. They repeatedly reconstruct the person, lose decision history, and mix advice with action. We wanted persistent intelligence that belongs to the human, not to one chat session.

## What it does
Consilium keeps goals, reflections, decisions, and outcomes as personal memory. A Council Chair selects relevant specialist agents, each retrieves separate advisor evidence and bounded personal context, and each returns a citation-required structured report. Unknown citations fail validation; insufficient support causes abstention. The Chair surfaces consensus, disagreement, uncertainty, and a next action.

## Why WebMCP
WebMCP is the architectural boundary between an external browser agent and the human’s system. It exposes exactly the useful capabilities—not a brittle UI and not a broad backend API. Tool availability changes with application state: proposal creation dynamically registers a commit capability, and successful commit removes it. Human and agent see the same live trace and state.

## Human + agent collaboration
The external agent can understand current priorities, search bounded memory, consult the internal council, inspect evidence, and draft a proposal. It cannot silently convert advice into a persistent plan. The human explicitly authorizes the one-use commit.

## Implementation
Six tools use the current `document.modelContext.registerTool` API, JSON schemas, read-only hints, and abort-signal registration lifecycle. A localhost-bound Python service supplies session-isolated SQLite state. Personal and advisor retrieval paths remain distinct. The UI reconciles every important tool result into visible state.

## OpenAI technology
The deployment design uses OpenAI Agents SDK’s agents-as-tools manager pattern, `gpt-5.6-sol` for council synthesis, `gpt-5.6-terra` for specialists, Responses API, and `text-embedding-3-large`. Deterministic demo mode proves the complete safety flow without pretending live model execution when no separately authorized API credential is present.

## Challenges and accomplishments
The hardest problem was making agentic collaboration inspectable without exposing chain-of-thought, and making writes useful without weakening human control. We built safe operational tracing, evidence-ID validation, an injection fixture, deterministic reset, and a dynamic proposal→commit capability.

## Learnings
WebMCP becomes most valuable when capabilities encode product state and trust—not when it merely mirrors CRUD. Persistent memory and external agents complement each other when provenance and mutation authority are explicit.

## What’s next
Activate and benchmark the live Agents SDK adapter, deploy behind isolated Cloudflare HTTPS routing, validate in ChatGPT’s current built-in browser, and add private-memory pluggability without changing the public demo boundary.

## Built with
WebMCP, OpenAI Agents SDK, Responses API, GPT-5.6 Sol, GPT-5.6 Terra, text-embedding-3-large, Python, SQLite, HTML/CSS/JavaScript, Cloudflare (deployment target).

## Links
- Live URL: **pending deployment**
- Public repository: **pending GitHub authorization/publication audit**
- Video: **pending recording/upload**

Testing: follow the 60-second judge test in `README.md`; full script in `DEMO.md`.

