const express = require('express');
const router = express.Router();
const db = require('../models');

// Leadership roles that can create/edit/delete events
const LEADERSHIP_ROLES = ['PRESIDENT', 'VP', 'SECRETARY', 'LEAD'];

// ── Get all clubs (public – all students can view) ─────────
router.get('/', async (req, res) => {
  try {
    const clubs = await db.Club.findAll({
      where: { status: 'ACTIVE' },
      include: [{ model: db.ClubMember, attributes: ['id', 'club_role'] }],
      order: [['name', 'ASC']]
    });
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Create club ────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, mission_statement, description, category } = req.body;
    if (!name) return res.status(400).json({ message: 'Club name is required' });
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const club = await db.Club.create({ name, slug, mission_statement, description, category });
    res.status(201).json(club);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Get a single club by ID ───────────────────────────────
router.get('/:clubId', async (req, res) => {
  try {
    const club = await db.Club.findByPk(req.params.clubId, {
      include: [
        { model: db.Event, order: [['start_time', 'ASC']] },
        {
          model: db.ClubMember,
          include: [{ model: db.User, attributes: ['id', 'full_name', 'email', 'branch', 'program', 'global_role'] }]
        }
      ]
    });
    if (!club) return res.status(404).json({ message: 'Club not found' });
    res.json(club);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Get members of a club ──────────────────────────────────
router.get('/:clubId/members', async (req, res) => {
  try {
    const members = await db.ClubMember.findAll({
      where: { club_id: req.params.clubId },
      include: [{
        model: db.User,
        attributes: ['id', 'full_name', 'email', 'username', 'department', 'program', 'branch', 'global_role', 'account_status']
      }],
      order: [
        [db.Sequelize.literal(`CASE club_role
          WHEN 'PRESIDENT' THEN 1
          WHEN 'VP' THEN 2
          WHEN 'SECRETARY' THEN 3
          WHEN 'LEAD' THEN 4
          ELSE 5 END`), 'ASC'],
        ['createdAt', 'ASC']
      ]
    });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Add a member to a club ─────────────────────────────────
router.post('/:clubId/members', async (req, res) => {
  try {
    const { user_id, club_role } = req.body;
    if (!user_id) return res.status(400).json({ message: 'user_id is required' });

    const existing = await db.ClubMember.findOne({ where: { club_id: req.params.clubId, user_id } });
    if (existing) return res.status(409).json({ message: 'User is already a member of this club' });

    const member = await db.ClubMember.create({
      club_id: req.params.clubId,
      user_id,
      club_role: club_role || 'MEMBER'
    });

    // Update user global_role if they become a leadership position
    if (LEADERSHIP_ROLES.includes(club_role)) {
      await db.User.update(
        { global_role: 'CLUB_ADMIN', assigned_club_id: req.params.clubId },
        { where: { id: user_id } }
      );
    }

    res.status(201).json({ message: 'Member added successfully', member });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Update member role ─────────────────────────────────────
router.patch('/:clubId/members/:memberId', async (req, res) => {
  try {
    const { club_role } = req.body;
    const member = await db.ClubMember.findByPk(req.params.memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    await member.update({ club_role });

    // Sync global_role: if new role is leadership, elevate; if MEMBER, revert
    const newGlobalRole = LEADERSHIP_ROLES.includes(club_role) ? 'CLUB_ADMIN' : 'STUDENT';
    await db.User.update({ global_role: newGlobalRole }, { where: { id: member.user_id } });

    res.json({ message: 'Member role updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Remove a member from a club ────────────────────────────
router.delete('/:clubId/members/:memberId', async (req, res) => {
  try {
    const member = await db.ClubMember.findByPk(req.params.memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    // Revert global role to STUDENT
    await db.User.update({ global_role: 'STUDENT', assigned_club_id: null }, { where: { id: member.user_id } });
    await member.destroy();

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Get events for a club (public) ────────────────────────
router.get('/:clubId/events', async (req, res) => {
  try {
    const events = await db.Event.findAll({
      where: { club_id: req.params.clubId },
      order: [['start_time', 'ASC']]
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Update an event (leadership only) ──────────────────────
// Caller must pass their user_id in header or body for role verification
router.patch('/:clubId/events/:eventId', async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ message: 'user_id is required for authorisation.' });

    const membership = await db.ClubMember.findOne({ where: { club_id: req.params.clubId, user_id } });
    if (!membership || !LEADERSHIP_ROLES.includes(membership.club_role)) {
      return res.status(403).json({ message: 'Only club leaders (President, VP, Secretary, Lead) can edit events.' });
    }

    const event = await db.Event.findByPk(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const { user_id: _drop, ...updateFields } = req.body;
    await event.update(updateFields);
    res.json({ message: 'Event updated successfully', event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Get registrations (roster) for an event ────────────────
router.get('/:clubId/events/:eventId/roster', async (req, res) => {
  try {
    const roster = await db.EventRegistration.findAll({
      where: { event_id: req.params.eventId },
      include: [{ model: db.User, attributes: ['id', 'full_name', 'email', 'username', 'branch', 'program'] }]
    });
    res.json(roster);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
