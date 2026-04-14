# API Endpoints Documentation

Complete API reference for Task Management System. All endpoints are available at `/api` prefix.

---

## 📌 Base URL

- **Development**: `http://localhost:5000/api`
- **Production**: `https://task-management-api-xxxxx.onrender.com/api`

---

## 🔐 Authentication

All protected endpoints require `Authorization` header with JWT token:

```
Authorization: Bearer <access_token>
```

Tokens are obtained from login endpoint and typically stored in localStorage.

---

## 🚀 Endpoints

### 1️⃣ Authentication Routes (`/api/auth`)

#### Register New User

```
POST /api/auth/register
Content-Type: application/json
```

**Request Body**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (201 Created):

```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user"
}
```

**Error** (400 Bad Request):

```json
{
  "message": "Email already registered"
}
```

---

#### Login

```
POST /api/auth/login
Content-Type: application/json
```

**Request Body**:

```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200 OK) - Sets httpOnly cookie + returns token:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error** (401 Unauthorized):

```json
{
  "message": "Invalid email or password"
}
```

---

#### Refresh Token

```
POST /api/auth/refresh
Authorization: Bearer <refresh_token>
```

**Response** (200 OK):

```json
{
  "accessToken": "new_token_here"
}
```

---

#### Logout

```
POST /api/auth/logout
Authorization: Bearer <access_token>
```

**Response** (200 OK):

```json
{
  "message": "Logged out successfully"
}
```

---

#### Get Current User

```
GET /api/auth/me
Authorization: Bearer <access_token>
```

**Response** (200 OK):

```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user"
}
```

---

### 2️⃣ Projects Routes (`/api/projects`)

#### Get Project Suggestions (Public)

```
GET /api/projects/suggestions
```

**Response** (200 OK):

```json
[
  {
    "_id": "project_id",
    "name": "Build a Blog",
    "description": "Create a full-stack blog application",
    "difficulty": "intermediate",
    "category": "web"
  }
]
```

---

#### Get My Projects

```
GET /api/projects/my-projects
Authorization: Bearer <access_token>
```

**Response** (200 OK):

```json
[
  {
    "_id": "project_id",
    "name": "React Todo App",
    "description": "A simple todo list app",
    "owner": "user_id",
    "status": "in-progress",
    "progress": 75
  }
]
```

---

#### Get All My Projects

```
GET /api/projects/all-my-projects
Authorization: Bearer <access_token>
```

**Response**: List of owned and enrolled projects

---

#### Get Project By ID

```
GET /api/projects/:id
Authorization: Bearer <access_token>
```

**Response** (200 OK):

```json
{
  "_id": "project_id",
  "name": "React Todo App",
  "description": "A simple todo list app",
  "owner": "user_id",
  "status": "in-progress",
  "tasks": [],
  "milestones": [],
  "files": []
}
```

---

#### Create Project

```
POST /api/projects
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "name": "New Project",
  "description": "Project description",
  "category": "web",
  "difficulty": "intermediate"
}
```

**Response** (201 Created):

```json
{
  "_id": "new_project_id",
  "name": "New Project",
  "owner": "user_id",
  "status": "not-started"
}
```

---

#### Update Project

```
PUT /api/projects/:id
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "name": "Updated Name",
  "status": "in-progress",
  "progress": 50
}
```

**Response** (200 OK): Updated project object

---

#### Delete Project

```
DELETE /api/projects/:id
Authorization: Bearer <access_token>
```

**Response** (200 OK):

```json
{
  "message": "Project deleted successfully"
}
```

---

#### Enroll in Project

```
POST /api/projects/:id/enroll
Authorization: Bearer <access_token>
```

**Response** (200 OK):

```json
{
  "message": "Enrolled successfully"
}
```

---

#### Rate Project

```
POST /api/projects/:id/rate
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "rating": 5,
  "review": "Great project to learn from!"
}
```

**Response** (200 OK): Updated project with rating

---

#### Update Milestone

```
PUT /api/projects/:id/milestones/:milestoneId
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "status": "completed"
}
```

**Response** (200 OK): Updated milestone

---

### 3️⃣ Tasks Routes (`/api/tasks`)

#### Get User Tasks

```
GET /api/tasks
Authorization: Bearer <access_token>
Query Params:
  - projectId: Filter by project
  - status: "todo", "in-progress", "completed"
