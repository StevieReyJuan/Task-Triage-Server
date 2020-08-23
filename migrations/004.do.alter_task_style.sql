CREATE TYPE task_status AS ENUM (
    'Urgent',
    'Elevated',
    'Delay',
    'Done'
);

ALTER TABLE tasks
    ADD status task_status;
