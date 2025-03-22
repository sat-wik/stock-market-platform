'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Watchlists', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
        },
        userId: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        symbol: {
            type: Sequelize.STRING,
            allowNull: false
        },
        createdAt: {
            allowNull: false,
            type: Sequelize.DATE
        },
        updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
        }
    });

    // Add unique constraint to prevent duplicate symbols for a user
    await queryInterface.addConstraint('Watchlists', {
        fields: ['userId', 'symbol'],
        type: 'unique',
        name: 'unique_user_symbol'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Watchlists');
  }
};
