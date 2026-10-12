const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middlewares/authMiddleware');
const rbacMiddleware = require('../middlewares/rbacMiddleware');

// Get all events
router.get('/', eventController.getAllEvents);

// Get real-time event tracker (Live/Upcoming/Completed for the logged-in student)
router.get('/tracker', authMiddleware, eventController.getEventTracker);

// Create event (Requires admin/leadership role, handled by rbac in the future)
router.post('/', authMiddleware, rbacMiddleware('CLUB_ADMIN'), eventController.createEvent);

// Register for an event
router.post('/:id/register', authMiddleware, eventController.registerForEvent);

// Check-in (Scan QR Code)
router.post('/check-in', authMiddleware, rbacMiddleware('CLUB_ADMIN'), eventController.checkInEvent);

// Export event roster (Analytics)
router.get('/:id/export', authMiddleware, rbacMiddleware('CLUB_ADMIN'), eventController.exportEventRoster);

module.exports = router;

