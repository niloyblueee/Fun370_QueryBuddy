const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const fs = require('fs');
const mysql = require('mysql2/promise');

const initializeDatabase = async () => {
  try {
    // Read SQL file
    const sql = fs.readFileSync(path.join(__dirname, 'Create tables.sql'), 'utf8');

    // Connect to MySQL
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      multipleStatements: true
    });

    // Execute SQL
    await connection.query(sql);
    await connection.end();

    console.log('✅ Database initialized with schema and dummy data!');
    return true;
  } catch (err) {
    console.error('❌ Error initializing database:', err.message);
    return false;
  }
};

// Run initialization
initializeDatabase().then(success => {
  process.exit(success ? 0 : 1);
});