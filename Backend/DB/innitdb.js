const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const fs = require('fs');
const mysql = require('mysql2/promise');
const { URL } = require('url');

const parseDbConfig = () => {
  const rawUrl = process.env.MYSQL_URL ? process.env.MYSQL_URL.trim() : '';

  if (rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      return {
        host: parsed.hostname || process.env.MYSQL_HOST,
        port: parsed.port || process.env.MYSQL_PORT,
        user: parsed.username || process.env.MYSQL_USER,
        password: parsed.password || process.env.MYSQL_PASSWORD,
        database: parsed.pathname ? parsed.pathname.replace(/^\//, '') : process.env.MYSQL_DATABASE
      };
    } catch (err) {
      console.warn('Invalid MYSQL_URL, falling back to discrete env vars:', err.message);
    }
  }

  return {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  };
};

const dbConfig = parseDbConfig();

const initializeDatabase = async () => {
  try {
    // Connect to MySQL
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      multipleStatements: true
    });

    // Drop all existing tables
    console.log('🗑️  Dropping existing tables...');
    const dropTablesSQL = `
      SET FOREIGN_KEY_CHECKS = 0;
      DROP TABLE IF EXISTS Categories;
      DROP TABLE IF EXISTS Customers;
      DROP TABLE IF EXISTS customers;
      DROP TABLE IF EXISTS orders;
      DROP TABLE IF EXISTS products;
      DROP TABLE IF EXISTS orderdetails;
      DROP TABLE IF EXISTS catagories;
      SET FOREIGN_KEY_CHECKS = 1;
    `;
    await connection.query(dropTablesSQL);
    console.log('✅ Dropped all existing tables');

    // Read and execute SQL file to create fresh schema
    const sql = fs.readFileSync(path.join(__dirname, 'Create tables.sql'), 'utf8');
    console.log('📊 Creating fresh database schema...');
    await connection.query(sql);
    console.log('✅ Fresh database schema created');

    await connection.end();

    console.log('✅ Database reinitialized with fresh schema and dummy data!');
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