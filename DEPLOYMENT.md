# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB 6+ (local or cloud like MongoDB Atlas)
- Firebase project configured
- Domain name (for production)

---

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Google Authentication:
   - Go to Authentication → Sign-in method
   - Enable Google provider

### 2. Get Firebase Credentials

**For Backend (Admin SDK):**
1. Go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save the JSON file
4. Extract these values for `.env`:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

**For Frontend (Client SDK):**
1. Go to Project Settings → General
2. Under "Your apps", add a Web app
3. Copy the config values for `.env.local`

---

## MongoDB Setup

### Option 1: Local MongoDB
```bash
# Install MongoDB
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Start MongoDB
sudo systemctl start mongodb  # Linux
brew services start mongodb-community  # macOS
```

### Option 2: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for development)
5. Get connection string

---

## Backend Deployment

### Development
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Production Deployment (PM2)
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/app.js --name trackventory-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Environment Variables (Production)
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/trackventory
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
NODE_ENV=production
```

---

## Frontend Deployment

### Development
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with your credentials
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=.next
```

### Environment Variables (Production)
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

---

## Nginx Configuration (Optional)

If deploying backend on your own server:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable SSL with Let's Encrypt:
```bash
sudo certbot --nginx -d api.yourdomain.com
```

---

## Database Indexes

Indexes are automatically created by Mongoose schemas, but verify:

```javascript
// In MongoDB shell or Compass
db.users.getIndexes()
db.items.getIndexes()
db.inventory_transactions.getIndexes()
db.distributions.getIndexes()
```

---

## Initial Setup

### 1. Create First Admin User

After deploying, you need to manually create the first admin user in MongoDB:

```javascript
// Connect to MongoDB
use trackventory

// Insert first admin (replace with actual Firebase UID)
db.users.insertOne({
  firebaseUid: "firebase-uid-from-google-login",
  name: "Admin User",
  email: "admin@example.com",
  role: "ADMIN",
  status: "ACTIVE",
  createdAt: new Date()
})
```

**Steps:**
1. Sign in with Google on the frontend
2. Check browser console for Firebase UID
3. Insert user document with that UID
4. Refresh the page

### 2. Add Initial Data

Use the admin account to:
1. Create cities
2. Create items
3. Create volunteer users
4. Add initial stock

---

## Monitoring

### Backend Logs (PM2)
```bash
pm2 logs trackventory-backend
pm2 monit
```

### Database Monitoring
- Use MongoDB Atlas monitoring dashboard
- Or install MongoDB Compass for local monitoring

---

## Backup Strategy

### MongoDB Backup
```bash
# Backup
mongodump --uri="mongodb://localhost:27017/trackventory" --out=/backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://localhost:27017/trackventory" /backup/20240101
```

### Automated Backups (Cron)
```bash
# Add to crontab
0 2 * * * mongodump --uri="mongodb://localhost:27017/trackventory" --out=/backup/$(date +\%Y\%m\%d)
```

---

## Security Checklist

- [ ] Environment variables are not committed to Git
- [ ] MongoDB has authentication enabled
- [ ] MongoDB network access is restricted
- [ ] Firebase rules are configured
- [ ] HTTPS is enabled (SSL certificate)
- [ ] CORS is configured for production domain only
- [ ] Rate limiting is implemented (optional)
- [ ] Regular backups are scheduled

---

## Troubleshooting

### Backend won't start
- Check MongoDB connection
- Verify Firebase credentials
- Check port availability: `lsof -i :5000`

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS configuration in backend
- Verify backend is running

### Authentication fails
- Verify Firebase credentials match between frontend and backend
- Check Firebase console for authentication errors
- Ensure user exists in database

### Stock calculations are wrong
- Never modify `inventory_transactions` directly
- Use correction transactions via API
- Check transaction types and directions

---

## Performance Optimization

### Backend
- Enable MongoDB connection pooling (default in Mongoose)
- Add Redis caching for reports (optional)
- Use PM2 cluster mode for multiple cores

### Frontend
- Enable Next.js image optimization
- Use static generation where possible
- Implement lazy loading for large lists

### Database
- Ensure all indexes are created
- Monitor slow queries
- Consider sharding for large datasets (>1M records)

---

## Support

For issues or questions:
1. Check logs: `pm2 logs` (backend) or browser console (frontend)
2. Review API documentation
3. Check MongoDB connection and data integrity
4. Verify Firebase authentication setup
