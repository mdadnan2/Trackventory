# 📦 Trackventory - Community Distribution Management System

<div align="center">

**A production-grade, enterprise-level full-stack platform for managing humanitarian and community distribution operations**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

</div>

---

## 🌟 Overview

Trackventory is a sophisticated inventory and distribution management system designed for NGOs, relief organizations, and community groups. Built with financial-grade architecture principles, it provides **immutable audit trails**, **real-time stock tracking**, and **comprehensive distribution analytics** for field operations.

Whether you're managing disaster relief supplies, food distribution programs, or community aid initiatives, Trackventory ensures **complete accountability** and **operational transparency** from warehouse to beneficiary.

## ✨ Key Features

### 📖 Ledger-Based Architecture
- **Immutable Transaction History**: All stock movements recorded in an append-only ledger
- **Zero Data Loss**: Complete audit trail from procurement to distribution
- **Real-Time Calculations**: Stock levels computed dynamically from transaction history
- **Financial-Grade Integrity**: No manual stock adjustments, only verifiable transactions

### 🔐 Enterprise Security
- **Firebase Authentication**: Secure Google OAuth integration
- **Role-Based Access Control (RBAC)**: Granular permissions for Admin and Volunteer roles
- **Token-Based Authorization**: JWT verification on every request
- **Backend Validation**: Never trust client input - all business logic server-side

### 🔄 Stock Lifecycle Management
```
Central Warehouse → Volunteer Assignment → Field Distribution → Damage Reporting
                           ↓↑
                  Volunteer-to-Volunteer Transfer
```
- Track inventory through complete distribution pipeline
- Assign stock to field volunteers with accountability
- **Transfer stock between volunteers** for field-level resource rebalancing
- Record distributions with geographic and demographic data
- Report and track damaged/expired items

### 📊 Advanced Analytics & Reporting
- **Stock Summary Reports**: Real-time inventory across all locations
- **Volunteer Stock Tracking**: Individual volunteer inventory and distribution history
- **Campaign Analytics**: Performance metrics for distribution campaigns
- **Repeat Distribution Detection**: Identify areas receiving multiple distributions
- **Geographic Insights**: City and area-level distribution patterns

### ⚙️ Production-Ready Architecture
- **Atomic Database Transactions**: ACID compliance for multi-step operations
- **Idempotency**: Duplicate request prevention using unique request IDs
- **Error Handling**: Comprehensive error management and logging
- **Type Safety**: End-to-end TypeScript for reliability
- **Scalable Design**: Modular architecture ready for growth

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js with modular architecture
- **Database**: MongoDB 6+ with Mongoose ODM
- **Authentication**: Firebase Admin SDK
- **Validation**: Zod schema validation
- **Architecture**: Clean architecture with separation of concerns

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design
- **Authentication**: Firebase Client SDK
- **HTTP Client**: Axios with interceptors
- **State Management**: React hooks and context

## Project Structure

```
trackventory/
├── backend/
│   ├── src/
│   │   ├── modules/          # Feature modules
│   │   ├── middleware/       # Auth & error handling
│   │   ├── database/         # Models & schemas
│   │   └── utils/            # Utilities
│   └── package.json
└── frontend/
    ├── app/                  # Next.js pages
    ├── components/           # React components
    ├── services/             # API client
    └── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- MongoDB 6 or higher
- Firebase Project (for authentication)

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables** - Create `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/trackventory
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_PRIVATE_KEY=your-private-key
   NODE_ENV=development
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables** - Create `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** at `http://localhost:3000`

## 📚 Core Business Rules

Trackventory follows strict architectural principles to ensure data integrity:

1. **🚫 NO STOCK FIELD** - Stock is always calculated from transactions (never stored)
2. **🔒 NO TRANSACTION DELETION** - All history is immutable and auditable
3. **⚛️ ATOMIC OPERATIONS** - All multi-step operations use database transactions
4. **🔁 IDEMPOTENCY** - Duplicate requests are prevented with unique IDs
5. **✅ NEVER TRUST FRONTEND** - All validations and business logic on backend

