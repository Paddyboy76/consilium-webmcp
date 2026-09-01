# ADR 0001: Worker, D1, and Vectorize

Status: accepted, 2026-09-01.

Consilium Phase 2 uses one Cloudflare Worker for API and static assets, one D1 database as canonical structured/text storage, and one Vectorize index as a replaceable derived semantic index. Debian is control/build only. This is the fewest-component design that preserves deep timeline history, canonical citation hydration, and semantic retrieval. No KV, R2, Durable Objects, queues, nginx, systemd, or second backend is justified.

D1 is authoritative. Vector records hold stable IDs and filter metadata only; result IDs are hydrated from D1. Local development uses Wrangler/Miniflare's isolated local D1. Production IDs remain placeholders until authorized resource creation.

