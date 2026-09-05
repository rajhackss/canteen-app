const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { adminAuth } = require('../middleware/auth');

// Get settings (public for mobile app)
router.get('/', settingsController.getSettings);

// Update settings (admin only)
router.put('/', adminAuth, settingsController.updateSettings);

module.exports = router;
