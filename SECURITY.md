# Security and privacy

- The public demo is synthetic and session-scoped. No genuine journals, production stores, private corpora, secrets, or internal paths are shipped.
- WebMCP is a trust boundary. Tools accept bounded schemas; no arbitrary URL, SQL, filename, or shell parameter exists.
- Memory and source passages are untrusted data. Their text cannot change system instructions or invoke mutations.
- Citation IDs must belong to the actual retrieval set. Unsupported reports abstain.
- Council consultation is read-only. `propose_next_action` creates transient review state; only `commit_proposed_action`, dynamically present for a valid proposal, persists it once.
- Trace output exposes operational metadata and evidence IDs, not chain-of-thought, environment values, stack traces, or secrets.
- The backend binds to localhost by default and emits restrictive browser headers.

Before publication/deployment: run history-aware secret and personal-data scans, verify the synthetic dataset, and supply secrets only through isolated runtime configuration.

