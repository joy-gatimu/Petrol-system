const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();

// CORS Configuration: Allows your Vercel frontend to talk to this Render backend
const allowedOrigins = [
  process.env.CORS_ORIGIN, 
  "http://localhost:5173", 
  "http://localhost:3000"
].filter(Boolean); // Removes any undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes("vercel.app")) {
      return callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Test Database Connection
db.query('SELECT 1')
  .then(() => console.log('✅ Connected to MySQL Database'))
  .catch((err) => console.error('❌ Database connection failed:', err.message));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/master', require('./routes/master'));
app.use('/api/readings', require('./routes/readings'));
app.use('/api/reconciliation', require('./routes/reconciliation'));

// Health check route
app.get('/', (req, res) => res.send('Petrol Station API is running...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});