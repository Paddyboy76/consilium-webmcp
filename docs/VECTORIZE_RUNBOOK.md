# Vectorize v2 creation and rebuild runbook

This is a command plan, not authorization to execute it. The machine-readable authority is `config/vectorize.production.json`.

1. Create `consilium-evidence-bge768-v2` with 768 dimensions and cosine metric.
2. Create string metadata indexes for `corpus_kind`, `user_id`, `advisor_id`, `pack_version`, and `pipeline_version`.
3. Poll/list metadata indexes until every mutation is complete.
4. Generate production vectors only through the Workers AI binding using `@cf/baai/bge-base-en-v1.5`.
5. Upsert metadata containing no `session_id`; assert compact query filters are at most 1800 bytes.
6. Validate D1 canonical-row counts, Vectorize counts, per-pack positive/negative queries, and hydration hashes before switching the Worker binding.

Dimensions and metric cannot be changed. For a future incompatible pipeline, create a newly versioned index, repeat the full ordered process from canonical D1, switch only after validation, and retain the old index until rollback risk has passed.

