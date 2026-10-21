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

      return { tank_id: tank.tank_id, tank_name: tank.tank_name, opening, deliveries: delivered, sold, expected, actual, variance, status, hasDip: dips.length > 0 };
    }));
    res.json(results);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.get('/dashboard', async (req, res) => {
  const { date } = req.query;
  try {
    const [readings] = await db.query('SELECT SUM(litres_dispensed) as litres, SUM(sales_value) as sales FROM pump_readings WHERE reading_date = ?', [date]);
    
    // We add capacity_litres here so it comes as a number
    const [tanks] = await db.query(`
      SELECT t.tank_id, t.tank_name, t.capacity_litres, f.name as fuelName 
      FROM tanks t 
      JOIN fuel_types f ON t.fuel_type_id = f.fuel_type_id 
      WHERE t.is_active = 1
    `);

    const dips = await Promise.all(tanks.map(async (tank) => {
      const [latest] = await db.query('SELECT * FROM tank_dips WHERE tank_id = ? ORDER BY dip_date DESC LIMIT 1', [tank.tank_id]);
      if (latest.length > 0) {
        return {
          ...latest[0],
          closing_litres: Number(latest[0].closing_litres) // Force number
        };
      }
      return null;
    }));

    const enrichedTanks = tanks.map(t => ({
      ...t,
      capacity_litres: Number(t.capacity_litres) // Force number
    }));

    res.json({
      totalLitres: readings[0].litres ? Number(readings[0].litres) : 0,
      totalSales: readings[0].sales ? Number(readings[0].sales) : 0,
      tankCapacities: enrichedTanks,
      dips: dips.filter(d => d !== null)
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;