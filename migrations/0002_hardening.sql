ALTER TABLE patterns ADD COLUMN pipeline_hash TEXT;
ALTER TABLE consultations ADD COLUMN pipeline_hash TEXT;
ALTER TABLE advisor_reports ADD COLUMN pipeline_hash TEXT;
ALTER TABLE recommendations ADD COLUMN pipeline_hash TEXT;
ALTER TABLE vector_records ADD COLUMN pipeline_hash TEXT;
ALTER TABLE audit_events ADD COLUMN commit_proposal_id TEXT;

CREATE UNIQUE INDEX one_action_per_proposal ON actions(proposal_id);
CREATE UNIQUE INDEX one_commit_audit_per_proposal ON audit_events(commit_proposal_id);
CREATE INDEX consultations_session ON consultations(session_id, id);
CREATE INDEX proposals_session ON proposals(session_id, id);
