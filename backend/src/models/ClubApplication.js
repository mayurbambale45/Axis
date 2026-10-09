module.exports = (sequelize, Sequelize) => {
  const ClubApplication = sequelize.define("club_applications", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    club_id: {
      type: Sequelize.UUID,
      allowNull: false
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false
    },
    board: {
      type: Sequelize.ENUM('Member Board', 'Assistant Board', 'Main Board', 'Mentor Board'),
      allowNull: false
    },
    position: {
      type: Sequelize.STRING,
      allowNull: true // Empty for 1st year
    },
    status: {
      type: Sequelize.ENUM('PENDING', 'INTERVIEW_SCHEDULED', 'APPROVED', 'REJECTED'),
      defaultValue: 'PENDING'
    },
    aptitude_test_date: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    interview_date: {
      type: Sequelize.DATE,
      allowNull: true
    },
    admin_notes: {
      type: Sequelize.TEXT,
      allowNull: true
    }
  });
  return ClubApplication;
};
