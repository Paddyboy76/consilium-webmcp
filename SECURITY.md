# Security and privacy

- The public demo is synthetic and session-scoped. No genuine journals, production stores, private corpora, secrets, or internal paths are shipped.
- Demo ownership is server-issued, not client asserted: an HMAC-signed, expiring, versioned `HttpOnly; Secure; SameSite=Strict` cookie scopes consultations, traces, proposals, commits, resets, and audit records. This is public-demo session isolation, not full identity authentication.
- WebMCP is a trust boundary. Tools accept bounded schemas; no arbitrary URL, SQL, filename, or shell parameter exists.
- Memory and source passages are untrusted data. Their text cannot change system instructions or invoke mutations.
- Citation IDs must belong to the actual retrieval set. Unsupported reports abstain.
- Council consultation is read-only. `propose_next_action` creates transient review state; only `commit_proposed_action`, dynamically present for a valid proposal, persists it once.
- Trace output exposes operational metadata and evidence IDs, not chain-of-thought, environment values, stack traces, or secrets.
- The Worker exposes only bounded application routes and static assets and emits restrictive response headers.

Session signing keys are Worker secrets, never configuration values. Rotation increments `SESSION_KEY_VERSION`, moves the old secret/version into the explicitly temporary previous-key bindings, and issues only current-key cookies. Previous cookies remain valid only until their original short expiry; removing the previous binding rejects them. Unknown versions always receive a new isolated session.

Before publication/deployment: run history-aware secret and personal-data scans, verify the synthetic dataset, and supply secrets only through isolated runtime configuration.
