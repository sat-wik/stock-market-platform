require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'satwikpattanaik',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'stockmarket',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: console.log
  },
  test: {
    username: process.env.DB_USER || 'satwikpattanaik',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'stockmarket_test',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  }
};
