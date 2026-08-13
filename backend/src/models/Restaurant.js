const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Restaurant {
  // Create new restaurant
  static async create(ownerId, name, slug) {
    const id = uuidv4();
    const query = `
      INSERT INTO restaurants (id, owner_id, name, slug, status, subscription_tier)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, owner_id, name, slug, status, subscription_tier, created_at;
    `;
    const values = [id, ownerId, name, slug, 'active', 'free'];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (err) {
      if (err.code === '23505') { // Unique constraint violation
        throw new Error('Restaurant name or slug already exists');
      }
      throw err;
    }
  }

  // Find restaurant by ID
  static async findById(id) {
    const query = `
      SELECT id, owner_id, name, slug, logo_url, description, phone, email, 
             address, city, status, subscription_tier, created_at, updated_at
      FROM restaurants
      WHERE id = $1;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Find restaurant by slug
  static async findBySlug(slug) {
    const query = `
      SELECT id, owner_id, name, slug, logo_url, description, phone, email, 
             address, city, status, subscription_tier, created_at
      FROM restaurants
      WHERE slug = $1;
    `;
    const result = await pool.query(query, [slug]);
    return result.rows[0] || null;
  }

  // Find restaurant by owner ID
  static async findByOwnerId(ownerId) {
    const query = `
      SELECT id, owner_id, name, slug, logo_url, description, phone, email, 
             address, city, status, subscription_tier, created_at, updated_at
      FROM restaurants
      WHERE owner_id = $1;
    `;
    const result = await pool.query(query, [ownerId]);
    return result.rows[0] || null;
  }

  // Update restaurant
  static async update(id, updates) {
    const allowedFields = ['name', 'logo_url', 'description', 'phone', 'email', 'address', 'city'];
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
      UPDATE restaurants
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING id, name, slug, logo_url, description, phone, email, address, city, updated_at;
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // Check if slug exists
  static async slugExists(slug) {
    const query = `SELECT id FROM restaurants WHERE slug = $1;`;
    const result = await pool.query(query, [slug]);
    return result.rows.length > 0;
  }
}

module.exports = Restaurant;
