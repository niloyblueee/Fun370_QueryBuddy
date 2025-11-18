# 🚀 Quick Start Guide

## What's New?

Your QueryBuddy app now validates SQL queries **directly against your live database** instead of using client-side semantic analysis. This is much more accurate!

## How to Start Everything

### Step 1: Start the Backend API Server (Port 3001)
```bash
cd Backend
npm install      # (only needed first time)
npm start        # Server runs on http://localhost:3001
```

**Expected Output:**
```
Query validation server running on port 3001
Database tables already exist!
```

### Step 2: Start the Frontend Dev Server (Port 5174/5173)
```bash
cd Frontend
npm install      # (only needed first time)
npm run dev      # Frontend runs on http://localhost:5174
```

**Expected Output:**
```
VITE v7.2.2 ready in 263 ms
➜  Local: http://localhost:5174/
```

### Step 3: Open Your Browser
Navigate to: **http://localhost:5174**

---

## ✅ How the Validation Works

1. **User writes a SQL query** in the Quiz
2. **User clicks "Submit"**
3. **Frontend sends query to Backend API**
4. **Backend executes query on live database**
5. **Backend compares results with correct answer**
6. **Feedback is shown to user**

---

## 🔌 API Endpoints Available

### Validate Query
```
POST http://localhost:3001/api/validate-query
Content-Type: application/json

{
  "userQuery": "SELECT * FROM Customers",
  "correctQueries": ["SELECT * FROM Customers"]
}
```

### Check Backend Health
```
GET http://localhost:3001/api/health
```

### Get Table Schemas
```
GET http://localhost:3001/api/table-schemas
```

---

## 🌐 Database Connection

Your backend connects to:
- **Host**: crossover.proxy.rlwy.net
- **Port**: 31157
- **Database**: railway
- **User**: root

This is configured in `Backend/.env` (credentials already in place)

---

## 📋 Features

✅ Execute queries against actual database  
✅ Get exact error messages for SQL issues  
✅ Compare results precisely  
✅ Support for all SQL query types  
✅ Automatic database schema initialization  
✅ Connection pooling for performance  

---

## 🎯 Test It Out

1. Start both servers (Backend + Frontend)
2. Open http://localhost:5174
3. Try submitting a SQL query
4. You should see real feedback based on actual database results!

---

## ⚠️ Troubleshooting

### "Backend server not available"
- Check if Backend server is running on port 3001
- Run: `npm start` in the Backend folder

### Port Already in Use
- **Port 3001**: `taskkill /PID <pid> /F` to kill the process
- **Port 5174**: Vite automatically tries next port (5175, 5176, etc.)

### Database Connection Error
- Verify `.env` file exists in Backend folder
- Check internet connection (Railway MySQL is hosted)
- Ensure credentials are correct in `.env`

---

## 📚 File Structure

```
Fun370_QueryBuddy/
├── Backend/
│   ├── server.js              ← Main backend API server
│   ├── package.json
│   ├── .env                   ← Database credentials
│   └── DB/                    ← Database init scripts
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Quiz.jsx       ← Updated for async validation
│   │   └── utils/
│   │       └── sqlValidator.js ← Now calls backend API
│   ├── .env.local             ← API URL config
│   └── package.json
│
├── IMPLEMENTATION_SUMMARY.md  ← Full technical details
└── SETUP_GUIDE.md             ← Detailed setup guide
```

---

## 💡 Pro Tips

- Backend validates queries in **milliseconds** using database execution
- Each validation actually runs your query against real data
- Mistakes are caught immediately with detailed error messages
- You can test any SQL syntax directly!

Happy coding! 🎉
