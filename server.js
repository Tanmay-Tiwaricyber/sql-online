const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Allow cross-origin requests (for development purposes)
app.use(cors());

// Parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Initialize an in-memory SQLite database
const db = new sqlite3.Database(':memory:');

// Create a default table for testing
db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)');
});

// Endpoint to execute SQL commands
app.post('/execute', (req, res) => {
    const sql = req.body.query.trim();

    // Handle unsupported SHOW command
    if (sql.toLowerCase().startsWith('show')) {
        return res.status(400).json({
            error: 'SQLite does not support the SHOW command. Use the following to list tables:\nSELECT name FROM sqlite_master WHERE type=\'table\';'
        });
    }

    // Handle unsupported DESCRIBE command
    if (sql.toLowerCase().startsWith('describe')) {
        const tableName = sql.split(' ')[1]; // Extract table name
        if (!tableName) {
            return res.status(400).json({
                error: 'Table name is required for DESCRIBE command.'
            });
        }
        // Use PRAGMA to describe the table
        const pragmaSql = `PRAGMA table_info(${tableName});`;

        db.all(pragmaSql, [], (err, rows) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.json({ data: rows });
        });
        return; // Exit the function after handling DESCRIBE
    }

    // Handle other potential unsupported SQL commands
    const unsupportedCommands = ['DROP DATABASE']; // Add more if needed
    for (let command of unsupportedCommands) {
        if (sql.toUpperCase().includes(command)) {
            return res.status(400).json({
                error: `The command "${command}" is not supported in SQLite.`
            });
        }
    }

    // Execute the SQL command
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ data: rows });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`SQL compiler running at http://localhost:${port}`);
});
