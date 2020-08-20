const path = require('path');
const express = require('express');
// const xss = require('xss');
const TasksService = require('./tasks-service');
const { requireAuth } = require('../middleware/jwt-auth');
const { requireUser } = require('../middleware/app-auth');

const tasksRouter = express.Router();
const jsonBodyParser = express.json();

tasksRouter
    .route('/:teamId')
    .all(requireAuth, requireUser)
    .get((req, res, next) => {
        const team_id = req.params.teamId;
        TasksService.getTasksByTeamId(
            req.app.get('db'), team_id
        )
            .then(tasks => {
                res.json(tasks.map(TasksService.serializeTasks));
            })
            .catch(next);
    })
    .post(jsonBodyParser, (req, res, next) => {
        const team_id  = req.params.teamId;
        const { title, content, status } = req.body;
        const newTask = { title, content, status };

        for (const [key, value] of Object.entries(newTask)) {
            if (value == null) {
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                });
            }
        }

        newTask.team = team_id;
        newTask.modified_by = req.user.id;

        return TasksService.insertTask(
            req.app.get('db'),
            newTask
        )
            .then(task => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${task.id}`))
                    .json(TasksService.serializeTasks(task));
            })
            .catch(next)
    });

tasksRouter
    .route('/:teamId/:taskId')
    .all(requireAuth, requireUser, checkTaskExists)
    .get((req, res) => {
        res.json(TasksService.serializeTasks(res.task));
    })
    .patch(jsonBodyParser, (req, res, next) => {
        const team_id = req.params.teamId;
        const task_id = req.params.taskId
        const { title, content, status } = req.body;
        const taskToUpdate = { title, content, status };

        const numberOfValues = Object.values(taskToUpdate).filter(Boolean).length;

        if (numberOfValues.length === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must include any of 'title', 'content', or 'status'.`
                }
            });
        }

        taskToUpdate.team = team_id;
        taskToUpdate.modified_by = req.user.id;
        taskToUpdate.date_modified = new Date();

        return TasksService.updateTask(
            req.app.get('db'),
            team_id, task_id,
            taskToUpdate
        )
            .then(task => {
                console.log(task);
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${task.team}/${task.id}`))
                    .json(TasksService.serializeTasks(task));
            })
            .catch(next)
    });

    async function checkTaskExists(req, res, next) {
        try {
            const task = await TasksService.getTaskById(
                req.app.get('db'),
                req.params.teamId,
                req.params.taskId
            );

            if (!task) {
                return res.status(404).json({
                    error: `Task doesn't exist`
                });
            }
            
            res.task = task;
            next();
        }   catch (error) {
            next(error);
        }
    }

module.exports = tasksRouter;