module.exports = (sequelize, Sequelize) => {
  const Feedback = sequelize.define("feedbacks", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    rating: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    comment: {
      type: Sequelize.TEXT
    }
  });
  return Feedback;
};
