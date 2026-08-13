const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const authenticateJWT = require('../middleware/auth');

// Protected routes (auth required)
router.post('/', authenticateJWT, restaurantController.createRestaurant);
router.get('/my-restaurant', authenticateJWT, restaurantController.getMyRestaurant);
router.get('/:id', authenticateJWT, restaurantController.getRestaurantById);
router.put('/:id', authenticateJWT, restaurantController.updateRestaurant);

// Public routes (no auth required)
router.get('/slug/:slug', restaurantController.getRestaurantBySlug);

module.exports = router;
