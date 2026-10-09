module.exports = (sequelize, Sequelize) => {
  const Event = sequelize.define("events", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT
    },
    start_time: {
      type: Sequelize.DATE
    },
    end_time: {
      type: Sequelize.DATE
    },
    location: {
      type: Sequelize.STRING
    },
    poster_url: {
      type: Sequelize.STRING
    },
    max_capacity: {
      type: Sequelize.INTEGER
    },
    is_featured: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: Sequelize.ENUM("UPCOMING", "LIVE", "COMPLETED", "CANCELLED"),
      defaultValue: "UPCOMING"
    },
    custom_fields: {
      type: Sequelize.JSON
    },
    price: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    }
  });
  return Event;
};
