module.exports = (sequelize, Sequelize) => {
  const MentorSuggestion = sequelize.define("mentor_suggestions", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    mentor_id: {
      type: Sequelize.UUID,
      allowNull: false
    },
    club_id: {
      type: Sequelize.UUID,
      allowNull: false
    },
    // Optional: link suggestion to a specific event
    event_id: {
      type: Sequelize.UUID,
      allowNull: true
    },
    category: {
      type: Sequelize.ENUM("GENERAL", "BUDGET", "EVENT_PLANNING", "SAFETY", "ACADEMIC", "OUTREACH"),
      defaultValue: "GENERAL"
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    body: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    priority: {
      type: Sequelize.ENUM("LOW", "MEDIUM", "HIGH"),
      defaultValue: "MEDIUM"
    },
    status: {
      type: Sequelize.ENUM("PENDING", "ACKNOWLEDGED", "IMPLEMENTED", "DISMISSED"),
      defaultValue: "PENDING"
    }
  });
  return MentorSuggestion;
};
