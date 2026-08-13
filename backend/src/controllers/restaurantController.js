const Restaurant = require('../models/Restaurant');
const { generateUniqueSlug } = require('../utils/slugUtils');

// Create new restaurant
async function createRestaurant(req, res) {
  try {
    const { name } = req.body;
    const userId = req.userId;

    // Validate input
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Restaurant name is required' });
    }

    if (name.length > 255) {
      return res.status(400).json({ error: 'Restaurant name is too long' });
    }

    // Check if user already has a restaurant
    const existing = await Restaurant.findByOwnerId(userId);
    if (existing) {
      return res.status(400).json({ error: 'You already have a restaurant' });
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(name);

    // Create restaurant
    const restaurant = await Restaurant.create(userId, name, slug);

    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully',
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        status: restaurant.status,
        subscription_tier: restaurant.subscription_tier
      }
    });
  } catch (err) {
    console.error('Create restaurant error:', err);
    res.status(400).json({ error: err.message });
  }
}

// Get my restaurant
async function getMyRestaurant(req, res) {
  try {
    const userId = req.userId;

    const restaurant = await Restaurant.findByOwnerId(userId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found. Create one first.' });
    }

    res.json({
      success: true,
      restaurant
    });
  } catch (err) {
    console.error('Get restaurant error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get restaurant by ID (owner only)
async function getRestaurantById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Verify ownership
    if (restaurant.owner_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      success: true,
      restaurant
    });
  } catch (err) {
    console.error('Get restaurant error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get restaurant by slug (public)
async function getRestaurantBySlug(req, res) {
  try {
    const { slug } = req.params;

    const restaurant = await Restaurant.findBySlug(slug);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Return only public info
    res.json({
      success: true,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        logo_url: restaurant.logo_url,
        description: restaurant.description,
        phone: restaurant.phone,
        email: restaurant.email,
        address: restaurant.address,
        city: restaurant.city
      }
    });
  } catch (err) {
    console.error('Get restaurant error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Update restaurant
async function updateRestaurant(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const updates = req.body;

    // Verify ownership
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    if (restaurant.owner_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update restaurant
    const updated = await Restaurant.update(id, updates);

    res.json({
      success: true,
      message: 'Restaurant updated successfully',
      restaurant: updated
    });
  } catch (err) {
    console.error('Update restaurant error:', err);
    res.status(400).json({ error: err.message });
  }
}

module.exports = {
  createRestaurant,
  getMyRestaurant,
  getRestaurantById,
  getRestaurantBySlug,
  updateRestaurant
};
