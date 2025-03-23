import { DataTypes } from 'sequelize';
import sequelize from './index.js';
import User from './user.js';

const PriceAlert = sequelize.define('PriceAlert', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    symbol: {
        type: DataTypes.STRING,
        allowNull: false
    },
    targetPrice: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    condition: {
        type: DataTypes.ENUM('above', 'below'),
        allowNull: false
    },
    triggered: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

PriceAlert.belongsTo(User);
User.hasMany(PriceAlert);

export default PriceAlert;
