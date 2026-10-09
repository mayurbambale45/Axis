const express = require('express');
const router = express.Router();
const db = require('../models');

// Update Club Profile
router.put('/profile/:clubId', async (req, res) => {
  try {
    const club = await db.Club.findByPk(req.params.clubId);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    await club.update(req.body);
    res.json({ message: 'Club updated safely.', club });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Applications & Recruitment ─────────────────────────────
router.get('/applications/:clubId', async (req, res) => {
  try {
    const apps = await db.ClubApplication.findAll({
      where: { club_id: req.params.clubId },
      include: [{ model: db.User, attributes: ['id', 'full_name', 'email', 'year', 'program', 'branch', 'admission_year'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/applications/:appId', async (req, res) => {
  try {
    const app = await db.ClubApplication.findByPk(req.params.appId);
    if (!app) return res.status(404).json({ message: 'Application not found' });
    
    const { status, aptitude_test_date, interview_date, admin_notes, message_to_user } = req.body;
    
    // Update Application
    await app.update({ 
      status: status || app.status, 
      aptitude_test_date: aptitude_test_date || app.aptitude_test_date, 
      interview_date: interview_date || app.interview_date, 
      admin_notes: admin_notes || app.admin_notes 
    });

    if (message_to_user) {
      await db.Notification.create({
        title: 'Club Application Update',
        body: message_to_user,
        type: 'CLUB',
        user_id: app.user_id,
        sender_role: 'CLUB_ADMIN'
      });
    }

    // Process approval logic -> automatically assign club_role and global_role if approved
    if (status === 'APPROVED') {
       // Convert board back to a standard club_role
       let assignedRole = 'MEMBER';
       if (app.board === 'Assistant Board') assignedRole = 'SECRETARY';
       if (app.board === 'Main Board') assignedRole = 'LEAD'; 
       // Mentors should have global_role CLUB_MENTOR, but we stick to STUDENT/CLUB_ADMIN mapping for simpler scopes.
       
       const existingMember = await db.ClubMember.findOne({ where: { user_id: app.user_id, club_id: app.club_id }});
       if (!existingMember) {
         await db.ClubMember.create({ club_id: app.club_id, user_id: app.user_id, club_role: assignedRole });
       } else {
         await existingMember.update({ club_role: assignedRole });
       }
       // If role gives power, set global_role to CLUB_ADMIN (handled via UI or implicitly).
       const newGlobalRole = ['PRESIDENT', 'VP', 'SECRETARY', 'LEAD'].includes(assignedRole) ? 'CLUB_ADMIN' : 'STUDENT';
       await db.User.update(
         { global_role: newGlobalRole, assigned_club_id: app.club_id },
         { where: { id: app.user_id }}
       );
    }
    
    res.json({ message: 'Application updated', application: app });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get event roster (all registrations with user info)
router.get('/events/:eventId/roster', async (req, res) => {
  try {
    const roster = await db.EventRegistration.findAll({
      where: { event_id: req.params.eventId },
      include: [
        { model: db.User, attributes: ['id', 'full_name', 'email', 'username', 'branch', 'program'] },
        { model: db.Event, attributes: ['title', 'start_time', 'max_capacity'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(roster);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create Event
router.post('/events', async (req, res) => {
  try {
    const event = await db.Event.create(req.body);
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// AI MoM Generator Mock
router.post('/generate-mom', (req, res) => {
  const rawText = req.body.raw_notes || '';
  if (!rawText) return res.status(400).json({ message: 'No raw notes provided' });

  const mockMom = `
### Generated Minutes of the Meeting (MoM)
**Date:** ${new Date().toLocaleDateString()}
**Summary Context:** Derived from unstructured raw audio/notes.

**🎯 Key Action Items:**
- Finalize event venues based on recent capacities.
- Follow up with vendors for the upcoming keynote event.

**📝 Discussion Highlights:**
- "${rawText.substring(0, 80)}..." was noted as a critical priority.
- Financial budgets align with requested models.

_Powered by AXIS AI Service Mock_
`;

  res.json({ structured_mom: mockMom });
});

// ── Notifications ──────────────────────────────────────────
// Send a broadcast notification to all students (or specific user_id)
router.post('/notify', async (req, res) => {
  try {
    const { title, body, type, user_id, link } = req.body;
    if (!title || !body) return res.status(400).json({ message: 'Title and body are required' });

    const notification = await db.Notification.create({
      title,
      body,
      type: type || 'ANNOUNCEMENT',
      user_id: user_id || null, // null = broadcast
      link: link || null,
      sender_role: 'CLUB_ADMIN'
    });

    // If it's an event deadline, also send email to all students
    if (type === 'DEADLINE' || type === 'EVENT_ALERT') {
      const emailService = require('../services/emailService');
      const students = await db.User.findAll({ where: { active_role: 'STUDENT', account_status: 'APPROVED' } });
      const emails = students.map(s => s.email).filter(Boolean);
      for (const email of emails) {
        try {
          await emailService.sendEmail(
            email,
            `[AXIS] ${title}`,
            body,
            `<h3>${title}</h3><p>${body}</p>${link ? `<p><a href="${link}">View Details</a></p>` : ''}<p style="color:#666;font-size:12px;">Sent via AXIS Campus Portal</p>`
          );
        } catch(e) { /* skip failed emails */ }
      }
    }

    res.status(201).json({ message: 'Notification sent successfully', notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all notifications sent by club admin (for history)
router.get('/notifications', async (req, res) => {
  try {
    const notes = await db.Notification.findAll({
      where: { sender_role: 'CLUB_ADMIN' },
      order: [['createdAt', 'DESC']],
      limit: 30
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

