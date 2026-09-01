# Consilium — WebMCP Challenge Edition

**One human. One sovereign memory. Many evidence-backed agents.**

Consilium turns a 67-day append-oriented history of goals, commitments, recommendations, responses, actions, failures, adaptations, and outcomes into reasoning evidence for a user-appointed council. WebMCP lets the browser agent the human chooses collaborate with that council through a narrow typed boundary—without silently turning advice into action.

## Hetzner release candidate

This checkout is prepared for reproducible local review; it is not a claim of a deployed URL or live OpenAI reasoning. From a fresh checkout, run the single release entry point:

```bash
npm run release:check
```

It installs the lockfile exactly with `npm ci`, runs static checks, the 42 meaningful tests, a no-deploy Worker build, and an isolated loopback HTTP acceptance journey. The latter uses deterministic fixture reasoning, temporary D1 state, migrations 0001 and 0002, and a restrictive temporary signing-secret env file. The current supervisor run passed all nine checkpoints without an OpenAI or remote Cloudflare call. See [docs/HETZNER_ACCEPTANCE.md](docs/HETZNER_ACCEPTANCE.md).

The isolated Cloudflare release is live at [consilium-webmcp.patrickhallermann.workers.dev](https://consilium-webmcp.patrickhallermann.workers.dev). It uses remote D1, Workers AI BGE768 embeddings, and metadata-filtered Vectorize retrieval with deterministic dual-grounded council synthesis. It does not claim OpenAI Agents SDK runtime execution. See [docs/CLOUDFLARE_LIVE_EVIDENCE.md](docs/CLOUDFLARE_LIVE_EVIDENCE.md).

## 60-second judge test

1. Run `npm ci`, `npm run db:migrate`, then supply a test-only `SESSION_SIGNING_KEY` to `npm run dev`, and open the Wrangler URL in a WebMCP-capable browser. For automated local proof, prefer `npm run acceptance:hetzner`.
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

The deterministic fixture adapter makes causality and safety reproducible without a credential. It proves that relevant history changes advice and irrelevant history does not. Production reasoning constructs genuine OpenAI Agents SDK specialists-as-tools with `gpt-5.6-sol` as chair and `gpt-5.6-terra` specialists; paid reasoning fails closed until a deployer supplies a separately authorized Worker secret. Production retrieval independently uses Workers AI `@cf/baai/bge-base-en-v1.5` (768 dimensions) and one cosine Vectorize index.

See [ARCHITECTURE.md](ARCHITECTURE.md), [SECURITY.md](SECURITY.md), [DEMO.md](DEMO.md), and [PREEXISTING.md](PREEXISTING.md).

## Development

```bash
npm run check
npm test
npm run deploy:check
npm run acceptance:hetzner
```

The original Python checkpoint remains intact beside the Worker until capability parity is proven. MIT licensed. Demo content is synthetic; no production Consilium data or private advisor material is included.
