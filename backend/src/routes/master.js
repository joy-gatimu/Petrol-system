const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const { logAction } = require('../utils/audit');
const router = express.Router();

router.get('/pumps', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM pumps WHERE is_active = 1');
  res.json(rows);
});

router.get('/tanks', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM tanks WHERE is_active = 1');
  res.json(rows);
});

router.get('/fuel-types', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM fuel_types');
  res.json(rows);
});

router.get('/prices', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM fuel_prices ORDER BY effective_from DESC');
  res.json(rows);
});

router.get('/suppliers', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM suppliers');
  res.json(rows);
});

router.get('/users', async (req, res) => {
  const [rows] = await db.query('SELECT user_id, full_name, username, role, is_active FROM users');
  res.json(rows);
});

router.post('/users', async (req, res) => {
  const { full_name, username, password, role } = req.body;
  
  try {
    const [existing] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existing.length > 0) return res.status(400).json({ message: 'Username already exists' });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      'INSERT INTO users (full_name, username, password_hash, role) VALUES (?, ?, ?, ?)',
      [full_name, username, password_hash, role]
    );

    // LOG THE ACTION (Assuming user_id 1 is the Super Admin creating this)
    await logAction(1, 'CREATE_USER', 'users', result.insertId);

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/audit', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100');
  res.json(rows);
});

module.exports = router;