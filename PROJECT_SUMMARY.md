# Trackventory - Project Summary

## 🎯 Project Overview

Trackventory is a production-grade Community Distribution Management System designed to track the complete lifecycle of inventory from central storage through volunteer distribution to end beneficiaries. Built with accounting-grade data integrity principles, it ensures complete audit trails and prevents data inconsistencies.

---

## ✨ Key Features

### 1. Ledger-Based Inventory System
- **No Direct Stock Storage**: Stock values are never stored directly
- **Transaction Ledger**: All stock calculated from immutable transaction history
- **Complete Audit Trail**: Every stock movement is recorded and traceable
- **Data Integrity**: Impossible to have inconsistent stock values

### 2. Role-Based Access Control
- **Admin Role**: Full system access
  - Create users, items, cities, packages
  - Add stock to central inventory
  - Assign stock to volunteers
  - View all reports
  
- **Volunteer Role**: Field operations
  - View assigned stock
  - Record distributions
  - Report damage/loss
  - View personal distribution history

### 3. Stock Lifecycle Management
```
Central Inventory → Volunteer Assignment → Distribution → Beneficiaries
                                        → Damage/Loss
```

### 4. Geographic Tracking
- **City-Based**: Track distributions by city
- **Area-Level**: Free-text area names for granular tracking
- **Repeat Distribution Detection**: Identify frequently served areas

### 5. Campaign Management
- **Optional Campaigns**: Link distributions to specific campaigns
- **Campaign Reports**: Aggregate distribution data by campaign
- **Multi-Campaign Support**: Run multiple campaigns simultaneously

### 6. Atomic Operations
- **Database Transactions**: All multi-step operations are atomic
- **Rollback on Failure**: Automatic rollback if any step fails
- **Data Consistency**: Guaranteed consistency across collections

### 7. Idempotency Protection
- **Unique Request IDs**: Prevent duplicate submissions
- **Safe Retries**: Can safely retry failed requests
- **Conflict Detection**: Returns error on duplicate attempts

### 8. Comprehensive Reporting
- **Stock Summary**: Current stock across all locations
- **Volunteer Inventory**: What each volunteer currently holds
- **Campaign Analytics**: Distribution statistics by campaign
- **Repeat Distribution**: Areas receiving multiple distributions

---

## 🏗️ Technical Architecture

### Backend Stack
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Firebase Admin SDK
- **Validation**: Zod schemas
- **Architecture**: Modular service-repository pattern

### Frontend Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Client SDK
- **HTTP Client**: Axios
- **State Management**: React Context (Auth)

### Database Design
- **Users**: User accounts with roles and status
- **Items**: Inventory item master data
- **Packages**: Predefined item bundles
- **Cities**: City master data
- **Campaigns**: Distribution campaigns
- **Inventory Transactions**: **CORE LEDGER** - All stock movements
- **Volunteer Stock Assignments**: Assignment records
- **Distributions**: Distribution records with idempotency

---

## 🔒 Security Features

### Authentication
- Google OAuth via Firebase
- ID token verification on every request
- No password storage

### Authorization
- Database-stored user roles (not Firebase claims)
- Middleware-based role checking
- Route-level protection

### Data Protection
- Environment variable configuration
- No credentials in code
- CORS configuration
- Input validation on all endpoints

---

## 📊 Business Rules

### Core Principles
1. **Immutable History**: Transactions are never deleted
2. **Calculated Stock**: Stock is always computed from transactions
3. **Atomic Operations**: Multi-step operations are all-or-nothing
4. **Idempotent Requests**: Duplicate submissions are prevented
5. **Backend Validation**: Never trust frontend data

### Stock Calculations
```javascript
// Central Stock
SUM(STOCK_IN) - SUM(ISSUE_TO_VOLUNTEER)

// Volunteer Stock
SUM(ISSUE_TO_VOLUNTEER) - SUM(DISTRIBUTION) - SUM(DAMAGE)

// Total Distributed
SUM(DISTRIBUTION)

// Total Damaged
SUM(DAMAGE)
```

### Transaction Types
- **STOCK_IN**: Admin adds stock to central inventory
- **ISSUE_TO_VOLUNTEER**: Stock assigned from central to volunteer
- **DISTRIBUTION**: Volunteer distributes to beneficiaries
- **DAMAGE**: Volunteer reports damaged/lost items
- **ADJUSTMENT**: Admin correction (if needed)

---

## 🎨 User Interface

### Responsive Design
- **Desktop**: Full-featured dashboard with tables and forms
- **Mobile**: Touch-optimized interface for field use
- **Tablet**: Adaptive layout for both orientations

### Admin Dashboard
- Stock summary overview
- Quick actions for common tasks
- User management
- Item and city management
- Stock operations (add/assign)
- Comprehensive reports

### Volunteer Dashboard
- Personal stock overview
- Distribution recording form
- Damage reporting
- Distribution history

---

## 📈 Scalability

### Database
- Indexed collections for fast queries
- Aggregation pipelines for reports
- Connection pooling
- Ready for sharding (1M+ records)

### Backend
- Stateless design
- Horizontal scaling ready
- PM2 cluster mode support
- Caching-ready architecture

