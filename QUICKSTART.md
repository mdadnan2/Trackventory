# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
# Install all dependencies (backend + frontend)
npm run install:all
```

Or manually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Step 2: Setup Firebase

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Google Authentication
3. Get credentials (see DEPLOYMENT.md for details)

### Step 3: Setup MongoDB

**Option A: Local MongoDB**
```bash
# Make sure MongoDB is running
mongod
```

**Option B: MongoDB Atlas**
- Create free cluster at https://www.mongodb.com/cloud/atlas
- Get connection string

### Step 4: Configure Environment Variables

**Backend** (`backend/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/trackventory
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key
NODE_ENV=development
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Step 5: Start Development Servers

**Terminal 1 - Backend:**
```bash
npm run dev:backend
# or
cd backend && npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
# or
cd frontend && npm run dev
```

### Step 6: Create First Admin User

1. Open http://localhost:3000
2. Sign in with Google
3. Check browser console for your Firebase UID
4. Connect to MongoDB and insert admin user:

```javascript
use trackventory

db.users.insertOne({
  firebaseUid: "YOUR-FIREBASE-UID-FROM-CONSOLE",
  name: "Admin User",
  email: "your-email@example.com",
  role: "ADMIN",
  status: "ACTIVE",
  createdAt: new Date()
})
```

5. Refresh the page - you should now have admin access!

---

## 📋 Initial Setup Checklist

After logging in as admin, set up your system:

1. **Add Cities**
   - Go to Dashboard → Cities
   - Add cities where you operate

2. **Add Items**
   - Go to Dashboard → Items
   - Add inventory items (e.g., Rice, Blankets, Water)

3. **Create Volunteer Users**
   - Go to Dashboard → Users
   - Add volunteer accounts (you'll need their Firebase UIDs)

4. **Add Initial Stock**
   - Go to Dashboard → Stock
   - Add stock to central inventory

5. **Assign Stock to Volunteers**
   - Go to Dashboard → Stock → Assign to Volunteer
   - Distribute stock to volunteers

---

## 🎯 Common Tasks

### As Admin:
- **Add Stock**: Dashboard → Stock → Add Stock
- **Assign to Volunteer**: Dashboard → Stock → Assign to Volunteer
- **View Reports**: Dashboard → Reports
- **Manage Users**: Dashboard → Users

### As Volunteer:
- **View My Stock**: Dashboard (home page)
- **Record Distribution**: Dashboard → Distribution
- **Report Damage**: Dashboard → Distribution → Report Damage
- **View History**: Dashboard → Reports

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check if MongoDB is running
mongosh

# Check if port 5000 is available
netstat -ano | findstr :5000  # Windows
lsof -i :5000                  # Mac/Linux
```

### Frontend won't start
```bash
# Check if port 3000 is available
netstat -ano | findstr :3000  # Windows
lsof -i :3000                  # Mac/Linux

# Clear Next.js cache
cd frontend
rm -rf .next
npm run dev
```

### Can't login
- Verify Firebase credentials in both `.env` files
- Check Firebase Console → Authentication → Users
- Ensure user exists in MongoDB with correct `firebaseUid`

### Stock calculations seem wrong
- Stock is calculated from transactions - never edit transactions directly
- Check `inventory_transactions` collection in MongoDB
- Use the API to make corrections

---

## 📚 Documentation

- **API Documentation**: See `API_DOCUMENTATION.md`
- **Deployment Guide**: See `DEPLOYMENT.md`
- **Project Overview**: See `README.md`

---

## 🏗️ Architecture Overview

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────┐      ┌──────────────┐
│  Next.js    │◄────►│   Firebase   │
│  Frontend   │      │     Auth     │
└──────┬──────┘      └──────────────┘
       │ REST API
       ▼
┌─────────────┐      ┌──────────────┐
│  Express    │◄────►│   Firebase   │
│   Backend   │      │  Admin SDK   │
└──────┬──────┘      └──────────────┘
       │
       ▼
┌─────────────┐
│   MongoDB   │
│   Database  │
└─────────────┘
```

---

## 🎓 Key Concepts

### Ledger-Based Inventory
- Stock is NEVER stored as a number
- All stock is calculated from `inventory_transactions`
- This ensures complete audit trail and data integrity

### Transaction Types
- `STOCK_IN` - Admin adds stock to central
- `ISSUE_TO_VOLUNTEER` - Stock assigned to volunteer
- `DISTRIBUTION` - Volunteer distributes to people
- `DAMAGE` - Volunteer reports damaged/lost items
- `ADJUSTMENT` - Admin correction (if needed)

### Stock Flow
```
Central Stock → Volunteer Stock → Distribution
                                → Damage
```

### Idempotency
- All distribution/damage operations use unique `requestId`
- Prevents duplicate submissions
- Safe to retry failed requests

---

## 💡 Best Practices

1. **Never delete transactions** - Use adjustment transactions instead
2. **Always use unique requestId** - Prevents duplicates
3. **Validate on backend** - Never trust frontend data
4. **Use atomic transactions** - For multi-step operations
5. **Regular backups** - Backup MongoDB regularly

---

## 🆘 Need Help?

1. Check the logs:
   - Backend: Terminal running `npm run dev:backend`
   - Frontend: Browser console (F12)
   - MongoDB: Use MongoDB Compass

2. Review documentation:
   - API_DOCUMENTATION.md
   - DEPLOYMENT.md
   - README.md

3. Common issues:
   - Authentication: Check Firebase setup
   - Database: Verify MongoDB connection
   - Permissions: Ensure user has correct role

---

## ✅ You're Ready!

Your Community Distribution Management System is now running!

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Docs: See API_DOCUMENTATION.md

Happy distributing! 🎉
