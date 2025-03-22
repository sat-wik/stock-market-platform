import User from './user.js';
import Watchlist from './watchlist.js';

// Set up associations
const setupAssociations = () => {
    // User-Watchlist associations
    User.hasMany(Watchlist, { foreignKey: 'userId', as: 'watchlistItems' });
    Watchlist.belongsTo(User, { foreignKey: 'userId' });
};

export default setupAssociations;