### Frontend
- Static generation where possible
- Code splitting
- Lazy loading
- Image optimization

---

## 🔄 Data Flow Examples

### Adding Stock (Admin)
1. Admin submits stock addition form
2. Backend validates items exist
3. Creates STOCK_IN transactions
4. Returns success
5. Central stock automatically increases

### Assigning Stock (Admin)
1. Admin selects volunteer and items
2. Backend validates:
   - Volunteer exists and is active
   - Items exist and are active
   - Central stock is sufficient
3. Creates assignment record
4. Creates ISSUE_TO_VOLUNTEER transactions (OUT from central)
5. Returns success
6. Central stock decreases, volunteer stock increases

### Recording Distribution (Volunteer)
1. Volunteer submits distribution form
2. Backend validates:
   - City exists
   - Items exist
   - Volunteer has sufficient stock
   - RequestId is unique
3. Creates distribution record
4. Creates DISTRIBUTION transactions (OUT from volunteer)
5. Returns success
6. Volunteer stock decreases

### Reporting Damage (Volunteer)
1. Volunteer submits damage report
2. Backend validates:
   - Items exist
   - Volunteer has sufficient stock
   - RequestId is unique
3. Creates DAMAGE transactions (OUT from volunteer)
4. Returns success
5. Volunteer stock decreases

---

## 📋 API Endpoints Summary

### Public
- `POST /api/auth/login` - Google login

### Admin Only
- `POST /api/users` - Create user
- `POST /api/items` - Create item
- `POST /api/cities` - Create city
- `POST /api/campaigns` - Create campaign
- `POST /api/packages` - Create package
- `POST /api/stock/add` - Add stock
- `POST /api/stock/assign` - Assign stock

### Authenticated
- `GET /api/items` - List items
- `GET /api/cities` - List cities
- `GET /api/campaigns` - List campaigns
- `GET /api/stock/central` - Get central stock
- `GET /api/stock/volunteer/:id` - Get volunteer stock
- `POST /api/distribution` - Record distribution
- `POST /api/distribution/damage` - Report damage
- `GET /api/reports/*` - Various reports

---

## 🧪 Testing Recommendations

### Unit Tests
- Service layer business logic
- Stock calculation functions
- Validation schemas

### Integration Tests
- API endpoints
- Database operations
- Transaction rollbacks

### E2E Tests
- Complete user flows
- Admin operations
- Volunteer operations

---

## 🚀 Deployment Options

### Backend
- **VPS**: Ubuntu/Debian with PM2
- **PaaS**: Heroku, Railway, Render
- **Container**: Docker + Kubernetes
- **Serverless**: AWS Lambda (with modifications)

### Frontend
- **Vercel**: Recommended (Next.js native)
- **Netlify**: Full support
- **AWS Amplify**: Full support
- **Self-hosted**: Nginx + PM2

### Database
- **MongoDB Atlas**: Recommended (managed)
- **Self-hosted**: MongoDB on VPS
- **Docker**: MongoDB container

---

## 📦 Project Structure

```
trackventory/
├── backend/
│   ├── src/
│   │   ├── modules/          # Feature modules (auth, users, items, etc.)
│   │   ├── middleware/       # Auth, error handling
│   │   ├── database/         # Models, schemas
│   │   ├── utils/            # Helpers, transactions
│   │   └── app.ts           # Express app
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/                  # Next.js pages
│   ├── components/           # React components
│   ├── services/             # API client
│   ├── hooks/                # Custom hooks
│   ├── types/                # TypeScript types
│   ├── lib/                  # Firebase config
│   ├── package.json
│   └── tsconfig.json
├── README.md
├── QUICKSTART.md
├── API_DOCUMENTATION.md
├── DEPLOYMENT.md
└── package.json
```

---

## 🎓 Learning Resources

### For Developers
- **Backend**: Express.js, MongoDB, Mongoose
- **Frontend**: Next.js, React, Tailwind CSS
- **Auth**: Firebase Authentication
- **TypeScript**: Type safety throughout

### For Administrators
- **User Management**: Creating and managing users
- **Inventory**: Adding and assigning stock
- **Reports**: Understanding stock movements

### For Volunteers
- **Stock Management**: Viewing assigned inventory
- **Distribution**: Recording distributions
- **Reporting**: Damage and loss reporting

---

## 🔮 Future Enhancements

### Potential Features
- [ ] Mobile app (React Native)
- [ ] Offline support with sync
- [ ] Barcode/QR code scanning
- [ ] Photo attachments for distributions
- [ ] SMS notifications
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Export to Excel/PDF
- [ ] Bulk operations
- [ ] API rate limiting
- [ ] Redis caching
- [ ] Real-time updates (WebSocket)

---

## 📄 License

MIT License - Free for personal and commercial use

---

## 🤝 Contributing

This is a production-ready template. Feel free to:
- Fork and customize for your needs
- Report issues
- Suggest improvements
- Share your implementations

---

## 📞 Support

For questions or issues:
1. Check documentation files
2. Review API documentation
3. Check deployment guide
4. Review code comments

---

**Built with ❤️ for community service organizations**
