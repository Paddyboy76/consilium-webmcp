# ADR 0004: Agents SDK on Workers

Status: spike pending build evidence, 2026-09-01.

Official Agents SDK troubleshooting documentation states that Cloudflare Workers are supported with limitations: `nodejs_compat` is required, HTTP Responses transport should be used, and traces must be manually flushed. The spike imports `Agent`, creates distinct councillors and a manager with councillors as tools, and bundles under Wrangler without making a paid call.

Historical note: Pass 2 superseded this compatibility spike. The production adapter now uses the native Cloudflare `AI` binding and JSON-schema output; the OpenAI Agents dependency and secret path were removed. Fixture mode remains explicit and deterministic, and invalid Workers AI output uses a visibly labelled deterministic fallback.
