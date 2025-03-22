import { DataTypes } from 'sequelize';
import Watchlist from './watchlist.js';
import bcrypt from 'bcryptjs';
import sequelize from './index.js';

const tableName = 'Users';

const User = sequelize.define(tableName, {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [3, 30]
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
            // Hash password before saving
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(value, salt);
            this.setDataValue('password', hash);
        }
    },
    // Watchlist is now handled through the Watchlist model association
}, {
    hooks: {
        beforeSave: async (user) => {
            // Log for debugging
            console.log('Saving user:', {
                id: user.id,
                email: user.email,
                passwordLength: user.password?.length
            });
        }
    }
});

User.prototype.validatePassword = async function(password) {
    try {
        const isValid = await bcrypt.compare(password, this.password);
        console.log('Password validation:', {
            userId: this.id,
            isValid,
            passwordLength: password?.length,
            hashedLength: this.password?.length
        });
        return isValid;
    } catch (error) {
        console.error('Password validation error:', error);
        return false;
    }
};


export default User;
