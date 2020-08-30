const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Teams Endpoints', () => {
    let db;

    const { testTeams, testUsers, testTasks, testTeamUsers } = helpers.makeTaskTriageFixtures();

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL
        });
        app.set('db', db);
    });

    after('disconnect from db', () => db.destroy());

    before('cleanup', () => helpers.cleanTables(db));

    afterEach('cleanup', () => helpers.cleanTables(db));

    beforeEach('insert tasks', () => {
        return helpers.seedTasksTable(db, testTeams, testUsers, testTasks, testTeamUsers);
    });

    describe(`GET /api/teams`, () => {
        context(`Given user is assigned to teams`, () => {
            it(`responds with array of teams`, () => {

                const teamsList = helpers.makeExpectedTeamsForUser(testUsers[0], testTeams, testTeamUsers);

                return supertest(app)
                    .get('/api/teams')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(teamsList);
            });
        });

        context(`Given user is not assigned to any teams`, () => {
            it(`responds with an empty array`, () => {

                const teamsList = helpers.makeExpectedTeamsForUser(testTeamUsers[3], testTeams, testTeamUsers);

                return supertest(app)
                    .get('/api/teams')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[3]))
                    .expect(teamsList);
            });
        });
    });

    describe(`POST /api/teams`, () => {
        context(`No team of the same name exists`, () => {

            it(`creates a new team and responds with team details with a generated token`, () => {

                const newTeam = {
                    team_name: 'new team'
                };

                return supertest(app)
                    .post('/api/teams')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(newTeam)
                    .expect(201)
                    .expect(res => {
                        expect(res.body).to.have.property('id');
                        expect(res.body).to.have.property('token');
                        expect(res.body.name).to.eql(newTeam.team_name);
                        expect(res.headers.location).to.eql(`/api/teams/${res.body.id}`);
                    })
                    .expect(res => {
                        db
                            .from('teams')
                            .select('*')
                            .where({ id: res.body.id })
                            .first()
                            .then(row => {
                                expect(row.name).to.eql(newTeam.team_name);
                            })
                    });
            });
        });

        context(`Given a team of the same name exists`, () => {

            it(`responds with 400`, () => {

                const newTeam = {
                    team_name: 'Home'
                };

                return supertest(app)
                    .post('/api/teams')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(newTeam)
                    .expect(400, { error: 'A team by that name already exists' });
            });
        });
    });

    describe(`POST /api/teams/join-team`, () => {
        context(`A valid team token is entered`, () => {

            it(`successfully joins team by creating a new user/team pairing`, () => {

                const teamToken = {
                    token: '0e082de0-a15c-455b-b9d4-7ceb98605de5'
                };

                return supertest(app)
                    .post('/api/teams/join-team')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(teamToken)
                    .expect(201)
                    .expect(testTeams[2]);
            });
        });

        context(`An invalid team token is entered with no matching team`, () => {

            it(`responds with 404`, () => {

                const teamToken = {
                    token: 'not even a token'
                };

                return supertest(app)
                    .post('/api/teams/join-team')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(teamToken)
                    .expect(404, { error: `Team doesn't exist` });
            });
        });
    });
});