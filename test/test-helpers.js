const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
    return [
        {
            id: 1,
            name: 'tester1',
            user_name: 'test-user-1',
            password: 'password'
        },
        {
            id: 2,
            name: 'tester2',
            user_name: 'test-user-2',
            password: 'password'
        },
        {
            id: 3,
            name: 'tester3',
            user_name: 'test-user-3',
            password: 'password'
        },
        {
            id: 4,
            name: 'tester4',
            user_name: 'test-user-4',
            password: 'password'
        }
    ];
}

function makeTeamsArray() {
    return [
        {
            id: 1,
            name: 'Home',
            token: '10c83aed-d156-4c18-834f-0e76e20c2b71'
        },
        {
            id: 2,
            name: 'Work',
            token: 'ba19f6e9-1fee-4d58-b5a4-638e43a33c2b'
        },
        {
            id: 3,
            name: 'Friends',
            token: '0e082de0-a15c-455b-b9d4-7ceb98605de5'
        },
        {
            id: 4,
            name: 'Empty',
            token: 'Does it matter?'
        }
    ];
}

function makeTasksArray(teams, users) {
    return [
        {
            id: 1,
            team: teams[0].id, 
            title: 'Do chores',
            content: 'Dishes',
            modified_by: users[0].id,
            status: 'Elevated',
            date_modified: '2021-01-22T16:28:32.615Z'
        },
        {
            id: 2,
            team: teams[0].id, 
            title: 'Vacuum',
            content: '...Just vacuum',
            modified_by: users[0].id,
            status: 'Delay',
            date_modified: '2021-01-22T16:28:32.615Z'
        },
        {
            id: 3,
            team: teams[0].id, 
            title: 'Laundry',
            content: 'Colors',
            modified_by: users[0].id,
            status: 'Done',
            date_modified: '2021-01-22T16:28:32.615Z'
        },
        {
            id: 4,
            team: teams[1].id, 
            title: 'Capstone',
            content: 'Finish the MVP!',
            modified_by: users[2].id,
            status: 'Urgent',
            date_modified: '2021-01-22T16:28:32.615Z'
        },
        {
            id: 5,
            team: teams[1].id, 
            title: 'Email',
            content: 'Send it',
            modified_by: users[2].id,
            status: 'Delay',
            date_modified: '2021-01-22T16:28:32.615Z'
        },
        {
            id: 6,
            team: teams[1].id, 
            title: 'TPS Reports',
            content: 'Get them',
            modified_by: users[2].id,
            status: 'Done',
            date_modified: '2021-01-22T16:28:32.615Z'
        },
        {
            id: 7,
            team: teams[2].id, 
            title: 'Hangout',
            content: 'With social distancing',
            modified_by: users[1].id,
            status: 'Delay',
            date_modified: '2021-01-22T16:28:32.615Z'
        },
        {
            id: 8,
            team: teams[2].id, 
            title: 'Buy beers',
            content: 'Pilsners & Pizza',
            modified_by: users[1].id,
            status: 'Elevated',
            date_modified: '2021-01-22T16:28:32.615Z'
        },
        {
            id: 9,
            team: teams[2].id, 
            title: 'Facetime',
            content: 'This is getting old',
            modified_by: users[1].id,
            status: 'Done',
            date_modified: '2021-01-22T16:28:32.615Z'
        }
    ];
}

function makeTeamUsersArray() {
    return [
        {
            id: 1,
            team_id: 1,
            user_id: 1, 
        },
        {
            id: 2,
            team_id: 1,
            user_id: 2,
        },
        {
            id: 3,
            team_id: 2,
            user_id: 1, 
        },
        {
            id: 4,
            team_id: 2,
            user_id: 3,
        },
        {
            id: 5,
            team_id: 3, //Only team that testUsers[0] is not a member of
            user_id: 2, 
        },
        {
            id: 6,
            team_id: 4,
            user_id: 1 
        }
    ];
}

function makeExpectedTasksForTeam(team, tasks) {
    return tasks.filter(task => task.team === team.id);
}

function makeExpectedTeamsForUser(user, teams, pairs) {
    const userTeamPair = pairs.filter(pair => pair.user_id === user.id);

    return userTeamPair.map(pair => {
            return teams.find(team => team.id === pair.team_id)
    });
}

function makeTaskTriageFixtures() {
    const testUsers = makeUsersArray();
    const testTeams = makeTeamsArray();
    const testTasks = makeTasksArray(testTeams, testUsers);
    const testTeamUsers = makeTeamUsersArray();

    return { testUsers, testTeams, testTasks, testTeamUsers };
}

function cleanTables(db) {
    return db.transaction(trx =>
        trx.raw(
            `TRUNCATE
            teams,
            users,
            teams_users,
            tasks`
        )
        .then(() =>
            Promise.all([
                trx.raw(`ALTER SEQUENCE teams_id_seq minvalue 0 START WITH 1`),
                trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
                trx.raw(`ALTER SEQUENCE teams_users_id_seq minvalue 0 START WITH 1`),
                trx.raw(`ALTER SEQUENCE tasks_id_seq minvalue 0 START WITH 1`),
                trx.raw(`SELECT setval('teams_id_seq', 0)`),
                trx.raw(`SELECT setval('users_id_seq', 0)`),
                trx.raw(`SELECT setval('teams_users_id_seq', 0)`),
                trx.raw(`SELECT setval('tasks_id_seq', 0)`)
            ])
        )
    );
}

function seedUsersTable(db, users) {
    const preppedUsers = users.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 1)
    }));

    return db.into('users').insert(preppedUsers)
        .then(() =>
            // update the auto sequence to stay in sync
            db.raw(
                    `SELECT setval('users_id_seq', ?)`,
                    [users[users.length - 1].id],
            )
        );
}

function seedTeamsTable(db, teams) {
    return db.into('teams').insert(teams)
        .then(() => 
            // update the auto sequence to stay in sync
            db.raw(
                `SELECT setval('teams_id_seq', ?)`,
                [teams[teams.length -  1].id],
            )
        );
}

// add teams users to async?
function seedTasksTable(db, teams, users, tasks, pairs) {
    // use a transaction to group the queries and auto rollback on any failure
    return db.transaction(async trx => {
        await seedTeamsTable(trx, teams);
        await seedUsersTable(trx, users);
        await seedTeamsUsersTable(trx, pairs);
        await trx.into('tasks').insert(tasks);
        // update the auto sequence to match the forced id values
        await trx.raw(
            `SELECT setval('tasks_id_seq', ?)`,
            [tasks[tasks.length - 1].id],
        );
    });
}

function seedTeamsUsersTable(db, pairs) {
    return db.into('teams_users').insert(pairs)
        .then(() => 
            // update the auto sequence to stay in sync
            db.raw(
                `SELECT setval('teams_users_id_seq', ?)`,
                [pairs[pairs.length -  1].id],
            )
        );
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ user_id: user.id }, secret, {
        subject: user.user_name,
        algorithm: 'HS256'
    });

    return `Bearer ${token}`;
}

module.exports = {
    makeUsersArray,
    makeTeamsArray,
    makeTeamsArray,
    makeTeamUsersArray,

    makeExpectedTasksForTeam,
    makeExpectedTeamsForUser,
    makeTaskTriageFixtures,
    cleanTables,
    seedUsersTable,
    seedTeamsTable,
    seedTasksTable,
    seedTeamsUsersTable,

    makeAuthHeader
};