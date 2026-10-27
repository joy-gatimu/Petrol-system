const express = require('express');
const db = require('../db');
const { logAction } = require('../utils/audit');
const router = express.Router();

// --- PUMP READINGS ---
router.get('/', async (req, res) => {
  const { date } = req.query;
  const [rows] = await db.query('SELECT * FROM pump_readings WHERE reading_date = ?', [date]);
  res.json(rows);
});

router.get('/last/:pump_id', async (req, res) => {
  const { date } = req.query;
  try {
    const [rows] = await db.query(
      'SELECT closing_meter FROM pump_readings WHERE pump_id = ? AND reading_date < ? ORDER BY reading_date DESC LIMIT 1',
      [req.params.pump_id, date]
    );
    res.json(rows.length > 0 ? rows[0] : { closing_meter: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/pumps', async (req, res) => {
  const { pump_id, reading_date, opening_meter, closing_meter, unit_price } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO pump_readings (pump_id, reading_date, opening_meter, closing_meter, unit_price, recorded_by) VALUES (?, ?, ?, ?, ?, 1)',
      [pump_id, reading_date, opening_meter, closing_meter, unit_price]
    );
    await logAction(1, 'CREATE_READING', 'pump_readings', result.insertId);
    res.status(201).json({ message: 'Reading saved' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/pumps/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM pump_readings WHERE reading_id = ?', [req.params.id]);
    await logAction(1, 'DELETE_READING', 'pump_readings', req.params.id);
    res.json({ message: 'Reading deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- TANK DIPS ---
router.get('/dips', async (req, res) => {
  const { date } = req.query;
  const [rows] = await db.query('SELECT * FROM tank_dips WHERE dip_date = ?', [date]);
  res.json(rows);
});

router.post('/dips', async (req, res) => {
  const { tank_id, dip_date, opening_litres, closing_litres } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO tank_dips (tank_id, dip_date, opening_litres, closing_litres, recorded_by) VALUES (?, ?, ?, ?, 1)',
      [tank_id, dip_date, opening_litres, closing_litres]
    );
    await logAction(1, 'CREATE_DIP', 'tank_dips', result.insertId);
    res.status(201).json({ message: 'Dip saved' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/dips/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM tank_dips WHERE dip_id = ?', [req.params.id]);
    await logAction(1, 'DELETE_DIP', 'tank_dips', req.params.id);
    res.json({ message: 'Dip deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- DELIVERIES ---
router.get('/deliveries', async (req, res) => {
  const { date } = req.query;
  const [rows] = await db.query('SELECT * FROM fuel_deliveries WHERE delivery_date = ?', [date]);
  res.json(rows);
});

router.post('/deliveries', async (req, res) => {
  const { tank_id, supplier_id, delivery_date, litres_received, delivery_note_no } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO fuel_deliveries (tank_id, supplier_id, delivery_date, litres_received, delivery_note_no, recorded_by) VALUES (?, ?, ?, ?, ?, 1)',
      [tank_id, supplier_id, delivery_date, litres_received, delivery_note_no]
    );
    await logAction(1, 'CREATE_DELIVERY', 'fuel_deliveries', result.insertId);
    res.status(201).json({ message: 'Delivery saved' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/deliveries/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM fuel_deliveries WHERE delivery_id = ?', [req.params.id]);
    await logAction(1, 'DELETE_DELIVERY', 'fuel_deliveries', req.params.id);
    res.json({ message: 'Delivery deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;