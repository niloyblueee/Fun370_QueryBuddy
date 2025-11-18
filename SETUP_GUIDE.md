# Fun370 QueryBuddy - Server-Based SQL Validation

This project now uses **server-side database validation** instead of client-side semantic analysis. SQL queries are executed against the actual database to verify correctness.

## Setup Instructions

### 1. Backend Setup

Navigate to the Backend directory and install dependencies:

```bash
cd Backend
npm install
```

### 2. Database Connection

The backend connects to your Railway database using the `.env` file:

```
MYSQL_HOST=crossover.proxy.rlwy.net
MYSQL_PORT=31157
MYSQL_USER=root
MYSQL_PASSWORD=MIkVNnOmDZrWppFHvMBjBifmOmPGbOIj
MYSQL_DATABASE=railway
```

### 3. Initialize Database (if needed)

```bash
npm run init-db
```

### 4. Start Backend Server

```bash
npm start
```

The server will run on `http://localhost:3001` and:
- Automatically initialize the database schema if tables don't exist
- Expose REST API endpoints for query validation

### 5. Frontend Setup

Navigate to the Frontend directory:

```bash
cd ../Frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### `POST /api/validate-query`
Validates a user's SQL query by executing it against the database.

**Request Body:**
```json
{
  "userQuery": "SELECT * FROM Customers",
  "correctQueries": ["SELECT * FROM Customers", "SELECT Customers.* FROM Customers"]
}
```

**Response:**
```json
{
  "isValid": true,
  "feedback": "Correct! Your query returns the expected results.",
  "userRowCount": 50,
  "correctRowCount": 50
}
```

### `GET /api/health`
Checks if the backend is connected to the database.

**Response:**
```json
{
  "status": "connected",
  "message": "Database connection successful"
}
```

### `GET /api/table-schemas`
Returns the structure of all tables in the database.

**Response:**
```json
{
  "Customers": [
    {"COLUMN_NAME": "CustomerID", "COLUMN_TYPE": "int"},
    ...
  ],
  ...
}
```

## How It Works

1. **User submits a SQL query** on the frontend
2. **Frontend sends the query to the backend API** via POST request
3. **Backend executes both the user's query and the correct query** against the live database
4. **Results are compared** - if they're identical (same rows, same order), the query is correct
5. **Feedback is returned** to the frontend

This approach is **more accurate** because:
- ✅ Validates against actual data
- ✅ Catches SQL syntax errors immediately
- ✅ Handles complex queries better
- ✅ Works with all SQL dialects the database supports
- ✅ Detects logical errors (e.g., wrong WHERE conditions)

## Environment Variables

### Backend (.env)
```
MYSQL_HOST=crossover.proxy.rlwy.net
MYSQL_PORT=31157
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=railway
PORT=3001 (optional, defaults to 3001)
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:3001
```

## Notes

- The backend uses connection pooling for better performance
- Queries are validated by actual execution - if a query has SQL errors, the API will return a detailed error message
- The database is automatically initialized with schema and dummy data on first run
