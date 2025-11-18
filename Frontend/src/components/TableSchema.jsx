import React from 'react';
import './TableSchema.css';

const TableSchema = () => {
  const tables = [
    {
      name: 'customers',
      columns: [
        { name: 'customerid', type: 'INT', constraint: 'PK' },
        { name: 'firstname', type: 'VARCHAR(255)', constraint: '' },
        { name: 'lastname', type: 'VARCHAR(255)', constraint: '' },
        { name: 'email', type: 'VARCHAR(255)', constraint: '' },
        { name: 'joindate', type: 'DATE', constraint: '' },
        { name: 'city', type: 'VARCHAR(255)', constraint: '' },
        { name: 'status', type: 'VARCHAR(100)', constraint: '' }
      ]
    },
    {
      name: 'categories',
      columns: [
        { name: 'categoryid', type: 'INT', constraint: 'PK' },
        { name: 'categoryname', type: 'VARCHAR(255)', constraint: '' }
      ]
    },
    {
      name: 'products',
      columns: [
        { name: 'productid', type: 'INT', constraint: 'PK' },
        { name: 'productname', type: 'VARCHAR(255)', constraint: '' },
        { name: 'categoryid', type: 'INT', constraint: 'FK' },
        { name: 'price', type: 'DECIMAL(10,2)', constraint: '' },
        { name: 'stockquantity', type: 'INT', constraint: '' }
      ]
    },
    {
      name: 'orders',
      columns: [
        { name: 'orderid', type: 'INT', constraint: 'PK' },
        { name: 'customerid', type: 'INT', constraint: 'FK' },
        { name: 'orderdate', type: 'DATETIME', constraint: '' },
        { name: 'status', type: 'VARCHAR(100)', constraint: '' }
      ]
    },
    {
      name: 'orderdetails',
      columns: [
        { name: 'orderdetailid', type: 'INT', constraint: 'PK' },
        { name: 'orderid', type: 'INT', constraint: 'FK' },
        { name: 'productid', type: 'INT', constraint: 'FK' },
        { name: 'quantity', type: 'INT', constraint: '' },
        { name: 'unitprice', type: 'DECIMAL(10,2)', constraint: '' }
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
