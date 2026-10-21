const express = require('express');
const db = require('../db');
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
router.get('/audit', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100');
  res.json(rows);
});

module.exports = router;
