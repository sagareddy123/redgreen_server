const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());


// In-memory user storage
const users = [];

// Secret key for JWT
const JWT_SECRET = 'your_jwt_secret';


const mysql = require('mysql2');
const cron = require('node-cron');

// Database connection configuration
const dbConfig = {
  host: 'srv873.hstgr.io',
  user: 'u109247860_gameWin',
  password: 'Sury@1729',
  database: 'u109247860_RedGreen',
  waitForConnections: true,
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Promisify the query function for easier async/await usage
const query = promisify(pool.query).bind(pool);

// Function to create a new game with the current UTC timestamp
const createNewGame = async () => {
  try {
    const insertQuery = 'INSERT INTO red_green_game (game_started_time) VALUES (UTC_TIMESTAMP())';
    await query(insertQuery);
    console.log('New game created at', new Date().toISOString());
  } catch (error) {
    console.error('Error inserting new game:', error);
  }
};

// Function to initialize the first game if the table is empty
const initializeGame = async () => {
  try {
    const checkQuery = 'SELECT COUNT(*) AS count FROM red_green_game';
    const results = await query(checkQuery);
    if (results[0].count === 0) {
      await createNewGame();
    }
  } catch (error) {
    console.error('Error checking table:', error);
  }
};

// Initialize the first game if the table is empty
initializeGame();

// Schedule the task to create a new game every 135 seconds (2 minutes and 15 seconds)
setInterval(createNewGame, 135 * 1000);

console.log('Scheduled tasks are running...');


// // Register endpoint
// app.post('/register', async (req, res) => {
//     const { username, password } = req.body;
//     if (!username || !password) {
//         return res.status(400).send('Username and password are required');
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     users.push({ username, password: hashedPassword });

//     res.status(201).send('User registered successfully');
// });


// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(username, password);
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    try {
        pool.query('SELECT * FROM users WHERE username = ?', [username], async (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Error logging in');
            }

            if (results.length === 0) {
                return res.status(401).send('Invalid credentials');
            }

            const user = results[0];
            const isPasswordValid = password === user.password;
            if (!isPasswordValid) {
                return res.status(401).send('Invalid credentials');
            }

            const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });

            res.status(200).json({ token });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error logging in');
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


