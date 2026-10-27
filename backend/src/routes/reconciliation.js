const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/stock', async (req, res) => {
  const { date } = req.query;
  try {
    const [tanks] = await db.query('SELECT * FROM tanks WHERE is_active = 1');
    const results = await Promise.all(tanks.map(async (tank) => {
      const [dips] = await db.query('SELECT * FROM tank_dips WHERE tank_id = ? AND dip_date = ?', [tank.tank_id, date]);
      const opening = dips.length > 0 ? Number(dips[0].opening_litres) : 0;
      const actual = dips.length > 0 ? Number(dips[0].closing_litres) : 0;

      const [delivs] = await db.query('SELECT SUM(litres_received) as total FROM fuel_deliveries WHERE tank_id = ? AND delivery_date = ?', [tank.tank_id, date]);
      const delivered = delivs[0].total ? Number(delivs[0].total) : 0;

      const [pumps] = await db.query('SELECT pump_id FROM pumps WHERE tank_id = ?', [tank.tank_id]);
      const pumpIds = pumps.map(p => p.pump_id);
      let sold = 0;
      if (pumpIds.length > 0) {
        const [readings] = await db.query('SELECT SUM(litres_dispensed) as total FROM pump_readings WHERE pump_id IN (?) AND reading_date = ?', [pumpIds, date]);
        sold = readings[0].total ? Number(readings[0].total) : 0;
      }

      const expected = opening + delivered - sold;
      const variance = actual - expected;
      let status = 'balanced';
      if (variance < -5) status = 'shortage';
      else if (variance > 5) status = 'surplus';

      return { 
        tank_id: tank.tank_id, tank_name: tank.tank_name, opening, deliveries: delivered, sold, expected, actual, variance, status, hasDip: dips.length > 0 
      };
    }));
    res.json(results);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/dashboard', async (req, res) => {
  const { date } = req.query;
  try {
    const [readings] = await db.query('SELECT SUM(litres_dispensed) as litres, SUM(sales_value) as sales FROM pump_readings WHERE reading_date = ?', [date]);
    const [tanks] = await db.query('SELECT t.*, f.name as fuelName FROM tanks t JOIN fuel_types f ON t.fuel_type_id = f.fuel_type_id WHERE t.is_active = 1');
    
    const dips = await Promise.all(tanks.map(async (tank) => {
      const [latest] = await db.query('SELECT * FROM tank_dips WHERE tank_id = ? AND dip_date <= ? ORDER BY dip_date DESC LIMIT 1', [tank.tank_id, date]);
      if (latest.length > 0) return { ...latest[0], closing_litres: Number(latest[0].closing_litres) };
      return null;
    }));

    const enrichedTanks = tanks.map(t => ({ ...t, capacity_litres: Number(t.capacity_litres) }));
    const [cashRecon] = await db.query('SELECT * FROM cash_reconciliations WHERE recon_date = ?', [date]);
    const cashDiscrepancy = cashRecon.length > 0 && cashRecon[0].status !== 'balanced' ? 1 : 0;

    const stockDiscrepancies = await Promise.all(tanks.map(async (tank) => {
       const [dips] = await db.query('SELECT * FROM tank_dips WHERE tank_id = ? AND dip_date = ?', [tank.tank_id, date]);
       const [delivs] = await db.query('SELECT SUM(litres_received) as total FROM fuel_deliveries WHERE tank_id = ? AND delivery_date = ?', [tank.tank_id, date]);
       const [pumps] = await db.query('SELECT pump_id FROM pumps WHERE tank_id = ?', [tank.tank_id]);
       const pumpIds = pumps.map(p => p.pump_id);
       let sold = 0;
       if (pumpIds.length > 0) {
         const [r] = await db.query('SELECT SUM(litres_dispensed) as total FROM pump_readings WHERE pump_id IN (?) AND reading_date = ?', [pumpIds, date]);
         sold = r[0].total ? Number(r[0].total) : 0;
       }
       const opening = dips.length > 0 ? Number(dips[0].opening_litres) : 0;
       const actual = dips.length > 0 ? Number(dips[0].closing_litres) : 0;
       const expected = opening + Number(delivs[0].total || 0) - sold;
       const variance = actual - expected;
       return (variance < -5 || variance > 5) ? 1 : 0;
    }));

    const totalStockDiscrepancies = stockDiscrepancies.reduce((a, b) => a + b, 0);

    res.json({
      totalLitres: readings[0].litres ? Number(readings[0].litres) : 0,
      totalSales: readings[0].sales ? Number(readings[0].sales) : 0,
      cashDiscrepancy,
      totalStockDiscrepancies, 
      tankCapacities: enrichedTanks,
      dips: dips.filter(d => d !== null)
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/expected-cash', async (req, res) => {
  const { date } = req.query;
  try {
    const [readings] = await db.query('SELECT SUM(litres_dispensed * unit_price) as expected FROM pump_readings WHERE reading_date = ?', [date]);
    const expected = readings[0].expected ? Number(readings[0].expected) : 0;
    res.json({ expectedCash: expected });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/cash/:date', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM cash_reconciliations WHERE recon_date = ?', [req.params.date]);
    res.json(rows.length > 0 ? rows[0] : null);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/cash', async (req, res) => {
  const { recon_date, expected_sales, actual_cash, actual_mpesa, actual_card } = req.body;
  const actualTotal = Number(actual_cash) + Number(actual_mpesa) + Number(actual_card);
  const variance = actualTotal - Number(expected_sales);
  let status = 'balanced';
  if (variance < -5) status = 'shortage';
  else if (variance > 5) status = 'surplus';

  try {
    await db.query(`
      INSERT INTO cash_reconciliations (recon_date, expected_sales, actual_cash, actual_mpesa, actual_card, status, recorded_by)
      VALUES (?, ?, ?, ?, ?, ?, 1)
      ON DUPLICATE KEY UPDATE 
        expected_sales = VALUES(expected_sales), actual_cash = VALUES(actual_cash),
        actual_mpesa = VALUES(actual_mpesa), actual_card = VALUES(actual_card), status = VALUES(status)
    `, [recon_date, expected_sales, actual_cash, actual_mpesa, actual_card, status]);
    res.status(201).json({ message: 'Cash saved' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.delete('/cash/:date', async (req, res) => {
  try {
    await db.query('DELETE FROM cash_reconciliations WHERE recon_date = ?', [req.params.date]);
    res.json({ message: 'Cash record deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/monthly', async (req, res) => {
  const { year, month } = req.query;
  try {
    const prefix = `${year}-${String(month).padStart(2, "0")}`;
    const [rows] = await db.query(`
      SELECT p.pump_name as pump, SUM(pr.litres_dispensed) as litres, SUM(pr.sales_value) as sales
      FROM pump_readings pr JOIN pumps p ON pr.pump_id = p.pump_id
      WHERE pr.reading_date LIKE ? GROUP BY p.pump_id ORDER BY p.pump_name
    `, [`${prefix}%`]);
    res.json(rows);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;