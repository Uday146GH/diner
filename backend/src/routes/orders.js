const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authenticateJWT = require('../middleware/auth');

// Public routes
router.post('/', orderController.placeOrder);
router.get('/:id', orderController.getOrder);
router.get('/track/:orderNumber', orderController.trackOrder);

// Protected routes
router.get('/', authenticateJWT, orderController.getRestaurantOrders);
router.put('/:id/status', authenticateJWT, orderController.updateOrderStatus);

module.exports = router;
