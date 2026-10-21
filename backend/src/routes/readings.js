const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  const { date } = req.query;
  const [rows] = await db.query('SELECT * FROM pump_readings WHERE reading_date = ?', [date]);
  res.json(rows);
});
router.post('/pumps', async (req, res) => {
  const { pump_id, reading_date, opening_meter, closing_meter, unit_price } = req.body;
  try {
    await db.query('INSERT INTO pump_readings (pump_id, reading_date, opening_meter, closing_meter, unit_price, recorded_by) VALUES (?, ?, ?, ?, ?, 1)', [pump_id, reading_date, opening_meter, closing_meter, unit_price]);
    res.status(201).json({ message: 'Reading saved' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.delete('/pumps/:id', async (req, res) => {
  await db.query('DELETE FROM pump_readings WHERE reading_id = ?', [req.params.id]);
  res.json({ message: 'Reading deleted' });
});

router.get('/dips', async (req, res) => {
  const { date } = req.query;
  const [rows] = await db.query('SELECT * FROM tank_dips WHERE dip_date = ?', [date]);
  res.json(rows);
});
router.post('/dips', async (req, res) => {
  const { tank_id, dip_date, opening_litres, closing_litres } = req.body;
  try {
    await db.query('INSERT INTO tank_dips (tank_id, dip_date, opening_litres, closing_litres, recorded_by) VALUES (?, ?, ?, ?, 1)', [tank_id, dip_date, opening_litres, closing_litres]);
    res.status(201).json({ message: 'Dip saved' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.delete('/dips/:id', async (req, res) => {
  await db.query('DELETE FROM tank_dips WHERE dip_id = ?', [req.params.id]);
  res.json({ message: 'Dip deleted' });
});

router.get('/deliveries', async (req, res) => {
  const { date } = req.query;
  const [rows] = await db.query('SELECT * FROM fuel_deliveries WHERE delivery_date = ?', [date]);
  res.json(rows);
});
router.post('/deliveries', async (req, res) => {
  const { tank_id, supplier_id, delivery_date, litres_received, delivery_note_no } = req.body;
  try {
    await db.query('INSERT INTO fuel_deliveries (tank_id, supplier_id, delivery_date, litres_received, delivery_note_no, recorded_by) VALUES (?, ?, ?, ?, ?, 1)', [tank_id, supplier_id, delivery_date, litres_received, delivery_note_no]);
    res.status(201).json({ message: 'Delivery saved' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.delete('/deliveries/:id', async (req, res) => {
  await db.query('DELETE FROM fuel_deliveries WHERE delivery_id = ?', [req.params.id]);
  res.json({ message: 'Delivery deleted' });
});

module.exports = router;
