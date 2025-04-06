const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const session = require('express-session');

app.use(session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: true
}));


// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (HTML, CSS, JS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'vehicle_rental'
});

db.connect((err) => {
    if (err) throw err;
    console.log('✅ MySQL Connected...');
});

// Routes
// Serve your main login/register page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Registration route
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).send('Please fill in all fields');
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(sql, [name, email, hashedPassword], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).send('Email already registered');
            }
            return res.status(500).send('Server error');
        }
        res.send('✅ User registered successfully');
    });
});

// Login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (err, results) => {
        if (err) return res.status(500).send('Server error');
        if (results.length === 0) return res.status(400).send('User not found');

        const user = results[0];
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) return res.status(401).send('Invalid password');

        // ✅ Save user's name in session
        req.session.user = {
            name: user.name,
            email: user.email
        };

        // Redirect to homepage or dashboard
        res.redirect('/');
    });
});

//user
app.get('/user', (req, res) => {
    if (req.session.user) {
        res.json({
            loggedIn: true,
            name: req.session.user.name
        });
    } else {
        res.json({ loggedIn: false });
    }
});
//log out
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Logout failed');
        }
        res.clearCookie('connect.sid');
        res.redirect('/'); // Redirect to homepage after logout
    });
});


// Start server
app.listen(3000, () => {
    console.log('🚀 Server running at http://localhost:3000');
});
