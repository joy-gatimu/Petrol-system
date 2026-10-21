-- 1. Create Database
DROP DATABASE IF EXISTS petrol_station_db;
CREATE DATABASE petrol_station_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE petrol_station_db;

-- 2. USERS Table
CREATE TABLE users (
    user_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'attendant') NOT NULL DEFAULT 'attendant',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. FUEL TYPES & PRICES
CREATE TABLE fuel_types (
    fuel_type_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(40) NOT NULL UNIQUE
);

CREATE TABLE fuel_prices (
    price_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    fuel_type_id INT UNSIGNED NOT NULL,
    price_per_litre DECIMAL(8,2) NOT NULL CHECK (price_per_litre > 0),
    effective_from DATE NOT NULL,
    FOREIGN KEY (fuel_type_id) REFERENCES fuel_types(fuel_type_id)
);

-- 4. TANKS & PUMPS
CREATE TABLE tanks (
    tank_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tank_name VARCHAR(40) NOT NULL UNIQUE,
    fuel_type_id INT UNSIGNED NOT NULL,
    capacity_litres DECIMAL(10,2) NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    FOREIGN KEY (fuel_type_id) REFERENCES fuel_types(fuel_type_id)
);

CREATE TABLE pumps (
    pump_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pump_name VARCHAR(40) NOT NULL UNIQUE,
    tank_id INT UNSIGNED NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    FOREIGN KEY (tank_id) REFERENCES tanks(tank_id)
);

-- 5. SUPPLIERS & DELIVERIES
CREATE TABLE suppliers (
    supplier_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20)
);

CREATE TABLE fuel_deliveries (
    delivery_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tank_id INT UNSIGNED NOT NULL,
    supplier_id INT UNSIGNED NOT NULL,
    delivery_date DATE NOT NULL,
    litres_received DECIMAL(10,2) NOT NULL,
    delivery_note_no VARCHAR(40) NOT NULL,
    recorded_by INT UNSIGNED,
    FOREIGN KEY (tank_id) REFERENCES tanks(tank_id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
    FOREIGN KEY (recorded_by) REFERENCES users(user_id)
);

-- 6. DAILY TRANSACTIONS (Readings & Dips)
CREATE TABLE pump_readings (
    reading_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pump_id INT UNSIGNED NOT NULL,
    reading_date DATE NOT NULL,
    opening_meter DECIMAL(12,2) NOT NULL,
    closing_meter DECIMAL(12,2) NOT NULL,
    unit_price DECIMAL(8,2) NOT NULL,
    litres_dispensed DECIMAL(12,2) GENERATED ALWAYS AS (closing_meter - opening_meter) STORED,
    sales_value DECIMAL(14,2) GENERATED ALWAYS AS ((closing_meter - opening_meter) * unit_price) STORED,
    recorded_by INT UNSIGNED,
    UNIQUE KEY (pump_id, reading_date),
    FOREIGN KEY (pump_id) REFERENCES pumps(pump_id),
    FOREIGN KEY (recorded_by) REFERENCES users(user_id)
);

CREATE TABLE tank_dips (
    dip_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tank_id INT UNSIGNED NOT NULL,
    dip_date DATE NOT NULL,
    opening_litres DECIMAL(10,2) NOT NULL,
    closing_litres DECIMAL(10,2) NOT NULL,
    recorded_by INT UNSIGNED,
    UNIQUE KEY (tank_id, dip_date),
    FOREIGN KEY (tank_id) REFERENCES tanks(tank_id),
    FOREIGN KEY (recorded_by) REFERENCES users(user_id)
);

-- 7. RECONCILIATIONS (Stock & Cash)
CREATE TABLE reconciliations (
    recon_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tank_id INT UNSIGNED NOT NULL,
    recon_date DATE NOT NULL,
    opening_stock DECIMAL(10,2) NOT NULL,
    deliveries DECIMAL(10,2) NOT NULL DEFAULT 0,
    litres_sold DECIMAL(10,2) NOT NULL,
    expected_closing DECIMAL(10,2) NOT NULL,
    actual_closing DECIMAL(10,2) NOT NULL,
    variance DECIMAL(10,2) GENERATED ALWAYS AS (actual_closing - expected_closing) STORED,
    status ENUM('balanced', 'shortage', 'surplus') NOT NULL,
    run_by INT UNSIGNED,
    UNIQUE KEY (tank_id, recon_date),
    FOREIGN KEY (tank_id) REFERENCES tanks(tank_id),
    FOREIGN KEY (run_by) REFERENCES users(user_id)
);

CREATE TABLE cash_reconciliations (
    cash_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    recon_date DATE NOT NULL UNIQUE,
    expected_sales DECIMAL(14,2) NOT NULL,
    actual_cash DECIMAL(14,2) NOT NULL DEFAULT 0,
    actual_mpesa DECIMAL(14,2) NOT NULL DEFAULT 0,
    actual_card DECIMAL(14,2) NOT NULL DEFAULT 0,
    variance DECIMAL(14,2) GENERATED ALWAYS AS ((actual_cash + actual_mpesa + actual_card) - expected_sales) STORED,
    status ENUM('balanced', 'shortage', 'surplus') NOT NULL,
    recorded_by INT UNSIGNED,
    FOREIGN KEY (recorded_by) REFERENCES users(user_id)
);

-- 8. AUDIT LOGS
CREATE TABLE audit_logs (
    log_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED,
    action VARCHAR(30) NOT NULL,
    table_name VARCHAR(40),
    record_id INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ==========================================
-- 9. SEED DATA
-- ==========================================

-- Add Admin User (Password is 'admin123')
INSERT INTO users (full_name, username, password_hash, role) VALUES 
('Jane Wanjiru', 'admin', '$2b$10$EPYcJ.uT8VqZkO4v3z1Y/eK5U5z1Y.O6m7Xq9z3Y5z1Y.O6m7Xq9', 'super_admin');

-- Add Fuel Types
INSERT INTO fuel_types (name) VALUES ('Super Petrol'), ('Diesel'), ('Kerosene');

-- Add Prices
INSERT INTO fuel_prices (fuel_type_id, price_per_litre, effective_from) VALUES 
(1, 205.00, '2026-10-01'),
(2, 195.00, '2026-10-01'),
(3, 180.00, '2026-10-01');

-- Add Tanks
INSERT INTO tanks (tank_name, fuel_type_id, capacity_litres) VALUES 
('Tank 1', 1, 15000.00),
('Tank 2', 2, 25000.00),
('Tank 3', 3, 10000.00);

-- Add Pumps
INSERT INTO pumps (pump_name, tank_id) VALUES 
('Pump 1', 1),
('Pump 2', 2),
('Pump 3', 3);

-- Add Suppliers
INSERT INTO suppliers (name, phone) VALUES ('Vivo Energy', '0700000000');

-- Add Initial Dips so tanks start FULL
INSERT INTO tank_dips (tank_id, dip_date, opening_litres, closing_litres, recorded_by) 
VALUES 
(1, CURDATE(), 15000.00, 15000.00, 1),
(2, CURDATE(), 25000.00, 25000.00, 1),
(3, CURDATE(), 10000.00, 10000.00, 1);