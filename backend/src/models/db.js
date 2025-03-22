import sequelize from './index.js';
import User from './user.js';

const models = {
    User
};

// Run model associations if any
Object.values(models)
    .filter(model => typeof model.associate === 'function')
    .forEach(model => model.associate(models));

export { User };
export default models;
