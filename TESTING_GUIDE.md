# API Testing Checklist & Guide

Step-by-step guide to test all API endpoints before deployment.

---

## 🚀 Setup for Testing

### Start the Backend Server

```bash
cd Backend
npm install
npm run dev
```

Should output: `Server running on port 5000`

### Start the Frontend Dev Server (in another terminal)

```bash
cd Frontend
npm install
npm run dev
```

Should output: `VITE v... is ready in ... ms` and accessible at http://localhost:5173

---

## 🧪 Testing Guide

Use any of these tools:

- **cURL** (command line)
- **Postman** (GUI)
- **Thunder Client** (VS Code extension)
- **Browser DevTools** (Network tab)

### Import API Collection

If using Postman/Thunder Client, import `ThunderClient-API-Tests.json` for pre-configured requests.

---

## ✅ Authentication Tests

### 1. Health Check (No Auth Required)

```bash
curl http://localhost:5000/
```

✅ **Expected Response**:

```json
{
  "message": "Task Management API Live!",
  "status": "OK",
  "timestamp": "2026-04-11T...",
  "routes": ["/api/auth/me", "/api/projects"]
}
```

---

### 2. Register New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "TestPassword123!"
  }'
```

✅ **Expected Response** (201 Created):

```json
{
  "_id": "...user_id...",
  "name": "Test User",
  "email": "testuser@example.com",
  "role": "user"
}
```

❌ **Error Case**: Email already exists

```json
{
  "message": "Email already registered"
}
```

**Test Cases**:

- [x] Valid registration
- [x] Duplicate email (should fail)
- [x] Missing fields (should fail)
- [x] Invalid email format (should fail)
- [x] Short password (should fail)

---

### 3. Login User

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPassword123!"
  }'
```

✅ **Expected Response** (200 OK):

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...user_id...",
    "name": "Test User",
    "email": "testuser@example.com"
  }
}
```

⚠️ **Note**: Response also sets httpOnly cookie with refresh token

**Test Cases**:

- [x] Valid credentials
- [x] Wrong password (should fail)
- [x] Non-existent email (should fail)
- [x] Missing fields (should fail)

---

### 4. Get Current User (Requires Auth)

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

✅ **Expected Response** (200 OK):

```json
{
  "_id": "...user_id...",
  "name": "Test User",
  "email": "testuser@example.com",
  "role": "user"
}
```

❌ **Error Case**: Missing token (401 Unauthorized)

**Test Cases**:

- [x] Valid token → Returns user info
- [x] Invalid token → 401 Unauthorized
- [x] No token → 401 Unauthorized
- [x] Expired token → 401 + TOKEN_EXPIRED code

---

### 5. Refresh Token

```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json"
```

✅ **Expected Response** (200 OK):

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

⚠️ **Note**: Uses httpOnly refresh token cookie (set by login)

---

### 6. Logout

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

✅ **Expected Response** (200 OK):

```json
{
  "message": "Logged out successfully"
}
```

---

## 📁 Projects API Tests

**Prerequisites**: Be logged in (have auth token)

### 7. Get Project Suggestions (Public)

```bash
curl http://localhost:5000/api/projects/suggestions
```

✅ **Expected**: Array of suggested projects (200 OK)

---

### 8. Create Project

```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "description": "A test project for learning",
    "category": "web",
    "difficulty": "beginner"
  }'
```

✅ **Expected Response** (201 Created):

```json
{
  "_id": "...project_id...",
  "name": "Test Project",
  "owner": "...user_id...",
  "status": "not-started",
  "createdAt": "2026-04-11T..."
}
```

**Save the project ID** for subsequent tests: `PROJECT_ID=...`

**Test Cases**:

- [x] Create with valid data
- [x] Missing required fields (should fail)
- [x] Invalid category (should fail)

---

### 9. Get My Projects

```bash
curl http://localhost:5000/api/projects/my-projects \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

✅ **Expected**: Array of user's projects (200 OK)

---

### 10. Get Project By ID

```bash
curl http://localhost:5000/api/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

✅ **Expected**: Single project object (200 OK)

---

### 11. Update Project

```bash
curl -X PUT http://localhost:5000/api/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress",
    "progress": 25
  }'
```

✅ **Expected**: Updated project object (200 OK)

---

### 12. Enroll in Project

```bash
curl -X POST http://localhost:5000/api/projects/PROJECT_ID/enroll \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

✅ **Expected**: Success message (200 OK)

---

### 13. Rate Project

```bash
curl -X POST http://localhost:5000/api/projects/PROJECT_ID/rate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "review": "Great project!"
  }'
```

✅ **Expected**: Updated project with rating (200 OK)

---

### 14. Delete Project

```bash
curl -X DELETE http://localhost:5000/api/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

✅ **Expected**: Success message (200 OK)

---

## ✅ Tasks API Tests

### 15. Create Task

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Setup project structure",
    "description": "Create folder structure and init files",
    "projectId": "PROJECT_ID",
    "priority": "high",
    "dueDate": "2026-04-20"
  }'
```

✅ **Expected**: Created task object (201 Created)

**Save task ID**: `TASK_ID=...`

---

### 16. Get User Tasks

```bash
curl "http://localhost:5000/api/tasks?projectId=PROJECT_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

✅ **Expected**: Array of tasks (200 OK)

---

### 17. Update Task

```bash
curl -X PUT http://localhost:5000/api/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress",
    "progress": 50
  }'
