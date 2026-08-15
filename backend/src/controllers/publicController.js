const Restaurant = require('../models/Restaurant');
const MenuCategory = require('../models/MenuCategory');
const MenuItem = require('../models/MenuItem');

// Get restaurant by slug (public)
async function getRestaurant(req, res) {
  try {
    const { slug } = req.params;

    const restaurant = await Restaurant.findBySlug(slug);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

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

// Get restaurant menu (categories + items)
async function getRestaurantMenu(req, res) {
  try {
    const { slug } = req.params;

    // Get restaurant
    const restaurant = await Restaurant.findBySlug(slug);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Get categories (active only)
    const categories = await MenuCategory.findByRestaurant(restaurant.id, false);

    // Get items (available only)
    const items = await MenuItem.findByRestaurant(restaurant.id);
    const availableItems = items.filter(i => i.is_available);

    // Group items by category
    const menuData = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      items: availableItems.filter(i => i.category_id === category.id)
    }));

    res.json({
      success: true,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        logo_url: restaurant.logo_url,
        description: restaurant.description
      },
      menu: menuData
    });
  } catch (err) {
    console.error('Get menu error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getRestaurant,
  getRestaurantMenu
};
