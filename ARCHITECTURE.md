# Architecture

The browser owns the human-visible state and registers six narrow WebMCP tools. Five are stable; `commit_proposed_action` is registered with an `AbortController` only while a valid proposal exists. Tool calls reach a localhost-bound Python service with bounded JSON inputs and session-scoped SQLite demo state.

Personal Memory RAG answers “what happened for this human?” Advisor Evidence RAG answers “what does this framework teach?” They have distinct IDs and retrieval paths. Retrieved text is untrusted data. Each specialist emits an `AdvisorReport`; deterministic validation rejects unknown citations. The Council Chair produces a `CouncilDecision` and safe operational trace, never hidden reasoning.

Local deterministic synthesis is the tested fallback. The intended deployed intelligence layer uses OpenAI Agents SDK’s agents-as-tools manager pattern: `gpt-5.6-sol` chair, parallel `gpt-5.6-terra` specialists, and `text-embedding-3-large`. It requires an explicitly supplied API credential and is not impersonated when absent.

Deployment target: Cloudflare HTTPS edge → isolated reverse proxy route → localhost backend on a verified free port. No database or backend port is public.

