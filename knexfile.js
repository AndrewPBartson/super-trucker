
const path = require('path')

module.exports = {

  development: {
    client: 'pg',
    connection:  'postgres://localhost/trip_planner',
    migrations: {
        directory: __dirname + 'db/migrations',
    },
    seeds: {
      directory: __dirname + 'db/seeds',
    },
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: __dirname + 'db/migrations',
    },
    seeds: {
      directory: __dirname + 'db/seeds',
    },
  }
};
