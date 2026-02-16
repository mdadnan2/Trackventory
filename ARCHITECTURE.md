# System Architecture Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐              ┌──────────────┐                │
│  │    Admin     │              │  Volunteer   │                │
│  │   (Desktop)  │              │   (Mobile)   │                │
│  └──────┬───────┘              └──────┬───────┘                │
│         │                              │                         │
│         └──────────────┬───────────────┘                        │
│                        │                                         │
└────────────────────────┼─────────────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER (Next.js)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    React Components                         │ │
│  │  • Login Page        • Dashboard        • Reports          │ │
│  │  • Items Page        • Stock Page       • Distribution     │ │
│  │  • Users Page        • Cities Page                         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Services & Hooks                         │ │
│  │  • API Client        • useAuth Hook     • Firebase Client  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ REST API (JSON)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND LAYER (Express.js)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      Middleware                             │ │
│  │  • Firebase Token Verification                             │ │
│  │  • User Attachment from DB                                 │ │
│  │  • Role-Based Authorization                                │ │
│  │  • Error Handler                                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Feature Modules                          │ │
│  │                                                             │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │ │
│  │  │   Auth   │  │  Users   │  │  Items   │  │ Packages │  │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │ │
│  │                                                             │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │ │
│  │  │  Cities  │  │Campaigns │  │  Stock   │  │Distribut.│  │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │ │
│  │                                                             │ │
│  │  ┌──────────┐                                              │ │
│  │  │ Reports  │                                              │ │
│  │  └──────────┘                                              │ │
│  │                                                             │ │
│  │  Each module: Controller → Service → Repository (Mongoose) │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Mongoose ODM
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER (MongoDB)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      Collections                            │ │
│  │                                                             │ │
│  │  • users                    • items                        │ │
│  │  • packages                 • cities                       │ │
│  │  • campaigns                                               │ │
│  │  • inventory_transactions   ◄── CORE LEDGER               │ │
│  │  • volunteer_stock_assignments                            │ │
│  │  • distributions                                           │ │
│  │                                                             │ │
│  │  All with proper indexes and schemas                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  Firebase Authentication                    │ │
│  │  • Google OAuth Provider                                   │ │
│  │  • ID Token Generation                                     │ │
│  │  • Token Verification (Admin SDK)                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. User Authentication Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │ 1. Click "Sign in with Google"
     ▼
┌──────────────┐
│   Frontend   │
└────┬─────────┘
     │ 2. Redirect to Google OAuth
     ▼
┌──────────────┐
│   Firebase   │
│     Auth     │
└────┬─────────┘
     │ 3. Return ID Token
     ▼
┌──────────────┐
│   Frontend   │
└────┬─────────┘
     │ 4. POST /api/auth/login with ID Token
     ▼
┌──────────────┐
│   Backend    │
└────┬─────────┘
     │ 5. Verify token with Firebase Admin SDK
     │ 6. Lookup user in MongoDB by firebaseUid
     │ 7. Check user status (ACTIVE/BLOCKED)
     ▼
┌──────────────┐
│   MongoDB    │
└────┬─────────┘
     │ 8. Return user data
     ▼
┌──────────────┐
│   Backend    │
└────┬─────────┘
     │ 9. Return user info to frontend
     ▼
┌──────────────┐
│   Frontend   │
│ (Logged In)  │
└──────────────┘
```

### 2. Stock Addition Flow (Admin)

```
┌──────────┐
│  Admin   │
└────┬─────┘
     │ 1. Submit "Add Stock" form
     ▼
┌──────────────┐
│   Frontend   │
└────┬─────────┘
     │ 2. POST /api/stock/add
     │    { items: [{ itemId, quantity }] }
     ▼
┌──────────────┐
│   Backend    │
│  Middleware  │
└────┬─────────┘
     │ 3. Verify Firebase token
     │ 4. Attach user from DB
     │ 5. Check role = ADMIN
     ▼
┌──────────────┐
│   Backend    │
│   Service    │
└────┬─────────┘
     │ 6. Start DB transaction
     │ 7. Validate items exist
     │ 8. Create STOCK_IN transactions
     │ 9. Commit transaction
     ▼
