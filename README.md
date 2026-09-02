# Consilium — WebMCP Challenge Edition

**One human. One sovereign memory. Many evidence-backed councillors.**

Consilium turns a synthetic 67-day history of goals, commitments, recommendations, responses, actions, failures, adaptations, and outcomes into active evidence for a user-appointed council. WebMCP lets a chosen browser agent collaborate through a narrow typed boundary while every persistent action remains under explicit human control.

## Try the live application

- Live: [consilium-webmcp.patrickhallermann.workers.dev](https://consilium-webmcp.patrickhallermann.workers.dev)
- Source: [github.com/Paddyboy76/consilium-webmcp](https://github.com/Paddyboy76/consilium-webmcp)

The live Cloudflare Worker uses canonical D1 records, Workers AI `@cf/baai/bge-base-en-v1.5` embeddings, and a 768-dimension cosine Vectorize index. Council reports and synthesis are deterministic and dual-grounded. `/api/health` and the UI identify that runtime honestly; `openaiConfigured` is false. No OpenAI Agents SDK, Responses API, or GPT model call is part of the deployed acceptance evidence.

## One-minute judge journey

Use ChatGPT's WebMCP-capable in-app browser or Chrome with WebMCP enabled:

1. Open the live URL and reset the synthetic demo.
2. Ask: “Explain the protected single-action pattern, including counterevidence.”
3. Ask: “What should I focus on in the next 45 minutes, and why?”
4. Inspect the visible trace: three councillor reports, canonical personal-memory IDs, appointed-book IDs, citation validation, and dual-grounding status.
5. Ask for a proposal but explicitly say not to commit it. Confirm there is no persisted action and the commit tool appears.
6. Explicitly commit the pending proposal. Confirm an action is created and the one-use commit tool disappears.
7. Reset the synthetic session for the next judge.

Seven WebMCP tools are normally registered. `commit_proposed_action` is the eighth and exists only while the current signed session owns a pending proposal.

```text
Human + chosen browser agent
             │ typed WebMCP tools
             ▼
       Consilium boundary
        ├─ canonical personal memory in D1
        ├─ Workers AI + Vectorize retrieval
        ├─ three user-appointed source packs
        ├─ deterministic evidence-bounded council
        ├─ citation and dual-grounding guardrail
        └─ proposal → explicit one-use commit
```

## Reproduce and verify

```bash
npm ci
npm run release:check -- --skip-install
```

That runs TypeScript/ESLint, 42 behavioral tests, a no-deploy Worker build, diff hygiene, and the isolated local HTTP journey. The local journey uses temporary D1 state and deterministic fixtures; it makes no OpenAI or remote Cloudflare calls. The bounded production journey is `scripts/cloudflare-live-proof.mjs`; it performs real retrieval and resets only its synthetic sessions after proof.

The repository also contains an import-time, no-call Agents SDK compatibility adapter. It is unconfigured, deliberately rejects execution, and is not the live reasoning path. Activating it would require a separately authorized paid application credential and new acceptance evidence.

See [ARCHITECTURE.md](ARCHITECTURE.md), [SECURITY.md](SECURITY.md), [DEMO.md](DEMO.md), [SUBMISSION.md](SUBMISSION.md), and [PREEXISTING.md](PREEXISTING.md). MIT licensed. All personal-memory demo content is synthetic; advisor excerpts are packaged public-domain sources.
