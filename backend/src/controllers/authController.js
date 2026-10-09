const db = require('../models');
const config = require('../config/auth.config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const LEADERSHIP = ['PRESIDENT', 'VP', 'SECRETARY', 'LEAD'];

exports.requestTermination = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required.' });
    const user = await db.User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.account_status === 'TERMINATED')
      return res.status(400).json({ message: 'Account is already terminated.' });
    user.account_status = 'TERMINATION_REQUESTED';
    await user.save();
    res.json({ message: 'Account termination request submitted to Super Admin.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ──────────────────────────────────────────
   POST /auth/register
   ────────────────────────────────────────── */
exports.register = async (req, res) => {
  try {
    const {
      full_name, username, email, phone, section,
      branch, gender, program, password,
      requested_role,          // STUDENT | CLUB_MEMBER | CLUB_MENTOR
      club_id,                 // for CLUB_MEMBER
      club_role,               // PRESIDENT|VP|SECRETARY|LEAD|MEMBER
      designation, department, // for CLUB_MENTOR
      mentor_club_id,          // primary club the mentor is requesting
      admission_year: admissionYearBody,
    } = req.body;

    if (!full_name || !email || !password)
      return res.status(400).json({ message: 'Full name, email, and password are required.' });

    // Duplicate check
    const whereClause = email ? { email } : {};
    if (username) whereClause.username = username;
    const existing = await db.User.findOne({
      where: { [db.Sequelize.Op.or]: [{ email }, ...(username ? [{ username }] : [])] }
    });
    if (existing) return res.status(400).json({ message: 'Username or email already in use.' });

    // Global role mapping
    let global_role = 'STUDENT';
    if (requested_role === 'CLUB_MENTOR') global_role = 'CLUB_MENTOR';
    // CLUB_MEMBER stays as STUDENT globally - elevated via club membership

    // Calculate admission_year
    let admission_year = admissionYearBody;
    if (!admission_year) {
      if (requested_role !== 'CLUB_MENTOR' && username && /^\d{8}$/.test(username)) {
        admission_year = 2000 + parseInt(username.substring(0, 2), 10);
      } else {
        admission_year = new Date().getFullYear();
      }
    }

    // Build mentor_club_ids array
    const mentor_club_ids = (requested_role === 'CLUB_MENTOR' && mentor_club_id)
      ? [mentor_club_id]
      : [];

    const user = await db.User.create({
      full_name,
      username: username || email.split('@')[0],
      email,
      phone: phone || null,
      section: section || null,
      password_hash: bcrypt.hashSync(password || username, 8),
      branch: branch || null,
      gender: gender || null,
      program: program || 'BTECH',
      admission_year,
      designation: designation || null,
      department: department || null,
      mentor_club_ids,
      global_role,
      account_status: 'PENDING',
    });

    // Pre-create club membership if registering as Club Member or leadership role
    if (requested_role === 'CLUB_MEMBER' && club_id) {
      const validClub = await db.Club.findByPk(club_id);
      if (validClub) {
        const exists = await db.ClubMember.findOne({ where: { user_id: user.id, club_id } });
        if (!exists) {
          await db.ClubMember.create({ user_id: user.id, club_id, club_role: club_role || 'MEMBER' });
        }
        // If leadership role, elevate global_role
        if (LEADERSHIP.includes(club_role)) {
          await user.update({ global_role: 'CLUB_ADMIN', assigned_club_id: club_id });
        }
      }
    }

    // Notify Super Admin about ALL registrations (visible in Pending Approvals)
    let notifTitle = `New Registration – ${user.full_name}`;
    let notifBody = `${user.full_name} (${user.username}) has registered as a ${requested_role || 'STUDENT'}.`;

    if (requested_role === 'CLUB_MEMBER' && club_id) {
      const club = await db.Club.findByPk(club_id);
      notifBody += ` They have applied for the role of ${club_role || 'MEMBER'} in ${club?.name || 'a club'}.`;
    }
    if (requested_role === 'CLUB_MENTOR' && mentor_club_id) {
      const club = await db.Club.findByPk(mentor_club_id);
      notifBody += ` They have requested to mentor ${club?.name || 'a club'}.`;
    }
    notifBody += ' Please review and approve their account.';

    await db.Notification.create({
      title: notifTitle,
      body: notifBody,
      type: 'SYSTEM',
      user_id: null, // broadcast to admin
      sender_role: 'SUPER_ADMIN_ALERT',
    });

    return res.status(201).json({
      message: 'Registration submitted successfully. Your account is pending Super Admin approval. You will be able to login once approved.',
      userId: user.id
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: error.message });
  }
};

/* ──────────────────────────────────────────
   POST /auth/login
   Auto-detects role from user's global_role
   ────────────────────────────────────────── */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: 'Username and password are required.' });

    const user = await db.User.findOne({
      where: { username },
      include: [{
        model: db.ClubMember,
        include: [{ model: db.Club, attributes: ['id', 'name', 'category'] }]
      }]
    });

    if (!user) return res.status(404).json({ message: 'User not found. Please check your credentials.' });

    if (!bcrypt.compareSync(password, user.password_hash))
      return res.status(401).json({ message: 'Incorrect password.' });

    if (user.account_status === 'REJECTED')
      return res.status(403).json({ message: 'Your registration was rejected by the administrator. Please contact the admin.' });
    if (user.account_status === 'TERMINATED')
      return res.status(403).json({ message: 'Your account has been terminated. For continued access, please contact the Super Admin.' });
    if (user.account_status === 'TERMINATION_REQUESTED')
      return res.status(403).json({ message: 'Your account termination is pending review. Contact Super Admin if this was a mistake.' });
    if (user.account_status !== 'APPROVED')
      return res.status(403).json({ message: 'Your account is pending Super Admin approval. Please try again after approval.' });

    // Auto-detect active role from global_role
    let activeRole = user.global_role || 'STUDENT';

    // Club memberships for session
    const clubMemberships = (user.club_members || []).map(cm => ({
      membership_id: cm.id,
      club_id: cm.club_id,
      club_name: cm.club?.name || null,
      club_category: cm.club?.category || null,
      club_role: cm.club_role,
    }));

    // Mentor club list
    const mentorClubs = user.mentor_club_ids || [];

    const accessToken = jwt.sign(
      { id: user.id, role: activeRole },
      config.secret,
      { expiresIn: '8h' }
    );

    const refreshToken = jwt.sign({ id: user.id }, config.secret, { expiresIn: '7d' });

    res.cookie('jwt_refresh', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      section: user.section,
      branch: user.branch,
      department: user.department,
      designation: user.designation,
      program: user.program,
      gender: user.gender,
      bio: user.bio,
      skills: user.skills,
      admission_year: user.admission_year,
      year: user.year,
      global_role: user.global_role,
      active_role: activeRole,
      club_memberships: clubMemberships,
      mentor_club_ids: mentorClubs,
      assigned_club_id: user.assigned_club_id,
      accessToken
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: error.message });
  }
};

