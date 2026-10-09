module.exports = (sequelize, Sequelize) => {
  const Notification = sequelize.define("notifications", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: true // null = broadcast to all students
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    body: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    type: {
      type: Sequelize.ENUM('EVENT_ALERT', 'DEADLINE', 'ANNOUNCEMENT', 'SYSTEM', 'CLUB'),
      defaultValue: 'ANNOUNCEMENT'
    },
    is_read: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    link: {
      type: Sequelize.STRING,
      allowNull: true
    },
    sender_role: {
      type: Sequelize.STRING,
      defaultValue: 'SYSTEM'
    }
  });
  return Notification;
};
