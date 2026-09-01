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
Consilium keeps an append-oriented longitudinal record of goals, commitments, advice, responses, actions, failures, adaptations, and outcomes. It derives versioned patterns with supporting and contradictory events. A Council Chair invokes only the user-appointed specialists; each retrieves its own verified public-domain source pack plus causal personal context and returns a citation-required structured report. Unknown or cross-councillor citations fail validation; insufficient support causes abstention.

## Why WebMCP
WebMCP is the architectural boundary between an external browser agent and the human’s system. It exposes exactly the useful capabilities—not a brittle UI and not a broad backend API. Tool availability changes with application state: proposal creation dynamically registers a commit capability, and successful commit removes it. Human and agent see the same live trace and state.

## Human + agent collaboration
The external agent can understand current priorities, search bounded memory, consult the internal council, inspect evidence, and draft a proposal. It cannot silently convert advice into a persistent plan. The human explicitly authorizes the one-use commit.

## Implementation
Eight focused capabilities use the current `document.modelContext.registerTool` API, JSON schemas, read-only hints, and abort-signal registration lifecycle. One Cloudflare Worker serves the UI/API; D1 is canonical and Vectorize is derived. Personal and advisor retrieval paths use distinct pre-query metadata filters. The UI exposes pattern support, counterevidence, source editions, and every important tool result.

## OpenAI technology
The implementation constructs OpenAI Agents SDK’s agents-as-tools manager pattern with `gpt-5.6-sol` for council synthesis and distinct `gpt-5.6-terra` specialists. It bundles under Wrangler. Retrieval uses Workers AI `@cf/baai/bge-base-en-v1.5` at 768 dimensions and one cosine Vectorize index. Deterministic fixture mode proves advice causality and safety without pretending live model execution or production semantic retrieval.

## Challenges and accomplishments
The hardest problem was making agentic collaboration inspectable without exposing chain-of-thought, and making writes useful without weakening human control. We built safe operational tracing, evidence-ID validation, an injection fixture, deterministic reset, and a dynamic proposal→commit capability.

## Learnings
WebMCP becomes most valuable when capabilities encode product state and trust—not when it merely mirrors CRUD. Persistent memory and external agents complement each other when provenance and mutation authority are explicit.

## What’s next
Activate and benchmark the separately gated live Agents SDK adapter, extend browser proof to the mutation lifecycle if needed, and add private-memory pluggability without changing the public demo boundary.

## Built with
WebMCP, OpenAI Agents SDK, Responses API, GPT-5.6 Sol, GPT-5.6 Terra, Cloudflare Workers AI, Vectorize, D1, TypeScript, HTML/CSS/JavaScript.

## Links
- Live URL: **https://consilium-webmcp.patrickhallermann.workers.dev**
- Public repository: **pending GitHub authorization/publication audit**
- Video: **pending recording/upload**

Testing: follow the 60-second judge test in `README.md`; full script in `DEMO.md`.

## Evidence status

The Hetzner checkout passed in-process and local HTTP checks. The isolated Cloudflare Worker passed server-live D1/Workers AI/Vectorize acceptance, and supervisor Browser/WebMCP proof passed bounded memory search, canonical dual-grounded council consultation, and visible honest UI/trace/guardrail state. Proposal/commit/replay/reset are server-live corroborated rather than browser-proven. OpenAI Agents application execution remains untested and unclaimed; no paid OpenAI application call was made.
