const path = require('path');
const express = require('express');
const UsersService = require('./users-service');
// const { requireAuth } = require('../middleware/jwt-auth')

const usersRouter = express.Router();
const jsonBodyParser = express.json();

usersRouter
    .post('/', jsonBodyParser, (req, res, next) => {
        const { name, user_name, password } = req.body;

        for (const field of ['name', 'user_name', 'password'])
            if(!req.body[field])
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                });
        
        const passwordError = UsersService.validatePassword(password);

        if (passwordError) 
            return res.status(400).json({ error: passwordError });

        UsersService.hasUserWithUserName(
            req.app.get('db'),
            user_name
        )
        .then(hasUserWithUserName => {
            if (hasUserWithUserName)
                return res.status(400).json({ error: `Username already exists` });

            return UsersService.hashPassword(password)
                .then(hashedPassword => {
                    const newUser = {
                        name,
                        user_name,
                        password: hashedPassword
                    };

                    return UsersService.insertUser(
                        req.app.get('db'),
                        newUser
                    )
                        .then(user => {
                            res
                                .status(201)
                                .location(path.posix.join(req.originalUrl, `/${user.id}`))
                                .json(UsersService.serializeUser(user))
                        });
                });
        })
        .catch(next);
    });

module.exports = usersRouter;