## 💻 API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Google OAuth login |

### User Management (Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/users` | Create new user |
| `GET` | `/api/users` | List all users |
| `PATCH` | `/api/users/:id` | Update user details |

### Item Management
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/api/items` | Create inventory item | Admin |
| `GET` | `/api/items` | List all items | All |
| `PATCH` | `/api/items/:id` | Update item details | Admin |

### Stock Management
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/stock/central` | Get central warehouse stock | All |
| `GET` | `/api/stock/volunteer/:id` | Get volunteer stock | All |
| `POST` | `/api/stock/add` | Add stock to central warehouse | Admin |
| `POST` | `/api/stock/assign` | Assign stock to volunteer | Admin |
| `POST` | `/api/stock/return` | Return stock to central warehouse | All |
| `POST` | `/api/stock/transfer` | Transfer stock between volunteers | All |

### Distribution Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/distribution` | Record field distribution |
| `POST` | `/api/distribution/damage` | Report damaged items |
| `GET` | `/api/distribution` | List distributions with filters |

### Analytics & Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/reports/stock-summary` | Current stock across all locations |
| `GET` | `/api/reports/volunteer-stock` | Volunteer-wise stock summary |
| `GET` | `/api/reports/campaign-distribution` | Campaign performance metrics |
| `GET` | `/api/reports/repeat-distribution` | Areas with repeat distributions |

## 🗂️ Database Schema

### Collections Overview

| Collection | Purpose | Key Features |
|------------|---------|-------------|
| `users` | User accounts and roles | Firebase UID, role-based access |
| `items` | Inventory item catalog | Name, unit, category |
| `packages` | Pre-defined item bundles | Multiple items with quantities |
| `cities` | Geographic master data | City and area hierarchy |
| `campaigns` | Distribution campaigns | Campaign tracking and analytics |
| `inventory_transactions` | **CORE LEDGER** | Immutable stock movement history |
| `volunteer_stock_assignments` | Stock assignment records | Volunteer accountability |
| `distributions` | Distribution records | Beneficiary and location data |

### Transaction Types
- `STOCK_IN`: Items added to central warehouse
- `ISSUE_TO_VOLUNTEER`: Stock transferred to field volunteer
- `DISTRIBUTION`: Items distributed to beneficiaries
- `DAMAGE`: Damaged/expired items reported
- `RETURN_TO_CENTRAL`: Stock returned from volunteer to warehouse
- `VOLUNTEER_TRANSFER`: Stock transferred between volunteers

## 🔒 Security

- **Firebase Authentication**: Industry-standard OAuth 2.0 with Google
- **Token Verification**: Firebase ID tokens verified on every request
- **Database Authorization**: User roles stored and validated server-side
- **Role-Based Access Control**: Granular permissions for Admin and Volunteer
- **No Custom Claims**: Authorization logic in database, not Firebase
- **Protected Routes**: Middleware-based route protection
- **Input Validation**: Zod schema validation on all endpoints
- **SQL Injection Prevention**: MongoDB parameterized queries

---

## 💯 Use Cases

Trackventory is perfect for:

- 🌍 **Humanitarian Organizations**: Disaster relief and emergency aid distribution
- 🍞 **Food Banks**: Community food distribution programs
- 🏫 **NGOs**: Educational material and supply distribution
- 🏥 **Healthcare**: Medical supply tracking for field clinics
- 🎁 **Community Programs**: Seasonal aid and donation distribution

---

## 🛣️ Roadmap

- [ ] Mobile app for field volunteers
- [ ] Barcode/QR code scanning
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Export reports to PDF/Excel
- [ ] SMS notifications for volunteers
- [ ] Offline mode with sync

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

<div align="center">

**Built with ❤️ for communities that make a difference**

</div>
