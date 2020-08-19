INSERT INTO teams (name, token)
VALUES
    ('Home', '10c83aed-d156-4c18-834f-0e76e20c2b71'),
    ('Work', 'ba19f6e9-1fee-4d58-b5a4-638e43a33c2b'),
    ('Friends', '0e082de0-a15c-455b-b9d4-7ceb98605de5');

INSERT INTO users (name, user_name, password)
VALUES
    ('Steven', 's.steven.reyes@gmail.com', '$2a$12$Uocv.8jRXx29eneT93eNeuqkC0iGl/YyLJAAASG3ogbS1jnM8rvwG'),
    ('Amber', 'amber@gmail.com', '$2a$12$ggRMKSuHwkdjbyN9kvTMS.FZFAHec/zudAB7OuJUonydE2s4DB176'),
    ('Mario', 'mario@mario.com', '$2a$12$5bN1ABZMSGKps/oiceK10u5MPMgGcSSJDiFen6huQTjqMhH/ohG92');

INSERT INTO teams_users (team_id, user_id)
VALUES
    (1, 1),
    (1, 2),
    (2, 1),
    (2, 3),
    (3, 2);

INSERT INTO tasks (team, title, content, modified_by, status)
VALUES
    (1, 'Do chores', 'Dishes', 1, 'Elevated'),
    (1, 'Vacuum', '...Just vacuum', 1, 'Stable'),
    (2, 'Capstone', 'Finish the MVP!', 3, 'Severe'),
    (3, 'Hangout', 'With social distancing', 2, 'Stable');