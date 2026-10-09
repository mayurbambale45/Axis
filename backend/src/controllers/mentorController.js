const db = require('../models');
const { Op } = require('sequelize');

/**
 * GET /api/v1/mentor/overview?mentor_id=&club_id=
 * Returns events progress + budget for the mentor's selected club.
 * mentor_club_ids is a JSON array (max 2 clubs).
 */
exports.getOverview = async (req, res) => {
  try {
    const { mentor_id, club_id } = req.query;
    if (!mentor_id) return res.status(400).json({ message: 'mentor_id required' });

    const mentor = await db.User.findByPk(mentor_id);
    if (!mentor || mentor.global_role !== 'CLUB_MENTOR')
      return res.status(403).json({ message: 'Not a valid club mentor.' });

    // Build a unified list of club IDs this mentor oversees
    let mentorClubs = Array.isArray(mentor.mentor_club_ids) ? [...mentor.mentor_club_ids] : [];
    // Also include assigned_club_id if it exists and isn't already in the list
    if (mentor.assigned_club_id && !mentorClubs.includes(mentor.assigned_club_id)) {
      mentorClubs.unshift(mentor.assigned_club_id);
    }

    // Determine which club to show based on query param or default to first
    const activeClubId = (club_id && mentorClubs.includes(club_id))
      ? club_id
      : mentorClubs[0] || null;

    if (!activeClubId)
      return res.json({ club: null, mentor, eventSummaries: [], mentorClubs: [] });

    const club = await db.Club.findByPk(activeClubId, {
      include: [{
        model: db.ClubMember,
        include: [{ model: db.User, attributes: ['id', 'full_name', 'email', 'club_role'] }]
      }]
    });

    const events = await db.Event.findAll({
      where: { club_id: activeClubId },
      include: [
        { model: db.EventRegistration },
        { model: db.BudgetItem }
      ],
      order: [['start_time', 'DESC']]
    });

    const eventSummaries = events.map(evt => {
      const regs  = evt.EventRegistrations || [];
      const items = evt.BudgetItems || [];
      const totalRegs = regs.length;
      const checkedIn = regs.filter(r => r.check_in_status).length;
      const totalBudget   = items.reduce((s, b) => s + parseFloat(b.estimated_amount || 0), 0);
      const approvedBudget= items.filter(b => b.approval_status === 'APPROVED')
                                 .reduce((s, b) => s + parseFloat(b.estimated_amount || 0), 0);
      return {
        id: evt.id, title: evt.title, status: evt.status,
        start_time: evt.start_time, location: evt.location,
        max_capacity: evt.max_capacity,
        totalRegistrations: totalRegs, checkedIn,
        attendanceRate: totalRegs > 0 ? Math.round((checkedIn / totalRegs) * 100) : 0,
        totalBudgetSpend: totalBudget, approvedBudget,
        budgetItems: items
      };
    });

    // Get full club details for all mentor's clubs (for the club switcher UI)
    const allMentorClubs = mentorClubs.length > 0
      ? await db.Club.findAll({
          where: { id: { [Op.in]: mentorClubs } },
          attributes: ['id', 'name', 'category']
        })
      : [];

    res.json({ club, mentor, eventSummaries, mentorClubs: allMentorClubs, activeClubId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * GET /api/v1/mentor/suggestions?mentor_id=
 */
exports.getSuggestions = async (req, res) => {
  try {
    const { mentor_id } = req.query;
    const suggestions = await db.MentorSuggestion.findAll({
      where: { mentor_id },
      include: [{ model: db.Event, attributes: ['id', 'title'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/v1/mentor/suggestions
 */
exports.postSuggestion = async (req, res) => {
  try {
    const { mentor_id, club_id, event_id, title, body, category, priority } = req.body;
    const suggestion = await db.MentorSuggestion.create({
      mentor_id, club_id, event_id: event_id || null,
      title, body, category: category || 'GENERAL', priority: priority || 'MEDIUM'
    });
    res.status(201).json(suggestion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/v1/mentor/budget?club_id=
 */
exports.getBudget = async (req, res) => {
  try {
    const { club_id } = req.query;
    if (!club_id) return res.json([]);
    const items = await db.BudgetItem.findAll({
      where: { club_id },
      include: [{ model: db.Event, attributes: ['id', 'title', 'start_time'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * PATCH /api/v1/mentor/budget/:id/review
 */
exports.reviewBudgetItem = async (req, res) => {
  try {
    const item = await db.BudgetItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Budget item not found' });
    await item.update({
      approval_status: req.body.approval_status,
      mentor_note: req.body.mentor_note || item.mentor_note
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/v1/mentor/budget
 */
exports.submitBudgetItem = async (req, res) => {
  try {
    const { event_id, club_id, submitted_by, description, category, estimated_amount } = req.body;
    const item = await db.BudgetItem.create({
      event_id, club_id, submitted_by, description,
      category: category || 'MISCELLANEOUS',
      estimated_amount: parseFloat(estimated_amount) || 0
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/v1/mentor/members?club_id=
 * Returns full member roster for a club (mentor read-only view)
 */
exports.getClubMembers = async (req, res) => {
  try {
    const { club_id } = req.query;
    if (!club_id) return res.json([]);
    const members = await db.ClubMember.findAll({
      where: { club_id },
      include: [{
        model: db.User,
        attributes: ['id', 'full_name', 'email', 'username', 'branch', 'section', 'program', 'gender']
      }],
      order: [['createdAt', 'ASC']]
    });
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/v1/mentor/broadcast
 * Allows mentor to send a club-specific announcement to all club members
 * Body: { mentor_id, club_id, title, body }
 */
exports.broadcastToClub = async (req, res) => {
  try {
    const { mentor_id, club_id, title, body } = req.body;
    if (!mentor_id || !club_id || !title || !body)
      return res.status(400).json({ message: 'mentor_id, club_id, title, and body are required.' });

    const mentor = await db.User.findByPk(mentor_id);
    if (!mentor || mentor.global_role !== 'CLUB_MENTOR')
      return res.status(403).json({ message: 'Not a valid club mentor.' });

    // Verify mentor is authorized for this club
    const mentorClubs = Array.isArray(mentor.mentor_club_ids) ? [...mentor.mentor_club_ids] : [];
    if (mentor.assigned_club_id && !mentorClubs.includes(mentor.assigned_club_id))
      mentorClubs.unshift(mentor.assigned_club_id);
    if (!mentorClubs.includes(club_id))
      return res.status(403).json({ message: 'You are not authorized to send announcements to this club.' });

    // Get all members of the club
    const members = await db.ClubMember.findAll({ where: { club_id } });

    if (members.length === 0)
      return res.status(400).json({ message: 'No club members found to notify.' });

    // Create individual notifications for each club member
    const notifications = members.map(m => ({
      user_id: m.user_id,
      title,
      body,
      type: 'ANNOUNCEMENT',
      sender_role: 'CLUB_MENTOR',
    }));

    await db.Notification.bulkCreate(notifications);

    res.status(201).json({ message: `Announcement sent to ${members.length} club members.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/v1/mentor/approve-second-club
 * Super Admin endpoint: approve a mentor's second-club request
 * Body: { mentor_id, club_id }
 */
exports.approveSecondClub = async (req, res) => {
  try {
    const { mentor_id, club_id } = req.body;
    const mentor = await db.User.findByPk(mentor_id);
    if (!mentor) return res.status(404).json({ message: 'User not found' });
    if (mentor.global_role !== 'CLUB_MENTOR')
      return res.status(400).json({ message: 'User is not a mentor' });

    const existing = Array.isArray(mentor.mentor_club_ids) ? mentor.mentor_club_ids : [];
    if (existing.length >= 2)
      return res.status(400).json({ message: 'Mentor already has max 2 clubs' });
    if (existing.includes(club_id))
      return res.status(409).json({ message: 'Club already assigned' });

    await mentor.update({ mentor_club_ids: [...existing, club_id] });
    res.json({ message: 'Second club approved and assigned to mentor' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
