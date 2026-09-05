const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'snacks', 'beverages', 'dinner']
  },
  image: {
    type: String,
    default: ''
  },
  available: {
    type: Boolean,
    default: true
  },
  preparationTime: {
    type: Number,
    default: 15 // in minutes
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
menuItemSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('MenuItem', menuItemSchema);