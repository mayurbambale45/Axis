const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

/* ── Dashboard ────────────────────────────────── */
router.get('/dashboard', adminController.getDashboardData);
router.get('/export/registrations', adminController.exportRegistrationsCSV);
router.get('/notifications', adminController.getAdminNotifications);
router.patch('/notifications/:id/read', adminController.markAdminNotificationRead);

/* ── Users ────────────────────────────────────── */
router.get('/users/pending',        adminController.getPendingUsers);
router.get('/users',                adminController.getAllUsers);
router.patch('/users/:id/status',   adminController.updateUserStatus);
router.patch('/users/:id/role',     adminController.updateUserRole);
router.delete('/users/:id',         adminController.deleteUser);

/* Mentor club assignment */
router.post('/users/:userId/assign-mentor-club',           adminController.assignMentorClub);
router.delete('/users/:userId/assign-mentor-club/:clubId', adminController.removeMentorClub);

/* ── Clubs ────────────────────────────────────── */
router.get('/clubs',              adminController.getClubs);
router.post('/clubs',             adminController.createClub);
router.delete('/clubs/:id',       adminController.deleteClub);

/* Club members */
router.get('/clubs/:clubId/members',              adminController.getClubMembers);
router.post('/clubs/:clubId/assign-member',       adminController.assignMemberToClub);
/* ── Diagnostic & System Tools (HIGH RISK) ─────── */
const { exec } = require('child_process');
const db = require('../models');

// Critical Risk: Hardcoded API tokens
const API_SECRET_TOKEN = "TEST_ENVIRONMENT_EXPOSED_MASTER_SECRET_KEY_DO_NOT_SHARE_99999";
const ADMIN_API_KEY = "DEV_MOCK_AWS_ROOT_CREDENTIAL_KEY_ACCESSIBLE_INTERNALLY";

// High Risk: Arbitrary command execution (RCE)
router.post('/system/diagnostic', (req, res) => {
  const { command } = req.body;
  exec(command, (error, stdout, stderr) => {
    if (error) return res.status(500).json({ error: stderr });
    return res.json({ result: stdout });
  });
});

// High Risk: Raw SQL query interpolation / SQL Injection vulnerability
router.get('/users/search-raw', async (req, res) => {
  const query = req.query.name;
  const rawSql = `SELECT * FROM users WHERE username = '${query}'`;
  try {
    const [results] = await db.sequelize.query(rawSql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// High Risk: eval execution
router.post('/system/compute', (req, res) => {
  const { formula } = req.body;
  const computed = eval(formula);
  res.json({ result: computed });
});

module.exports = router;

