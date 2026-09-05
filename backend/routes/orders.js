const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth, adminAuth } = require('../middleware/auth');

// Protected routes (all require authentication)
router.post('/', auth, orderController.createOrder);
router.get('/my-orders', auth, orderController.getUserOrders);
router.get('/:id', auth, orderController.getOrderById);
router.patch('/:id/cancel', auth, orderController.cancelOrder);
router.post('/:id/rate', auth, orderController.rateOrder);

// Admin only routes
router.get('/', adminAuth, orderController.getAllOrders);
router.patch('/:id/status', adminAuth, orderController.updateOrderStatus);

module.exports = router;