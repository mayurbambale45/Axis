const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');

router.use('/auth', authRoutes);

// Placeholder for other routes
router.use('/clubs', require('./clubRoutes'));
router.use('/events', require('./eventRoutes'));
router.use('/admin', require('./adminRoutes'));
router.use('/student', require('./studentRoutes'));
router.use('/club-admin', require('./clubAdminRoutes'));
router.use('/super-admin', require('./superAdminRoutes'));
router.use('/mentor', require('./mentorRoutes'));

module.exports = router;
