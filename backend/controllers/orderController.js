const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// Helper to safely parse pickup time into a valid Date object
function parsePickupTime(input) {
  if (!input) {
    return new Date(Date.now() + 20 * 60 * 1000); // default 20 minutes from now
  }

  // 1. If it's already a valid Date or ISO string or numeric timestamp
  const directDate = new Date(input);
  if (!isNaN(directDate.getTime()) && directDate.getFullYear() > 2020) {
    return directDate;
  }

  const str = String(input).trim().toLowerCase();

  // 2. Relative time like "15 mins", "in 20 min", "30m", "1 hr", "1 hour"
  const relativeMatch = str.match(/^(?:in\s*)?(\d+)\s*(m|min|mins|minutes|h|hr|hrs|hours)?$/i);
  if (relativeMatch) {
    const val = parseInt(relativeMatch[1], 10);
    const unit = (relativeMatch[2] || 'm').toLowerCase();
    const minutes = unit.startsWith('h') ? val * 60 : val;
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  // 3. Time format like "4 pm", "4:30 pm", "4pm", "16:30", "4:00"
  const timeMatch = str.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const ampm = timeMatch[3] ? timeMatch[3].toLowerCase() : null;

    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;

    const targetDate = new Date();
    targetDate.setHours(hours, minutes, 0, 0);

    // If the time already passed today by more than 5 minutes, assume next day
    if (targetDate.getTime() < Date.now() - 5 * 60 * 1000) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    return targetDate;
  }

  // Fallback to 20 minutes from now
  return new Date(Date.now() + 20 * 60 * 1000);
}

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      pickupTime,
      specialInstructions,
      paymentMethod,
      isExpressPickup,
      pickupCounter,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must include at least one item' });
    }

    // Validate items, calculate total and estimated preparation wait time
    let totalAmount = 0;
    let maxPrepTime = 10;
    let hasMeals = false;
    let hasBeveragesOnly = true;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: `Menu item not found: ${item.menuItemId}` });
      }
      if (!menuItem.available) {
        return res.status(400).json({ message: `Menu item not available: ${menuItem.name}` });
      }

      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;

      if (menuItem.preparationTime && menuItem.preparationTime > maxPrepTime) {
        maxPrepTime = menuItem.preparationTime;
      }
      if (['lunch', 'dinner'].includes(menuItem.category)) {
        hasMeals = true;
      }
      if (menuItem.category !== 'beverages') {
        hasBeveragesOnly = false;
      }

      orderItems.push({
        menuItem: menuItem._id,
        quantity: item.quantity,
        price: menuItem.price
      });
    }

    // Smart pickup counter guide assignment
    let assignedCounter = pickupCounter;
    if (!assignedCounter) {
      if (isExpressPickup) {
        assignedCounter = 'Counter 1 (Express Shelf)';
      } else if (hasBeveragesOnly) {
        assignedCounter = 'Counter 1 (Quick / Beverages)';
      } else if (hasMeals) {
        assignedCounter = 'Counter 2 (Main Kitchen & Meals)';
      } else {
        assignedCounter = 'Counter 3 (Snacks & Fast Food)';
      }
    }

    // Create order
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      pickupTime: parsePickupTime(pickupTime),
      specialInstructions: specialInstructions || '',
      paymentMethod: paymentMethod === 'upi' ? 'upi' : 'cash',
      isExpressPickup: Boolean(isExpressPickup),
      pickupCounter: assignedCounter,
      estimatedPrepTime: maxPrepTime,
    });

    await order.save();

    // Populate menu item details for response
    await order.populate('items.menuItem');

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: 'Error creating order', error: error.message });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.menuItem')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Get single order
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.menuItem');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order or is admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

// Update order status & counter (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, pickupCounter } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (pickupCounter) updateData.pickupCounter = pickupCounter;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('items.menuItem');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: 'Error updating order status', error: error.message });
  }
};

// Rate order & meal (customer only)
exports.rateOrder = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const numRating = Number(rating);

    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const order = await Order.findById(req.params.id).populate('items.menuItem');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    order.rating = numRating;
    order.ratingFeedback = feedback || '';
    await order.save();

    // Update rating on each ordered MenuItem
    for (const item of order.items) {
      const menuItemId = item.menuItem?._id || item.menuItem;
      if (menuItemId) {
        const menuItem = await MenuItem.findById(menuItemId);
        if (menuItem) {
          const currentTotal = (menuItem.rating || 4.5) * (menuItem.numReviews || 1);
          const newNumReviews = (menuItem.numReviews || 0) + 1;
          const newRating = Number(((currentTotal + numRating) / (newNumReviews + 1)).toFixed(1));
          menuItem.rating = Math.min(5, Math.max(1, newRating));
          menuItem.numReviews = newNumReviews;
          await menuItem.save();
        }
      }
    }

    res.json({ message: 'Rating submitted successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting rating', error: error.message });
  }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const orders = await Order.find(filter)
      .populate('items.menuItem')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Can only cancel pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot cancel order in current status' });
    }

    order.status = 'cancelled';
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling order', error: error.message });
  }
};