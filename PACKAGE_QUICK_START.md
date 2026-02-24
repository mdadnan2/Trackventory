# 📦 Package Feature - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will help you quickly start using the package feature in Trackventory.

---

## Prerequisites

- Backend server running on `http://localhost:5000`
- Firebase authentication token
- Admin account for package creation
- At least 2 items in the system
- At least 1 volunteer account

---

## Step 1: Create Your First Package

**Endpoint**: `POST /api/packages`

```bash
curl -X POST http://localhost:5000/api/packages \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Family Relief Kit",
    "description": "Basic food supplies for family of 4",
    "items": [
      {
        "itemId": "YOUR_RICE_ITEM_ID",
        "quantity": 5
      },
      {
        "itemId": "YOUR_OIL_ITEM_ID",
        "quantity": 2
      }
    ]
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "PACKAGE_ID",
    "name": "Family Relief Kit",
    "items": [...]
  }
}
```

✅ **Save the `_id` - you'll need it for next steps!**

---

## Step 2: Add Stock to Central Warehouse

Before assigning packages, ensure central warehouse has sufficient stock.

**Endpoint**: `POST /api/stock/add`

```bash
curl -X POST http://localhost:5000/api/stock/add \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "itemId": "YOUR_RICE_ITEM_ID",
        "quantity": 50
      },
      {
        "itemId": "YOUR_OIL_ITEM_ID",
        "quantity": 20
      }
    ]
  }'
```

---

## Step 3: Check Available Packages

See how many complete packages can be formed from central warehouse stock.

**Endpoint**: `GET /api/packages/:id/stock-summary?type=central`

```bash
curl -X GET "http://localhost:5000/api/packages/PACKAGE_ID/stock-summary?type=central" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "packageName": "Family Relief Kit",
    "maxPackages": 10,
    "items": [
      {
        "itemName": "Rice",
        "quantityPerPackage": 5,
        "possiblePackages": 10
      },
      {
        "itemName": "Oil",
        "quantityPerPackage": 2,
        "possiblePackages": 10
      }
    ]
  }
}
```

✅ **You can assign up to 10 packages!**

---

## Step 4: Assign Package to Volunteer

**Endpoint**: `POST /api/packages/assign`

```bash
# Generate UUID v4 for requestId (use online generator or uuidgen command)
REQUEST_ID=$(uuidgen)

curl -X POST http://localhost:5000/api/packages/assign \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"packageId\": \"PACKAGE_ID\",
    \"volunteerId\": \"VOLUNTEER_ID\",
    \"quantity\": 3,
    \"requestId\": \"$REQUEST_ID\"
  }"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Package assigned successfully",
    "assignmentId": "ASSIGNMENT_ID"
  }
}
```

✅ **3 packages assigned to volunteer!**

---

## Step 5: Volunteer Distributes Package

Now the volunteer can distribute packages to beneficiaries.

**Endpoint**: `POST /api/packages/distribute`

```bash
# Generate new UUID v4 for this distribution
REQUEST_ID=$(uuidgen)

curl -X POST http://localhost:5000/api/packages/distribute \
  -H "Authorization: Bearer VOLUNTEER_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"packageId\": \"PACKAGE_ID\",
    \"quantity\": 1,
    \"distributionDate\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
    \"location\": {
      \"cityId\": \"YOUR_CITY_ID\",
      \"areaId\": \"YOUR_AREA_ID\",
      \"address\": \"Relief Camp Site A\"
    },
    \"beneficiaryInfo\": {
      \"name\": \"Ahmed Khan\",
      \"familySize\": 6
    },
    \"requestId\": \"$REQUEST_ID\"
  }"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Package distributed successfully",
    "distributionId": "DISTRIBUTION_ID"
  }
}
```

✅ **Package distributed to beneficiary!**

---

## Step 6: Check Volunteer's Remaining Stock

**Endpoint**: `GET /api/packages/:id/stock-summary?type=volunteer&volunteerId=VOLUNTEER_ID`

```bash
curl -X GET "http://localhost:5000/api/packages/PACKAGE_ID/stock-summary?type=volunteer&volunteerId=VOLUNTEER_ID" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "packageName": "Family Relief Kit",
    "maxPackages": 2,
    "items": [...]
  }
}
```

✅ **Volunteer has 2 packages remaining (3 assigned - 1 distributed)**

---

## 🎯 Common Use Cases

### Use Case 1: Create Multiple Package Types

```bash
# Winter Relief Kit
curl -X POST http://localhost:5000/api/packages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Winter Relief Kit",
    "description": "Essential items for winter",
    "items": [
      {"itemId": "BLANKET_ID", "quantity": 2},
      {"itemId": "JACKET_ID", "quantity": 1}
    ]
  }'

# Emergency Food Kit
curl -X POST http://localhost:5000/api/packages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Emergency Food Kit",
    "description": "3-day emergency food supply",
    "items": [
      {"itemId": "RICE_ID", "quantity": 3},
      {"itemId": "WATER_ID", "quantity": 6}
    ]
  }'
```

