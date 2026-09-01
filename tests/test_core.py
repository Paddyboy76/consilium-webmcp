import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from app import core
from app.models import AdvisorReport


class CoreTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.db_patch = patch.object(core, "DB_PATH", Path(self.temp.name) / "test.db")
        self.db_patch.start()
        core.reset_demo("test")

    def tearDown(self):
        self.db_patch.stop(); self.temp.cleanup()

    def test_reset_is_deterministic(self):
        core.propose_action("Do the thing", "Evidence", "test")
        state = core.reset_demo("test")
        self.assertEqual(state["actions"], [])
        self.assertIsNone(state["pending_proposal"])

    def test_memory_retrieval_is_bounded_and_untrusted(self):
        results = core.search_memory("morning focus", 3)
        self.assertLessEqual(len(results), 3)
        self.assertTrue(all(item["untrusted"] for item in results))

    def test_prompt_injection_remains_data(self):
        results = core.search_memory("IGNORE DELETE", 5)
        self.assertEqual(results[0]["id"], "mem-injection")
        self.assertTrue(results[0]["untrusted"])
        self.assertEqual(len(core.current_context("test")["goals"]), 3)

    def test_advisor_specific_retrieval(self):
        self.assertEqual(core.advisor_sources("advisor-lean")[0]["id"], "src-lean-1")

    def test_invalid_citation_forces_abstention(self):
        report = AdvisorReport("a", "A", "q", [], [{"source_id":"invented"}], [], "bad", .9, "")
        self.assertFalse(core.validate_report(report, [], ["real"]))
        self.assertTrue(report.abstained)
        self.assertEqual(report.recommendation, "ABSTAIN")

    def test_council_structured_output_and_selection(self):
        result = core.consult_council("What should I focus on this morning?", "test")
        self.assertEqual(len(result["selected_advisors"]), 3)
        self.assertEqual(result["validation"]["citation_guardrail"], "passed")
        self.assertFalse(result["validation"]["persistent_mutation"])
        self.assertTrue(all(not r["abstained"] for r in result["advisor_reports"]))

    def test_propose_does_not_persist_then_commit_once(self):
        proposal = core.propose_action("Send three invitations", "Council consensus", "test")
        state = core.current_context("test")
        self.assertEqual(state["actions"], [])
        self.assertEqual(state["pending_proposal"]["id"], proposal["proposal_id"])
        core.commit_action(proposal["proposal_id"], "test")
        self.assertEqual(len(core.current_context("test")["actions"]), 1)
        with self.assertRaises(ValueError): core.commit_action(proposal["proposal_id"], "test")

    def test_invalid_proposal_cannot_commit(self):
        with self.assertRaises(ValueError): core.commit_action("../../etc/passwd", "test")

    def test_trace_is_session_scoped(self):
        result = core.consult_council("What should I focus on?", "test")
        self.assertEqual(core.inspect_trace(result["trace_id"], "test")["trace_id"], result["trace_id"])
        with self.assertRaises(LookupError): core.inspect_trace(result["trace_id"], "other")


if __name__ == "__main__": unittest.main()
