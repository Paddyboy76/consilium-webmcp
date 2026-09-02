# Devpost-ready recovery submission copy

Consilium is a compact Cloudflare adaptation of a mature personal operating system. The recovered experience organizes a synthetic life into domains and cross-horizon missions, turns progress and failure into structured reflection, makes that history change the morning brief, and convenes a user-appointed council whose personal and public-domain source evidence is inspectable. Human and WebMCP interactions share the same D1 workflows; recommendations remain proposals until explicit commit.

The visual and interaction architecture selectively adapts user-owned Brain2 patterns. The data, Cloudflare Worker/D1/Vectorize layer, WebMCP boundary, and public-domain passage packs are challenge-specific. The current council synthesis is deterministic and explicitly labelled; Workers AI supplies production embeddings.

## Project title

Consilium — Persistent intelligence for your life

## Tagline

One human. One sovereign memory. Many evidence-backed councillors.

## Short description

Consilium lets a person's chosen browser agent collaborate with a persistent, evidence-bounded council through WebMCP—connecting lived history to appointed source knowledge while keeping every persistent action under explicit human control.

## Inspiration

General assistants are powerful but episodic. They repeatedly reconstruct the person, lose the history of what advice was tried and what happened, and blur the line between recommending and acting. Consilium explores persistent intelligence that belongs to the human rather than one chat session.

## What it does

The public demo preserves a synthetic 67-day history of goals, commitments, recommendations, responses, actions, failures, adaptations, and outcomes. It derives versioned patterns with supporting and contradictory events, confidence, time windows, and provenance. Memory is an active input to the recommendation, not a transcript panel.

Only the user's three appointed councillors may participate. Each is restricted to its active verified public-domain source pack. Cloudflare retrieval gathers personal evidence and appointed-book evidence through separate filtered lanes, then canonical D1 hydration verifies every ID. Structured reports and the final recommendation are validated; unsupported, invented, cross-pack, or inadequately grounded claims are rejected, and insufficient support produces abstention.

## Why WebMCP is central

WebMCP is the collaboration boundary between an external browser agent and the human's persistent system. Seven stable tools expose current context, bounded memory search, pattern explanation, appointed-council provenance, consultation, trace inspection, and proposal creation. An eighth one-use commit tool exists only while the signed session owns a pending proposal. This is richer and safer than asking an agent to infer application state from pixels or giving it a broad mutation API.

## What humans and agents do together

The chosen browser agent can recover relevant history, compare failures with adaptations, consult the appointed council, inspect verifiable evidence, and draft a next action. The person sees the same trace and state. Advice never silently becomes a plan: proposal creation is explicitly non-mutating, and only an explicit owner-authorized commit persists one action and audit record.

## How it was built

The browser uses `document.modelContext.registerTool`, JSON schemas, annotations, and abort-signal lifecycle management. One isolated Cloudflare Worker serves the UI and API. D1 is canonical for longitudinal memory, pattern links, appointments, source text, reports, recommendations, proposals, actions, and audit records. Workers AI `@cf/baai/bge-base-en-v1.5` embeds queries. A 768-dimension cosine Vectorize index applies separate personal/advisor metadata filters before results are rehydrated from canonical D1.

The deployed council reasoning is deterministic and dual-grounded. The live UI says **CLOUDFLARE RETRIEVAL · DETERMINISTIC COUNCIL**, and `/api/health` reports `openaiConfigured: false`. The repository contains an inactive, import-time Agents SDK compatibility adapter, but it is unconfigured, deliberately rejects execution, and is not part of the live runtime or acceptance evidence. No Responses API or GPT model call is claimed.

## Challenges and accomplishments

The hardest work was making durable personalization auditable without exposing hidden reasoning, and making agent-driven actions useful without weakening human control. Consilium includes safe operational traces, canonical evidence-ID validation, semantic support checks, injection-resistance boundaries, abstention, signed-session isolation, atomic one-action commit, replay rejection, and deterministic cleanup.

## Learnings

WebMCP is most valuable when tools encode product meaning, trust, and changing authority—not when they merely mirror CRUD. Persistent memory helps only when outcomes and counterevidence can change advice, and citations help only when the application verifies them against canonical sources.

## Built with

WebMCP, Cloudflare Workers, Workers AI, Vectorize, D1, TypeScript, HTML, CSS, and JavaScript. The OpenAI Agents SDK is present only in an inactive compatibility adapter and is not a live dependency claim.

## Links

- Live application: https://consilium-webmcp.patrickhallermann.workers.dev
- Public repository: https://github.com/Paddyboy76/consilium-webmcp
- Video: add the public YouTube URL after recording; no video is claimed yet

## Judge testing instructions

1. Open the live application in ChatGPT's WebMCP-capable in-app browser or Chrome with WebMCP enabled.
2. Reset the synthetic demo session.
3. Ask: “Explain the protected single-action pattern, including counterevidence.”
4. Ask: “What should I focus on in the next 45 minutes, and why?” Verify three reports, a non-abstained decision, personal ID `evt-64-adapt-success`, appointed-book IDs `marcus-b4-03`, `epictetus-ench-01a`, and `suntzu-3-2`, and a passing dual-grounding guardrail.
5. Ask for a proposal without commit. Confirm no action persisted and the commit capability appears.
6. Explicitly commit it. Confirm the action persists and the one-use commit capability disappears.
7. Reset the synthetic session for the next judge.

## Final submission checklist

- [x] Public live URL
- [x] Public repository on `main`
- [x] Detectable MIT license
- [x] Devpost-ready description and testing instructions
- [x] Under-three-minute recording script
- [ ] Patrick: record and upload the demo publicly to YouTube
- [ ] Patrick: paste the YouTube URL above and into Devpost
- [ ] Patrick: perform the final signed-in Devpost review and confirm submission before the deadline
