const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(express.json());  // Middleware to parse JSON request bodies

// Setup the SQLite database connection
const dbPath = path.resolve(__dirname, 'mars.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create the credit_scores table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS credit_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      score INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
});

// Routes for Credit Scores
// GET all credit scores
app.get('/creditscores', (req, res) => {
  db.all('SELECT * FROM credit_scores', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ creditScores: rows });
  });
});

// GET a specific credit score by ID
app.get('/creditscores/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM credit_scores WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: 'Credit score not found' });
    }
    res.json({ creditScore: row });
  });
});

// POST a new credit score
app.post('/creditscores', (req, res) => {
  const { score, user_id } = req.body;
  const query = 'INSERT INTO credit_scores (score, user_id) VALUES (?, ?)';
  db.run(query, [score, user_id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Credit score added successfully', id: this.lastID });
  });
});

// PUT to update an existing credit score
app.put('/creditscores/:id', (req, res) => {
  const { score } = req.body;
  const { id } = req.params;
  const query = 'UPDATE credit_scores SET score = ? WHERE id = ?';

  db.run(query, [score, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Credit score updated successfully', changes: this.changes });
  });
});

// DELETE a credit score by ID
app.delete('/creditscores/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM credit_scores WHERE id = ?';

  db.run(query, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Credit score deleted successfully', changes: this.changes });
  });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


