const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database middleware - attach pool to all requests
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// Create connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  collation: 'utf8mb4_general_ci'  // Case-insensitive collation
});

// Initialize database if needed
const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // List all databases to find the right one
    const [databases] = await connection.query("SHOW DATABASES");
    console.log('Available databases:', databases.map(db => db.Database));
    
    // Check if tables exist in current database
    const [tables] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?",
      [process.env.MYSQL_DATABASE]
    );
    
    connection.release();

    if (tables.length === 0) {
      console.log('No tables found in database:', process.env.MYSQL_DATABASE);
      console.log('Initializing database...');
      const sql = fs.readFileSync(path.join(__dirname, 'DB', 'Create tables.sql'), 'utf8');
      const connection = await pool.getConnection();
      await connection.query(sql);
      connection.release();
      console.log('Database initialized with schema and dummy data!');
    } else {
      console.log(`Database '${process.env.MYSQL_DATABASE}' has ${tables.length} tables!`);
    }
  } catch (err) {
    console.error('Error during database initialization:', err.message);
  }
};

// Endpoint to validate SQL query against database
app.post('/api/validate-query', async (req, res) => {
  try {
    const { userQuery, correctQueries } = req.body;

    if (!userQuery) {
      return res.status(400).json({
        isValid: false,
        feedback: 'User query is required'
      });
    }

    const queries = Array.isArray(correctQueries) ? correctQueries : [correctQueries];

    // Get connection from pool
    const connection = await req.db.getConnection();

    try {
      // Execute user query
      const [userResult] = await connection.query(userQuery);
      
      // Execute all correct queries and compare results
      for (const correctQuery of queries) {
        const [correctResult] = await connection.query(correctQuery);

        // Compare results - check if they're equivalent
        if (resultsAreEquivalent(userResult, correctResult)) {
          return res.json({
            isValid: true,
            feedback: 'Correct! Your query returns the expected results.',
            userRowCount: userResult.length,
            correctRowCount: correctResult.length
          });
        }
      }

      // If no match found
      return res.json({
        isValid: false,
        feedback: 'Your query does not return the expected results.',
        userRowCount: userResult.length,
        expectedRowCount: correctQueries[0] ? (await connection.query(correctQueries[0]))[0].length : 0
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Query execution error:', error);
    return res.status(400).json({
      isValid: false,
      feedback: `SQL Error: ${error.message}`
    });
  }
});

// Endpoint to get table schemas
app.get('/api/table-schemas', async (req, res) => {
  try {
    const connection = await req.db.getConnection();
    
    const [tables] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?",
      [process.env.MYSQL_DATABASE]
    );

    const schemas = {};
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      const [columns] = await connection.query(
        "SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?",
        [process.env.MYSQL_DATABASE, tableName]
      );
      schemas[tableName] = columns;
    }

    connection.release();
    res.json(schemas);
  } catch (error) {
    console.error('Error fetching schemas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to test connection
app.get('/api/health', async (req, res) => {
  try {
    const connection = await req.db.getConnection();
    const [result] = await connection.query('SELECT 1 as status');
    connection.release();
    
    res.json({ 
      status: 'connected',
      message: 'Database connection successful'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'disconnected',
      error: error.message 
    });
  }
});

// Helper function to compare query results
function resultsAreEquivalent(result1, result2) {
  // Convert results to JSON strings for comparison
  const str1 = JSON.stringify(
    result1.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
  );
  const str2 = JSON.stringify(
    result2.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
  );
  
  return str1 === str2;
}

// Start server
app.listen(PORT, async () => {
  console.log(`Query validation server running on port ${PORT}`);
  await initializeDatabase();
});
