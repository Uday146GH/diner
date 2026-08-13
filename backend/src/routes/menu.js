const express = require('express');
const router = express.Router();
const menuCategoryController = require('../controllers/menuCategoryController');
const menuItemController = require('../controllers/menuItemController');
const authenticateJWT = require('../middleware/auth');

// Categories (protected routes)
router.post('/categories', authenticateJWT, menuCategoryController.createCategory);
router.get('/categories', authenticateJWT, menuCategoryController.getCategories);
router.put('/categories/:id', authenticateJWT, menuCategoryController.updateCategory);
router.delete('/categories/:id', authenticateJWT, menuCategoryController.deleteCategory);

// Items (protected routes)
router.post('/items', authenticateJWT, menuItemController.createItem);
router.get('/items', authenticateJWT, menuItemController.getItems);
router.get('/items/category/:categoryId', authenticateJWT, menuItemController.getItemsByCategory);
router.put('/items/:id', authenticateJWT, menuItemController.updateItem);
router.delete('/items/:id', authenticateJWT, menuItemController.deleteItem);

module.exports = router;
