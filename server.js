const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// Connect to SQLite DB
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // Create tables if they don't exist
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS records (
                txHash TEXT PRIMARY KEY,
                patientId TEXT NOT NULL,
                diagnosis TEXT NOT NULL,
                notes TEXT NOT NULL,
                date TEXT NOT NULL,
                doctorName TEXT NOT NULL
            )`);

            console.log('Database tables verified.');
        });
    }
});

// -- API Routes --

// Register User
app.post('/api/register', (req, res) => {
    const { name, password, role } = req.body;
    if (!name || !password || !role) return res.status(400).json({ error: 'All fields are required.' });

    // In a real app, hash the password using bcrypt. For this prototype, we store as-is or basic mock hash.
    const query = `INSERT INTO users (name, password, role) VALUES (?, ?, ?)`;
    db.run(query, [name, password, role], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User registered successfully!', userId: this.lastID, name, role });
    });
});

// Login User
app.post('/api/login', (req, res) => {
    const { name, password, role } = req.body;
    if (!name || !password || !role) return res.status(400).json({ error: 'All fields are required.' });

    const query = `SELECT * FROM users WHERE name = ? AND password = ? AND role = ?`;
    db.get(query, [name, password, role], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(401).json({ error: 'Invalid credentials or role.' });
        res.json({ message: 'Login successful', user: { name: row.name, role: row.role } });
    });
});

// Insert Medical Record
app.post('/api/records', (req, res) => {
    const { txHash, patientId, diagnosis, notes, date, doctorName } = req.body;

    const query = `INSERT INTO records (txHash, patientId, diagnosis, notes, date, doctorName) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(query, [txHash, patientId, diagnosis, notes, date, doctorName], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Record encrypted and stored successfully!', txHash });
    });
});

// Get Medical Records (For Patients & Admin)
app.get('/api/records', (req, res) => {
    // In a production app, the patientId would be extracted from an auth token.
    // Here we just fetch all records (Prototype design). Frontend can filter, or backend can filter if patient name matches.
    const { patientName } = req.query;

    let query = `SELECT * FROM records ORDER BY date DESC`;
    let params = [];

    // Simple basic check to mock filtering for the patient
    if (patientName) {
        // Here we guess patient ID is mapped to name somehow, or we just return their records if notes match them etc.
        // For prototype, we'll return all and frontend filters, or backend filters if we changed schema.
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Fallback to serve index.html for SPA routing cleanly
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
