require('dotenv').config();


const express = require('express');
const sanitizeHtml = require('sanitize-html');
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


app.put('/modify-credits/:userName/:creditsToAdd', async (req, res) => {
  // Directly extracting parameters from the request
  let userName = req.params.userName;
  let creditsToAdd = parseInt(req.params.creditsToAdd);

  // Sanitize userName to prevent XSS attacks
  userName = sanitizeHtml(userName, {
    allowedTags: [], // Ensuring only text is allowed
    allowedAttributes: {}
  });

  // Validate creditsToAdd to ensure it's a valid number after parsing
  if (isNaN(creditsToAdd)) {
    return res.status(400).send('Invalid credits amount');
  }

  console.log('Modifying credits for user:', userName);
  console.log('Credits to add:', creditsToAdd);
  
  try {
      // Fetch the user's current credits
      const queryResult = await pool.query('SELECT credits FROM soda WHERE LOWER(name) = LOWER($1)', [userName.toLowerCase()]);
      console.log('Query result:', queryResult.rows);
      if (queryResult.rows.length > 0) {
          const currentCredits = queryResult.rows[0].credits;
          const updatedCredits = currentCredits + creditsToAdd;
          // Update user's credits in the database
          await pool.query('UPDATE soda SET credits = $1 WHERE LOWER(name) = LOWER($2)', [updatedCredits, userName.toLowerCase()]);
          console.log('Credits updated successfully.');
          res.sendStatus(200);
      } else {
          console.log('User not found.');
          res.status(404).json({ error: 'User not found' });
      }
  } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/add-user', async (req, res) => {
  let { id, name } = req.body;
  // Sanitize inputs to prevent XSS attacks
  id = sanitizeHtml(id);
  name = sanitizeHtml(name);

  console.log('Adding user:', name, 'with ID:', id);

  if (!id || !name) {
    return res.status(400).json({ error: 'ID and name are required' });
  }

  try {
    // Check if the user already exists
    const userExistsQuery = await pool.query('SELECT EXISTS(SELECT 1 FROM soda WHERE id = $1)', [id]);
    const userExists = userExistsQuery.rows[0].exists;

    if (userExists) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Insert the new user into the database
    await pool.query('INSERT INTO soda (id, name) VALUES ($1, $2)', [id, name]);
    console.log('User added successfully.');
    res.sendStatus(201); // 201: Created
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});










  

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


