# Vercel Deployment Environment Variables

Add these to your Vercel Dashboard → Project → Settings → Environment Variables:

```
VITE_API_URL=https://task-management-system-p4vx.onrender.com
VITE_SOCKET_URL=https://task-management-system-p4vx.onrender.com
```

## Backend CORS Status

Backend/server.js already configured for production:

- Origin: `https://task-management-frontend.vercel.app`, `https://task-management-frontend-git-main-kelvin-maina.vercel.app`
- Credentials: `true`

## Verification Commands

```bash
# Backend
cd Backend && npm install

# Frontend build test
cd Frontend && npm run build

# Test API connectivity
curl https://task-management-system-p4vx.onrender.com/
```
