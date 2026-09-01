# ADR 0004: Agents SDK on Workers

Status: spike pending build evidence, 2026-09-01.

Official Agents SDK troubleshooting documentation states that Cloudflare Workers are supported with limitations: `nodejs_compat` is required, HTTP Responses transport should be used, and traces must be manually flushed. The spike imports `Agent`, creates distinct councillors and a manager with councillors as tools, and bundles under Wrangler without making a paid call.

If the build/runtime spike passes, this is the production adapter. Fixture mode remains explicit and deterministic. Production mode without `OPENAI_API_KEY` fails closed with `MODEL_CONFIGURATION_ERROR`; it never silently substitutes fixture output. If reproducible Worker incompatibility appears, separate Responses API calls with deterministic orchestration are the approved fallback, but only after this ADR records exact failure output.

