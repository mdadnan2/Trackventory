# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require Firebase ID token in Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

---

## Auth Module

### Login
```http
POST /auth/login
```

**Body:**
```json
{
  "idToken": "firebase-id-token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "ADMIN"
    }
  }
}
```

---

## Users Module (Admin Only)

### Create User
```http
POST /users
```

**Body:**
```json
{
  "firebaseUid": "firebase-uid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "VOLUNTEER"
}
```

### List Users
```http
GET /users?page=1&limit=20
```

### Get User by ID
```http
GET /users/:id
```

### Update User
```http
PATCH /users/:id
```

**Body:**
```json
{
  "name": "Updated Name",
  "status": "BLOCKED"
}
```

---

## Items Module

### Create Item (Admin Only)
```http
POST /items
```

**Body:**
```json
{
  "name": "Rice",
  "category": "Food",
  "unit": "kg"
}
```

### List Items
```http
GET /items?page=1&limit=50
```

### Get Item by ID
```http
GET /items/:id
```

### Update Item (Admin Only)
```http
PATCH /items/:id
```

**Body:**
```json
{
  "name": "Updated Name",
  "isActive": false
}
```

---

## Stock Module

### Get Central Stock
```http
GET /stock/central?itemId=optional-item-id
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "itemId": "item-id",
      "item": { "name": "Rice", "unit": "kg" },
      "stock": 1000
    }
  ]
}
```

### Get Volunteer Stock
```http
GET /stock/volunteer/:volunteerId?itemId=optional-item-id
```

### Add Stock (Admin Only)
```http
POST /stock/add
```

**Body:**
```json
{
  "items": [
    { "itemId": "item-id", "quantity": 100 }
  ]
}
```

### Assign Stock to Volunteer (Admin Only)
```http
POST /stock/assign
```

**Body:**
```json
{
  "volunteerId": "volunteer-id",
  "items": [
    { "itemId": "item-id", "quantity": 50 }
  ]
}
```

---

## Distribution Module

### Record Distribution
```http
POST /distribution
```

**Body:**
```json
{
  "cityId": "city-id",
  "area": "Downtown",
  "campaignId": "optional-campaign-id",
  "items": [
    { "itemId": "item-id", "quantity": 10 }
  ],
  "requestId": "unique-request-id"
}
```

**Note:** `requestId` must be unique to prevent duplicate submissions.

### Report Damage
```http
POST /distribution/damage
```

**Body:**
```json
{
  "items": [
    { "itemId": "item-id", "quantity": 5 }
  ],
  "requestId": "unique-request-id"
}
```

### List Distributions
```http
GET /distribution?page=1&limit=50&volunteerId=optional&cityId=optional&campaignId=optional
```

---

## Reports Module

### Current Stock Summary
```http
GET /reports/stock-summary
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "item": {
        "id": "item-id",
        "name": "Rice",
        "category": "Food",
        "unit": "kg"
      },
      "centralStock": 500,
      "volunteerStock": 300,
      "totalDistributed": 200,
      "totalDamaged": 10
    }
  ]
}
```

### Volunteer Stock Summary
```http
GET /reports/volunteer-stock
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "volunteer": {
        "id": "volunteer-id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "items": [
        {
          "item": { "id": "item-id", "name": "Rice", "unit": "kg" },
          "stock": 50
        }
      ]
    }
  ]
}
```

### Campaign Distribution Summary
```http
GET /reports/campaign-distribution?campaignId=optional
```

### Repeat Distribution History
```http
GET /reports/repeat-distribution
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": {
        "cityId": "city-id",
        "area": "Downtown"
      },
      "count": 5,
      "distributions": [...]
    }
  ]
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error

---

## Stock Calculation Logic

### Central Stock
```
SUM(STOCK_IN) - SUM(ISSUE_TO_VOLUNTEER)
```

### Volunteer Stock
```
SUM(ISSUE_TO_VOLUNTEER) - SUM(DISTRIBUTION) - SUM(DAMAGE)
```

All calculations are performed in real-time from the `inventory_transactions` ledger.

---

## Idempotency

Distribution and damage reporting endpoints use `requestId` for idempotency. 

**Best Practice:**
```javascript
const requestId = `${userId}-${Date.now()}-${Math.random()}`;
```

Duplicate `requestId` will return `409 Conflict` error.
