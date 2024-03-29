require('dotenv').config();


const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());


console.log({
    DB_USER: process.env.DB_USER,
    DB_HOST: process.env.DB_HOST,
    DB_NAME: process.env.DB_NAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_PORT: process.env.DB_PORT,
  });

// Setup your PostgreSQL connection here
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
  });


  const createTableQuery = `
  CREATE TABLE IF NOT EXISTS soda ( -- no need for quotes if your table name is lowercase
      id varchar PRIMARY KEY,
      credits integer,
      admin boolean,
      name text
  );
  `;
  

pool.query(createTableQuery, (err, result) => {
    if (err) {
        console.error('Error creating table:', err);
    } else {
        console.log('Table created successfully');
    }
});


app.get('/test-db', async (req, res) => {
    try {
      const queryResult = await pool.query('SELECT * FROM soda'); // Updated query to select all
      res.json(queryResult.rows); // Send all rows as a response
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

  app.get('/get-name/:id', async (req, res) => {
    const id = req.params.id; // Get the ID from the request parameters
    try {
      const queryResult = await pool.query('SELECT name FROM soda WHERE id = $1', [id]);
      if (queryResult.rows.length > 0) {
        res.json({ name: queryResult.rows[0].name });
      } else {
        res.status(404).json({ error: 'No record found with the given ID' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

app.get('/check-id/:nfcId', async (req, res) => {
  const nfcId = req.params.nfcId;
  try {
    const queryResult = await pool.query('SELECT EXISTS(SELECT 1 FROM soda WHERE id = $1)', [nfcId]);
    console.log(queryResult.rows); // Log to see what is being returned
    res.json({ exists: queryResult.rows[0].exists });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


  

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


