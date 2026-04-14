# Deployment Guide - Task Management System

Complete guide for deploying the Task Management System to Vercel (Frontend) and Render (Backend).

## 📋 Prerequisites

- GitHub account for repository
- Vercel account (https://vercel.com)
- Render account (https://render.com)
- MongoDB Atlas account (https://www.mongodb.com/cloud/atlas) - for cloud database
- Environment variables for production

---

## 🚀 Backend Deployment (Render)

### Step 1: Prepare Backend for Render

1. **Verify render.yaml configuration** ✅
   - File is already configured at `/Backend/render.yaml`
   - Includes all required environment variables

2. **Set up MongoDB Atlas** (Cloud Database)

   ```
   1. Go to https://www.mongodb.com/cloud/atlas
   2. Create a free cluster
   3. Create database user with strong password
   4. Get connection string: mongodb+srv://username:password@cluster.mongodb.net/task-management?retryWrites=true&w=majority
   5. Copy this for MONGODB_URI environment variable
   ```

3. **Push to GitHub**
   ```bash
   git push origin main
   ```

### Step 2: Deploy to Render

1. **Connect Render to GitHub**
   - Visit https://render.com
   - Click "New" → "Web Service"
   - Connect your GitHub account
   - Select this repository
   - Choose `Backend` as the root directory (if asked)

2. **Configure Deployment Settings**
   - **Name**: `task-management-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free tier available

3. **Add Environment Variables**

   Click "Environment" and add:

   | Key                  | Value                                |
   | -------------------- | ------------------------------------ |
   | `NODE_ENV`           | `production`                         |
   | `PORT`               | `10000`                              |
   | `MONGODB_URI`        | Your MongoDB Atlas connection string |
   | `JWT_ACCESS_SECRET`  | Generate: `openssl rand -base64 32`  |
   | `JWT_REFRESH_SECRET` | Generate: `openssl rand -base64 32`  |

4. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete (~5-10 minutes)
   - Note the deployed URL (e.g., `https://task-management-api-xxxxx.onrender.com`)

5. **Test Deployment**
   ```bash
   curl https://task-management-api-xxxxx.onrender.com/
   # Should return: { "message": "Task Management API Live!", "status": "OK", ... }
   ```

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend Environment

1. **Update Frontend `.env.production`**

   Create `.env.production` in `/Frontend` directory:

   ```env
   # Replace xxxxx with your actual Render backend URL
   VITE_API_URL=https://task-management-api-xxxxx.onrender.com/api
   VITE_BACKEND_URL=https://task-management-api-xxxxx.onrender.com
   ```

2. **Verify `.env` for development**

   `.env` should be:

   ```env
   VITE_API_URL=/api
   VITE_BACKEND_URL=http://localhost:5000
   ```

3. **Test Build Locally**
   ```bash
   cd Frontend
   npm run build
   npm run preview
   ```
   Should open on http://localhost:4173 without errors

### Step 2: Deploy to Vercel

1. **Connect Vercel to GitHub**
   - Visit https://vercel.com
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Vercel auto-detects it's a monorepo

2. **Configure Build Settings**
   - **Root Directory**: `./Frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Add Environment Variables**

   In Vercel project settings → "Environment Variables":

   | Key                | Value                                                |
   | ------------------ | ---------------------------------------------------- |
   | `VITE_API_URL`     | `https://task-management-api-xxxxx.onrender.com/api` |
   | `VITE_BACKEND_URL` | `https://task-management-api-xxxxx.onrender.com`     |

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~3-5 minutes)
   - Visit deployed URL (e.g., `https://task-management-frontend.vercel.app`)

### Step 3: Enable Preview Deployments

For staging/preview environments:

- Vercel automatically creates preview deployments for pull requests
- Useful for testing before merging to main

---

## 🔧 Update CORS in Backend

After noting your Vercel URL, update backend CORS if needed:

**File**: `Backend/server.js`

```javascript
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [
            "https://task-management-frontend.vercel.app",
            "https://task-management-frontend-git-main-YOUR_USERNAME.vercel.app",
            // Add any other Vercel preview URLs
          ]
        : true, // allow all origins locally
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
```

---

## 🧪 Post-Deployment Testing

### Backend Health Check

```bash
curl https://task-management-api-xxxxx.onrender.com/
```

### Frontend Health Check

Visit https://task-management-frontend.vercel.app

- Should load without console errors
- Check Network tab for API calls to backend

### Test User Registration

1. Visit deployed frontend
2. Go to Register page
3. Create test account
4. Should successfully register and redirect to login

### Test User Login

1. Login with created account
2. Should receive JWT token
3. Dashboard should load with data

---

## 📊 Monitoring & Logs

### Render Backend Logs

- Log in to Render dashboard
- Select your service → "Logs" tab
- View real-time logs and deployment history

### Vercel Frontend Logs

- Log in to Vercel dashboard
- Select your project
- View build logs and runtime logs

---

## 🆘 Common Issues & Solutions

### Issue: "401 Unauthorized" on API calls

**Solution**:

- Verify `VITE_API_URL` environment variable is set correctly
- Check JWT token is being sent in Authorization header
- Verify backend is running and accessible

### Issue: CORS errors

**Solution**:

- Confirm frontend URL is in backend CORS origin list
- Restart both services
- Clear browser cache and cookies

### Issue: "Cannot find module" on Render

**Solution**:

- Ensure `npm install` runs successfully
- Check `package.json` has all dependencies
- Verify `node_modules` is not in `.gitignore`

### Issue: Vercel can't find API

**Solution**:

- Verify `VITE_API_URL` is correct
- Check API is running on Render
- Test API directly: `curl https://task-management-api-xxxxx.onrender.com/`

### Issue: Database connection timeout

**Solution**:

- Verify MongoDB Atlas IP whitelist includes Render IPs
- Use MongoDB Atlas → Network Access → Add `0.0.0.0/0` for development
- Check MONGODB_URI connection string is correct

---

## 🔐 Security Checklist

- [ ] JWT secrets are strong and random (32+ characters)
- [ ] Never commit `.env` files to GitHub
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS (automatic on Vercel & Render)
- [ ] Verify CORS is restricted to your domain
- [ ] Test authentication flows after deployment
- [ ] Monitor logs for suspicious activity

---

## 🚀 Continuous Deployment

Both Vercel and Render support automatic deployments:

1. **Vercel**: Automatically deploys on `git push` to main
2. **Render**: Can be configured for auto-deploy from GitHub

Disable auto-deploy if you need manual approval:

- Render: Service Settings → Turn off "Auto-Deploy"
- Vercel: Project Settings → Deployment → Uncheck "Auto-deploy"

---

## 📞 Support URLs

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas/docs
- **Express Docs**: https://expressjs.com/
- **React Docs**: https://react.dev/

---

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Update frontend environment variables
3. ✅ Deploy frontend to Vercel
4. ✅ Test all API endpoints (see API_ENDPOINTS.md)
5. ✅ Monitor logs and performance
6. ✅ Set up automated testing (optional)