┌──────────────┐
│   MongoDB    │
│ inventory_   │
│ transactions │
└────┬─────────┘
     │ 10. Transactions saved
     ▼
┌──────────────┐
│   Backend    │
└────┬─────────┘
     │ 11. Return success
     ▼
┌──────────────┐
│   Frontend   │
│ (Stock Added)│
└──────────────┘
```

### 3. Distribution Recording Flow (Volunteer)

```
┌──────────┐
│Volunteer │
└────┬─────┘
     │ 1. Submit distribution form
     ▼
┌──────────────┐
│   Frontend   │
└────┬─────────┘
     │ 2. POST /api/distribution
     │    { cityId, area, items, requestId }
     ▼
┌──────────────┐
│   Backend    │
│  Middleware  │
└────┬─────────┘
     │ 3. Verify token & attach user
     ▼
┌──────────────┐
│   Backend    │
│   Service    │
└────┬─────────┘
     │ 4. Start DB transaction
     │ 5. Check requestId unique
     │ 6. Validate city exists
     │ 7. Validate items exist
     │ 8. Calculate volunteer stock
     │ 9. Verify sufficient stock
     │ 10. Create distribution record
     │ 11. Create DISTRIBUTION transactions
     │ 12. Commit transaction
     ▼
┌──────────────┐
│   MongoDB    │
│ distributions│
│ inventory_   │
│ transactions │
└────┬─────────┘
     │ 13. Records saved
     ▼
┌──────────────┐
│   Backend    │
└────┬─────────┘
     │ 14. Return success
     ▼
┌──────────────┐
│   Frontend   │
│(Distribution │
│  Recorded)   │
└──────────────┘
```

### 4. Stock Calculation Flow

```
┌──────────┐
│   User   │
└────┬─────┘
     │ 1. Request stock summary
     ▼
┌──────────────┐
│   Frontend   │
└────┬─────────┘
     │ 2. GET /api/reports/stock-summary
     ▼
┌──────────────┐
│   Backend    │
│   Service    │
└────┬─────────┘
     │ 3. Query inventory_transactions
     │
     │ Central Stock:
     │ ┌─────────────────────────────────┐
     │ │ SUM(STOCK_IN direction=IN)      │
     │ │ - SUM(ISSUE_TO_VOLUNTEER OUT)   │
     │ └─────────────────────────────────┘
     │
     │ Volunteer Stock:
     │ ┌─────────────────────────────────┐
     │ │ SUM(ISSUE_TO_VOLUNTEER IN)      │
     │ │ - SUM(DISTRIBUTION OUT)         │
     │ │ - SUM(DAMAGE OUT)               │
     │ └─────────────────────────────────┘
     │
     │ 4. Aggregate by itemId
     ▼
┌──────────────┐
│   MongoDB    │
│ inventory_   │
│ transactions │
└────┬─────────┘
     │ 5. Return aggregated data
     ▼
┌──────────────┐
│   Backend    │
└────┬─────────┘
     │ 6. Join with items collection
     │ 7. Format response
     ▼
