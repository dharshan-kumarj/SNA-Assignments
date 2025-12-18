const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
// Serve static files from ../public (since backend is in a subdir but public is in root)
// However, in Docker, we will mount public or copy it.
// To satisfy the "zip with backend and public" structure, we assume relative path ../public
app.use(express.static(path.join(__dirname, '../public')));

// Database Configuration
const dbConfig = {
    host: process.env.DB_HOST || 'mysql-db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword',
    database: process.env.DB_NAME || 'student_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool;

// Connect to Database with Retry Logic
const connectWithRetry = () => {
    console.log('Attempting to connect to MySQL...');
    pool = mysql.createPool(dbConfig);

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('MySQL Connection Error:', err.code);
            console.log('Retrying in 5 seconds...');
            setTimeout(connectWithRetry, 5000);
        } else {
            console.log('Connected to MySQL Database.');
            initializeTable();
            connection.release();
        }
    });
};

function initializeTable() {
    const tableQuery = `
        CREATE TABLE IF NOT EXISTS students (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            course VARCHAR(255) NOT NULL,
            age INT NOT NULL
        )
    `;
    pool.query(tableQuery, (err) => {
        if (err) {
            console.error("Table creation error:", err);
        } else {
            console.log("Students table ready.");
        }
    });
}

connectWithRetry();

// Routes

// Get all students
app.get('/api/students', (req, res) => {
    if (!pool) return res.status(500).json({ error: "Database not connected" });

    pool.query("SELECT * FROM students ORDER BY id DESC", (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Create a new student
app.post('/api/students', (req, res) => {
    const { name, email, course, age } = req.body;
    const sql = "INSERT INTO students (name, email, course, age) VALUES (?,?,?,?)";

    pool.query(sql, [name, email, course, age], function (err, result) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": { id: result.insertId, name, email, course, age }
        });
    });
});

// Update a student
app.put('/api/students/:id', (req, res) => {
    const { name, email, course, age } = req.body;
    // Note: COALESCE works in MySQL too
    const sql = `UPDATE students SET 
                 name = COALESCE(?, name), 
                 email = COALESCE(?, email), 
                 course = COALESCE(?, course), 
                 age = COALESCE(?, age) 
                 WHERE id = ?`;

    pool.query(sql, [name, email, course, age, req.params.id], function (err, result) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "changes": result.affectedRows
        });
    });
});

// Delete a student
app.delete('/api/students/:id', (req, res) => {
    const sql = 'DELETE FROM students WHERE id = ?';

    pool.query(sql, [req.params.id], function (err, result) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "deleted", changes: result.affectedRows });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