### Use Case 2: Bulk Assignment to Multiple Volunteers

```bash
# Assign to Volunteer 1
curl -X POST http://localhost:5000/api/packages/assign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"packageId\": \"$PKG_ID\", \"volunteerId\": \"$VOL1_ID\", \"quantity\": 5, \"requestId\": \"$(uuidgen)\"}"

# Assign to Volunteer 2
curl -X POST http://localhost:5000/api/packages/assign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"packageId\": \"$PKG_ID\", \"volunteerId\": \"$VOL2_ID\", \"quantity\": 5, \"requestId\": \"$(uuidgen)\"}"
```

### Use Case 3: Update Package Contents

```bash
curl -X PATCH http://localhost:5000/api/packages/PACKAGE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"itemId": "RICE_ID", "quantity": 10},
      {"itemId": "OIL_ID", "quantity": 3},
      {"itemId": "SUGAR_ID", "quantity": 2}
    ]
  }'
```

---

## 🔍 Troubleshooting

### Error: "Insufficient central stock"

**Problem**: Not enough items in central warehouse to form packages.

**Solution**:
1. Check stock summary to see which item is the bottleneck
2. Add more stock to central warehouse
3. Retry assignment

```bash
# Check what's available
curl -X GET "http://localhost:5000/api/packages/$PKG_ID/stock-summary?type=central" \
  -H "Authorization: Bearer $TOKEN"

# Add more stock
curl -X POST http://localhost:5000/api/stock/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items": [{"itemId": "ITEM_ID", "quantity": 100}]}'
```

### Error: "Duplicate items in package"

**Problem**: Same item appears multiple times in package definition.

**Solution**: Remove duplicate items from the items array.

```bash
# ❌ Wrong
{
  "items": [
    {"itemId": "RICE_ID", "quantity": 5},
    {"itemId": "RICE_ID", "quantity": 3}  // Duplicate!
  ]
}

# ✅ Correct
{
  "items": [
    {"itemId": "RICE_ID", "quantity": 8}  // Combined
  ]
}
```

### Error: "Package not found or inactive"

**Problem**: Package was deleted or doesn't exist.

**Solution**: Check package exists and is active.

```bash
# List all packages
curl -X GET "http://localhost:5000/api/packages" \
  -H "Authorization: Bearer $TOKEN"

# Get specific package
curl -X GET "http://localhost:5000/api/packages/$PKG_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Monitoring Package Operations

### View All Packages
```bash
curl -X GET "http://localhost:5000/api/packages?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### View Package Details
```bash
curl -X GET "http://localhost:5000/api/packages/$PKG_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### Check Central Warehouse Stock
```bash
curl -X GET "http://localhost:5000/api/stock/central" \
  -H "Authorization: Bearer $TOKEN"
```

### Check Volunteer Stock
```bash
curl -X GET "http://localhost:5000/api/stock/volunteer/$VOLUNTEER_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🎓 Best Practices

### 1. Always Use UUID v4 for requestId
```bash
# Generate UUID v4
REQUEST_ID=$(uuidgen)  # Linux/Mac
REQUEST_ID=$(powershell -Command "[guid]::NewGuid().ToString()")  # Windows

# Use in request
-d "{\"requestId\": \"$REQUEST_ID\"}"
```

### 2. Check Stock Before Assignment
```bash
# Always check stock summary first
curl -X GET "http://localhost:5000/api/packages/$PKG_ID/stock-summary?type=central" \
  -H "Authorization: Bearer $TOKEN"

# Then assign based on maxPackages
```

### 3. Include Campaign ID for Analytics
```bash
-d '{
  "packageId": "...",
  "campaignId": "CAMPAIGN_ID",  // Include for better tracking
  ...
}'
```

### 4. Record Accurate Beneficiary Information
```bash
-d '{
  "beneficiaryInfo": {
    "name": "Full Name",
    "phone": "+923001234567",
    "familySize": 6,
    "idProof": "42101-1234567-8"  // Include for audit trail
  }
}'
```

---

## 📚 Next Steps

1. **Read Full Documentation**: [PACKAGE_API_DOCUMENTATION.md](PACKAGE_API_DOCUMENTATION.md)
2. **Explore Examples**: [backend/examples/package-examples.js](backend/examples/package-examples.js)
3. **Review Implementation**: [PACKAGE_IMPLEMENTATION_SUMMARY.md](PACKAGE_IMPLEMENTATION_SUMMARY.md)
4. **Integrate with Frontend**: Build UI components for package management

---

## 🆘 Need Help?

- **API Documentation**: See [PACKAGE_API_DOCUMENTATION.md](PACKAGE_API_DOCUMENTATION.md)
- **Examples**: Check [backend/examples/package-examples.js](backend/examples/package-examples.js)
- **Architecture**: Review [README.md](README.md)
- **Issues**: Open an issue on GitHub

---

**🎉 You're ready to use the package feature!**

Start by creating your first package and assigning it to volunteers. The system will handle all the complex transaction management automatically while maintaining complete audit trails.
