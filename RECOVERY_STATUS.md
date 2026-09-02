# Recovery status

Updated: 2026-09-02 UTC

## Identity

- Starting SHA: `d971e6b1a0a2d512aac863dd2a9c77044efb8a75`
- Final SHA: pending final commit
- Branch / remote parity: pending final push
- Deployment URL/version: pending gated deployment

## Shipped feature map

- Brain2-inspired Sovereign dark shell with responsive navigation for Today, Missions, Morning Brief, Journal/Reflection, Council, Library/Advisors, and Transparency/Trace.
- Four synthetic life areas and eight linked cross-horizon seed missions.
- Persisted mission/project creation, progress/outcome/failure logging, linked CAAR reflection, timeline, and reflection-influenced morning brief.
- Advisor appointment, arbitrary council question, three visible reports, synthesis, canonical trace, and proposal-before-commit control.
- Nine stable WebMCP tools plus the dynamic one-use commit tool, all calling the visible UI’s endpoints; mutating recovery tools create `webmcp_calls` records.

## Schema and corpus

- Migration `0003_recovery_product.sql`: six session-scoped application tables and indexes.
- Source packs: 3 public-domain editions, 6 selected passages each, 18 advisor passages total. This is not full-book grounding.
- Vector target after ingestion: 96 synthetic personal-event vectors + 18 advisor vectors = 114, BGE base English v1.5, 768 dimensions, cosine.
- Reasoning: deterministic evidence-bounded council; Workers AI supplies production embeddings. No language-model call was made during recovery development and deterministic output is labelled.

## Acceptance evidence

- `npm run check`: passed.
- `npm test`: 10 files / 45 tests passed, including the recovered D1 operating-loop integration.
- Local HTTP marker journey `RECOVERY-E2E-20260902`: goal created; failure logged; linked adaptation stored; brief rationale changed to “Send the marked invitation before opening design tools”; three dual-grounded reports returned; trace inspected; proposal confirmed non-mutating; commit succeeded; replay rejected.
- Real Chromium screenshots: `/tmp/consilium-1440.png` (Today, 1440×900), `/tmp/consilium-768.png` (Missions, 768×1024), `/tmp/consilium-390.png` (Journal, 390×844), plus `/tmp/consilium-council-1440.png`. Visual inspection passed; a browser mutation produced visible `BROWSER-E2E-20260902` mission state with zero console/page errors and no 1440px body overflow.
- Wrangler 4.127.1 types generated; production `wrangler deploy --dry-run` passed (3 assets, D1, Vectorize, Workers AI bindings).
- Diff hygiene and targeted private-data/credential/copyright scans passed; only synthetic records and selected public-domain primary passages were added.

## Honest gaps / blockers

- Deployment blocker: the existing Wrangler OAuth token is expired and this terminal is non-interactive (`wrangler whoami` 403 / “auth token has expired”). Per release policy, no token workaround was attempted. Remote backup, migration, 12 new advisor-vector upserts, deploy, and live acceptance were therefore not run.

## 90-second judge walkthrough

Open Today: point out four life areas, active cross-horizon missions, recent evidence, and last adaptation. Create a marked Today goal in Missions and log a failure. Complete the linked evening reflection, naming why and a Version-2 adaptation. Refresh Morning Brief and open its evidence: the new reflection ID and tomorrow implication now explain priority one. In Library, inspect and appoint the public-domain advisors. Ask the Council what to do about the failure. Expand the three reports, then open Trace for canonical personal IDs and book title/locator/excerpt. Stage the recommendation: show that no action exists. Explicitly commit it and return to Today to show the action and audit-linked ID. Finish on the WebMCP inspector: the browser agent and the human used the same state transitions.
