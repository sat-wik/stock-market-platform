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
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false
  }
};
