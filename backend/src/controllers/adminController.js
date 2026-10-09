const db = require('../models');
const { Op } = require('sequelize');

let analyticsService;
try { analyticsService = require('../services/analyticsService'); } catch (e) { analyticsService = null; }

/* ────────────────────────────────────────────────────
   GET /admin/dashboard  – summary stats
   ──────────────────────────────────────────────────── */
exports.getDashboardData = async (req, res) => {
  try {
    const [totalRegistrations, upcomingEvents, recentRegistrations, pendingCount, totalUsers, totalClubs] = await Promise.all([
      db.EventRegistration.count(),
      db.Event.findAll({
        where: { status: 'UPCOMING' },
        limit: 5,
        order: [['start_time', 'ASC']],
        include: [{ model: db.Club, attributes: ['name'] }]
      }),
      db.EventRegistration.findAll({
        include: [
          { model: db.User, attributes: ['full_name', 'email'] },
          { model: db.Event, attributes: ['title'] }
        ],
        limit: 5,
        order: [['createdAt', 'DESC']]
      }),
      db.User.count({ where: { account_status: { [Op.in]: ['PENDING', 'TERMINATION_REQUESTED'] } } }),
      db.User.count({ where: { account_status: 'APPROVED' } }),
      db.Club.count({ where: { status: 'ACTIVE' } }),
    ]);

    res.json({
      totalRegistrations,
      upcomingEvents,
      recentRegistrations,
      pendingCount,
      totalUsers,
      totalClubs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ────────────────────────────────────────────────────
   GET /admin/users/pending  – all pending accounts
   Returns PENDING + TERMINATION_REQUESTED users with club membership info
   ──────────────────────────────────────────────────── */
exports.getPendingUsers = async (req, res) => {
  try {
    const users = await db.User.findAll({
      where: {
        account_status: { [Op.in]: ['PENDING', 'TERMINATION_REQUESTED'] }
      },
      include: [{
        model: db.ClubMember,
        include: [{ model: db.Club, attributes: ['id', 'name', 'category'] }],
        required: false,
      }],
      order: [['createdAt', 'ASC']],
      attributes: [
        'id', 'full_name', 'username', 'email', 'phone',
        'global_role', 'account_status', 'branch', 'section',
        'program', 'gender', 'admission_year', 'designation',
        'department', 'mentor_club_ids', 'assigned_club_id', 'createdAt'
      ]
    });
    res.json(users);
  } catch (err) {
    console.error('getPendingUsers error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ────────────────────────────────────────────────────
   GET /admin/users  – all approved users
   ──────────────────────────────────────────────────── */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await db.User.findAll({
      where: {
        account_status: { [Op.notIn]: ['TERMINATED'] }
      },
      include: [{
        model: db.ClubMember,
        include: [{ model: db.Club, attributes: ['id', 'name'] }],
        required: false
      }],
      order: [['createdAt', 'DESC']],
      attributes: [
        'id', 'full_name', 'username', 'email', 'phone',
        'global_role', 'account_status', 'branch', 'section',
        'program', 'gender', 'admission_year', 'designation',
        'department', 'mentor_club_ids', 'createdAt'
      ]
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ────────────────────────────────────────────────────
   PATCH /admin/users/:id/status
   Valid statuses: APPROVED | REJECTED | TERMINATED
   ──────────────────────────────────────────────────── */
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['APPROVED', 'REJECTED', 'TERMINATED'].includes(status))
      return res.status(400).json({ message: 'Invalid status. Must be APPROVED, REJECTED, or TERMINATED.' });

    const user = await db.User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.update({ account_status: status });

    // Send a notification to the user if APPROVED or REJECTED
    try {
      if (status === 'APPROVED') {
        await db.Notification.create({
          user_id: user.id,
          title: 'Account Approved ✅',
          body: `Welcome to AXIS! Your ${user.global_role.replace('_', ' ')} account has been approved. You can now log in to access your dashboard.`,
          type: 'SYSTEM',
          sender_role: 'SUPER_ADMIN',
        });
      } else if (status === 'REJECTED') {
        await db.Notification.create({
          user_id: user.id,
          title: 'Registration Not Approved',
          body: 'Your AXIS registration request was not approved. Please contact the Super Admin for more information.',
          type: 'SYSTEM',
          sender_role: 'SUPER_ADMIN',
        });
      }
    } catch (notifErr) {
      // Don't fail the whole request if notification fails
      console.error('Notification creation failed:', notifErr.message);
    }

    res.json({ message: `User account set to ${status}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ────────────────────────────────────────────────────
   PATCH /admin/users/:id/role
   ──────────────────────────────────────────────────── */
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { global_role } = req.body;
    const validRoles = ['STUDENT', 'CLUB_ADMIN', 'CLUB_MENTOR', 'SUPER_ADMIN'];
    if (!validRoles.includes(global_role))
      return res.status(400).json({ message: 'Invalid role.' });

    const user = await db.User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.update({ global_role });
    res.json({ message: 'User role updated.', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ────────────────────────────────────────────────────
   DELETE /admin/users/:id
   Soft-delete: sets account_status = TERMINATED
   ──────────────────────────────────────────────────── */
exports.deleteUser = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    await user.update({ account_status: 'TERMINATED' });
    res.json({ message: 'User account has been terminated (hidden from system).' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ────────────────────────────────────────────────────
   GET /admin/clubs  – all clubs
   ──────────────────────────────────────────────────── */
exports.getClubs = async (req, res) => {
  try {
    const clubs = await db.Club.findAll({
      order: [['name', 'ASC']],
      include: [{
        model: db.ClubMember,
        attributes: ['id', 'club_role'],
        required: false,
      }]
    });
    const enriched = clubs.map(c => ({
      ...c.toJSON(),
      member_count: (c.club_members || []).length,
    }));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ────────────────────────────────────────────────────
   POST /admin/clubs  – create a new club
   ──────────────────────────────────────────────────── */
exports.createClub = async (req, res) => {
  try {
    const { name, mission_statement, description, category } = req.body;
    if (!name) return res.status(400).json({ message: 'Club name is required.' });
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const club = await db.Club.create({
      name, slug, mission_statement, description,
      category: category || 'Technical',
      status: 'ACTIVE', is_active: true, approval_status: 'APPROVED'
    });
    res.status(201).json(club);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError')
      return res.status(400).json({ message: 'A club with this name already exists.' });
    res.status(500).json({ message: err.message });
  }
};

/* ────────────────────────────────────────────────────
   DELETE /admin/clubs/:id
   ──────────────────────────────────────────────────── */
exports.deleteClub = async (req, res) => {
  try {
    const club = await db.Club.findByPk(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found.' });
    await club.update({ status: 'INACTIVE', is_active: false });
    res.json({ message: 'Club deactivated successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ────────────────────────────────────────────────────
   POST /admin/clubs/:clubId/assign-member
   ──────────────────────────────────────────────────── */
exports.assignMemberToClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { user_id, club_role } = req.body;
    if (!user_id) return res.status(400).json({ message: 'user_id is required.' });

    const [user, club] = await Promise.all([
      db.User.findByPk(user_id),
      db.Club.findByPk(clubId),
    ]);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (!club) return res.status(404).json({ message: 'Club not found.' });

    const existing = await db.ClubMember.findOne({ where: { user_id, club_id: clubId } });
    if (existing) {
      await existing.update({ club_role: club_role || 'MEMBER' });
      return res.json({ message: 'Member role updated.', member: existing });
    }

    const member = await db.ClubMember.create({ user_id, club_id: clubId, club_role: club_role || 'MEMBER' });

    // Upgrade global_role if leadership
    const LEADERSHIP = ['PRESIDENT', 'VP', 'SECRETARY', 'LEAD'];
    if (LEADERSHIP.includes(club_role)) {
      await user.update({ global_role: 'CLUB_ADMIN', assigned_club_id: clubId });
    }

    res.status(201).json({ message: 'Member assigned to club successfully.', member });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ────────────────────────────────────────────────────
   GET /admin/clubs/:clubId/members
   ──────────────────────────────────────────────────── */
exports.getClubMembers = async (req, res) => {
  try {
    const members = await db.ClubMember.findAll({
      where: { club_id: req.params.clubId },
      include: [{ model: db.User, attributes: ['id', 'full_name', 'email', 'username', 'branch', 'section', 'program', 'gender', 'account_status'] }],
      order: [['createdAt', 'ASC']]
    });
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ────────────────────────────────────────────────────
   DELETE /admin/clubs/:clubId/members/:memberId
   ──────────────────────────────────────────────────── */
exports.removeClubMember = async (req, res) => {
  try {
    const { clubId, memberId } = req.params;
    const member = await db.ClubMember.findOne({ where: { id: memberId, club_id: clubId } });
    if (!member) return res.status(404).json({ message: 'Club member not found.' });
    await member.destroy();
    res.json({ message: 'Club member removed successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ────────────────────────────────────────────────────
   POST /admin/users/:userId/assign-mentor-club
   ──────────────────────────────────────────────────── */
exports.assignMentorClub = async (req, res) => {
  try {
    const { userId } = req.params;
    const { club_id } = req.body;
    const user = await db.User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.global_role !== 'CLUB_MENTOR')
      return res.status(400).json({ message: 'User is not a Club Mentor.' });

    const existing = Array.isArray(user.mentor_club_ids) ? user.mentor_club_ids : [];
    if (existing.includes(club_id))
      return res.status(409).json({ message: 'Already assigned to this club.' });
    if (existing.length >= 2)
      return res.status(400).json({ message: 'Mentor already has maximum 2 clubs.' });

    await user.update({ mentor_club_ids: [...existing, club_id] });
    res.json({ message: 'Club assigned to mentor.', mentor_club_ids: [...existing, club_id] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ────────────────────────────────────────────────────
   DELETE /admin/users/:userId/assign-mentor-club/:clubId
   ──────────────────────────────────────────────────── */
exports.removeMentorClub = async (req, res) => {
  try {
    const { userId, clubId } = req.params;
    const user = await db.User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const existing = Array.isArray(user.mentor_club_ids) ? user.mentor_club_ids : [];
    await user.update({ mentor_club_ids: existing.filter(id => id !== clubId) });
    res.json({ message: 'Club removed from mentor.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ────────────────────────────────────────────────────
   CSV export
   ──────────────────────────────────────────────────── */
exports.exportRegistrationsCSV = async (req, res) => {
  try {
    const registrations = await db.EventRegistration.findAll({
      include: [
        { model: db.User, attributes: ['full_name', 'email'] },
        { model: db.Event, attributes: ['title'] }
      ]
    });

    const dataToExport = registrations.map(reg => ({
      ID: reg.id,
      StudentName: reg.user?.full_name || 'N/A',
      Email: reg.user?.email || 'N/A',
      Event: reg.event?.title || 'N/A',
      Status: reg.check_in_status ? 'Checked In' : 'Registered',
      Time: reg.createdAt
    }));

    if (analyticsService?.exportToCSV) {
      const csvData = analyticsService.exportToCSV(dataToExport);
      res.setHeader('Content-disposition', 'attachment; filename=registrations.csv');
      res.set('Content-Type', 'text/csv');
      return res.status(200).send(csvData);
    }

    // Manual CSV fallback
    const headers = Object.keys(dataToExport[0] || {});
    const csvLines = [
      headers.join(','),
      ...dataToExport.map(row => headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(','))
    ];
    res.setHeader('Content-disposition', 'attachment; filename=registrations.csv');
    res.set('Content-Type', 'text/csv');
    res.status(200).send(csvLines.join('\n'));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ────────────────────────────────────────────────────
   Admin Notifications
   ──────────────────────────────────────────────────── */
exports.getAdminNotifications = async (req, res) => {
  try {
    const notes = await db.Notification.findAll({
      where: { sender_role: 'SUPER_ADMIN_ALERT' },
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAdminNotificationRead = async (req, res) => {
  try {
    await db.Notification.update({ is_read: true }, { where: { id: req.params.id } });
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

