const MenuItem = require('../models/MenuItem');
const MenuCategory = require('../models/MenuCategory');
const Restaurant = require('../models/Restaurant');

// Create new item
async function createItem(req, res) {
  try {
    const { categoryId, name, price, description, isVeg } = req.body;
    const userId = req.userId;

    // Validate input
    if (!categoryId || !name || price === undefined) {
      return res.status(400).json({ error: 'Category ID, name, and price are required' });
    }

    if (isNaN(price) || price < 0) {
      return res.status(400).json({ error: 'Price must be a valid number' });
    }

    // Verify category belongs to user's restaurant
    const category = await MenuCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const restaurant = await Restaurant.findByOwnerId(userId);
    if (!restaurant || category.restaurant_id !== restaurant.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Create item
    const item = await MenuItem.create(
      restaurant.id,
      categoryId,
      name,
      price,
      description
    );

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      item
    });
  } catch (err) {
    console.error('Create item error:', err);
    res.status(400).json({ error: err.message });
  }
}

// Get all items for restaurant
async function getItems(req, res) {
  try {
    const userId = req.userId;

    // Verify restaurant ownership
    const restaurant = await Restaurant.findByOwnerId(userId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Get items
    const items = await MenuItem.findByRestaurant(restaurant.id);

    res.json({
      success: true,
      items
    });
  } catch (err) {
    console.error('Get items error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get items by category
async function getItemsByCategory(req, res) {
  try {
    const { categoryId } = req.params;
    const userId = req.userId;

    // Verify category belongs to user's restaurant
    const category = await MenuCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const restaurant = await Restaurant.findByOwnerId(userId);
    if (!restaurant || category.restaurant_id !== restaurant.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get items
    const items = await MenuItem.findByCategory(categoryId, true); // Include unavailable

    res.json({
      success: true,
      items
    });
  } catch (err) {
    console.error('Get items error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Update item
async function updateItem(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const updates = req.body;

    // Verify item exists and belongs to user's restaurant
    const item = await MenuItem.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const restaurant = await Restaurant.findByOwnerId(userId);
    if (!restaurant || item.restaurant_id !== restaurant.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update item
    const updated = await MenuItem.update(id, updates);

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      item: updated
    });
  } catch (err) {
    console.error('Update item error:', err);
    res.status(400).json({ error: err.message });
  }
}

// Delete item
async function deleteItem(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Verify item exists and belongs to user's restaurant
    const item = await MenuItem.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const restaurant = await Restaurant.findByOwnerId(userId);
    if (!restaurant || item.restaurant_id !== restaurant.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete item
    await MenuItem.delete(id);

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (err) {
    console.error('Delete item error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  createItem,
  getItems,
  getItemsByCategory,
  updateItem,
  deleteItem
};
