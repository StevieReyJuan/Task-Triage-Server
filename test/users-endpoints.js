const knex = require('knex');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('User Endpoints', () => {
    let db;
    const { testUsers } = helpers.makeTaskTriageFixtures();

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

    describe(`POST /api/users`, () => {
        context(`User Validation`, () => {
            beforeEach('insert users', () => helpers.seedUsersTable(db, testUsers));

            const requiredFields = ['name', 'user_name', 'password'];

            requiredFields.forEach(field => {
                const registerAttemptBody = {
                    name: 'test name',
                    user_name: 'test user_name',
                    password: 'test password'
                };

                it(`responds with 400 required error when '${field}' is missing`, () => {
                    delete registerAttemptBody[field];

                    return supertest(app)
                        .post('/api/users')
                        .send(registerAttemptBody)
                        .expect(400, {
                            error: `Missing '${field}' in request body`});
                });

                it(`responds 400 'Password must be longer than 7 characters' when empty password`, () => {
                    const userShortPassword = {
                        name: 'test name',
                        user_name: 'test user_name',
                        password: '123456'
                    };
                    return supertest(app)
                        .post('/api/users')
                        .send(userShortPassword)
                        .expect(400, { error: `Password must be longer than 7 characters` });
                });
            
                it(`responds 400 'Password must be less than 72 characters' when long password`, () => {
                    const userLongPassword = {
                        name: 'test name',
                        user_name: 'test user_name',
                        password: '*'.repeat(73)
                    };
                    return supertest(app)
                        .post('/api/users')
                        .send(userLongPassword)
                        .expect(400, { error: `Password must be less than 72 characters` });
                });
        
                it(`responds 400 error when password starts with spaces`, () => {
                    const userPasswordStartsSpaces = {
                        name: 'test name',
                        user_name: 'test user_name',
                        password: ' 1Aa!2Bb@'
                    };
                    return supertest(app)
                        .post('/api/users')
                        .send(userPasswordStartsSpaces)
                        .expect(400, { error: `Password must not start or end with a space` });
                });
        
                it(`responds 400 error when password ends with spaces`, () => {
                    const userPasswordEndsSpaces = {
                        name: 'test name',
                        user_name: 'test user_name',
                        password: '1Aa!2Bb@ '
                    };

                    return supertest(app)
                        .post('/api/users')
                        .send(userPasswordEndsSpaces)
                        .expect(400, { error: `Password must not start or end with a space` });
                });
            });
        });

        context(`Happy path`, () => {
            it(`responds 201, serialized user, storing bcryped password`, () => {
                const newUser = {
                    name: 'test name',
                    user_name: 'test user_name',
                    password: '11AAaa!!'
                };
                return supertest(app)
                    .post('/api/users')
                    .send(newUser)
                    .expect(201)
                    .expect(res => {
                        expect(res.body).to.have.property('id');
                        expect(res.body.name).to.eql(newUser.name);
                        expect(res.body.user_name).to.eql(newUser.user_name);
                        expect(res.body).to.not.have.property('password');
                        expect(res.headers.location).to.eql(`/api/users/${res.body.id}`);
                    })
                        .expect(res =>
                            db
                                .from('users')
                                .select('*')
                                .where({ id: res.body.id })
                                .first()
                                .then(row => {
                                    expect(row.name).to.eql(newUser.name);
                                    expect(row.user_name).to.eql(newUser.user_name);
                    
                                    return bcrypt.compare(newUser.password, row.password);
                                })
                                .then(compareMatch => {
                                    expect(compareMatch).to.be.true;
                                })
                        );
            });
        });
    });
});