```

✅ **Expected**: Updated task object (200 OK)

---

### 18. Delete Task

```bash
curl -X DELETE http://localhost:5000/api/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

✅ **Expected**: Success message (200 OK)

---

## 📊 Dashboard API Tests

### 19. Get Dashboard Stats

```bash
curl http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

✅ **Expected**: Stats object with counts (200 OK)

```json
{
  "totalProjects": 1,
  "activeProjects": 0,
  "completedProjects": 0,
  "totalTasks": 1,
  "completedTasks": 0,
  ...
}
```

---

### 20. Get Recent Activity

```bash
curl http://localhost:5000/api/dashboard/activity \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

✅ **Expected**: Array of activity entries (200 OK)

---

### 21. Get Initial Dashboard Data

```bash
curl http://localhost:5000/api/dashboard/initial-data \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

✅ **Expected**: Combined stats, activity, and user data (200 OK)

---

## 🤖 Guidance API Tests

### 22. Get AI Assistance

```bash
curl -X POST http://localhost:5000/api/guidance/ai-assistance \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How do I implement user authentication?",
    "context": "Using Node.js and React"
  }'
```

✅ **Expected**: AI response object (200 OK or 202 Accepted)

---

### 23. Get Mentor Matches

```bash
curl http://localhost:5000/api/guidance/mentor-matches \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

✅ **Expected**: Array of potential mentors (200 OK or empty)

---

### 24. Analyze Progress

```bash
curl -X POST http://localhost:5000/api/guidance/analyze-progress \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

✅ **Expected**: Progress analysis object (200 OK)

---

## 📝 Files API Tests

### 25. Get Project Files

```bash
curl "http://localhost:5000/api/files/projects/PROJECT_ID/files" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

✅ **Expected**: Array of files or empty array (200 OK)

---

### 26. Get File Structure

```bash
curl "http://localhost:5000/api/files/projects/PROJECT_ID/file-structure" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

✅ **Expected**: Hierarchical file tree (200 OK)

---

---

## 🔍 Frontend Integration Tests

### 27. Test Login Flow on Frontend

1. Open http://localhost:5173
2. Navigate to Login page
3. Enter: `testuser@example.com` / `TestPassword123!`
4. ✅ Should redirect to dashboard
5. Check Console → Network tab → Should see successful API calls

---

### 28. Test Dashboard Loading

1. After logged in, dashboard should load with:
   - [x] User stats (projects, tasks)
   - [x] Recent activity
   - [x] Project list
   - [x] Task list

---

### 29. Test Project Creation on Frontend

1. Click "New Project" or similar button
2. Fill in project details
3. Submit
4. ✅ Should appear in project list
5. Check Network tab → POST /api/projects should return 201

---

### 30. Test Task Creation on Frontend

1. Open or create a project
2. Click "New Task" or add task button
3. Fill in task details
4. Submit
5. ✅ Should appear in task list
6. Check Network → POST /api/tasks should return 201

---

## ⚠️ Error Handling Tests

### 31. Test 401 Unauthorized

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer invalid-token"
```

✅ **Expected**: 401 Unauthorized with error message

---

### 32. Test 404 Not Found

```bash
curl http://localhost:5000/api/projects/invalid-id \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

✅ **Expected**: 404 Not Found

---

### 33. Test CORS

1. From frontend (http://localhost:5173), make API call
2. Check browser console → Should NOT have CORS errors
3. Network tab → Response headers should include CORS headers

---

### 34. Test Rate Limiting

Make 100+ requests rapidly to `/api`:

```bash
for i in {1..150}; do curl http://localhost:5000/api/projects/my-projects -H "Authorization: Bearer TOKEN"; done
```

✅ **Expected**: After 100 requests → 429 Too Many Requests

---

## 📋 Quick Test Checklist

- [ ] Backend starts without errors
- [ ] Frontend connects to backend (/api works)
- [ ] Health check endpoint responds
- [ ] User registration works
- [ ] User login works and returns token
- [ ] Auth token is stored in localStorage
- [ ] Protected endpoints require auth
- [ ] Invalid tokens are rejected (401)
- [ ] Project CRUD operations work
- [ ] Task CRUD operations work
- [ ] Dashboard loads with stats
- [ ] Files API returns data
- [ ] Guidance API responds
- [ ] CORS headers present in responses
- [ ] Error messages are descriptive
- [ ] Frontend dashboard renders without errors

---

## 🚀 Pre-Deployment Checklist

- [ ] All tests pass locally
- [ ] No console errors in frontend
- [ ] API response times are reasonable (<500ms)
- [ ] Authentication flow works end-to-end
- [ ] Database queries are optimized
- [ ] Environment variables are set correctly
- [ ] Build process completes without warnings
- [ ] No sensitive data in code/logs
- [ ] CORS is properly configured
- [ ] Error handling is robust

---

## 📞 Debugging Tips

1. **Check Frontend Console** (F12 → Console tab)
   - Look for CORS errors, 404 errors, or auth issues

2. **Check Network Tab** (F12 → Network tab)
   - Click on API request → Status code, Response, Headers tabs
   - Verify correct URL is being called
   - Check Authorization header is present

3. **Check Backend Logs** (Terminal where `npm run dev` is running)
   - Look for connection errors, validation errors
   - Check MongoDB connection status

4. **Test with cURL** (Command line)
   - More transparent than browser XHR
   - Easier to see raw response

5. **Check MongoDB**
   - Verify connection string is correct
   - Ensure database has data

---
