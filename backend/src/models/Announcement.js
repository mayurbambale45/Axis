module.exports = (sequelize, Sequelize) => {
  const Announcement = sequelize.define("announcements", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    content: {
      type: Sequelize.TEXT
    },
    is_public: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }
  });
  return Announcement;
};
