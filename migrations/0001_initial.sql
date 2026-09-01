PRAGMA foreign_keys = ON;

CREATE TABLE users (id TEXT PRIMARY KEY, display_name TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE sessions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL, reset_version TEXT NOT NULL);
CREATE TABLE projects (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), title TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE goals (id TEXT PRIMARY KEY, project_id TEXT REFERENCES projects(id), user_id TEXT NOT NULL REFERENCES users(id), title TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE commitments (id TEXT PRIMARY KEY, goal_id TEXT NOT NULL REFERENCES goals(id), text TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE events (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), session_id TEXT REFERENCES sessions(id), occurred_at TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK(event_type IN ('interaction','observation','goal_transition','checkpoint','commitment','recommendation','user_response','action_proposed','action_committed','outcome','reflection','constraint','friction','energy','adaptation','correction')),
  subject_id TEXT, valence TEXT CHECK(valence IN ('positive','negative','neutral') OR valence IS NULL), magnitude REAL,
  payload_json TEXT NOT NULL, provenance TEXT NOT NULL, supersedes_event_id TEXT REFERENCES events(id), created_at TEXT NOT NULL
);
CREATE INDEX events_user_time ON events(user_id, occurred_at);
CREATE INDEX events_type_time ON events(event_type, occurred_at);
CREATE TABLE patterns (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), name TEXT NOT NULL, assertion TEXT NOT NULL,
  confidence REAL NOT NULL CHECK(confidence BETWEEN 0 AND 1), window_start TEXT NOT NULL, window_end TEXT NOT NULL,
  algorithm_version TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('active','rejected','superseded')), supersedes_pattern_id TEXT REFERENCES patterns(id), created_at TEXT NOT NULL
);
CREATE TABLE pattern_evidence (pattern_id TEXT NOT NULL REFERENCES patterns(id), event_id TEXT NOT NULL REFERENCES events(id), relation TEXT NOT NULL CHECK(relation IN ('supports','contradicts')), weight REAL NOT NULL, PRIMARY KEY(pattern_id,event_id));
CREATE TABLE recommendations (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), consultation_id TEXT, text TEXT NOT NULL, producer TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE recommendation_evidence (recommendation_id TEXT NOT NULL REFERENCES recommendations(id), evidence_id TEXT NOT NULL, lane TEXT NOT NULL CHECK(lane IN ('personal','advisor')), PRIMARY KEY(recommendation_id,evidence_id));
CREATE TABLE recommendation_responses (id TEXT PRIMARY KEY, recommendation_id TEXT NOT NULL REFERENCES recommendations(id), response TEXT NOT NULL CHECK(response IN ('accepted','rejected','deferred','edited')), detail TEXT, occurred_at TEXT NOT NULL);
CREATE TABLE actions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), recommendation_id TEXT REFERENCES recommendations(id), proposal_id TEXT, text TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL, completed_at TEXT);
CREATE TABLE outcomes (id TEXT PRIMARY KEY, action_id TEXT NOT NULL REFERENCES actions(id), result TEXT NOT NULL CHECK(result IN ('success','failure','partial','unintended')), detail TEXT NOT NULL, occurred_at TEXT NOT NULL);
CREATE TABLE source_packs (id TEXT PRIMARY KEY, advisor_id TEXT NOT NULL, version TEXT NOT NULL, author TEXT NOT NULL, title TEXT NOT NULL, translator TEXT, edition TEXT NOT NULL, publication_year INTEGER, public_domain_basis TEXT NOT NULL, canonical_url TEXT NOT NULL, source_sha256 TEXT NOT NULL, doctrine_profile TEXT NOT NULL, anti_drift_boundaries TEXT NOT NULL, ingestion_version TEXT NOT NULL, embedding_model TEXT, embedding_dimensions INTEGER, UNIQUE(advisor_id,version));
CREATE TABLE source_chunks (id TEXT PRIMARY KEY, pack_id TEXT NOT NULL REFERENCES source_packs(id), advisor_id TEXT NOT NULL, locator TEXT NOT NULL, canonical_text TEXT NOT NULL, normalized_hash TEXT NOT NULL, ordinal INTEGER NOT NULL);
CREATE TABLE council_appointments (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), advisor_id TEXT NOT NULL, pack_id TEXT NOT NULL REFERENCES source_packs(id), appointed_at TEXT NOT NULL, ended_at TEXT, provenance TEXT NOT NULL);
CREATE TABLE consultations (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), session_id TEXT NOT NULL REFERENCES sessions(id), question TEXT NOT NULL, evidence_bundle_json TEXT NOT NULL, model_config_version TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE advisor_reports (id TEXT PRIMARY KEY, consultation_id TEXT NOT NULL REFERENCES consultations(id), advisor_id TEXT NOT NULL, report_json TEXT NOT NULL, validation_json TEXT NOT NULL, abstained INTEGER NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE proposals (id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES sessions(id), consultation_id TEXT REFERENCES consultations(id), text TEXT NOT NULL, rationale TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('pending','committed','cancelled','superseded')), created_at TEXT NOT NULL, committed_at TEXT);
CREATE UNIQUE INDEX one_pending_proposal ON proposals(session_id) WHERE status='pending';
CREATE TABLE audit_events (id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES sessions(id), event_type TEXT NOT NULL, subject_id TEXT, safe_detail_json TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE vector_records (id TEXT PRIMARY KEY, canonical_id TEXT NOT NULL, corpus_kind TEXT NOT NULL CHECK(corpus_kind IN ('personal','advisor')), user_id TEXT, advisor_id TEXT, pack_version TEXT, content_hash TEXT NOT NULL, embedding_model TEXT NOT NULL, dimensions INTEGER NOT NULL, embedding_version TEXT NOT NULL, indexed_at TEXT);

