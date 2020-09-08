const { getTeamsByUser } = require('../teams/teams-service');

function requireUser(req, res, next) {
    const teamId = parseInt(req.params.teamId);
    const userId = req.user.id;

    getTeamsByUser(
        req.app.get('db'),
        userId
    )
        .then(teams => {
            const team = teams.find(team => {
                return team.id === teamId;
            });

            if (!team) {
                return res.status(401).json({ error: 'Unauthorized request' });
            }
            next();
        })
        .catch(err => {
            // console.error(err);
            next(err);
        });
}

module.exports = { requireUser };