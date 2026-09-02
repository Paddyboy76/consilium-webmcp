PRAGMA foreign_keys = ON;

CREATE TABLE journal_entries (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  area_id TEXT NOT NULL REFERENCES life_areas(id),
  mission_id TEXT REFERENCES missions(id),
  body TEXT NOT NULL CHECK(length(body) BETWEEN 20 AND 4000),
  mood TEXT NOT NULL CHECK(mood IN ('energized','steady','strained','reflective')),
  occurred_at TEXT NOT NULL
);
CREATE INDEX journal_entries_session_time ON journal_entries(session_id, occurred_at);

ALTER TABLE proposals ADD COLUMN target_mission_id TEXT REFERENCES missions(id);
ALTER TABLE actions ADD COLUMN mission_id TEXT REFERENCES missions(id);
