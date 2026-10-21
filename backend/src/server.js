const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

db.query('SELECT 1')
  .then(() => console.log('Connected to MySQL Database'))
  .catch((err) => console.error('Database connection failed:', err.message));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/master', require('./routes/master'));
app.use('/api/readings', require('./routes/readings'));
app.use('/api/reconciliation', require('./routes/reconciliation'));

app.get('/', (req, res) => res.send('Petrol Station API is running...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
