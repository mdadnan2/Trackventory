# 📦 Package Feature API Documentation

## Overview
The Package feature allows admins to create pre-defined bundles of items and manage their assignment to volunteers and distribution to beneficiaries.

---

## 🔐 Authentication
All endpoints require Firebase authentication token in the `Authorization` header:
```
Authorization: Bearer <firebase-id-token>
```

---

## 📋 API Endpoints

### 1. Create Package (Admin Only)
**POST** `/api/packages`

Create a new package with items and quantities.

**Request Body:**
```json
{
  "name": "Family Relief Kit",
  "description": "Basic food supplies for family of 4",
  "items": [
    {
      "itemId": "507f1f77bcf86cd799439011",
      "quantity": 5
    },
    {
      "itemId": "507f1f77bcf86cd799439012",
      "quantity": 2
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Family Relief Kit",
    "description": "Basic food supplies for family of 4",
    "items": [
      {
        "itemId": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Rice",
          "unit": "kg"
        },
        "quantity": 5
      }
    ],
    "isActive": true,
    "createdBy": "507f1f77bcf86cd799439014",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

**Validation:**
- ✅ Package name must be unique
- ✅ Must contain at least 1 item
- ✅ All itemIds must exist and be active
- ✅ No duplicate items in package
- ✅ Quantities must be positive

---

### 2. Get All Packages
**GET** `/api/packages?page=1&limit=10`

List all active packages with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Family Relief Kit",
        "description": "Basic food supplies",
        "items": [...]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

---

### 3. Get Package by ID
**GET** `/api/packages/:id`

Get detailed information about a specific package.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Family Relief Kit",
    "description": "Basic food supplies",
    "items": [
      {
        "itemId": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Rice",
          "unit": "kg",
          "category": "Food"
        },
        "quantity": 5
      }
    ],
    "isActive": true,
    "createdBy": "507f1f77bcf86cd799439014",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### 4. Update Package (Admin Only)
**PATCH** `/api/packages/:id`

Update package details.

**Request Body:**
```json
{
  "name": "Updated Family Kit",
  "description": "Updated description",
  "items": [
    {
      "itemId": "507f1f77bcf86cd799439011",
      "quantity": 10
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Updated Family Kit",
    ...
  }
}
```

---

### 5. Delete Package (Admin Only)
**DELETE** `/api/packages/:id`

Soft delete a package (sets isActive to false).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Package deleted successfully"
  }
}
```

---

### 6. Assign Package to Volunteer (Admin Only)
**POST** `/api/packages/assign`

Assign one or more packages to a volunteer. This creates individual item transactions.

**Request Body:**
```json
{
  "packageId": "507f1f77bcf86cd799439013",
  "volunteerId": "507f1f77bcf86cd799439015",
  "quantity": 3,
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Package assigned successfully",
    "assignmentId": "507f1f77bcf86cd799439016"
  }
}
```

**Business Logic:**
1. Validates package exists and is active
2. Validates volunteer exists and is active
3. Checks central warehouse has sufficient stock for ALL items
4. Creates OUT transactions from central warehouse
5. Creates IN transactions to volunteer
6. Links all transactions to package assignment
7. Uses atomic database transaction (all-or-nothing)

**Idempotency:**
- If `requestId` already exists, returns existing assignment without creating duplicates
- Response includes `duplicate: true` flag

**Stock Calculation Example:**
```
Package: Family Relief Kit
- Rice: 5 kg
- Oil: 2 L

Assigning 3 packages:
- Rice required: 5 × 3 = 15 kg
- Oil required: 2 × 3 = 6 L

Central warehouse must have at least 15 kg Rice and 6 L Oil
```

---

### 7. Distribute Package
**POST** `/api/packages/distribute`

Volunteer distributes packages to beneficiaries.

**Request Body:**
```json
{
  "packageId": "507f1f77bcf86cd799439013",
  "quantity": 2,
  "distributionDate": "2024-01-15T14:30:00Z",
  "location": {
    "cityId": "507f1f77bcf86cd799439017",
    "areaId": "507f1f77bcf86cd799439018",
    "address": "123 Main Street",
    "coordinates": {
      "lat": 24.8607,
      "lng": 67.0011
    }
  },
  "beneficiaryInfo": {
    "name": "Ahmed Khan",
    "phone": "+923001234567",
    "familySize": 5,
    "idProof": "42101-1234567-8"
  },
  "campaignId": "507f1f77bcf86cd799439019",
  "requestId": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Package distributed successfully",
    "distributionId": "507f1f77bcf86cd79943901a"
  }
}
```

**Business Logic:**
1. Validates package exists and is active
2. Checks volunteer has sufficient stock for ALL items in package
3. Creates OUT transactions for each item
4. Links all transactions to package distribution
5. Records beneficiary and location information
6. Uses atomic database transaction

**Access Control:**
- Both Admin and Volunteer can distribute packages
- Volunteer can only distribute from their own stock

---

### 8. Get Package Stock Summary
**GET** `/api/packages/:id/stock-summary?type=central`
**GET** `/api/packages/:id/stock-summary?type=volunteer&volunteerId=507f...`

Calculate how many complete packages can be formed from available stock.

**Query Parameters:**
- `type`: `central` or `volunteer`
- `volunteerId`: Required if type is `volunteer`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "packageId": "507f1f77bcf86cd799439013",
    "packageName": "Family Relief Kit",
    "maxPackages": 10,
    "items": [
      {
        "itemId": "507f1f77bcf86cd799439011",
        "itemName": "Rice",
        "quantityPerPackage": 5,
        "possiblePackages": 10
      },
      {
        "itemId": "507f1f77bcf86cd799439012",
        "itemName": "Oil",
        "quantityPerPackage": 2,
        "possiblePackages": 15
      }
    ]
  }
}
```

**Logic:**
- `maxPackages` = minimum of all `possiblePackages`
- Bottleneck item determines maximum packages
- In example above: Rice allows 10 packages, Oil allows 15, so max = 10

---

## 🔄 Transaction Flow

### Package Assignment Flow
```
1. Admin assigns 3 "Family Relief Kits" to Volunteer A
2. Package contains: 5kg Rice + 2L Oil
3. System creates 4 transactions:
   
   Transaction 1: Rice OUT from Central (15 kg)
   Transaction 2: Rice IN to Volunteer A (15 kg)
   Transaction 3: Oil OUT from Central (6 L)
   Transaction 4: Oil IN to Volunteer A (6 L)
   