/* ──────────────────────────────────────────
   POST /auth/refresh
   ────────────────────────────────────────── */
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies.jwt_refresh;
    if (!token) return res.status(403).json({ message: 'Refresh token not found.' });

    jwt.verify(token, config.secret, async (err, decoded) => {
      if (err) return res.status(401).json({ message: 'Refresh token expired or invalid.' });
      const user = await db.User.findByPk(decoded.id);
      if (!user) return res.status(404).json({ message: 'User not found.' });
      const newToken = jwt.sign({ id: user.id, role: user.global_role }, config.secret, { expiresIn: '8h' });
      return res.status(200).json({ accessToken: newToken, role: user.global_role, id: user.id });
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* ──────────────────────────────────────────
   POST /auth/logout
   ────────────────────────────────────────── */
exports.logout = (req, res) => {
  res.clearCookie('jwt_refresh');
  return res.status(200).json({ message: 'Logged out successfully.' });
};

/* ──────────────────────────────────────────
   POST /auth/change-password
   Body: { user_id, old_password, new_password }
   ────────────────────────────────────────── */
exports.changePassword = async (req, res) => {
  try {
    const { user_id, old_password, new_password } = req.body;
    if (!user_id || !old_password || !new_password)
      return res.status(400).json({ message: 'user_id, old_password and new_password are required.' });

    if (new_password.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });

    const user = await db.User.findByPk(user_id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (!bcrypt.compareSync(old_password, user.password_hash))
      return res.status(401).json({ message: 'Current password is incorrect.' });

    await user.update({ password_hash: bcrypt.hashSync(new_password, 10) });
    return res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* ──────────────────────────────────────────
   POST /auth/mentor/request-club
   Body: { user_id, club_id }
   Sends a request to Super Admin to add a 2nd club to mentor
   ────────────────────────────────────────── */
exports.requestMentorClub = async (req, res) => {
  try {
    const { user_id, club_id } = req.body;
    if (!user_id || !club_id)
      return res.status(400).json({ message: 'user_id and club_id are required.' });

    const user = await db.User.findByPk(user_id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.global_role !== 'CLUB_MENTOR')
      return res.status(403).json({ message: 'Only Club Mentors can request additional clubs.' });

    const currentClubs = Array.isArray(user.mentor_club_ids) ? user.mentor_club_ids : [];
    if (currentClubs.length >= 2)
      return res.status(400).json({ message: 'You already mentor 2 clubs (maximum allowed).' });
    if (currentClubs.includes(club_id))
      return res.status(409).json({ message: 'You are already mentoring this club.' });

    const club = await db.Club.findByPk(club_id);
    if (!club) return res.status(404).json({ message: 'Club not found.' });

    // Create a pending notification/request for Super Admin
    await db.Notification.create({
      title: `Club Mentor Second-Club Request – ${user.full_name}`,
      body: `${user.full_name} (${user.username}) has requested to also mentor ${club.name}. They currently mentor ${currentClubs.length} club(s). Please review and update their profile in User Directory if approved.`,
      type: 'ANNOUNCEMENT',
      user_id: null, // admin broadcast
      sender_role: 'SYSTEM',
    });

    return res.status(200).json({ message: 'Request sent to Super Admin for approval. You will be notified once approved.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
