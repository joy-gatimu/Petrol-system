const db = require('../db');

async function logAction(userId, action, tableName, recordId) {
  try {
    await db.query(
      'INSERT INTO audit_logs (user_id, action, table_name, record_id) VALUES (?, ?, ?, ?)',
      [userId, action, tableName, recordId]
    );
  } catch (err) {
    console.error("Failed to write audit log:", err.message);
  }
}

module.exports = { logAction };