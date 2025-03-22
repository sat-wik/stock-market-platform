import { DataTypes } from 'sequelize';
import sequelize from './index.js';


const Watchlist = sequelize.define('Watchlist', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    symbol: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    indexes: [
        // Unique constraint to prevent duplicate symbols for a user
        {
            unique: true,
            fields: ['userId', 'symbol']
        }
    ]
});



export default Watchlist;
