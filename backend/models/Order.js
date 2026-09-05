const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  pickupTime: {
    type: Date,
    required: true
  },
  specialInstructions: {
    type: String,
    default: ''
  },
  pickupCounter: {
    type: String,
    default: 'Counter 1 (Main Pickup)'
  },
  isExpressPickup: {
    type: Boolean,
    default: false
  },
  estimatedPrepTime: {
    type: Number,
    default: 15
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  ratingFeedback: {
    type: String,
    default: ''
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi'],
    default: 'cash'
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
orderSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Order', orderSchema);