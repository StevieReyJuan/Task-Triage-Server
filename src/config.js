module.exports = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://sreyes@localhost/tasktriage',
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://sreyes@localhost/tasktriage-test',
    JWT_SECRET: process.env.JWT_SECRET || 'test-jwt-secret',
    JWT_EXPIRY: process.env.JWT_EXPIRY || '3h',
    // CLIENT_ORIGIN: 'https://app.vercel.app'
}