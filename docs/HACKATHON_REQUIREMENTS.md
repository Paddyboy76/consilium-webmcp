# Hackathon requirements matrix

Verified September 1, 2026 against the [official challenge page](https://webmcp.devpost.com/), [official rules](https://webmcp.devpost.com/rules), [current WebMCP specification](https://webmachinelearning.github.io/webmcp/), and [OpenAI model documentation](https://developers.openai.com/api/docs/models). Deadline: **September 3, 2026 at 1:00 PM Pacific**.

| Requirement / criterion | Concrete implementation or deliverable |
|---|---|
| Functional software | Local Python service, responsive browser UI, deterministic reset |
| Public code and license | Fresh repository, MIT `LICENSE`, publication audit pending |
| Demo video | Exact sub-three-minute script in `DEMO.md` |
| WebMCP leverage (first tie-break) | Six typed tools; shared visible state; dynamic one-use commit lifecycle |
| Execution | Structured council, separate retrieval, citation guardrail, 14 automated tests |
| Impact | User-owned longitudinal context survives transient agent sessions |
| Creativity / ambition | External browser agent collaborates with an internal evidence council through capabilities that change with human-approved state |
| OpenAI centrality | Agents SDK manager architecture/model choices documented; live API blocked pending separately authorized credential |
| Safety | Untrusted memory, bounded input, abstention, proposal→commit, session scope, safe trace |

Current spec API: `document.modelContext.registerTool(tool, { signal })`; aborting the signal unregisters the dynamic tool. Read-only annotations are applied to four tools. The specification does not currently define an untrusted-content annotation on the tool dictionary, so trust is explicit in descriptions and response payloads rather than invented metadata.

