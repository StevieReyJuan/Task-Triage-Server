const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Tasks Endpoints', () => {
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

    describe(`GET /api/teams/:teamId`, () => {

        context(`Given no tasks`, () => {
            it(`responds with an empty list`, () => {
                
                return supertest(app)
                    .get(`/api/teams/${testTeams[3].id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect([]);
                }
            );
        });

        context(`Given user belongs to team with tasks`, () => {
            it(`responds with array of tasks`, () => {

                const taskList = helpers.makeExpectedTasksForTeam(testTeams[0], testTasks);
                
                return supertest(app)
                    .get(`/api/teams/${testTeams[0].id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(taskList);
            });
        });
    });

    describe(`GET /api/teams/:teamId/:taskId`, () => {
        context(`Given task exists`, () => {
            it(`responds with 201 and task`, () => {
                return supertest(app)
                    .get(`/api/teams/${testTeams[0].id}/${testTasks[0].id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(201)
                    .expect(testTasks[0]);
            });
        });
    });

    describe(`POST /api/teams/:teamId`, () => {

        context(`Given no required fields are blank`, () => {
            it(`creates a new post returning 201 and the new post`, () => {
                const newTask = {
                    team: testTeams[0].id,
                    title: 'testing',
                    content: 'testing 123',
                    status: 'Delay'
                };

                return supertest(app)
                    .post(`/api/teams/${testTeams[0].id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(newTask)
                    .expect(201)
                    .expect(res => {
                        expect(res.body).to.have.property('id');
                        expect(res.body.team).to.eql(newTask.team);
                        expect(res.body.title).to.eql(newTask.title);
                        expect(res.body.content).to.eql(newTask.content);
                        expect(res.body.status).to.eql(newTask.status);
                        expect(res.body.modified_by).to.eql(testUsers[0].id);
                        expect(res.headers.location).to.eql(`/api/teams/${testTeams[0].id}/${res.body.id}`);
                        const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' });
                        const actualDate = new Date(res.body.date_modified).toLocaleString();
                        expect(actualDate).to.eql(expectedDate);
                    })
                    .expect(res => {
                        db
                            .from('tasks')
                            .select('*')
                            .where({ id: res.body.id })
                            .first()
                            .then(row => {
                                expect(row.title).to.eql(newTask.title);
                                expect(row.team).to.eql(testTeams[0].id);
                                const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' });
                                const actualDate = new Date(row.date_modified).toLocaleString();
                                expect(actualDate).to.eql(expectedDate);
                            });
                    });
            });
        });
    });
});