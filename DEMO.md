# WebMCP golden demonstration

Ask the browser agent: “Review my recent history and active goals. Find the recurring pattern most likely to block me today, include counterevidence, consult my appointed council using their books, and show me the evidence. Propose the smallest useful change to today's plan. Do not apply it until I approve.”

1. Open Transparency first. Show the always-visible 13-tool catalogue grouped as Reads, Structured writes, and Gated actions, plus the separate live browser-discovery status.
2. Visit Today, Missions, Progress, and Journal. Verify the canonical `PHY`, `MNT`, `SPR`, `SOC`, `FIN`, and `VOC` domains; create/log a mission, explicitly update its status, and save a journal entry linked to its area/goal.
3. Ask the browser agent to call `record_evening_reflection` with biometrics, a 40+ character journal, all six named CAAR keys, and a status for every active Today goal. For each missed goal supply 15+ character `why_failed` and `adaptation`. Compare the returned reflection/fact/directive IDs with Journal and Transparency.
4. Generate Morning Brief and show that the newly accepted reflection changed selected goal evidence, readiness caution, pattern/counterpattern, rationale, uncertainty, and the persisted replacement brief—it did not copy a generic tomorrow field.
5. Let the agent read current context, recent history, patterns/counterevidence, and appointed source packs. The matching UI views expose the same records and IDs.
6. Convene Council. Watch the genuine textured Enso progressively reveal while actual appointed advisor names advance, then compare distinct reasoning, uncertainty, disagreement, personal evidence, counterevidence, and exact book excerpts/locators.
7. Open Transparency to follow reads, retrieval, deliberation, validation, `Human control · unchanged`, and recent tool input/result records.
8. Stage the recommendation and prove there is a pending proposal with zero actions. Ask for explicit approval, commit once, and retry the same proposal for HTTP 409. The approved change becomes an audit-linked Today goal in the target area and appears in Today, Missions, Morning Brief, and audit.

Local screenshots and tests use `deterministic-test-fixture`, which must never be described as AI reasoning. Production prefers Workers AI structured generation and labels `deterministic-fallback` on failure. Never describe the selected 18 passages as full-book grounding, and never claim the browser-agent journey passed live until it is exercised after deployment.
