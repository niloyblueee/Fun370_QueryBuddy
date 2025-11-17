import React from 'react';
import './TableSchema.css';

const TableSchema = () => {
  const tables = [
    {
      name: 'Customers',
      columns: [
        { name: 'CustomerID', type: 'INT', constraint: 'PK' },
        { name: 'FirstName', type: 'VARCHAR', constraint: '' },
        { name: 'LastName', type: 'VARCHAR', constraint: '' },
        { name: 'Email', type: 'VARCHAR', constraint: '' },
        { name: 'JoinDate', type: 'DATE', constraint: '' },
        { name: 'City', type: 'VARCHAR', constraint: '' }
      ]
    },
    {
      name: 'Categories',
      columns: [
        { name: 'CategoryID', type: 'INT', constraint: 'PK' },
        { name: 'CategoryName', type: 'VARCHAR', constraint: '' }
      ]
    },
    {
      name: 'Products',
      columns: [
        { name: 'ProductID', type: 'INT', constraint: 'PK' },
        { name: 'ProductName', type: 'VARCHAR', constraint: '' },
        { name: 'CategoryID', type: 'INT', constraint: 'FK' },
        { name: 'Price', type: 'DECIMAL', constraint: '' },
        { name: 'StockQuantity', type: 'INT', constraint: '' }
      ]
    },
    {
      name: 'Orders',
      columns: [
        { name: 'OrderID', type: 'INT', constraint: 'PK' },
        { name: 'CustomerID', type: 'INT', constraint: 'FK' },
        { name: 'OrderDate', type: 'DATETIME', constraint: '' },
        { name: 'Status', type: 'VARCHAR', constraint: '' }
      ]
    },
    {
      name: 'OrderDetails',
      columns: [
        { name: 'OrderDetailID', type: 'INT', constraint: 'PK' },
        { name: 'OrderID', type: 'INT', constraint: 'FK' },
        { name: 'ProductID', type: 'INT', constraint: 'FK' },
        { name: 'Quantity', type: 'INT', constraint: '' },
        { name: 'UnitPrice', type: 'DECIMAL', constraint: '' }
      ]
    }
  ];

  return (
    <div className="table-schema-container">
      <h2>Database Schema</h2>
      <div className="tables-grid">
        {tables.map((table) => (
          <div key={table.name} className="table-card">
            <h3 className="table-name">{table.name}</h3>
            <table className="schema-table">
              <thead>
                <tr>
                  <th>Column</th>
                  <th>Type</th>
                  <th>Key</th>
                </tr>
              </thead>
              <tbody>
                {table.columns.map((column) => (
                  <tr key={column.name}>
                    <td className="column-name">{column.name}</td>
                    <td className="column-type">{column.type}</td>
                    <td className={`column-constraint ${column.constraint.toLowerCase()}`}>
                      {column.constraint}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableSchema;
