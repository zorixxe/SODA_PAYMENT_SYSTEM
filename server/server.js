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




// Endpoint to get all user names
app.get('/get-user-names', async (req, res) => {
  try {
    const queryResult = await pool.query('SELECT id, name FROM soda ORDER BY name ASC');
    res.json(queryResult.rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Internal server error' });
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
      // Fetch user's credits and cans from the database based on the NFC ID
      const queryResult = await pool.query('SELECT credits, cans FROM soda WHERE id = $1', [nfcId]);
      if (queryResult.rows.length > 0) {
          const { credits, cans } = queryResult.rows[0];
          // Send the credits and cans as a JSON response
          res.json({ credits, cans });
      } else {
          res.status(404).json({ error: 'No record found with the given NFC ID' });
      }
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});



app.put('/update-credits/:nfcId', async (req, res) => {
  const nfcId = req.params.nfcId;

  try {
      // Start a database transaction
      await pool.query('BEGIN');
      
      // Fetch the current user's credits and cans
      const selectResult = await pool.query('SELECT credits, cans FROM soda WHERE id = $1 FOR UPDATE', [nfcId]);
      if (selectResult.rows.length === 0) {
          // If the user doesn't exist, rollback and return an error
          await pool.query('ROLLBACK');
          return res.status(404).json({ error: 'No record found with the given NFC ID' });
      }

      const currentCredits = selectResult.rows[0].credits;
      const currentCans = selectResult.rows[0].cans;

      // Update credits and cans, and commit the transaction
      const updatedCredits = currentCredits - 1; // Subtract 1 credit
      const updatedCans = currentCans + 1; // Increment cans by 1

      // Ensure updatedCredits is not negative
      if (updatedCredits < 0) {
          await pool.query('ROLLBACK');
          return res.status(400).json({ error: 'Insufficient credits' });
      }

      const updateQuery = 'UPDATE soda SET credits = $1, cans = $2 WHERE id = $3';
      await pool.query(updateQuery, [updatedCredits, updatedCans, nfcId]);
      await pool.query('COMMIT');

      res.sendStatus(200);
  } catch (err) {
      // If any error occurs, rollback the transaction
      await pool.query('ROLLBACK');
      console.error('Database error:', err);
      res.status(500).json({ error: 'Internal server error' });
  }
});









app.put('/modify-credits/:userId/:creditsToAdd', async (req, res) => {
  let userId = req.params.userId;
  let creditsToAdd = parseInt(req.params.creditsToAdd);

  // You might not need to sanitize userId if it's always an alphanumeric string
  userId = sanitizeHtml(userId);

  // Validate creditsToAdd to ensure it's a valid number after parsing
  if (isNaN(creditsToAdd)) {
    return res.status(400).send('Invalid credits amount');
  }

  console.log('Modifying credits for user ID:', userId);
  console.log('Credits to add:', creditsToAdd);

  try {
    // Fetch the user's current credits using the id
    const queryResult = await pool.query('SELECT credits FROM soda WHERE id = $1', [userId]);
    console.log('Query result:', queryResult.rows);
    if (queryResult.rows.length > 0) {
        const currentCredits = queryResult.rows[0].credits;
        const updatedCredits = currentCredits + creditsToAdd;
        // Update user's credits in the database using the id
        await pool.query('UPDATE soda SET credits = $1 WHERE id = $2', [updatedCredits, userId]);
        console.log('Credits updated successfully.');
        res.sendStatus(200);
    } else {
        console.log('User ID not found.');
        res.status(404).json({ error: 'User ID not found' });
    }
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.get('/get-user-info/:nfcId', async (req, res) => {
  const nfcId = req.params.nfcId;
  try {
      const queryResult = await pool.query('SELECT name, credits, cans, admin FROM soda WHERE id = $1', [nfcId]);
      if (queryResult.rows.length > 0) {
          const userInfo = {
              name: queryResult.rows[0].name,
              credits: queryResult.rows[0].credits,
              cans: queryResult.rows[0].cans,
              admin: queryResult.rows[0].admin // Include the admin status
          };
          res.json(userInfo);
      } else {
          res.status(404).json({ error: 'No record found with the given NFC ID' });
      }
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

app.put('/modify-credits/:userName/:creditsToAdd', async (req, res) => {
  // Directly extracting parameters from the request
  let userName = req.params.userName;
  let creditsToAdd = parseInt(req.params.creditsToAdd);
  console.log(`Executing query: SELECT credits FROM soda WHERE LOWER(name) = LOWER($1)`, userName.toLowerCase());


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


