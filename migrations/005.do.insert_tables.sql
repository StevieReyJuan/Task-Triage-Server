INSERT INTO teams (name, token)
VALUES
    ('Home', '10c83aed-d156-4c18-834f-0e76e20c2b71'),
    ('Work', 'ba19f6e9-1fee-4d58-b5a4-638e43a33c2b'),
    ('Friends', '0e082de0-a15c-455b-b9d4-7ceb98605de5');

INSERT INTO users (name, user_name, password)
VALUES
    ('Tester1', 'test123', '$2a$12$Uocv.8jRXx29eneT93eNeuqkC0iGl/YyLJAAASG3ogbS1jnM8rvwG'),
    ('Tester2', 'test456', '$2a$12$ggRMKSuHwkdjbyN9kvTMS.FZFAHec/zudAB7OuJUonydE2s4DB176'),
    ('Tester3', 'test789', '$2a$12$5bN1ABZMSGKps/oiceK10u5MPMgGcSSJDiFen6huQTjqMhH/ohG92');

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
    (1, 'Vacuum', '...Just vacuum', 1, 'Delay'),
    (1, 'Laundry', 'Colors', 1, 'Done'),
    (2, 'Capstone', 'Finish the MVP!', 3, 'Urgent'),
    (2, 'Email', 'Send it', 3, 'Delay'),
    (2, 'TPS Reports', 'Get them', 3, 'Done'),
    (3, 'Hangout', 'With social distancing', 2, 'Delay'),
    (3, 'Buy beers', 'Pilsners & Pizza', 2, 'Elevated'),
    (3, 'Facetime', 'This is getting old', 2, 'Done');