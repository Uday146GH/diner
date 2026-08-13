const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class MenuItem {
  // Create new item
  static async create(restaurantId, categoryId, name, price, description = null) {
    const id = uuidv4();
    const query = `
      INSERT INTO menu_items 
      (id, restaurant_id, category_id, name, description, price, is_available, is_veg, display_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, restaurant_id, category_id, name, description, price, image_url, is_available, is_veg, created_at;
    `;
    const values = [id, restaurantId, categoryId, name, description, price, true, true, 0];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  // Find item by ID
  static async findById(id) {
    const query = `
      SELECT id, restaurant_id, category_id, name, description, price, image_url, is_available, is_veg, display_order, created_at, updated_at
      FROM menu_items
      WHERE id = $1;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Find all items by category
  static async findByCategory(categoryId, includeUnavailable = false) {
    const query = `
      SELECT id, restaurant_id, category_id, name, description, price, image_url, is_available, is_veg, display_order, created_at
      FROM menu_items
      WHERE category_id = $1 ${includeUnavailable ? '' : 'AND is_available = true'}
      ORDER BY display_order ASC;
    `;
    const result = await pool.query(query, [categoryId]);
    return result.rows;
  }

  // Find all items by restaurant
  static async findByRestaurant(restaurantId) {
    const query = `
      SELECT id, restaurant_id, category_id, name, description, price, image_url, is_available, is_veg, display_order, created_at
      FROM menu_items
      WHERE restaurant_id = $1
      ORDER BY display_order ASC;
    `;
    const result = await pool.query(query, [restaurantId]);
    return result.rows;
  }

  // Update item
  static async update(id, updates) {
    const allowedFields = ['name', 'description', 'price', 'image_url', 'is_available', 'is_veg', 'display_order'];
    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    const query = `
      UPDATE menu_items
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING id, name, price, image_url, is_available, is_veg, updated_at;
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // Delete item
  static async delete(id) {
    const query = `
      DELETE FROM menu_items
      WHERE id = $1
      RETURNING id;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
}

module.exports = MenuItem;
