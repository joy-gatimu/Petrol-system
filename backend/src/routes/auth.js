const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ? AND is_active = 1', [username]);
    if (rows.length === 0) return res.status(401).json({ message: 'Invalid username or password' });
    
    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ message: 'Invalid username or password' });

    const token = jwt.sign({ user_id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
    const { password_hash, ...safeUser } = user;
    
    res.json({ token, user: safeUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
