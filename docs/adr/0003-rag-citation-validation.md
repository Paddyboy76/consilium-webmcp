# ADR 0003: Dual retrieval and canonical citations

Status: accepted for dual-lane/citation design; embedding choice superseded by ADR 0005, 2026-09-01.

Personal history and councillor sources are separate retrieval lanes with pre-query filters. D1 stores canonical text; Vectorize stores vectors plus `corpus_kind`, `user_id`, `advisor_id`, and `pack_version`. Queries hydrate exact rows from D1.

Every personalized claim needs relevant personal IDs. Every substantive doctrine claim needs evidence from that councillor's currently appointed pack. A personalized recommendation needs both. Validators enforce subset, ownership, pack version, locator, canonical hash/excerpt, calibrated retrieval floor, and pre-reviewed fixture semantic support before reports reach the chair. Invalid reports abstain and are excluded. ADR 0005 defines the production embedding lane.
