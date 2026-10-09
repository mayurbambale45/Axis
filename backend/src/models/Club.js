module.exports = (sequelize, Sequelize) => {
  const Club = sequelize.define("clubs", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    slug: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    mission_statement: {
      type: Sequelize.TEXT
    },
    description: {
      type: Sequelize.TEXT
    },
    category: {
      type: Sequelize.STRING,
      defaultValue: 'Technical'  // Technical, Cultural, Social Service, Sports, etc.
    },
    logo_url: {
      type: Sequelize.STRING
    },
    banner_url: {
      type: Sequelize.STRING
    },
    status: {
      type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
      defaultValue: 'ACTIVE'
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    social_links: {
      type: Sequelize.JSON
    },
    team_members: {
      type: Sequelize.JSON
    },
    approval_status: {
      type: Sequelize.ENUM("PENDING", "APPROVED", "REJECTED"),
      defaultValue: "APPROVED"
    }
  });
  return Club;
};
