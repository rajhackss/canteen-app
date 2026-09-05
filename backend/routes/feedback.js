const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { auth, adminAuth } = require('../middleware/auth');

// Customer submit feedback
router.post('/', auth, feedbackController.submitFeedback);

// Admin view all feedback
router.get('/', adminAuth, feedbackController.getAllFeedback);

module.exports = router;
