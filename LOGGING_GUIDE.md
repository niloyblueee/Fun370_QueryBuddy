# Debug Logging Guide

## Overview
Comprehensive logging has been added to both backend and frontend to help diagnose connection and request issues.

## Backend Logging (server.js)

### Server Startup Logs
When the backend starts, you'll see:
```
🚀 [SERVER] Starting backend server initialization...
📡 [PORT] Server will run on port: 3001
🔧 [CONFIG] Database configuration loaded:
  Host: localhost
  Port: 3306
  Database: querybuddy
  User: root
✅ [MIDDLEWARE] CORS enabled
✅ [MIDDLEWARE] JSON parser enabled
✅ [MIDDLEWARE] Database pool middleware attached

============================================================
✨ [SERVER] Query validation server running on port 3001
🌐 [SERVER] Backend is LIVE and accepting requests!
📍 [SERVER] Access health check at: http://localhost:3001/api/health
============================================================
```

### Request Logs
Every incoming request logs:
```
📨 [REQUEST] GET /api/health
📨 [REQUEST] POST /api/validate-query
📨 [REQUEST] GET /api/table-schemas
```

### Endpoint Logs

**Health Check (`/api/health`):**
```
❤️  [API] /api/health - Health check request
✅ [API] Database connection healthy
```
OR if there's an issue:
```
❤️  [API] /api/health - Health check request
❌ [API] Health check failed: Connection refused
```

**Query Validation (`/api/validate-query`):**
```
🔍 [API] /api/validate-query - Validating SQL query
  User Query: SELECT * FROM users WHERE...
  Expected Queries Count: 1
✅ [API] Query validation PASSED - 5 rows returned
```
OR if it fails:
```
🔍 [API] /api/validate-query - Validating SQL query
  User Query: SELECT * FROM users WHERE...
  Expected Queries Count: 1
❌ [API] Query execution error: Syntax error in SQL statement
```

**Table Schemas (`/api/table-schemas`):**
```
📋 [API] /api/table-schemas - Fetching table schemas
✅ [API] Fetched 5 tables
```

---

## Frontend Logging (Vue/React)

### Initialization Logs
When the app loads:
```
🚀 [FRONTEND] SQL Validator initialized
📡 [FRONTEND] API Base URL: http://localhost:3001
```

### Quiz Component Logs
When the Quiz component mounts:
```
🎯 [QUIZ] Component mounted - Checking backend health...
❤️  [FRONTEND] Checking backend health...
🎯 [QUIZ] Backend health check result: HEALTHY ✅
```
OR if not running:
```
🎯 [QUIZ] Component mounted - Checking backend health...
❤️  [FRONTEND] Checking backend health...
❌ [FRONTEND] Backend health check failed: Failed to fetch
🎯 [QUIZ] Backend health check result: NOT RUNNING ❌
🎯 [QUIZ] Backend is not available!
```

### Query Submission Logs
When user submits a query:
```
🎯 [QUIZ] Submit button clicked
🎯 [QUIZ] Backend connected: true
🎯 [QUIZ] Validating query against backend...
📤 [FRONTEND] Sending validation request...
   Query: SELECT * FROM users...
📥 [FRONTEND] Response received - Status: 200
✅ [FRONTEND] Validation result: PASSED
```

OR if backend is not running:
```
🎯 [QUIZ] Submit button clicked
🎯 [QUIZ] Backend connected: false
🎯 [QUIZ] Cannot submit - backend not connected
```

---

## Troubleshooting Guide

### Issue: 404 Error / Cannot GET
**Check these logs:**
1. **Backend logs** - Do you see the startup message?
   - If NO: Backend is not running
   - If YES: Check if the route exists

2. **Frontend logs** - Check the Request URL being sent
   - Look for `📤 [FRONTEND] Sending validation request...`
   - Check the API_BASE_URL being used

### Issue: Backend Not Running
**Expected logs:** Look for startup message with ✨ icon
- If missing: Backend process crashed or didn't start
- Check the actual error before the crash

### Issue: Database Connection Failed
**Check:** `❤️  [API] Health check failed` message
- This shows the actual database error
- Verify MySQL is running and credentials are correct

### Issue: Query Validation Fails
**Check logs in order:**
1. `🔍 [API] /api/validate-query` - Did the request arrive?
2. Query execution logs - Did the SQL execute?
3. Result comparison logs - Did results match?

---

## How to Monitor Logs

### Backend (Terminal/Console)
```bash
npm start
# Watch for the startup logs and incoming requests
```

### Frontend (Browser DevTools)
1. Open Chrome DevTools (F12 or right-click → Inspect)
2. Go to **Console** tab
3. Filter by `[FRONTEND]` or `[QUIZ]` to see only frontend logs
4. Look for colored emoji icons to quickly spot issues

---

## Log Color Guide
- 🚀 = Startup/Initialization
- 📡 = Configuration
- ✅ = Success
- ❌ = Error
- ⚠️  = Warning
- 🔍 = API Request
- 📤 = Sending Data
- 📥 = Receiving Data
- 🎯 = Quiz Action
- ❤️  = Health Check
