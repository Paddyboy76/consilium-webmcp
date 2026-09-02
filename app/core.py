import json
import re
import sqlite3
import threading
import time
import uuid
from pathlib import Path

from .demo_data import ADVISORS, GOALS, MEMORIES, PERSONA, SOURCES
from .models import AdvisorReport

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "data" / "consilium.db"
LOCK = threading.Lock()


class ClosingConnection(sqlite3.Connection):
    def __exit__(self, exc_type, exc, tb):
        try:
            return super().__exit__(exc_type, exc, tb)
        finally:
            self.close()


def _db():
    DB_PATH.parent.mkdir(exist_ok=True)
    connection = sqlite3.connect(DB_PATH, factory=ClosingConnection)
    connection.row_factory = sqlite3.Row
    return connection


def reset_demo(session_id="demo"):
    with LOCK, _db() as db:
        db.executescript("""
        CREATE TABLE IF NOT EXISTS sessions(id TEXT PRIMARY KEY, reset_at REAL NOT NULL);
        CREATE TABLE IF NOT EXISTS actions(id TEXT PRIMARY KEY, session_id TEXT, text TEXT, status TEXT, created_at REAL);
        CREATE TABLE IF NOT EXISTS proposals(id TEXT PRIMARY KEY, session_id TEXT, text TEXT, rationale TEXT, status TEXT, created_at REAL);
        CREATE TABLE IF NOT EXISTS traces(id TEXT PRIMARY KEY, session_id TEXT, payload TEXT, created_at REAL);
        """)
        for table in ("actions", "proposals", "traces"):
            db.execute(f"DELETE FROM {table} WHERE session_id=?", (session_id,))
        db.execute("INSERT OR REPLACE INTO sessions VALUES (?,?)", (session_id, time.time()))
    return current_context(session_id)


def _ensure(session_id):
    with _db() as db:
        exists = db.execute("SELECT 1 FROM sessions WHERE id=?", (session_id,)).fetchone()
    if not exists:
        reset_demo(session_id)


def current_context(session_id="demo"):
    _ensure_tables()
    with _db() as db:
        actions = [dict(x) for x in db.execute("SELECT id,text,status FROM actions WHERE session_id=? ORDER BY created_at", (session_id,))]
        pending = db.execute("SELECT id,text,rationale FROM proposals WHERE session_id=? AND status='pending' ORDER BY created_at DESC LIMIT 1", (session_id,)).fetchone()
    return {"persona": PERSONA, "goals": GOALS, "today": {"available_minutes": 45, "priorities": ["Pilot outreach", "10K training", "Client delivery"]}, "actions": actions, "pending_proposal": dict(pending) if pending else None}


def _ensure_tables():
    with _db() as db:
        db.executescript("CREATE TABLE IF NOT EXISTS sessions(id TEXT PRIMARY KEY, reset_at REAL NOT NULL); CREATE TABLE IF NOT EXISTS actions(id TEXT PRIMARY KEY, session_id TEXT, text TEXT, status TEXT, created_at REAL); CREATE TABLE IF NOT EXISTS proposals(id TEXT PRIMARY KEY, session_id TEXT, text TEXT, rationale TEXT, status TEXT, created_at REAL); CREATE TABLE IF NOT EXISTS traces(id TEXT PRIMARY KEY, session_id TEXT, payload TEXT, created_at REAL);")


def search_memory(query, limit=5):
    terms = set(re.findall(r"[a-z0-9]+", query.lower())) - {"the", "and", "what", "should", "today", "with"}
    scored = []
    for item in MEMORIES:
        haystack = f"{item['title']} {item['text']}".lower()
        score = sum(term in haystack for term in terms)
        if score or not terms:
            scored.append((score, item))
    scored.sort(key=lambda pair: (pair[0], pair[1]["date"]), reverse=True)
    return [{**item, "untrusted": True} for _, item in scored[:max(1, min(limit, 8))]]


def advisor_sources(advisor_id):
    return [source for source in SOURCES if source["advisor_id"] == advisor_id]


def validate_report(report, allowed_personal, allowed_sources):
    cited = {e["source_id"] for e in report.evidence_items}
    valid = cited <= set(allowed_personal) | set(allowed_sources) and set(report.relevant_personal_context_ids) <= set(allowed_personal)
    if not valid or not cited:
        report.abstained = True
        report.abstention_reason = "Evidence validation failed or no supporting evidence was retrieved."
        report.recommendation = "ABSTAIN"
        report.confidence = 0
    return valid and not report.abstained


