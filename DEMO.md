# Demo recording script — target 2:45

Record the live URL in a WebMCP-capable browser. Keep the browser tool activity and Consilium page visible. Do not use music or third-party assets.

**0:00–0:18 — Problem and runtime**

“Most agents begin each conversation from zero. Consilium gives one human a durable memory and an evidence-bounded council.” Show the live URL, 67-day memory signal, and **CLOUDFLARE RETRIEVAL · DETERMINISTIC COUNCIL** label. “This live build uses Cloudflare retrieval and deterministic council reasoning; it does not claim a live OpenAI model call.”

**0:18–0:42 — Memory that changes advice**

Ask: **“Explain the protected single-action pattern, including counterevidence.”** Show its time window, confidence, supporting IDs, contradictory IDs, the failed “morning always succeeds” hypothesis, and the later protected-block adaptation.

**0:42–1:42 — Live WebMCP consultation**

Ask exactly: **“What should I focus on in the next 45 minutes, and why?”** Let the browser agent call context, memory search, and council consultation. On the page, show three appointed councillors and their source packs. Point to personal ID `evt-64-adapt-success` and book IDs `marcus-b4-03`, `epictetus-ench-01a`, and `suntzu-3-2`. Show three validated reports, `dualGrounded: true`, and the non-abstained recommendation.

**1:42–2:05 — Trace and guardrail**

Ask the agent to inspect the council run. “This is safe operational trace, not hidden reasoning: exact evidence IDs, report status, disagreement, validation, and mutation status. Retrieved memory and book text are untrusted data; unknown or unsupported citations are rejected.”

**2:05–2:34 — Proposal versus commit**

Ask: **“Propose sending one accessibility pilot invitation, but do not commit it.”** Show **PENDING · NOT COMMITTED**, zero committed action for this clean session, and the tool count changing from seven to eight. Then ask: **“Commit the pending action now.”** Show the committed action and the tool count returning to seven. “Only the session owner can explicitly commit once; replay is rejected.”

**2:34–2:45 — Close**

“WebMCP is the typed boundary through which a person's chosen agent collaborates with persistent intelligence while evidence stays verifiable and action stays human-controlled.” Reset the synthetic demo for the next judge.

## Before recording

- Confirm `/api/health` is `ok`, `mode: cloudflare`, `reasoningMode: deterministic-dual-grounded`, `retrievalMode: workers-ai-vectorize`, and `openaiConfigured: false`.
- Start from a reset synthetic session: no pending proposal and no committed actions.
- Confirm seven tools initially, eight while pending, and seven after commit.
- Use the exact consultation question above; keep all IDs legible.
- Keep the final cut below 3:00, include narration audio, upload publicly to YouTube, and reset the session afterward.
