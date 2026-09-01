# Consilium — WebMCP Challenge Edition

**One human. One sovereign memory. Many evidence-backed agents.**

Consilium turns longitudinal goals, decisions, reflections, and outcomes into shared context for an evidence-bounded council. WebMCP lets the browser agent the human chooses collaborate with that council through a narrow typed boundary—without silently turning advice into action.

## 60-second judge test

1. Run `python3 -m app.server` and open `http://127.0.0.1:8765` in a WebMCP-capable browser.
2. Ask: “I have 45 minutes before work. What should I actually focus on today, and why?”
3. Watch the page update as the agent reads context, consults three specialists, validates citations, and synthesizes a recommendation.
4. Ask it to propose the next action. Confirm the page says **pending—not committed**.
5. Explicitly ask it to commit. The dynamic write tool disappears after its single valid use.

```text
Human + chosen browser agent
             │ typed WebMCP tools
             ▼
       Consilium boundary
        ├─ Personal Memory retrieval (untrusted data)
        ├─ Council Chair
        │   ├─ Effectiveness specialist
        │   ├─ Deep Work specialist
        │   └─ Lean Experiments specialist
        ├─ Advisor Evidence retrieval
        └─ Citation guardrail → proposal → explicit commit
```

The deterministic local mode makes the full safety and demo flow reproducible without a credential. The production intelligence adapter is designed for OpenAI Agents SDK with `gpt-5.6-sol` as chair, `gpt-5.6-terra` specialists, and `text-embedding-3-large`; API execution remains disabled until a deployer supplies a separately authorized API credential.

See [ARCHITECTURE.md](ARCHITECTURE.md), [SECURITY.md](SECURITY.md), [DEMO.md](DEMO.md), and [PREEXISTING.md](PREEXISTING.md).

## Development

```bash
python3 -m unittest discover -v
python3 -m app.server
curl http://127.0.0.1:8765/api/health
```

MIT licensed. Demo content is synthetic; no production Consilium data or private advisor material is included.

