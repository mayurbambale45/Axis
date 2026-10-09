module.exports = (sequelize, Sequelize) => {
  const Payment = sequelize.define("payments", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: Sequelize.ENUM("SUCCESS", "PENDING", "FAILED"),
      defaultValue: "SUCCESS"
    }
  });
  return Payment;
};
