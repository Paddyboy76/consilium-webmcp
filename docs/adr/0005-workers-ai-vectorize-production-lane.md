# ADR 0005: One Workers AI embedding lane and one Vectorize index

Status: accepted, 2026-09-01.

The deployable retrieval pipeline uses Cloudflare Workers AI model `@cf/baai/bge-base-en-v1.5`, which produces 768-dimensional vectors, and one cosine Vectorize index. OpenAI remains the reasoning provider and is not an embedding dependency. Offline tests may use the named deterministic fixture embedder, but fixture retrieval is never production semantic-retrieval proof.

Before insertion, create the index and all five string metadata indexes (`corpus_kind`, `user_id`, `advisor_id`, `pack_version`, `pipeline_version`), wait for the mutations to complete, then ingest. `session_id` is deliberately absent: memory retrieval is user-scoped; D1 owns session-scoped consultations and mutations. Filters are asserted below Vectorize's current compact-JSON limit of 2048 bytes.

Vector dimensions and metric are immutable. Migration therefore means: create a newly versioned index from the manifest, create/wait for metadata indexes, regenerate every vector from canonical D1 text, validate counts/sample queries, switch the binding, and only later retire the old index. Never mix incompatible pipeline hashes.

