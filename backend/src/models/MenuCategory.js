const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class MenuCategory {
  // Create new category
  static async create(restaurantId, name, description = null) {
    const id = uuidv4();
    const query = `
      INSERT INTO menu_categories (id, restaurant_id, name, description, display_order, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, restaurant_id, name, description, display_order, is_active, created_at;
    `;
    const values = [id, restaurantId, name, description, 0, true];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  // Find category by ID
  static async findById(id) {
    const query = `
      SELECT id, restaurant_id, name, description, display_order, is_active, created_at, updated_at
      FROM menu_categories
      WHERE id = $1;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Find all categories by restaurant
  static async findByRestaurant(restaurantId, includeInactive = false) {
    const query = `
      SELECT id, restaurant_id, name, description, display_order, is_active, created_at
      FROM menu_categories
      WHERE restaurant_id = $1 ${includeInactive ? '' : 'AND is_active = true'}
      ORDER BY display_order ASC;
    `;
    const result = await pool.query(query, [restaurantId]);
    return result.rows;
  }

  // Update category
  static async update(id, updates) {
    const allowedFields = ['name', 'description', 'display_order', 'is_active'];
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
      UPDATE menu_categories
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING id, name, description, display_order, is_active, updated_at;
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // Delete category (soft delete)
  static async delete(id) {
    const query = `
      UPDATE menu_categories
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
      RETURNING id, is_active;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
}

module.exports = MenuCategory;