┌──────────────┐
│   Frontend   │
│ (Display     │
│  Report)     │
└──────────────┘
```

---

## Module Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         MODULES                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────┐                                                    │
│  │   Auth   │──────────────────────────────────────┐            │
│  └──────────┘                                       │            │
│       │                                             │            │
│       │ Authenticates                               │            │
│       ▼                                             ▼            │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐  ┌──────────┐ │
│  │  Users   │────▶│  Stock   │────▶│Distribut.│  │ Reports  │ │
│  └──────────┘     └──────────┘     └──────────┘  └──────────┘ │
│       │                 │                 │             │       │
│       │                 │                 │             │       │
│       │                 ▼                 ▼             │       │
│       │           ┌──────────┐     ┌──────────┐        │       │
│       │           │  Items   │     │  Cities  │        │       │
│       │           └──────────┘     └──────────┘        │       │
│       │                 │                               │       │
│       │                 ▼                               │       │
│       │           ┌──────────┐                         │       │
│       │           │ Packages │                         │       │
│       │           └──────────┘                         │       │
│       │                                                 │       │
│       │                 ┌──────────┐                   │       │
│       └────────────────▶│Campaigns │◀──────────────────┘       │
│                         └──────────┘                            │
│                                                                  │
│  All modules interact with:                                     │
│  • inventory_transactions (for stock movements)                 │
│  • Middleware (for auth & authorization)                        │
│  • Utils (for transactions & errors)                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Security Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Request                                                           │
│     │                                                              │
│     ▼                                                              │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Layer 1: Firebase Token Verification                       │  │
│  │ • Verify ID token signature                                │  │
│  │ • Check token expiration                                   │  │
│  │ • Extract firebaseUid                                      │  │
│  └────────────────────────────────────────────────────────────┘  │
│     │                                                              │
│     ▼                                                              │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Layer 2: User Lookup & Status Check                        │  │
│  │ • Find user by firebaseUid in MongoDB                      │  │
│  │ • Check user.status === 'ACTIVE'                           │  │
│  │ • Attach user to request                                   │  │
│  └────────────────────────────────────────────────────────────┘  │
│     │                                                              │
│     ▼                                                              │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Layer 3: Role-Based Authorization                          │  │
│  │ • Check user.role against allowed roles                    │  │
│  │ • ADMIN: Full access                                       │  │
│  │ • VOLUNTEER: Limited access                                │  │
│  └────────────────────────────────────────────────────────────┘  │
│     │                                                              │
│     ▼                                                              │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Layer 4: Input Validation                                  │  │
│  │ • Zod schema validation                                    │  │
│  │ • Type checking                                            │  │
│  │ • Business rule validation                                 │  │
│  └────────────────────────────────────────────────────────────┘  │
│     │                                                              │
│     ▼                                                              │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Layer 5: Business Logic                                    │  │
│  │ • Stock availability checks                                │  │
│  │ • Idempotency checks                                       │  │
│  │ • Data integrity validation                                │  │
│  └────────────────────────────────────────────────────────────┘  │
│     │                                                              │
│     ▼                                                              │
│  Success Response                                                 │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Transaction Ledger Concept

```
┌──────────────────────────────────────────────────────────────────┐
│              INVENTORY TRANSACTIONS (LEDGER)                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Every stock movement creates an immutable transaction record:    │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Transaction Record                                         │  │
│  │ ────────────────                                           │  │
│  │ • itemId: ObjectId                                         │  │
│  │ • type: STOCK_IN | ISSUE_TO_VOLUNTEER | DISTRIBUTION |    │  │
│  │         DAMAGE | ADJUSTMENT                                │  │
│  │ • direction: IN | OUT                                      │  │
│  │ • quantity: Number                                         │  │
│  │ • performedBy: ObjectId (user)                             │  │
│  │ • referenceType: String (optional)                         │  │
│  │ • referenceId: ObjectId (optional)                         │  │
│  │ • createdAt: Date                                          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  Stock Calculation:                                                │
│  ─────────────────                                                 │
│                                                                    │
│  Central Stock for Item X:                                        │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ SELECT SUM(quantity)                                       │  │
│  │ FROM inventory_transactions                                │  │
│  │ WHERE itemId = X                                           │  │
│  │   AND type IN ('STOCK_IN', 'ISSUE_TO_VOLUNTEER')          │  │
│  │ GROUP BY direction                                         │  │
│  │                                                            │  │
│  │ Result: IN_total - OUT_total = Central Stock              │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  Volunteer Stock for Item X, Volunteer Y:                         │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ SELECT SUM(quantity)                                       │  │
│  │ FROM inventory_transactions                                │  │
│  │ WHERE itemId = X                                           │  │
│  │   AND performedBy = Y                                      │  │
│  │   AND type IN ('ISSUE_TO_VOLUNTEER',                      │  │
│  │                'DISTRIBUTION', 'DAMAGE')                   │  │
│  │ GROUP BY direction                                         │  │
│  │                                                            │  │
│  │ Result: IN_total - OUT_total = Volunteer Stock            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  Benefits:                                                         │
│  • Complete audit trail                                           │
│  • No data inconsistency possible                                 │
│  • Historical analysis available                                  │
│  • Corrections via new transactions                               │
│  • Immutable history                                              │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

This architecture ensures:
✅ Data integrity
✅ Complete audit trail
✅ Scalability
✅ Security
✅ Maintainability
