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

app.get('/get-credits/:nfcId', async (req, res) => {
  const nfcId = req.params.nfcId;
  try {
      // Fetch user's credits from the database based on the NFC ID
      const queryResult = await pool.query('SELECT credits FROM soda WHERE id = $1', [nfcId]);
      if (queryResult.rows.length > 0) {
          const credits = queryResult.rows[0].credits; // Assuming the user's credits are in the first row
          // Send the credits as a JSON response
          res.json({ credits });
      } else {
          res.status(404).json({ error: 'No record found with the given NFC ID' });
      }
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

app.get('/get-user-info/:nfcId', async (req, res) => {
  const nfcId = req.params.nfcId;
  try {
      const queryResult = await pool.query('SELECT name, credits FROM soda WHERE id = $1', [nfcId]);
      if (queryResult.rows.length > 0) {
          const userInfo = {
              name: queryResult.rows[0].name,
              credits: queryResult.rows[0].credits
          };
          res.json(userInfo);
      } else {
          res.status(404).json({ error: 'No record found with the given NFC ID' });
      }
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

app.put('/update-credits/:nfcId/:credits', async (req, res) => {
  const nfcId = req.params.nfcId;
  const credits = req.params.credits;
  try {
      // Update user's credits in the database
      await pool.query('UPDATE soda SET credits = $1 WHERE id = $2', [credits, nfcId]);
      res.sendStatus(200);
  } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Internal server error' });
  }
});





  

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


