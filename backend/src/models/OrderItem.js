const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class OrderItem {
  // Create order item
  static async create(orderId, menuItemId, restaurantId, itemName, itemPrice, quantity) {
    const id = uuidv4();
    const subtotal = parseFloat(itemPrice) * parseInt(quantity);
    
    const query = `
      INSERT INTO order_items (id, order_id, menu_item_id, restaurant_id, item_name, item_price, quantity, subtotal)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, order_id, menu_item_id, restaurant_id, item_name, item_price, quantity, subtotal;
    `;
    const values = [id, orderId, menuItemId, restaurantId, itemName, itemPrice, quantity, subtotal];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  // Find items by order
  static async findByOrder(orderId) {
    const query = `
      SELECT id, order_id, menu_item_id, restaurant_id, item_name, item_price, quantity, subtotal
      FROM order_items
      WHERE order_id = $1;
    `;
    const result = await pool.query(query, [orderId]);
    return result.rows;
  }
}

module.exports = OrderItem;
