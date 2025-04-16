const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// Connect to PgPool (assuming PgPool is running on localhost:7643)
const pool = new Pool({
  host: 'localhost', // PgPool's IP (localhost if it's running locally)
  user: 'user',
  database: 'postgres',
  password: 'password',
  port: 7643, // PgPool listens on this port
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Connection error:', err);
  } else {
    console.log('Connected:', res.rows);
  }
  // pool.end();
});

app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true }));

// Middleware to handle read queries (distributed to replicas)
const readMiddleware = async (req, res, next) => {
  if (req.method === 'GET') {
    // This is a read query, so we use load balancing (PgPool handles it)
    try {
      const result = await pool.query('SELECT * FROM test_table');
      res.json(result.rows);
    } catch (err) {
      console.error('Error executing query', err.stack);
      res.status(500).send('Internal Server Error');
    }
  } else {
    next(); // If not a GET request, proceed to the next middleware
  }
};

// Middleware to handle write queries (write to the primary)
const writeMiddleware = async (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    // This is a write query, which will go to the primary (PgPool will ensure this)
    try {
      // const result = await pool.query('SELECT NOW()'); // Example query to confirm connection
      next(); // Proceed to the next middleware (handle actual writes)
    } catch (err) {
      console.error('Error executing query', err.stack);
      res.status(500).send('Internal Server Error');
    }
  } else {
    next(); // Proceed to the next middleware if it's not a write request
  }
};

// Define a basic read endpoint for testing
app.get('/data', readMiddleware);

// Define a basic write endpoint for testing (insert data)
app.post('/data', writeMiddleware, async (req, res) => {
  const { data } = req.body;

  try {
    const query = 'INSERT INTO test_table (data) VALUES ($1) RETURNING *';
    const values = [data];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error inserting data', err.stack);
    res.status(500).send('Internal Server Error');
  }
});

// Define a basic update endpoint (update data)
app.put('/data/:id', writeMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const query = 'UPDATE test_table SET name = $1 WHERE id = $2 RETURNING *';
    const values = [name, id];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).send('Data not found');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating data', err.stack);
    res.status(500).send('Internal Server Error');
  }
});

// Define a basic delete endpoint (delete data)
app.delete('/data/:id', writeMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'DELETE FROM test_table WHERE id = $1 RETURNING *';
    const values = [id];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).send('Data not found');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error deleting data', err.stack);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
