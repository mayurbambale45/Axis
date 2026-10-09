const express = require('express');
const router = express.Router();
const saController = require('../controllers/superAdminController');

router.get('/stats', saController.getGlobalStats);
router.get('/clubs/pending', saController.getPendingClubs);
router.put('/clubs/:id/status', saController.updateClubStatus);

router.get('/users', saController.getUsers);
router.put('/users/:id/role', saController.updateUserRole);

router.get('/transactions', saController.getTransactions);

router.delete('/events/:id', saController.deleteEvent);

module.exports = router;
