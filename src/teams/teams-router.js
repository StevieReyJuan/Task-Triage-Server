const path = require('path');
const express = require('express');
// const xss = require('xss');
const TeamsService = require('./teams-service');
const { requireAuth } = require('../middleware/jwt-auth');
const { v4: uuid } = require('uuid');

const teamsRouter = express.Router();
const jsonBodyParser = express.json();

teamsRouter
    .route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        const user_id = req.user.id;
        TeamsService.getTeamsByUser(
            req.app.get('db'), user_id
        )
            .then(teams => {
                res.json(teams.map(TeamsService.serializeTeam));
            })
            .catch(next);
    })
    .post(jsonBodyParser, (req, res, next) => {
        const { team_name } = req.body

        if (!req.body.team_name) {
            return res.status(400).json({
                error: 'Missing team name in request body'
            });
        }

        let newTeam;

        TeamsService.hasTeamWithTeamName(
            req.app.get('db'),
            team_name
        )
            .then(hasTeamWithTeamName => {
                if (hasTeamWithTeamName) {
                    res.status(400).json({
                        error: 'A team by that name already exists'
                    })
                    return Promise.reject();
                }

                const newTeam = {
                    name: team_name,
                    token: uuid()
                };

                return TeamsService.insertTeam(
                    req.app.get('db'),
                    newTeam
                )
            })
            .then(team => {

                newTeam = team;

                const team_user = {
                    team_id: team.id,
                    user_id: req.user.id
                };  

                return TeamsService.assignUserToTeam(
                    req.app.get('db'),
                    team_user
                )
            })
            .then(pair => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${newTeam.id}`))
                    .json(TeamsService.serializeTeam(newTeam))
            })
            .catch(next)
    });

teamsRouter
    .route('/join-team')
    .all(requireAuth)
    .post(jsonBodyParser, (req, res, next) => {

        const { token } = req.body;

        let joinedTeam;
        
        TeamsService.hasTeamWithToken(
            req.app.get('db'),
            token
        )
            .then(team => {
                if (!team) {
                    return res.status(404).json({
                        error: `Team doesn't exist`
                    })
                }

                joinedTeam = team;

                const team_user = {
                    team_id: team.id,
                    user_id: req.user.id
                };  

                return TeamsService.assignUserToTeam(
                    req.app.get('db'),
                    team_user
                )
                    .then(pair => {
                        res
                            .status(201)
                            // .location()
                            .json(TeamsService.serializeTeam(joinedTeam))
                    })
            })
            .catch(next)
    });

module.exports = teamsRouter;