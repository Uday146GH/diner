const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class User {
  // Create new user
  static async create(email, passwordHash, fullName = null) {
    const id = uuidv4();
    const query = `
      INSERT INTO users (id, email, password_hash, full_name, role, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, full_name, role, created_at;
    `;
    const values = [id, email, passwordHash, fullName, 'owner', true];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (err) {
      if (err.code === '23505') { // Unique constraint violation
        throw new Error('Email already exists');
      }
      throw err;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    const query = `
      SELECT id, email, password_hash, full_name, role, is_active, created_at
      FROM users
      WHERE email = $1;
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  // Find user by ID
  static async findById(id) {
    const query = `
      SELECT id, email, full_name, role, is_active, created_at
      FROM users
      WHERE id = $1;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Update user
  static async update(id, updates) {
    const allowedFields = ['full_name', 'email'];
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
      UPDATE users
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING id, email, full_name, role, created_at, updated_at;
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // Deactivate user
  static async deactivate(id) {
    const query = `
      UPDATE users
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
      RETURNING id, email, is_active;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
}

module.exports = User;
