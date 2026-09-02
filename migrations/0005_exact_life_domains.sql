PRAGMA foreign_keys = ON;

ALTER TABLE life_areas ADD COLUMN code TEXT;
ALTER TABLE life_areas ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0,1));
ALTER TABLE life_areas ADD COLUMN migration_json TEXT NOT NULL DEFAULT '{}';

CREATE UNIQUE INDEX life_areas_session_code
  ON life_areas(session_id, code)
  WHERE code IS NOT NULL AND is_active = 1;
