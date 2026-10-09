module.exports = (sequelize, Sequelize) => {
  const ClubMember = sequelize.define("club_members", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    club_role: {
      // PRESIDENT, VP, SECRETARY = top leadership (can edit events/club)
      // LEAD                     = sub-leads / event coordinators
      // MEMBER                   = regular member (read-only club access)
      type: Sequelize.ENUM("PRESIDENT", "VP", "SECRETARY", "LEAD", "MEMBER"),
      defaultValue: "MEMBER"
    }
  });
  return ClubMember;
};
