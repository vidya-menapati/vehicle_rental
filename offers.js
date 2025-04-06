const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();

// Allow Cross-Origin requests (CORS)
app.use(cors());

// Middleware for parsing JSON data
app.use(express.json());

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'rental_db'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL Connected...');
});

// Handle booking POST request
app.post('/book', (req, res) => {
    const { offer_id, price } = req.body;

    const sql = 'INSERT INTO bookings (offer_id, price, payment_status) VALUES (?, ?, ?)';
    db.query(sql, [offer_id, price, 'pending'], (err, result) => {
        if (err) throw err;
        res.send('Booking ID: ' + result.insertId);
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
