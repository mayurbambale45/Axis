const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentorController');

// GET overview (events progress + club info for the mentor's assigned club)
router.get('/overview', mentorController.getOverview);

// Suggestions
router.get('/suggestions', mentorController.getSuggestions);
router.post('/suggestions', mentorController.postSuggestion);

// Budget review
router.get('/budget', mentorController.getBudget);
router.post('/budget', mentorController.submitBudgetItem);
router.patch('/budget/:id/review', mentorController.reviewBudgetItem);

// Club members (read-only view for mentor)
router.get('/members', mentorController.getClubMembers);

// Broadcast announcement to club members
router.post('/broadcast', mentorController.broadcastToClub);

module.exports = router;
