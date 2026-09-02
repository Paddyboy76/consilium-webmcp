# Architecture

## Recovery application layer

The recovered shell is a zero-build responsive frontend served by Worker Assets. It adapts Brain2’s dense dark monospaced navigation, domain grouping, mission focus/progress interaction, CAAR reflection vocabulary, morning-brief hierarchy, council/library, and transparency architecture. A thin browser client calls the same Worker routes exposed through WebMCP.

Migration `0003_recovery_product.sql` adds session-scoped `life_areas`, `missions`, `progress_logs`, `reflections`, `morning_briefs`, and `webmcp_calls`. Consequential council actions continue through the pre-existing `proposals` → atomic `actions` boundary. D1 remains canonical; no browser-only state represents a committed fact.

The morning brief is deterministic and inspectable: it selects active missions, then explicitly lets the newest reflection’s adaptation and tomorrow implication change the first priority rationale. It stores both the priority JSON and exact evidence IDs.

The UI always publishes a plain-language catalogue of 12 typed WebMCP contracts. Eleven are registered when browser-agent discovery is available; `commit_proposed_action` is registered with an `AbortController` only while the signed session owns a valid pending proposal. Strict schemas distinguish reads, writes, trace-only consultation, staging, and approval-gated commit. Tool calls reach one Cloudflare Worker with bounded JSON inputs.

D1 is canonical for the synthetic longitudinal history, inferred-pattern evidence links, appointments, source packs, consultations, reports, recommendations, proposals, actions, and audit records. Vectorize is a derived 768-dimension cosine index. Workers AI `@cf/baai/bge-base-en-v1.5` embeds queries; metadata filters separate personal memory from each appointed advisor and pack before canonical D1 hydration.

Retrieved text is untrusted data with no instruction, appointment, tool, secret, citation, or mutation authority. In production, one bounded Workers AI `@cf/meta/llama-3.1-8b-instruct-fast` call requests all three reports and synthesis with `response_format.type=json_schema` (`workers-ai-json-council-v2`). The server rejects malformed output, the wrong advisor set, invented personal IDs, and unknown or cross-advisor source IDs; it then hydrates dates, titles, locators, and excerpts from canonical D1 records. Each accepted report has both evidence lanes and explicit counterevidence. If generation or validation fails, a clearly labelled deterministic fallback is used. The visible trace is safe operational metadata, not hidden chain-of-thought.

No OpenAI SDK, API key, external AI provider, Responses API, or GPT model is used. Local tests stub the Workers AI contract and use the labelled deterministic fixture; no paid language-model call was made before deployment.

The model and request shape were checked on 2026-09-02 against Cloudflare's current official [JSON Mode documentation](https://developers.cloudflare.com/workers-ai/features/json-mode/) and [`llama-3.1-8b-instruct-fast` model page](https://developers.cloudflare.com/workers-ai/models/llama-3.1-8b-instruct-fast/). Cloudflare notes that schema compliance is not guaranteed, which is why application validation and fail-closed fallback remain mandatory.

Public-demo ownership uses a signed, expiring, versioned `HttpOnly; Secure; SameSite=Strict` cookie. It isolates consultations, traces, proposals, commits, resets, and audit records; it is not general user authentication.

Deployment: browser/WebMCP → isolated Cloudflare Worker → D1 + Workers AI + Vectorize. No Debian application service is part of the live architecture.
