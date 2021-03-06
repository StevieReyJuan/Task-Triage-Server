require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV, CLIENT_ORIGIN } = require('./config');
const authRouter = require('./auth/auth-router');
const usersRouter = require('./users/users-router');
const teamsRouter = require('./teams/teams-router');
const tasksRouter = require('./tasks/tasks-router');

const app = express();

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common';

app.use(morgan(morganOption));

app.use(cors({
    origin: CLIENT_ORIGIN
}));

app.use(helmet());

app.use('/api/auth', authRouter);

app.use('/api/users', usersRouter);

app.use('/api/teams', teamsRouter);

app.use('/api/teams', tasksRouter);

app.get('/', (req, res) => {
    res.send('Hello, world!')
});

app.get('/api/*', (req, res) => {
    res.json({ok: true});
});

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})

module.exports = app;