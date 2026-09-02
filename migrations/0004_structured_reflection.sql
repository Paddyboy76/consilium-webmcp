PRAGMA foreign_keys = ON;

CREATE TABLE nightly_reflections (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  journal TEXT NOT NULL,
  sleep_hours REAL NOT NULL CHECK(sleep_hours BETWEEN 0 AND 24),
  energy_level INTEGER NOT NULL CHECK(energy_level BETWEEN 1 AND 10),
  stress_level INTEGER NOT NULL CHECK(stress_level BETWEEN 1 AND 10),
  resting_hr INTEGER CHECK(resting_hr BETWEEN 30 AND 200),
  caar_json TEXT NOT NULL,
  synthesis_json TEXT NOT NULL,
  accepted_at TEXT NOT NULL
);
CREATE INDEX nightly_reflections_session_time ON nightly_reflections(session_id, accepted_at);

CREATE TABLE goal_reflections (
  id TEXT PRIMARY KEY,
  reflection_id TEXT NOT NULL REFERENCES nightly_reflections(id),
  session_id TEXT NOT NULL REFERENCES sessions(id),
  goal_id TEXT NOT NULL REFERENCES missions(id),
  area_id TEXT NOT NULL REFERENCES life_areas(id),
  status TEXT NOT NULL CHECK(status IN ('achieved','missed','not_reviewed')),
  why_failed TEXT,
  adaptation TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(reflection_id, goal_id)
);
CREATE INDEX goal_reflections_session_goal ON goal_reflections(session_id, goal_id, created_at);

CREATE TABLE reflection_facts (
  id TEXT PRIMARY KEY,
  reflection_id TEXT NOT NULL REFERENCES nightly_reflections(id),
  session_id TEXT NOT NULL REFERENCES sessions(id),
  goal_id TEXT REFERENCES missions(id),
  area_id TEXT REFERENCES life_areas(id),
  fact_type TEXT NOT NULL CHECK(fact_type IN ('progress','friction','energy','success','misalignment','mission','adaptation')),
  fact_text TEXT NOT NULL,
  source_key TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX reflection_facts_session_type ON reflection_facts(session_id, fact_type, created_at);

CREATE TABLE tomorrow_directives (
  id TEXT PRIMARY KEY,
  reflection_id TEXT NOT NULL REFERENCES nightly_reflections(id),
  session_id TEXT NOT NULL REFERENCES sessions(id),
  goal_id TEXT REFERENCES missions(id),
  area_id TEXT REFERENCES life_areas(id),
  directive TEXT NOT NULL,
  rationale TEXT NOT NULL,
  evidence_ids_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX tomorrow_directives_session_time ON tomorrow_directives(session_id, created_at);

ALTER TABLE morning_briefs ADD COLUMN analysis_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE morning_briefs ADD COLUMN recommendation_id TEXT REFERENCES recommendations(id);
