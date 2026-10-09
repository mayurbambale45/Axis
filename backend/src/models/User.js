module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    username: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    password_hash: {
      type: Sequelize.STRING,
      allowNull: false
    },
    full_name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: true
    },
    global_role: {
      type: Sequelize.ENUM("SUPER_ADMIN", "CLUB_ADMIN", "CLUB_MENTOR", "STUDENT"),
      defaultValue: "STUDENT"
    },
    assigned_club_id: {
      type: Sequelize.UUID,
      allowNull: true
    },
    // Club mentor can mentor up to 2 clubs (stored as JSON array of club UUIDs)
    mentor_club_ids: {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: []
    },
    designation: {
      type: Sequelize.STRING,
      allowNull: true
    },
    department: {
      type: Sequelize.STRING
    },
    branch: {
      type: Sequelize.STRING
    },
    // Section (e.g. A, B, C) for students
    section: {
      type: Sequelize.STRING,
      allowNull: true
    },
    gender: {
      type: Sequelize.ENUM('Male', 'Female', 'Other')
    },
    program: {
      type: Sequelize.ENUM('BTECH', 'MTECH'),
      defaultValue: 'BTECH'
    },
    admission_year: {
      type: Sequelize.INTEGER
    },
    account_status: {
      type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED', 'TERMINATION_REQUESTED', 'TERMINATED'),
      defaultValue: 'PENDING'
    },
    // Computed academic year (VIRTUAL – not stored in DB)
    year: {
      type: Sequelize.VIRTUAL,
      get() {
        if (!this.admission_year) return 'N/A';
        const now = new Date();
        const currentYear = now.getFullYear();
        const academicYearDelta = now.getMonth() >= 6 ? 1 : 0;
        let diff = currentYear - this.admission_year + academicYearDelta;
        if (this.program === 'MTECH') {
          if (diff <= 1) return '1st Year';
          if (diff === 2) return '2nd Year';
          return 'Alumni';
        } else {
          if (diff <= 1) return '1st Year';
          if (diff === 2) return '2nd Year';
          if (diff === 3) return '3rd Year';
          if (diff === 4) return '4th Year';
          return 'Alumni';
        }
      }
    },
    bio: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    skills: {
      type: Sequelize.STRING
    }
  });
  return User;
};
