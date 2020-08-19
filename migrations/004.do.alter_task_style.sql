CREATE TYPE task_status AS ENUM (
    'Immediate',
    'Delay',
    'Hold',
    'Done'
);

ALTER TABLE tasks
    ADD status task_status;
