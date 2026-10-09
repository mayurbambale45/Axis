const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const rateLimiter = require('../middlewares/rateLimiter');

router.post('/register',         authController.register);
router.post('/login',            rateLimiter, authController.login);
router.post('/request-termination', authController.requestTermination);
router.post('/refresh',          authController.refreshToken);
router.post('/logout',           authController.logout);
router.post('/change-password',  authController.changePassword);
router.post('/mentor/request-club', authController.requestMentorClub);

module.exports = router;
