const xss = require('xss');

const TeamsService = {
    getTeamsByUser(db, user_id) {
        return db
            .from('teams')
            .join('teams_users', 'teams.id', '=', 'teams_users.team_id')
            .select('teams.*')
            .where('teams_users.user_id', user_id);
    },
    hasTeamWithTeamName(db, name) {
        return db('teams')
            .where({ name })
            .first()
            .then(team => !!team); // true, does exist
    },
    insertTeam(db, newTeam) {
        return db
            .insert(newTeam)
            .into('teams')
            .returning('*')
            .then(([team]) => team);
    },
    serializeTeam(team) {
        return {
            id: team.id,
            name: xss(team.name),
            token: team.token
        }
    },
    assignUserToTeam(db, team_user) {
        return db
            .insert(team_user)
            .into('teams_users')
            .returning('*')
            .then(([pair]) => pair);
    }
}

module.exports = TeamsService;

// getTeamsByUser(db, user_id) {
//     return db
//         .from('teams', 'teams_users')
//         .select('teams.*')
//         .where('teams.id', 'teams_users.team_id')
//         .where('teams_users.user_id', user_id);
// }