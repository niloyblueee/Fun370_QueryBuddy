// sqlValidator.test.js
// Unit tests for sqlValidator.js
import { validateSQL, validateSQLAgainstMany } from './sqlValidator.js';

function testValidateSQL() {
  const tests = [
    // Simple exact match
    {
      user: 'SELECT * FROM Customers;',
      correct: 'SELECT * FROM Customers;',
      expect: true,
      desc: 'Exact match should pass',
    },
    // Cosmetic difference (alias)
    {
      user: 'SELECT c.* FROM Customers c;',
      correct: 'SELECT * FROM Customers;',
      expect: true,
      desc: 'Alias should be ignored',
    },
    // Trivial WHERE
    {
      user: 'SELECT * FROM Customers WHERE 1=1;',
      correct: 'SELECT * FROM Customers;',
      expect: true,
      desc: 'Trivial WHERE should be ignored',
    },
    // Column order
    {
      user: 'SELECT Price, ProductName FROM Products;',
      correct: 'SELECT ProductName, Price FROM Products;',
      expect: true,
      desc: 'Column order should not matter',
    },
    // DISTINCT
    {
      user: 'SELECT DISTINCT City FROM Customers;',
      correct: 'SELECT City FROM Customers;',
      expect: false,
      desc: 'DISTINCT mismatch should fail',
    },
    // WHERE clause difference
    {
      user: "SELECT * FROM Customers WHERE City = 'Los Angeles';",
      correct: "SELECT * FROM Customers WHERE City = 'New York';",
      expect: false,
      desc: 'Different WHERE value should fail',
    },
    // GROUP BY
    {
      user: 'SELECT City FROM Customers GROUP BY City;',
      correct: 'SELECT DISTINCT City FROM Customers;',
      expect: false,
      desc: 'GROUP BY vs DISTINCT should fail',
    },
    // Complex: A43 (Complicated)
    {
      user: `WITH CustomerSpending AS (   SELECT        c.City,       c.FirstName,       c.LastName,       SUM(od.Quantity * od.UnitPrice) AS TotalSpent,       ROW_NUMBER() OVER(PARTITION BY c.City ORDER BY SUM(od.Quantity * od.UnitPrice) DESC) AS city_rank   FROM Customers c   JOIN Orders o ON c.CustomerID = o.CustomerID   JOIN OrderDetails od ON o.OrderID = od.OrderID   GROUP BY c.CustomerID ) SELECT City, FirstName, LastName, TotalSpent FROM CustomerSpending WHERE city_rank <= 3;`,
      correct: `WITH CityRankings AS (   SELECT        c.City,       c.FirstName,       c.LastName,       SUM(od.Quantity * od.UnitPrice) AS TotalSpent,       RANK() OVER(PARTITION BY c.City ORDER BY SUM(od.Quantity * od.UnitPrice) DESC) AS city_rank   FROM Customers c   JOIN Orders o ON c.CustomerID = o.CustomerID   JOIN OrderDetails od ON o.OrderID = od.OrderID   GROUP BY c.CustomerID ) SELECT City, FirstName, LastName, TotalSpent FROM CityRankings WHERE city_rank <= 3;`,
      expect: false, // Different window function (ROW_NUMBER vs RANK)
      desc: 'Different window function should fail',
    },
  ];

  let passed = 0;
  for (const t of tests) {
    const result = validateSQL(t.user, t.correct);
    if (result.isValid === t.expect) {
      console.log('PASS:', t.desc);
      passed++;
    } else {
      console.error('FAIL:', t.desc, '|', result.feedback);
    }
  }
  console.log(`${passed}/${tests.length} tests passed.`);
}

testValidateSQL();
