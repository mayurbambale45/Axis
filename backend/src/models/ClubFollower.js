module.exports = (sequelize, Sequelize) => {
  const ClubFollower = sequelize.define("club_followers", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    }
  });
  return ClubFollower;
};
