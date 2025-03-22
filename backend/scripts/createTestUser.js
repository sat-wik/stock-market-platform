import { User } from '../src/models/db.js';
import { initDatabase } from '../src/models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const createTestUser = async () => {
    try {
        await initDatabase();

        // Delete existing test user if exists
        await User.destroy({
            where: {
                email: 'test@example.com'
            }
        });

        // Create test user (password will be hashed by the model)
        const testUser = await User.create({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        });

        // Fetch the user from database to ensure we have the correct password hash
        const savedUser = await User.findByPk(testUser.id);
        
        // Verify the password works
        const isValid = await savedUser.validatePassword('password123');
        
        console.log('Test user created successfully:', {
            id: savedUser.id,
            username: savedUser.username,
            email: savedUser.email,
            passwordValid: isValid
        });

        process.exit(0);
    } catch (error) {
        console.error('Error creating test user:', error);
        process.exit(1);
    }
};

createTestUser();
