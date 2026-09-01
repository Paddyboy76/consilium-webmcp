import re
import unittest
from pathlib import Path

JS = (Path(__file__).parents[1] / "web" / "app.js").read_text()


class WebMCPContractTests(unittest.TestCase):
    def test_current_api_is_visible(self):
        self.assertIn("document.modelContext.registerTool", JS)

    def test_six_tool_contracts(self):
        for name in ("get_current_context", "search_personal_memory", "consult_council", "inspect_council_run", "propose_next_action", "commit_proposed_action"):
            self.assertIn(name, JS)

    def test_read_tools_annotated(self):
        self.assertGreaterEqual(JS.count("readOnlyHint:true"), 4)

    def test_dynamic_commit_uses_abort_lifecycle(self):
        self.assertIn("new AbortController()", JS)
        self.assertIn("commitController.abort()", JS)

    def test_schemas_bound_text(self):
        self.assertIn("maxLength:600", JS)
        self.assertIn("maxLength:240", JS)
        self.assertNotIn("additionalProperties:true", JS)


if __name__ == "__main__": unittest.main()

