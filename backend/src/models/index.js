const dbConfig = require('../config/db.config.js');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  port: dbConfig.port,
  logging: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./User')(sequelize, Sequelize);
db.Club = require('./Club')(sequelize, Sequelize);
db.Event = require('./Event')(sequelize, Sequelize);
db.EventRegistration = require('./EventRegistration')(sequelize, Sequelize);
db.ClubMember = require('./ClubMember')(sequelize, Sequelize);
db.ClubFollower = require('./ClubFollower')(sequelize, Sequelize);
db.Feedback = require('./Feedback')(sequelize, Sequelize);
db.Announcement = require('./Announcement')(sequelize, Sequelize);
db.Payment = require('./Payment')(sequelize, Sequelize);
db.Notification = require('./Notification')(sequelize, Sequelize);
db.ClubApplication = require('./ClubApplication')(sequelize, Sequelize);

// Define relations
db.User.hasMany(db.ClubMember, { foreignKey: 'user_id' });
db.ClubMember.belongsTo(db.User, { foreignKey: 'user_id' });

db.Club.hasMany(db.ClubMember, { foreignKey: 'club_id' });
db.ClubMember.belongsTo(db.Club, { foreignKey: 'club_id' });

db.Club.hasMany(db.Event, { foreignKey: 'club_id' });
db.Event.belongsTo(db.Club, { foreignKey: 'club_id' });

db.User.hasMany(db.EventRegistration, { foreignKey: 'user_id' });
db.EventRegistration.belongsTo(db.User, { foreignKey: 'user_id' });

db.Event.hasMany(db.EventRegistration, { foreignKey: 'event_id' });
db.EventRegistration.belongsTo(db.Event, { foreignKey: 'event_id' });

db.User.hasMany(db.ClubFollower, { foreignKey: 'user_id' });
db.ClubFollower.belongsTo(db.User, { foreignKey: 'user_id' });

db.Club.hasMany(db.ClubFollower, { foreignKey: 'club_id' });
db.ClubFollower.belongsTo(db.Club, { foreignKey: 'club_id' });

db.User.hasMany(db.Feedback, { foreignKey: 'user_id' });
db.Feedback.belongsTo(db.User, { foreignKey: 'user_id' });

db.Event.hasMany(db.Feedback, { foreignKey: 'event_id' });
db.Feedback.belongsTo(db.Event, { foreignKey: 'event_id' });

db.Club.hasMany(db.Announcement, { foreignKey: 'club_id' });
db.Announcement.belongsTo(db.Club, { foreignKey: 'club_id' });

db.User.hasMany(db.Payment, { foreignKey: 'user_id' });
db.Payment.belongsTo(db.User, { foreignKey: 'user_id' });

db.Event.hasMany(db.Payment, { foreignKey: 'event_id' });
db.Payment.belongsTo(db.Event, { foreignKey: 'event_id' });

db.MentorSuggestion = require('./MentorSuggestion')(sequelize, Sequelize);
db.BudgetItem = require('./BudgetItem')(sequelize, Sequelize);

// MentorSuggestion relations
db.User.hasMany(db.MentorSuggestion, { foreignKey: 'mentor_id', as: 'suggestions_given' });
db.MentorSuggestion.belongsTo(db.User, { foreignKey: 'mentor_id', as: 'mentor' });
db.Club.hasMany(db.MentorSuggestion, { foreignKey: 'club_id' });
db.MentorSuggestion.belongsTo(db.Club, { foreignKey: 'club_id' });
db.Event.hasMany(db.MentorSuggestion, { foreignKey: 'event_id' });
db.MentorSuggestion.belongsTo(db.Event, { foreignKey: 'event_id' });

// BudgetItem relations
db.Event.hasMany(db.BudgetItem, { foreignKey: 'event_id' });
db.BudgetItem.belongsTo(db.Event, { foreignKey: 'event_id' });
db.Club.hasMany(db.BudgetItem, { foreignKey: 'club_id' });
db.BudgetItem.belongsTo(db.Club, { foreignKey: 'club_id' });

// Notification relations
db.User.hasMany(db.Notification, { foreignKey: 'user_id' });
db.Notification.belongsTo(db.User, { foreignKey: 'user_id' });

// ClubApplication relations
db.User.hasMany(db.ClubApplication, { foreignKey: 'user_id' });
db.ClubApplication.belongsTo(db.User, { foreignKey: 'user_id' });
db.Club.hasMany(db.ClubApplication, { foreignKey: 'club_id' });
db.ClubApplication.belongsTo(db.Club, { foreignKey: 'club_id' });

module.exports = db;
