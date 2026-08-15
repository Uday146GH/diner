const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class QRCode {
  // Create QR code for restaurant
  static async create(restaurantId, code, url) {
    const id = uuidv4();
    const query = `
      INSERT INTO qr_codes (id, restaurant_id, code, url)
      VALUES ($1, $2, $3, $4)
      RETURNING id, restaurant_id, code, url, created_at;
    `;
    const values = [id, restaurantId, code, url];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  // Find QR code by restaurant ID
  static async findByRestaurant(restaurantId) {
    const query = `
      SELECT id, restaurant_id, code, url, created_at
      FROM qr_codes
      WHERE restaurant_id = $1;
    `;
    const result = await pool.query(query, [restaurantId]);
    return result.rows[0] || null;
  }

  // Find QR code by ID
  static async findById(id) {
    const query = `
      SELECT id, restaurant_id, code, url, created_at
      FROM qr_codes
      WHERE id = $1;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Update QR code
  static async update(id, code, url) {
    const query = `
      UPDATE qr_codes
      SET code = $1, url = $2
      WHERE id = $3
      RETURNING id, code, url;
    `;
    const result = await pool.query(query, [code, url, id]);
    return result.rows[0] || null;
  }

  // Delete QR code
  static async delete(id) {
    const query = `
      DELETE FROM qr_codes
      WHERE id = $1
      RETURNING id;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
}

module.exports = QRCode;
