const MenuCategory = require('../models/MenuCategory');
const Restaurant = require('../models/Restaurant');

// Create new category
async function createCategory(req, res) {
  try {
    const { name, description } = req.body;
    const userId = req.userId;

    // Validate input
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Verify restaurant ownership
    const restaurant = await Restaurant.findByOwnerId(userId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found. Create one first.' });
    }

    // Create category
    const category = await MenuCategory.create(restaurant.id, name, description);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (err) {
    console.error('Create category error:', err);
    res.status(400).json({ error: err.message });
  }
}

// Get all categories for restaurant
async function getCategories(req, res) {
  try {
    const userId = req.userId;

    // Verify restaurant ownership
    const restaurant = await Restaurant.findByOwnerId(userId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Get categories
    const categories = await MenuCategory.findByRestaurant(restaurant.id, true); // Include inactive

    res.json({
      success: true,
      categories
    });
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Update category
async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const updates = req.body;

    // Verify category exists and belongs to user's restaurant
    const category = await MenuCategory.findById(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const restaurant = await Restaurant.findByOwnerId(userId);
    if (!restaurant || category.restaurant_id !== restaurant.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update category
    const updated = await MenuCategory.update(id, updates);

    res.json({
      success: true,
      message: 'Category updated successfully',
      category: updated
    });
  } catch (err) {
    console.error('Update category error:', err);
    res.status(400).json({ error: err.message });
  }
}

// Delete category
async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Verify category exists and belongs to user's restaurant
    const category = await MenuCategory.findById(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const restaurant = await Restaurant.findByOwnerId(userId);
    if (!restaurant || category.restaurant_id !== restaurant.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete category
    await MenuCategory.delete(id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
};
