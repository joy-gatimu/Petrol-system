export const users = [
  { user_id: 1, full_name: "Jane Wanjiru", username: "admin", password: "admin123", role: "admin", is_active: 1 },
  { user_id: 2, full_name: "Super Admin", username: "super", password: "super123", role: "super_admin", is_active: 1 },
  { user_id: 3, full_name: "Peter Attendant", username: "attendant", password: "att123", role: "attendant", is_active: 1 },
];

export const fuelTypes = [
  { fuel_type_id: 1, name: "Super Petrol" },
  { fuel_type_id: 2, name: "Diesel" },
  { fuel_type_id: 3, name: "Kerosene" },
];

export const prices = [
  { price_id: 1, fuel_type_id: 1, price_per_litre: 205.0, effective_from: "2026-10-01" },
  { price_id: 2, fuel_type_id: 2, price_per_litre: 195.0, effective_from: "2026-10-01" },
  { price_id: 3, fuel_type_id: 3, price_per_litre: 180.0, effective_from: "2026-10-01" },
];

export const tanks = [
  { tank_id: 1, tank_name: "Tank 1", fuel_type_id: 1, capacity_litres: 15000, is_active: 1 },
  { tank_id: 2, tank_name: "Tank 2", fuel_type_id: 2, capacity_litres: 25000, is_active: 1 },
  { tank_id: 3, tank_name: "Tank 3", fuel_type_id: 3, capacity_litres: 10000, is_active: 1 },
];

export const pumps = [
  { pump_id: 1, pump_name: "Pump 1", tank_id: 1, is_active: 1 },
  { pump_id: 2, pump_name: "Pump 2", tank_id: 2, is_active: 1 },
  { pump_id: 3, pump_name: "Pump 3", tank_id: 3, is_active: 1 },
];

export const suppliers = [
  { supplier_id: 1, name: "Vivo Energy", phone: "0700000000" },
];

export const readings = [
  { reading_id: 1, pump_id: 1, reading_date: "2026-10-14", opening_meter: 124900, closing_meter: 125430, unit_price: 205, litres_dispensed: 530, sales_value: 108650 },
  { reading_id: 2, pump_id: 2, reading_date: "2026-10-14", opening_meter: 88120, closing_meter: 88640.5, unit_price: 195, litres_dispensed: 520.5, sales_value: 106702.5 },
  { reading_id: 3, pump_id: 1, reading_date: "2026-10-13", opening_meter: 124380, closing_meter: 124900, unit_price: 205, litres_dispensed: 520, sales_value: 106600 },
];

export const dips = [
  { dip_id: 1, tank_id: 1, dip_date: "2026-10-15", opening_litres: 12000, closing_litres: 10172 },
  { dip_id: 2, tank_id: 2, dip_date: "2026-10-15", opening_litres: 9500, closing_litres: 11492 },
  { dip_id: 3, tank_id: 3, dip_date: "2026-10-15", opening_litres: 2100, closing_litres: 1918 },
];

export const deliveries = [
  { delivery_id: 1, tank_id: 2, supplier_id: 1, delivery_date: "2026-10-15", litres_received: 5000, delivery_note_no: "DN-1001" },
];

export const auditLogs = [
  { log_id: 1, user_id: 1, action: "LOGIN", table_name: "users", record_id: 1, created_at: "2026-10-15T08:12:00" },
  { log_id: 2, user_id: 1, action: "CREATE", table_name: "pump_readings", record_id: 1, created_at: "2026-10-15T09:30:00" },
];

export const VARIANCE_TOLERANCE = 5;