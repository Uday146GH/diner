const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// Place new order
async function placeOrder(req, res) {
  try {
    const { restaurantSlug, customerName, customerPhone, specialInstructions, items } = req.body;

    // Validate input
    if (!restaurantSlug || !customerName || !customerPhone || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get restaurant by slug
    const restaurant = await Restaurant.findBySlug(restaurantSlug);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Create order
    const order = await Order.create(
      restaurant.id,
      customerName,
      customerPhone,
      specialInstructions
    );

    // Add items to order and calculate total
    let totalAmount = 0;
    for (const item of items) {
      // Verify item belongs to restaurant
      const menuItem = await MenuItem.findById(item.id);
      if (!menuItem || menuItem.restaurant_id !== restaurant.id) {
        return res.status(400).json({ error: `Invalid item: ${item.name}` });
      }

      // Create order item with all required fields
      await OrderItem.create(
        order.id,
        item.id,
        restaurant.id,
        item.name,
        item.price,
        item.quantity
      );

      totalAmount += parseFloat(item.price) * item.quantity;
    }

    // Update order total
    await Order.updateTotal(order.id, totalAmount);

    // Get full order with items
    const fullOrder = await Order.findWithItems(order.id);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: fullOrder
    });
  } catch (err) {
    console.error('Place order error:', err);
    res.status(400).json({ error: err.message });
  }
}

// Get order details
async function getOrder(req, res) {
  try {
    const { id } = req.params;

    const order = await Order.findWithItems(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      order
    });
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get restaurant orders (protected)
async function getRestaurantOrders(req, res) {
  try {
    const userId = req.userId;
    const { status, limit = 50, offset = 0 } = req.query;

    // Get user's restaurant
    const restaurant = await Restaurant.findByOwnerId(userId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Get orders
    let orders = await Order.findByRestaurant(restaurant.id, limit, offset);

    // Filter by status if provided
    if (status) {
      orders = orders.filter(o => o.status === status);
    }

    res.json({
      success: true,
      orders,
      restaurantId: restaurant.id
    });
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Update order status (protected)
async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.userId;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Get order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify restaurant ownership
    const restaurant = await Restaurant.findByOwnerId(userId);
    if (!restaurant || order.restaurant_id !== restaurant.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Valid statuses
    const validStatuses = ['pending', 'accepted', 'preparing', 'ready', 'paid', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Update status
    const updated = await Order.updateStatus(id, status);

    res.json({
      success: true,
      message: 'Order status updated',
      order: updated
    });
  } catch (err) {
    console.error('Update order error:', err);
    res.status(400).json({ error: err.message });
  }
}

module.exports = {
  placeOrder,
  getOrder,
  getRestaurantOrders,
  updateOrderStatus
};
