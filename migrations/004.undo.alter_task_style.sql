ALTER TABLE tasks DROP COLUMN IF EXISTS status;

DROP TYPE IF EXISTS task_status;