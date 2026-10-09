module.exports = (sequelize, Sequelize) => {
  const BudgetItem = sequelize.define("budget_items", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    event_id: {
      type: Sequelize.UUID,
      allowNull: false
    },
    club_id: {
      type: Sequelize.UUID,
      allowNull: false
    },
    // Who submitted this budget line (Club Admin)
    submitted_by: {
      type: Sequelize.UUID,
      allowNull: true
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false
    },
    category: {
      type: Sequelize.ENUM("VENUE", "CATERING", "MARKETING", "EQUIPMENT", "PRIZES", "LOGISTICS", "MISC"),
      defaultValue: "MISC"
    },
    estimated_amount: {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    actual_amount: {
      type: Sequelize.FLOAT,
      allowNull: true
    },
    approval_status: {
      type: Sequelize.ENUM("PENDING", "APPROVED", "REJECTED", "REVISION_REQUESTED"),
      defaultValue: "PENDING"
    },
    // Mentor's comment when reviewing
    mentor_note: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    receipt_url: {
      type: Sequelize.STRING,
      allowNull: true
    }
  });
  return BudgetItem;
};
