module.exports = (sequelize, Sequelize) => {
  const EventRegistration = sequelize.define("event_registrations", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    qr_hash: {
      type: Sequelize.STRING,
      unique: true
    },
    check_in_status: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    check_in_time: {
      type: Sequelize.DATE
    },
    is_paid: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    ticket_url: {
      type: Sequelize.STRING
    }
  });
  return EventRegistration;
};
