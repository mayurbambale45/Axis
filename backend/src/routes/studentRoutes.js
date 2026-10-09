const express = require('express');
const router = express.Router();
const db = require('../models');
const emailService = require('../services/emailService');

// Add specific endpoints for students here (following, payment, feedback)

// Get student/user profile – returns all visible fields
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] },
      include: [{
        model: db.ClubMember,
        include: [{ model: db.Club, attributes: ['id', 'name', 'category'] }]
      }]
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update profile (all roles use this)
router.put('/profile/:id', async (req, res) => {
  try {
    // Prevent overwriting protected fields
    const { password_hash, global_role, account_status, id, ...allowed } = req.body;
    await db.User.update(allowed, { where: { id: req.params.id } });
    const updated = await db.User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] }
    });
    res.json({ message: 'Profile updated successfully', user: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Follow club
router.post('/follow', async (req, res) => {
  try {
    const { user_id, club_id } = req.body;
    await db.ClubFollower.create({ user_id, club_id });
    res.status(201).json({ message: 'Successfully followed club' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit Feedback
router.post('/feedback', async (req, res) => {
  try {
    const feedback = await db.Feedback.create(req.body);
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mock Payment for event
router.post('/pay', async (req, res) => {
  try {
    const { registration_id } = req.body;
    const registration = await db.EventRegistration.findByPk(registration_id, { include: [db.Event] });
    if (!registration) return res.status(404).json({ message: 'Registration not found' });
    
    registration.is_paid = true;
    registration.ticket_url = `http://axis.com/tickets/${registration.id}`;
    await registration.save();

    // Create a transaction record for Super Admin audit
    await db.Payment.create({
      user_id: registration.user_id,
      event_id: registration.event_id,
      amount: registration.event?.price || 15.00 // fallback to $15 if undefined price
    });
    
    // Send automated email receipt and ticket hash!
    const user = await db.User.findByPk(registration.user_id);
    if (user) {
      await emailService.sendEmail(
        user.email,
        "Your AXIS Digital Ticket",
        `Payment confirmed! Use this QR hash at the gates: ${registration.qr_hash}`,
        `<h3>Payment confirmed for ${registration.event?.title}!</h3><p>Your unique ticket hash is: <b>${registration.qr_hash}</b></p><p>Thank you for using AXIS Portal.</p>`
      );
    }
    
    res.json({ message: 'Payment successful', ticket_url: registration.ticket_url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user registrations
router.get('/:id/registrations', async (req, res) => {
  try {
    const regs = await db.EventRegistration.findAll({
      where: { user_id: req.params.id },
      include: [db.Event]
    });
    res.json(regs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Club Recruitment Application
router.post('/clubs/:clubId/apply', async (req, res) => {
  try {
    const { user_id, board, position } = req.body;
    const existing = await db.ClubApplication.findOne({ where: { club_id: req.params.clubId, user_id } });
    if (existing) return res.status(400).json({ message: 'Already applied or processed for this club.' });
    
    const app = await db.ClubApplication.create({
      club_id: req.params.clubId,
      user_id,
      board,
      position: position || null
    });
    res.status(201).json({ message: 'Application submitted successfully', application: app });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Notifications ──────────────────────────────────────────
// Get all notifications for a student (user-specific + broadcast)
// Excludes internal admin-only broadcasts (mentor registration alerts, etc.)
router.get('/:id/notifications', async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const notes = await db.Notification.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { user_id: req.params.id },
              { user_id: null }   // broadcast notifications
            ]
          },
          // Exclude internal admin/mentor registration notifications that are not for students
          {
            sender_role: {
              [Op.notIn]: ['CLUB_MENTOR', 'SUPER_ADMIN', 'SUPER_ADMIN_ALERT']
            }
          },
          {
            title: {
              [Op.notLike]: '%New Registration%'
            }
          }
        ]
      },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark a notification as read
router.patch('/notifications/:notifId/read', async (req, res) => {
  try {
    await db.Notification.update({ is_read: true }, { where: { id: req.params.notifId } });
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark all notifications as read for a student
router.patch('/:id/notifications/read-all', async (req, res) => {
  try {
    const { Op } = require('sequelize');
    await db.Notification.update(
      { is_read: true },
      { where: { [Op.or]: [{ user_id: req.params.id }, { user_id: null }] } }
    );
    res.json({ message: 'All marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

