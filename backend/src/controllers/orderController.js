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

// Track order by order number (public)
async function trackOrder(req, res) {
  try {
    const { orderNumber } = req.params;

    if (!orderNumber) {
      return res.status(400).json({ error: 'Order number is required' });
    }

    // Query to find order by order_number
    const query = `
      SELECT o.id, o.order_number, o.restaurant_id, o.customer_name, o.customer_phone, o.special_instructions, o.status, o.subtotal, o.total, o.created_at, o.updated_at,
             json_agg(json_build_object('id', oi.id, 'menuItemId', oi.menu_item_id, 'itemName', oi.item_name, 'itemPrice', oi.item_price, 'quantity', oi.quantity)) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.order_number = $1
      GROUP BY o.id;
    `;

    const result = await require('../config/database').query(query, [orderNumber]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = result.rows[0];

    res.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        specialInstructions: order.special_instructions,
        status: order.status,
        subtotal: order.subtotal,
        total: order.total,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        items: order.items
      }
    });
  } catch (err) {
    console.error('Track order error:', err);
    res.status(500).json({ error: 'Internal server error' });
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
  trackOrder,
  getOrder,
  getRestaurantOrders,
  updateOrderStatus
};