```

**Response** (200 OK):

```json
[
  {
    "_id": "task_id",
    "title": "Setup project",
    "description": "Initialize the project structure",
    "projectId": "project_id",
    "status": "in-progress",
    "dueDate": "2026-04-20",
    "priority": "high"
  }
]
```

---

#### Create Task

```
POST /api/tasks
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "title": "Implement authentication",
  "description": "Add user login/register",
  "projectId": "project_id",
  "priority": "high",
  "dueDate": "2026-05-01"
}
```

**Response** (201 Created):

```json
{
  "_id": "task_id",
  "title": "Implement authentication",
  "status": "todo",
  "projectId": "project_id"
}
```

---

#### Update Task

```
PUT /api/tasks/:id
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "status": "completed",
  "progress": 100
}
```

**Response** (200 OK): Updated task

---

#### Delete Task

```
DELETE /api/tasks/:id
Authorization: Bearer <access_token>
```

**Response** (200 OK):

```json
{
  "message": "Task deleted successfully"
}
```

---

### 4️⃣ Dashboard Routes (`/api/dashboard`)

#### Get Dashboard Stats

```
GET /api/dashboard/stats
Authorization: Bearer <access_token>
```

**Response** (200 OK):

```json
{
  "totalProjects": 5,
  "activeProjects": 3,
  "completedProjects": 2,
  "totalTasks": 20,
  "completedTasks": 12,
  "streakDays": 15,
  "totalHoursSpent": 42
}
```

---

#### Get Recent Activity

```
GET /api/dashboard/activity
Authorization: Bearer <access_token>
```

**Response** (200 OK):

```json
[
  {
    "type": "task_completed",
    "message": "Completed task 'Setup project'",
    "timestamp": "2026-04-11T10:30:00Z",
    "projectId": "project_id"
  }
]
```

---

#### Get Initial Dashboard Data

```
GET /api/dashboard/initial-data
Authorization: Bearer <access_token>
```

**Response** (200 OK): Combined stats, activity, and user info

---

### 5️⃣ Guidance Routes (`/api/guidance`)

#### Get AI Assistance

```
POST /api/guidance/ai-assistance
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "question": "How do I implement authentication?",
  "context": "React with Node.js",
  "code": "Optional code snippet"
}
```

**Response** (200 OK):

```json
{
  "response": "Here's how to implement authentication...",
  "suggestions": []
}
```

---

#### Analyze Progress

```
POST /api/guidance/analyze-progress
Authorization: Bearer <access_token>
```

**Response** (200 OK): Analysis of user's learning progress

---

#### Review Code

```
POST /api/guidance/review-code
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "code": "function example() { return 42; }",
  "language": "javascript"
}
```

**Response** (200 OK): Code review feedback

---

#### Get Mentor Matches

```
GET /api/guidance/mentor-matches
Authorization: Bearer <access_token>
```

**Response** (200 OK): List of potential mentors

---

#### Request Mentor

```
POST /api/guidance/request-mentor/:mentorId
Authorization: Bearer <access_token>
```

**Response** (200 OK): Mentor request created

---

#### Get Learning Path

```
GET /api/guidance/learning-path
Authorization: Bearer <access_token>
```

**Response** (200 OK): Personalized learning path

---

### 6️⃣ Files Routes (`/api/files`)

#### Get Project Files

```
GET /api/files/projects/:projectId/files
Authorization: Bearer <access_token>
```

**Response** (200 OK):

```json
[
  {
    "name": "index.js",
    "path": "src/index.js",
    "content": "...",
    "language": "javascript",
    "size": 1024
  }
]
```

---

#### Get File Structure

```
GET /api/files/projects/:projectId/file-structure
Authorization: Bearer <access_token>
```

**Response** (200 OK): Hierarchical file tree

---

#### Get Specific File

```
GET /api/files/projects/:projectId/files/:filePath
Authorization: Bearer <access_token>
```

**Response** (200 OK): File content and metadata

---

#### Save/Update File

```
POST /api/files/projects/:projectId/files/:filePath
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "content": "const x = 42;"
}
```

**Response** (200 OK): Updated file

---

---

## ⚠️ Error Responses

All error responses follow this format:

```json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "status": 400
}
```

### Common HTTP Status Codes

| Code | Meaning                               |
| ---- | ------------------------------------- |
| 200  | Success                               |
| 201  | Created                               |
| 400  | Bad Request                           |
| 401  | Unauthorized                          |
| 403  | Forbidden                             |
| 404  | Not Found                             |
| 409  | Conflict (e.g., email already exists) |
| 500  | Server Error                          |

---

## 🧪 Testing Tools

### Using cURL

```bash
# Health check
curl http://localhost:5000/

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"user@example.com","password":"Pass123!"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Pass123!"}'
```

### Using Postman

1. Import `ThunderClient-API-Tests.json` into Postman
2. Set `{{BASE_URL}}` variable to `http://localhost:5000`
3. Run requests from the collection

### Using Thunder Client (VS Code)

1. Open `ThunderClient-API-Tests.json` in VS Code
2. Download Thunder Client extension
3. Import and run tests directly

---

## 🔄 Rate Limiting

API requests are rate-limited to prevent abuse:

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

---

## 📝 API Response Codes

### Success Codes

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully

### Client Error Codes

- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Authorized but access denied
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists

### Server Error Codes

- `500 Internal Server Error`: Server-side error

---
