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
router.delete('/clubs/:clubId/members/:memberId', adminController.removeClubMember);

module.exports = router;
