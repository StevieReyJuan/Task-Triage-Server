const bcrypt = require('bcryptjs');
const xss = require('xss');

const UsersService = {
    serializeUser(user) {
        return {
            id: user.id,
            name: xss(user.name),
            user_name: xss(user.user_name),
            // date_created: new Date(user.date_created)
        };
    },
    validatePassword(password) {
        if (password.length < 7) {
            return 'Password must be longer than 7 characters';
        }
        if (password.length > 72) {
            return 'Password must be less than 72 characters';
        }
        if (password.startsWith(' ') || password.endsWith(' ')) {
            return 'Password must not start or end with a space';
        }
        return null;
    },
    hasUserWithUserName(db, user_name) {
        return db('users')
            .where({ user_name })
            .first()
            .then(user => !!user); //user is true
    },
    hashPassword(password) {
        return bcrypt.hash(password, 12);
    },
    insertUser(db, newuser) {
        return db
            .insert(newuser)
            .into('users')
            .returning('*')
            .then(([user]) => user);
    }
    // getAllusers(knex) {
    //     return knex.select('*').from('users')
    // }
}

module.exports = UsersService;