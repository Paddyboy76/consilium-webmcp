# Architecture

The browser owns the human-visible state and registers eight narrow WebMCP tools. Seven are stable; `commit_proposed_action` is registered with an `AbortController` only while a valid proposal exists. Tool calls reach one Cloudflare Worker with bounded JSON inputs, D1 canonical state/text, and a derived Vectorize index.

Personal Memory RAG answers “what happened for this human?” Advisor Evidence RAG answers “what does this framework teach?” They have distinct IDs and retrieval paths. Retrieved text is untrusted data. Each specialist emits an `AdvisorReport`; deterministic validation rejects unknown citations. The Council Chair produces a `CouncilDecision` and safe operational trace, never hidden reasoning.

Fixture synthesis is an explicit tested adapter, not a production fallback. The production intelligence layer uses OpenAI Agents SDK’s agents-as-tools manager pattern: `gpt-5.6-sol` chair and distinct `gpt-5.6-terra` specialists. Production mode without an explicitly supplied reasoning credential fails closed. Retrieval is separate: Workers AI `@cf/baai/bge-base-en-v1.5`, 768 dimensions, cosine distance, and one filtered Vectorize index.

Public-demo ownership is a signed, expiring, versioned `HttpOnly; Secure; SameSite=Strict` cookie. It isolates demo consultations, traces, proposals, commits, resets, and audit records; it is not full user identity authentication.

Deployment target: Cloudflare Worker + static assets → D1 + Vectorize → OpenAI. No Debian application service remains in the target architecture.
