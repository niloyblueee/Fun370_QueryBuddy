const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');

async function checkDatabases() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
    });

    console.log('✅ Connected to MySQL server\n');

    // List all databases
    const [databases] = await connection.query("SHOW DATABASES");
    console.log('📦 Available databases:');
    databases.forEach(db => console.log(`  - ${db.Database}`));

    // For each database, check for our tables
    console.log('\n🔍 Searching for our tables in each database...\n');
    
    for (const dbInfo of databases) {
      const dbName = dbInfo.Database;
      try {
        const [tables] = await connection.query(
          "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?",
          [dbName]
        );
        
        if (tables.length > 0) {
          const tableNames = tables.map(t => t.TABLE_NAME);
          if (tableNames.some(t => ['Customers', 'Products', 'Orders', 'Categories', 'OrderDetails'].includes(t))) {
            console.log(`✨ FOUND OUR TABLES in database: "${dbName}"`);
            console.log(`   Tables: ${tableNames.join(', ')}\n`);
          }
        }
      } catch (e) {
        // Skip if we can't access this database
      }
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDatabases();
