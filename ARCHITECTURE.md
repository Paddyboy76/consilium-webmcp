# Architecture

The browser registers seven stable WebMCP tools. An eighth, `commit_proposed_action`, is registered with an `AbortController` only while the signed session owns a valid pending proposal. Tool calls reach one Cloudflare Worker with bounded JSON inputs.

D1 is canonical for the synthetic longitudinal history, inferred-pattern evidence links, appointments, source packs, consultations, reports, recommendations, proposals, actions, and audit records. Vectorize is a derived 768-dimension cosine index. Workers AI `@cf/baai/bge-base-en-v1.5` embeds queries; metadata filters separate personal memory from each appointed advisor and pack before canonical D1 hydration.

Retrieved text is untrusted data with no instruction, appointment, tool, secret, citation, or mutation authority. Each councillor produces a structured report. Deterministic validation rejects unknown, cross-pack, semantically unsupported, or below-floor citations. A recommendation is displayed only when accepted personalized claims contain both canonical personal-memory IDs and canonical appointed-book IDs; otherwise the council abstains. The visible trace is safe operational metadata, not hidden chain-of-thought.

The deployed intelligence path is deterministic dual-grounded council reasoning over live Cloudflare retrieval. It does not execute OpenAI Agents SDK, Responses API, or GPT models. An import-time no-call Agents SDK compatibility adapter exists for a future separately authorized path; it is unconfigured, untested end-to-end, and deliberately fails closed.

Public-demo ownership uses a signed, expiring, versioned `HttpOnly; Secure; SameSite=Strict` cookie. It isolates consultations, traces, proposals, commits, resets, and audit records; it is not general user authentication.

Deployment: browser/WebMCP → isolated Cloudflare Worker → D1 + Workers AI + Vectorize. No Debian application service is part of the live architecture.
