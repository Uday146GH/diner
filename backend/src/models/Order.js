const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { generateOrderNumber } = require('../utils/orderUtils');

class Order {
  // Create new order
  static async create(restaurantId, customerName, customerPhone, notes = null) {
    const id = uuidv4();
    const orderNumber = generateOrderNumber();
    const query = `
      INSERT INTO orders (id, restaurant_id, order_number, customer_name, customer_phone, special_instructions, status, subtotal, total)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, order_number, restaurant_id, customer_name, customer_phone, special_instructions, status, subtotal, total, created_at;
    `;
    const values = [id, restaurantId, orderNumber, customerName, customerPhone, notes, 'pending', 0, 0];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  // Find order by ID
  static async findById(id) {
    const query = `
      SELECT id, order_number, restaurant_id, customer_name, customer_phone, special_instructions, status, subtotal, total, created_at, updated_at
      FROM orders
      WHERE id = $1;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Find all orders by restaurant
  static async findByRestaurant(restaurantId, limit = 100, offset = 0) {
    const query = `
      SELECT id, order_number, restaurant_id, customer_name, customer_phone, special_instructions, status, subtotal, total, created_at
      FROM orders
      WHERE restaurant_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3;
    `;
    const result = await pool.query(query, [restaurantId, limit, offset]);
    return result.rows;
  }

  // Update order status
  static async updateStatus(id, status) {
    const query = `
      UPDATE orders
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, order_number, status, updated_at;
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0] || null;
  }

  // Update order total
  static async updateTotal(id, subtotal) {
    const query = `
      UPDATE orders
      SET subtotal = $1, total = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, subtotal, total;
    `;
    const result = await pool.query(query, [subtotal, id]);
    return result.rows[0] || null;
  }

  // Get order with items
  static async findWithItems(id) {
    const query = `
      SELECT o.id, o.order_number, o.restaurant_id, o.customer_name, o.customer_phone, o.special_instructions, o.status, o.subtotal, o.total, o.created_at,
             json_agg(json_build_object('id', oi.id, 'menuItemId', oi.menu_item_id, 'itemName', oi.item_name, 'itemPrice', oi.item_price, 'quantity', oi.quantity)) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1
      GROUP BY o.id;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
}

module.exports = Order;
