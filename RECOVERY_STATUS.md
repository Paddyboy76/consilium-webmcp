# Recovery status — Pass 4

Updated: 2026-09-02 UTC

## Identity and scope

- Starting point: clean, pushed `bca9be98d34bca6fe36419b708edef340c1414f7`.
- Product identity is Consilium WebMCP: synthetic demo data, 18 narrow public-domain source excerpts, demo-scale Vectorize, Cloudflare runtime, and 12 visible WebMCP contracts.
- Pass 3’s biometrics, 40-character journal, exact six CAAR answers, per-Today-goal review states, missed-goal reason/adaptation validation, relational facts/directives, reflection-selected brief, canonical council citations, proposal gate, one-use commit, replay rejection, and durable trace remain intact.

## Exact domains and migration

- Canonical D1 codes and names: `PHY` Physical, `MNT` Mental, `SPR` Spiritual, `SOC` Social, `FIN` Financial, `VOC` Vocational, with the exact owner taxonomy descriptions.
- `migrations/0005_exact_life_domains.sql` additively introduces code, active/archive state, migration metadata, and a per-session canonical-code constraint.
- First-request reconciliation is idempotent. Legacy Health→Physical, Relationships→Social, and Vocation→Vocational mappings retain their stable rows and links. The seeded writing/essay Learning records move to Vocational; the legacy Learning area is archived with explicit migration metadata rather than deleted. Missing canonical domains and synthetic mission/progress/reflection chains are added without deleting audit/history.
- Today, Missions, Progress, mission creation, journal/reflection, brief retrieval, council retrieval, and WebMCP reads/writes all use the same generic canonical area metadata. There is no hardcoded domain advice.

## Genuine Enso

- `web/enso.png` is an unchanged copy of the owner-created `/home/patadmin/brain2/frontend/public/enso.png`, SHA-256 `296fe30c2ab7894564a46faed35bbba93742c6465aab61a5d9ae8b863be0916b`.
- A clockwise CSS conic alpha mask progressively reveals the PNG’s textured painted edge, followed by the original subtle breathe behavior. There is no SVG or thin-arc fallback.
- Reflection, morning brief, and council material waits share truthful client-known stage ledgers; council stage names derive from current appointments. Reduced motion shows the fully painted Enso with an immediately readable completed ledger.

## Local acceptance

- Focused Pass 4 tests passed during editing.
- Final full suite: 12 files / 59 tests passed. Production-config Wrangler dry-run passed with D1, Vectorize, Workers AI, and five static assets; it did not deploy or call a paid model.
- `npm run check` passed after correcting two lint-only forms in the new migration test assertion; no runtime code changed during those retries.
- Local Chromium at 1440×900 and 390×844: exact six-domain order, six linked Today reflection goals, 12-tool catalogue, zero page errors, and body width exactly equal to viewport.
- Visually inspected evidence in `artifacts/pass4/`: three progressive textured Enso frames, desktop/mobile six-domain screens, mobile structured reflection, and reduced-motion Enso. The Enso is visibly painted and was accepted; it is not a geometric arc.

## Deployment blocker and exact continuation

No deployment was attempted. Wrangler OAuth/device flow remains blocked by Cloudflare HTTP 403 from the Hetzner host; no API-token workaround is authorized or used. When interactive OAuth works, run:

```bash
npx wrangler d1 migrations apply consilium-webmcp-prod --remote --config wrangler.production.jsonc
npm run deploy:production
bash scripts/hetzner-acceptance.sh
CONSILIUM_LIVE_URL=https://<worker-host> node scripts/cloudflare-live-proof.mjs
CONSILIUM_LIVE_URL=https://<worker-host> node scripts/golden-pass3.mjs
```

Then use a WebMCP-capable browser to perform the `DEMO.md` journey: inspect all six domains/history, find support plus counterevidence, consult appointed advisors with canonical public-domain citations, stage without mutation, explicitly approve, commit once, verify visible Consilium state, reject replay, and inspect the durable trace.
