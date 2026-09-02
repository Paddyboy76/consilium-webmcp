PRAGMA foreign_keys = ON;

CREATE TABLE life_areas (
  id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES sessions(id), name TEXT NOT NULL,
  purpose TEXT NOT NULL, accent TEXT NOT NULL, position INTEGER NOT NULL, created_at TEXT NOT NULL
);
CREATE INDEX life_areas_session ON life_areas(session_id, position);

CREATE TABLE missions (
  id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES sessions(id), area_id TEXT NOT NULL REFERENCES life_areas(id),
  kind TEXT NOT NULL CHECK(kind IN ('project','goal')), title TEXT NOT NULL, why_text TEXT NOT NULL,
  horizon TEXT NOT NULL CHECK(horizon IN ('today','weekly','quarterly','yearly')), status TEXT NOT NULL,
  progress INTEGER NOT NULL CHECK(progress BETWEEN 0 AND 100), target_date TEXT, created_at TEXT NOT NULL
);
CREATE INDEX missions_session_area ON missions(session_id, area_id, status);

CREATE TABLE progress_logs (
  id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES sessions(id), mission_id TEXT NOT NULL REFERENCES missions(id),
  result TEXT NOT NULL CHECK(result IN ('progress','success','partial','failure')), progress INTEGER NOT NULL,
  note TEXT NOT NULL, occurred_at TEXT NOT NULL
);
CREATE INDEX progress_mission_time ON progress_logs(mission_id, occurred_at);

CREATE TABLE reflections (
  id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES sessions(id), mission_id TEXT REFERENCES missions(id),
  achieved TEXT NOT NULL, failed TEXT NOT NULL, happened TEXT NOT NULL, why_text TEXT NOT NULL,
  lesson TEXT NOT NULL, adaptation TEXT NOT NULL, tomorrow TEXT NOT NULL, occurred_at TEXT NOT NULL
);
CREATE INDEX reflections_session_time ON reflections(session_id, occurred_at);

CREATE TABLE morning_briefs (
  id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES sessions(id), generated_at TEXT NOT NULL,
  headline TEXT NOT NULL, priorities_json TEXT NOT NULL, evidence_json TEXT NOT NULL, mode TEXT NOT NULL
);
CREATE INDEX briefs_session_time ON morning_briefs(session_id, generated_at);

CREATE TABLE webmcp_calls (
  id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES sessions(id), tool_name TEXT NOT NULL,
  input_json TEXT NOT NULL, result_json TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE INDEX webmcp_calls_session_time ON webmcp_calls(session_id, created_at);
