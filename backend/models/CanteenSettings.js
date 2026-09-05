const mongoose = require('mongoose');

const canteenSettingsSchema = new mongoose.Schema({
  upiId: {
    type: String,
    default: 'canteen@upi'
  },
  upiName: {
    type: String,
    default: 'Smart Canteen'
  },
  upiQrCode: {
    type: String, // Data URL or Image URL
    default: ''
  },
  expressPickupAvailable: {
    type: Boolean,
    default: true
  },
  defaultCounters: {
    type: [String],
    default: [
      'Counter 1 (Express & Beverages)',
      'Counter 2 (Main Kitchen & Meals)',
      'Counter 3 (Snacks & Quick Bites)'
    ]
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

canteenSettingsSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('CanteenSettings', canteenSettingsSchema);
