import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'stockmarket',
    process.env.DB_USER || 'satwikpattanaik',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        logging: console.log,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        retry: {
            max: 3,
            match: [
                /SequelizeConnectionError/,
                /SequelizeConnectionRefusedError/,
                /SequelizeHostNotFoundError/,
                /SequelizeHostNotReachableError/,
                /SequelizeInvalidConnectionError/,
                /SequelizeConnectionTimedOutError/
            ],
            backoffBase: 1000,
            backoffExponent: 1.5,
        }
    }
);

export const initDatabase = async () => {
    try {
        console.log('Connecting to database...');
        console.log('Database config:', {
            name: process.env.DB_NAME || 'stockmarket',
            user: process.env.DB_USER || 'satwikpattanaik',
            host: process.env.DB_HOST || 'localhost'
        });
        
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        
        console.log('Synchronizing database models...');
        await sequelize.sync();
        console.log('Database models synchronized successfully.');
        
        return true;
    } catch (error) {
        console.error('Database initialization error:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};

export default sequelize;
