# Deployment Debug Steps

1. Push db.js debug logs
2. Deploy Backend to Render
3. Check Render logs for MONGO_URI debug output
4. Share the logs here
5. Remove debug logs after fixing

**Current Backend ENV vars needed:**

- MONGO_URI=your_mongodb_atlas_connection_string
- JWT_SECRET=your_secret
- NODE_ENV=production

Test local: `cd Backend && npm run dev`
