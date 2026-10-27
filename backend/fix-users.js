const bcrypt = require('bcrypt');
const db = require('./src/db');

async function fixUsers() {
  try {
    // 1. Generate the hashes
    const adminHash = await bcrypt.hash('admin123', 10);
    const superHash = await bcrypt.hash('super123', 10);
    const attendantHash = await bcrypt.hash('att123', 10);

    // 2. Update or Insert the users
    await db.query(`
      INSERT INTO users (full_name, username, password_hash, role) 
      VALUES 
        ('Jane Wanjiru', 'admin', ?, 'admin'),
        ('Super Admin', 'super', ?, 'super_admin'),
        ('Peter Attendant', 'attendant', ?, 'attendant')
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)
    `, [adminHash, superHash, attendantHash]);

    console.log('✅ All users created/updated successfully with new passwords!');
    console.log('Admin: admin / admin123');
    console.log('Super: super / super123');
    console.log('Attendant: attendant / att123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

fixUsers();