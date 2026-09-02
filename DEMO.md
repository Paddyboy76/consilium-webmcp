# WebMCP golden demonstration

Ask the browser agent: “Review my recent history and active goals. Find the recurring pattern most likely to block me today, include counterevidence, consult my appointed council using their books, and show me the evidence. Propose the smallest useful change to today's plan. Do not apply it until I approve.”

1. Open Transparency first. Show the always-visible 12-tool catalogue and the separate live browser-discovery status.
2. Let the agent read current context, recent history, patterns/counterevidence, and appointed source packs. The matching UI views expose the same records and IDs.
3. Convene Council. Before the run, point out the three appointments, book scope, two evidence lanes, and five stages. Afterward, compare distinct reasoning, confidence rationale, uncertainty, disagreement, personal evidence, counterevidence, and exact book excerpts/locators.
4. Open Transparency to follow the non-technical trace: reads, retrieval, deliberation mode, validation, and `Human control · unchanged`.
5. Stage the recommendation. Return to Today or query context to prove there is a pending proposal and zero actions.
6. Ask for explicit approval. Commit once; retry the same proposal to show HTTP 409 replay rejection. The approved change appears in Today, Missions, Morning Brief, and the tool audit.
7. Record progress/reflection later to leave durable evidence that the next consultation can retrieve.

Local screenshots and tests use `deterministic-test-fixture`, which must never be described as AI reasoning. Production prefers Workers AI structured generation and labels `deterministic-fallback` on failure. Never describe the selected 18 passages as full-book grounding, and never claim the browser-agent journey passed live until it is exercised after deployment.
