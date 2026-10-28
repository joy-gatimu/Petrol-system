
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // Enable TLS for the hosted database.
  // Set DB_SSL_CA to the downloaded CA certificate
  // when the provider requires certificate verification.
  ssl: process.env.DB_SSL_CA
    ? { ca: process.env.DB_SSL_CA }
    : undefined,

  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