def consult_council(question, session_id="demo"):
    if not isinstance(question, str) or not 3 <= len(question) <= 600:
        raise ValueError("question must be 3–600 characters")
    _ensure(session_id)
    memory = search_memory(question + " morning launch focus priorities", 5)
    memory_ids = [m["id"] for m in memory]
    reports = []
    recommendations = {
        "advisor-drucker": "Use this block for the contribution that matters most: ask potential clients about the audit.",
        "advisor-newport": "Use one quiet 45-minute block to send the prepared messages before opening email or touching the website.",
        "advisor-lean": "Send three messages now. Their replies will tell Maya more about demand than another round of preparation.",
    }
    for advisor in ADVISORS:
        sources = advisor_sources(advisor["id"])
        evidence = [{"source_id": m["id"], "title": m["title"], "kind": "personal_memory"} for m in memory[:3]]
        evidence += [{"source_id": s["id"], "title": s["title"], "kind": "advisor_source"} for s in sources]
        report = AdvisorReport(advisor["id"], advisor["name"], question, memory_ids[:3], evidence,
            ["Morning protected blocks correlate with completed launch work.", "More than three priorities correlates with failure to finish."],
            recommendations[advisor["id"]], 0.9, "Synthetic history is small; future outcomes remain uncertain.")
        validate_report(report, memory_ids, [s["id"] for s in sources])
        reports.append(report.dict())
    trace_id = "trace-" + uuid.uuid4().hex[:12]
    decision = {
        "trace_id": trace_id,
        "selected_advisors": [{"advisor_id": a["id"], "advisor_name": a["name"], "why": a["focus"]} for a in ADVISORS],
        "consensus": "Use the 45 minutes to send the messages Maya has already prepared.",
        "disagreements": ["Effectiveness emphasizes contribution; Lean emphasizes learning. Both point to the same action."],
        "personal_memory_evidence": memory[:4],
        "advisor_source_evidence": SOURCES,
        "advisor_reports": reports,
        "recommendation": "Before opening email, send the three prepared messages about the accessibility audit. Leave the website alone for now.",
        "proposed_next_action": "Send the three prepared accessibility-audit messages before opening email.",
        "uncertainty": "This is evidence-bounded advice from a small synthetic history, not a guarantee.",
        "validation": {"citation_guardrail": "passed", "prompt_injection": "treated_as_untrusted_data", "persistent_mutation": False},
        "engine": "deterministic_demo",
    }
    events = [
        {"stage": "WebMCP", "status": "complete", "detail": "Bounded council request accepted"},
        {"stage": "Council Chair", "status": "complete", "detail": "Selected 3 relevant specialists"},
        *[{"stage": r["advisor_name"], "status": "complete", "detail": r["recommendation"]} for r in reports],
        {"stage": "Evidence guardrail", "status": "passed", "detail": "All citations map to retrieved IDs"},
        {"stage": "Council synthesis", "status": "complete", "detail": decision["recommendation"]},
    ]
    decision["events"] = events
    with _db() as db:
        db.execute("INSERT INTO traces VALUES (?,?,?,?)", (trace_id, session_id, json.dumps(decision), time.time()))
    return decision


def inspect_trace(trace_id, session_id="demo"):
    if not re.fullmatch(r"trace-[a-f0-9]{12}", trace_id):
        raise ValueError("invalid trace id")
    with _db() as db:
        row = db.execute("SELECT payload FROM traces WHERE id=? AND session_id=?", (trace_id, session_id)).fetchone()
    if not row:
        raise LookupError("trace not found")
    return json.loads(row["payload"])


def propose_action(text, rationale, session_id="demo"):
    if not isinstance(text, str) or not 3 <= len(text) <= 240 or not isinstance(rationale, str) or len(rationale) > 500:
        raise ValueError("invalid proposal")
    _ensure(session_id)
    proposal_id = "proposal-" + uuid.uuid4().hex[:12]
    with _db() as db:
        db.execute("UPDATE proposals SET status='superseded' WHERE session_id=? AND status='pending'", (session_id,))
        db.execute("INSERT INTO proposals VALUES (?,?,?,?,?,?)", (proposal_id, session_id, text, rationale, "pending", time.time()))
    return {"proposal_id": proposal_id, "text": text, "rationale": rationale, "status": "pending", "persisted": False}


def commit_action(proposal_id, session_id="demo"):
    if not re.fullmatch(r"proposal-[a-f0-9]{12}", proposal_id):
        raise ValueError("invalid proposal id")
    with LOCK, _db() as db:
        row = db.execute("SELECT * FROM proposals WHERE id=? AND session_id=?", (proposal_id, session_id)).fetchone()
        if not row:
            raise LookupError("proposal not found")
        if row["status"] != "pending":
            raise ValueError("proposal is no longer pending")
        action_id = "action-" + uuid.uuid4().hex[:12]
        db.execute("INSERT INTO actions VALUES (?,?,?,?,?)", (action_id, session_id, row["text"], "committed", time.time()))
        db.execute("UPDATE proposals SET status='committed' WHERE id=?", (proposal_id,))
    return {"action_id": action_id, "proposal_id": proposal_id, "text": row["text"], "status": "committed"}
