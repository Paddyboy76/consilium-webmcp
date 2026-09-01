# ADR 0003: Dual retrieval and canonical citations

Status: accepted, 2026-09-01.

Personal history and councillor sources are separate retrieval lanes with pre-query filters. D1 stores canonical text; Vectorize stores vectors plus `corpus_kind`, `user_id`, `advisor_id`, and `pack_version`. Queries hydrate exact rows from D1.

Every personalized claim needs relevant personal IDs. Every substantive doctrine claim needs evidence from that councillor's currently appointed pack. A personalized recommendation needs both. Validators enforce subset, ownership, locator, and canonical-excerpt equality before reports reach the chair. Invalid reports abstain and are excluded. `text-embedding-3-large` at 1536 dimensions is selected for quality and a compact index, with model/dimensions/content hash/version recorded; no embeddings are generated without an authorized key.

