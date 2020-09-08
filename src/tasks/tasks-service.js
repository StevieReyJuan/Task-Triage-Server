const xss = require('xss');

const TasksService = {
    getTasksByTeamId(db, team_id) {
        return db
            .from('tasks')
            .select('*')
            .where('team', team_id);
    },
    getTaskById(db, team_id, task_id) {
        return db
            .from('tasks')
            .select('*')
            .where('team', team_id)
            .where('id', task_id)
            .first();
    },
    insertTask(db, newTask) {
        return db
            .insert(newTask)
            .into('tasks')
            .returning('*')
            .then(([task]) => task);
    },
    updateTask(db, team_id, task_id, updatedTaskFields) {
        return db
            .from('tasks')
            .where('team', team_id)
            .where('id', task_id)
            .update(updatedTaskFields)
            .returning('*')
            .then(([task]) => task)
            .then(task => 
                TasksService.getTaskById(db, task.team, task.id));
    },
    serializeTasks(task) {
        return {
            id: task.id,
            team: task.team,
            title: xss(task.title),
            content: xss(task.content),
            modified_by: task.modified_by,
            date_modified: new Date(task.date_modified) || null,
            status: task.status
        }
    }
}

module.exports = TasksService;