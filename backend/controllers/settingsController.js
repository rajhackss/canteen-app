const CanteenSettings = require('../models/CanteenSettings');

// Default fallback settings
const DEFAULT_SETTINGS = {
  upiId: 'canteen@upi',
  upiName: 'Smart Canteen',
  upiQrCode: '',
  expressPickupAvailable: true,
  defaultCounters: [
    'Counter 1 (Express & Beverages)',
    'Counter 2 (Main Kitchen & Meals)',
    'Counter 3 (Snacks & Quick Bites)'
  ]
};

// Get settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await CanteenSettings.findOne();
    if (!settings) {
      settings = await CanteenSettings.create(DEFAULT_SETTINGS);
    }
    res.json(settings);
  } catch (error) {
    res.json(DEFAULT_SETTINGS);
  }
};

// Update settings (admin only)
exports.updateSettings = async (req, res) => {
  try {
    const { upiId, upiName, upiQrCode, expressPickupAvailable, defaultCounters } = req.body;

    let settings = await CanteenSettings.findOne();
    if (!settings) {
      settings = new CanteenSettings();
    }

    if (upiId !== undefined) settings.upiId = String(upiId).trim();
    if (upiName !== undefined) settings.upiName = String(upiName).trim();
    if (upiQrCode !== undefined) settings.upiQrCode = String(upiQrCode).trim();
    if (expressPickupAvailable !== undefined) settings.expressPickupAvailable = Boolean(expressPickupAvailable);
    if (defaultCounters !== undefined && Array.isArray(defaultCounters)) {
      settings.defaultCounters = defaultCounters;
    }

    await settings.save();
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
};