4. All transactions linked to PackageAssignment record
5. PackageAssignment stores: packageId, volunteerId, quantity=3
```

### Package Distribution Flow
```
1. Volunteer A distributes 2 "Family Relief Kits"
2. System creates 2 transactions:
   
   Transaction 1: Rice OUT from Volunteer A (10 kg)
   Transaction 2: Oil OUT from Volunteer A (4 L)
   
3. All transactions linked to PackageDistribution record
4. PackageDistribution stores: beneficiary info, location, etc.
```

---

## 📊 Database Collections

### packages
```typescript
{
  _id: ObjectId,
  name: string,              // Unique
  description: string,
  items: [
    {
      itemId: ObjectId,
      quantity: number
    }
  ],
  isActive: boolean,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### package_assignments
```typescript
{
  _id: ObjectId,
  packageId: ObjectId,
  volunteerId: ObjectId,
  quantity: number,
  assignedBy: ObjectId,
  assignedAt: Date,
  transactionIds: [ObjectId],
  requestId: string          // Unique (idempotency)
}
```

### package_distributions
```typescript
{
  _id: ObjectId,
  packageId: ObjectId,
  volunteerId: ObjectId,
  quantity: number,
  distributionDate: Date,
  location: {
    cityId: ObjectId,
    areaId: ObjectId,
    address: string,
    coordinates: { lat, lng }
  },
  beneficiaryInfo: {
    name: string,
    phone: string,
    familySize: number,
    idProof: string
  },
  campaignId: ObjectId,
  transactionIds: [ObjectId],
  requestId: string,         // Unique (idempotency)
  createdAt: Date
}
```

### inventory_transactions (Enhanced)
```typescript
{
  _id: ObjectId,
  itemId: ObjectId,
  type: TransactionType,
  direction: TransactionDirection,
  quantity: number,
  referenceType: string,
  referenceId: ObjectId,
  packageAssignmentId: ObjectId,      // NEW
  packageDistributionId: ObjectId,    // NEW
  performedBy: ObjectId,
  createdAt: Date
}
```

---

## ✅ Validation Rules

### Create/Update Package
- Package name must be unique
- Must contain at least 1 item
- All items must exist and be active
- No duplicate items in same package
- Quantities must be positive integers

### Assign Package
- Package must exist and be active
- Volunteer must exist, be active, and have VOLUNTEER role
- Central warehouse must have sufficient stock for ALL items
- requestId must be unique (UUID v4)

### Distribute Package
- Package must exist and be active
- Volunteer must have sufficient stock for ALL items
- City and area must exist
- Beneficiary name is required
- requestId must be unique (UUID v4)

---

## 🔒 Security & Authorization

| Endpoint | Admin | Volunteer |
|----------|-------|-----------|
| Create Package | ✅ | ❌ |
| Get Packages | ✅ | ✅ |
| Get Package by ID | ✅ | ✅ |
| Update Package | ✅ | ❌ |
| Delete Package | ✅ | ❌ |
| Assign Package | ✅ | ❌ |
| Distribute Package | ✅ | ✅ |
| Stock Summary | ✅ | ✅ |

---

## 🎯 Use Cases

### Use Case 1: Create Standard Relief Package
```bash
POST /api/packages
{
  "name": "Winter Relief Kit",
  "description": "Essential items for winter season",
  "items": [
    { "itemId": "blanket_id", "quantity": 2 },
    { "itemId": "jacket_id", "quantity": 1 },
    { "itemId": "socks_id", "quantity": 3 }
  ]
}
```

### Use Case 2: Assign Packages to Field Volunteer
```bash
POST /api/packages/assign
{
  "packageId": "winter_kit_id",
  "volunteerId": "volunteer_id",
  "quantity": 10,
  "requestId": "uuid-v4"
}
```

### Use Case 3: Volunteer Distributes in Field
```bash
POST /api/packages/distribute
{
  "packageId": "winter_kit_id",
  "quantity": 1,
  "distributionDate": "2024-01-15T14:30:00Z",
  "location": {
    "cityId": "karachi_id",
    "areaId": "area_id",
    "address": "Relief Camp Site A"
  },
  "beneficiaryInfo": {
    "name": "Family of Ahmed",
    "familySize": 6
  },
  "requestId": "uuid-v4"
}
```

### Use Case 4: Check Available Packages
```bash
GET /api/packages/winter_kit_id/stock-summary?type=volunteer&volunteerId=volunteer_id

Response:
{
  "maxPackages": 8,
  "items": [
    { "itemName": "Blanket", "quantityPerPackage": 2, "possiblePackages": 8 },
    { "itemName": "Jacket", "quantityPerPackage": 1, "possiblePackages": 10 },
    { "itemName": "Socks", "quantityPerPackage": 3, "possiblePackages": 9 }
  ]
}
// Blanket is bottleneck: only 8 complete packages possible
```

---

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "message": "Insufficient central stock for Rice. Required: 15, Available: 10"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "message": "Package not found or inactive"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "message": "Unauthorized"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "message": "Access denied. Admin role required."
  }
}
```

---

## 💡 Best Practices

1. **Always use UUID v4 for requestId** to ensure idempotency
2. **Check stock summary before assignment** to avoid failures
3. **Use atomic transactions** - all operations are all-or-nothing
4. **Package names should be descriptive** and follow naming conventions
5. **Include campaign ID** when distributing for better analytics
6. **Record accurate beneficiary information** for audit trails
7. **Use coordinates** for geographic analytics

---

## 🔄 Integration with Existing Features

### Stock Management
- Package operations create individual item transactions
- Stock is always calculated from transaction ledger
- No separate stock field for packages

### Distribution Analytics
- Package distributions appear in distribution reports
- Can filter distributions by package
- Geographic analytics include package distributions

### Campaign Tracking
- Link package distributions to campaigns
- Track package-wise campaign performance
- Measure impact by package type

---

## 📈 Future Enhancements

- [ ] Package templates (seasonal, emergency, etc.)
- [ ] Bulk package assignment to multiple volunteers
- [ ] Package expiry tracking
- [ ] Package return functionality
- [ ] Package-to-package conversion
- [ ] Package distribution history by beneficiary
- [ ] Package analytics dashboard
- [ ] Export package reports to PDF/Excel

---

**Built with ❤️ for Trackventory**
