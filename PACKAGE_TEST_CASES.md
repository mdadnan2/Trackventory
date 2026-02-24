# 📦 Package Feature - Test Cases

## Test Environment Setup

### Prerequisites
- Backend server running on `http://localhost:5000`
- MongoDB database with test data
- Firebase authentication tokens for Admin and Volunteer
- At least 3 items in database (Rice, Oil, Sugar)
- At least 2 volunteers in database

### Test Data Setup
```bash
# 1. Create test items
POST /api/items
{"name": "Rice", "unit": "kg", "category": "Food"}
{"name": "Cooking Oil", "unit": "L", "category": "Food"}
{"name": "Sugar", "unit": "kg", "category": "Food"}

# 2. Add stock to central warehouse
POST /api/stock/add
{
  "items": [
    {"itemId": "rice_id", "quantity": 100},
    {"itemId": "oil_id", "quantity": 50},
    {"itemId": "sugar_id", "quantity": 30}
  ]
}
```

---

## 1. Package CRUD Tests

### TC-PKG-001: Create Package - Valid Data (Admin)
**Priority**: High  
**Type**: Positive

**Request**:
```json
POST /api/packages
Authorization: Bearer {admin_token}

{
  "name": "Family Relief Kit",
  "description": "Basic food supplies for family of 4",
  "items": [
    {"itemId": "rice_id", "quantity": 5},
    {"itemId": "oil_id", "quantity": 2},
    {"itemId": "sugar_id", "quantity": 1}
  ]
}
```

**Expected Result**:
- Status: 201 Created
- Response contains package with _id
- All items populated with details
- createdBy set to admin user
- isActive = true

---

### TC-PKG-002: Create Package - Duplicate Name
**Priority**: High  
**Type**: Negative

**Request**:
```json
POST /api/packages
Authorization: Bearer {admin_token}

{
  "name": "Family Relief Kit",  // Already exists
  "items": [{"itemId": "rice_id", "quantity": 5}]
}
```

**Expected Result**:
- Status: 400 Bad Request
- Error message about duplicate name

---

### TC-PKG-003: Create Package - Duplicate Items
**Priority**: High  
**Type**: Negative

**Request**:
```json
POST /api/packages
Authorization: Bearer {admin_token}

{
  "name": "Invalid Package",
  "items": [
    {"itemId": "rice_id", "quantity": 5},
    {"itemId": "rice_id", "quantity": 3}  // Duplicate
  ]
}
```

**Expected Result**:
- Status: 400 Bad Request
- Error: "Duplicate items in package"

---

### TC-PKG-004: Create Package - Non-existent Item
**Priority**: High  
**Type**: Negative

**Request**:
```json
POST /api/packages
Authorization: Bearer {admin_token}

{
  "name": "Invalid Package",
  "items": [
    {"itemId": "non_existent_id", "quantity": 5}
  ]
}
```

**Expected Result**:
- Status: 400 Bad Request
- Error: "Some items not found or inactive"

---

### TC-PKG-005: Create Package - Empty Items Array
**Priority**: Medium  
**Type**: Negative

**Request**:
```json
POST /api/packages
Authorization: Bearer {admin_token}

{
  "name": "Empty Package",
  "items": []
}
```

**Expected Result**:
- Status: 400 Bad Request
- Validation error

---

### TC-PKG-006: Create Package - Zero Quantity
**Priority**: Medium  
**Type**: Negative

**Request**:
```json
POST /api/packages
Authorization: Bearer {admin_token}

{
  "name": "Zero Quantity Package",
  "items": [
    {"itemId": "rice_id", "quantity": 0}
  ]
}
```

**Expected Result**:
- Status: 400 Bad Request
- Validation error

---

### TC-PKG-007: Create Package - Negative Quantity
**Priority**: Medium  
**Type**: Negative

**Request**:
```json
POST /api/packages
Authorization: Bearer {admin_token}

{
  "name": "Negative Package",
  "items": [
    {"itemId": "rice_id", "quantity": -5}
  ]
}
```

**Expected Result**:
- Status: 400 Bad Request
- Validation error

---

### TC-PKG-008: Create Package - Volunteer Access
**Priority**: High  
**Type**: Negative

**Request**:
```json
POST /api/packages
Authorization: Bearer {volunteer_token}

{
  "name": "Unauthorized Package",
  "items": [{"itemId": "rice_id", "quantity": 5}]
}
```

**Expected Result**:
- Status: 403 Forbidden
- Error: "Access denied. Admin role required."

---

### TC-PKG-009: Get All Packages
**Priority**: High  
**Type**: Positive

**Request**:
```
GET /api/packages?page=1&limit=10
Authorization: Bearer {admin_token}
```

**Expected Result**:
- Status: 200 OK
- Response contains pagination info
- Only active packages returned
- Items populated with details

---

### TC-PKG-010: Get Package by ID
**Priority**: High  
**Type**: Positive

**Request**:
```
GET /api/packages/{package_id}
Authorization: Bearer {admin_token}
```

**Expected Result**:
- Status: 200 OK
- Package details with populated items
- All fields present

---

### TC-PKG-011: Get Package - Invalid ID
**Priority**: Medium  
**Type**: Negative

**Request**:
```
GET /api/packages/invalid_id
Authorization: Bearer {admin_token}
```

**Expected Result**:
- Status: 404 Not Found
- Error: "Package not found"

---

### TC-PKG-012: Update Package - Valid Data
**Priority**: High  
**Type**: Positive

**Request**:
```json
PATCH /api/packages/{package_id}
Authorization: Bearer {admin_token}

{
  "name": "Updated Family Kit",
  "items": [
    {"itemId": "rice_id", "quantity": 10},
    {"itemId": "oil_id", "quantity": 3}
  ]
}
```

**Expected Result**:
- Status: 200 OK
- Package updated with new values
- updatedAt timestamp changed

---

### TC-PKG-013: Update Package - Volunteer Access
**Priority**: High  
**Type**: Negative

**Request**:
```json
PATCH /api/packages/{package_id}
Authorization: Bearer {volunteer_token}

{"name": "Unauthorized Update"}
```

**Expected Result**:
- Status: 403 Forbidden
- Error: "Access denied. Admin role required."

---

### TC-PKG-014: Delete Package (Soft Delete)
**Priority**: High  
**Type**: Positive

**Request**:
```
DELETE /api/packages/{package_id}
Authorization: Bearer {admin_token}
```

**Expected Result**:
- Status: 200 OK
- Package isActive set to false
- Package not in list endpoint
- Package still in database

---

### TC-PKG-015: Delete Package - Volunteer Access
**Priority**: High  
**Type**: Negative

**Request**:
```
DELETE /api/packages/{package_id}
Authorization: Bearer {volunteer_token}
```

**Expected Result**:
- Status: 403 Forbidden
- Error: "Access denied. Admin role required."

---

## 2. Package Assignment Tests

### TC-ASSIGN-001: Assign Package - Valid Data
**Priority**: Critical  
**Type**: Positive

**Request**:
```json
POST /api/packages/assign
Authorization: Bearer {admin_token}

{
  "packageId": "pkg_id",
  "volunteerId": "vol_id",
  "quantity": 3,
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Expected Result**:
- Status: 201 Created
- Response: {"success": true, "assignmentId": "..."}
- 6 transactions created (3 items × 2 directions)
- Central stock decreased
- Volunteer stock increased
- PackageAssignment record created

**Verification**:
```bash
# Check central stock decreased
GET /api/stock/central
# Rice: 100 - (5×3) = 85
# Oil: 50 - (2×3) = 44
# Sugar: 30 - (1×3) = 27

# Check volunteer stock increased
GET /api/stock/volunteer/{vol_id}
# Rice: 15, Oil: 6, Sugar: 3
```

---

### TC-ASSIGN-002: Assign Package - Insufficient Stock
**Priority**: Critical  
**Type**: Negative

**Setup**: Central warehouse has only 10kg Rice

**Request**:
```json
POST /api/packages/assign
Authorization: Bearer {admin_token}

{
  "packageId": "pkg_id",  // Requires 5kg Rice per package
  "volunteerId": "vol_id",
  "quantity": 5,  // Needs 25kg Rice total
  "requestId": "uuid"
}
```

**Expected Result**:
- Status: 400 Bad Request
- Error: "Insufficient central stock for Rice. Required: 25, Available: 10"
- No transactions created
- Stock unchanged

---

### TC-ASSIGN-003: Assign Package - Idempotency Test
**Priority**: Critical  
**Type**: Positive

**Request 1**:
```json
POST /api/packages/assign
{
  "packageId": "pkg_id",
  "volunteerId": "vol_id",
  "quantity": 2,
  "requestId": "same-uuid-123"
}
```

**Request 2** (Same requestId):
```json
POST /api/packages/assign
{
  "packageId": "pkg_id",
  "volunteerId": "vol_id",
  "quantity": 2,
  "requestId": "same-uuid-123"  // Same UUID
}
```

**Expected Result**:
- Request 1: Status 201, assignment created
- Request 2: Status 200, returns existing assignment
- Response 2 includes: "duplicate": true
- Only 1 assignment created
- Stock deducted only once

---

### TC-ASSIGN-004: Assign Package - Invalid Package ID
**Priority**: High  
**Type**: Negative

**Request**:
```json
POST /api/packages/assign
Authorization: Bearer {admin_token}

{
  "packageId": "non_existent_id",
  "volunteerId": "vol_id",
  "quantity": 1,
  "requestId": "uuid"
}
```

**Expected Result**:
- Status: 404 Not Found
- Error: "Package not found or inactive"

---

### TC-ASSIGN-005: Assign Package - Invalid Volunteer ID
**Priority**: High  
**Type**: Negative

**Request**:
```json
POST /api/packages/assign
Authorization: Bearer {admin_token}

{
  "packageId": "pkg_id",
  "volunteerId": "non_existent_id",
  "quantity": 1,
  "requestId": "uuid"
}
```

**Expected Result**:
- Status: 404 Not Found
- Error: "Volunteer not found or inactive"

---

### TC-ASSIGN-006: Assign Package - Inactive Package
**Priority**: Medium  
**Type**: Negative

**Setup**: Package is soft-deleted (isActive = false)

**Request**:
```json
POST /api/packages/assign
Authorization: Bearer {admin_token}

{
  "packageId": "inactive_pkg_id",
  "volunteerId": "vol_id",
  "quantity": 1,
  "requestId": "uuid"
}
```

**Expected Result**:
- Status: 404 Not Found
- Error: "Package not found or inactive"

---

### TC-ASSIGN-007: Assign Package - Zero Quantity
**Priority**: Medium  
**Type**: Negative

**Request**:
```json
POST /api/packages/assign
Authorization: Bearer {admin_token}

{
  "packageId": "pkg_id",
  "volunteerId": "vol_id",
  "quantity": 0,
  "requestId": "uuid"
}
```

**Expected Result**:
- Status: 400 Bad Request
- Validation error

---

### TC-ASSIGN-008: Assign Package - Volunteer Access
**Priority**: High  
**Type**: Negative

**Request**:
```json
POST /api/packages/assign
Authorization: Bearer {volunteer_token}

{
  "packageId": "pkg_id",
  "volunteerId": "vol_id",
  "quantity": 1,
  "requestId": "uuid"
}
```

**Expected Result**:
- Status: 403 Forbidden
- Error: "Access denied. Admin role required."

---

### TC-ASSIGN-009: Assign Package - Missing requestId
**Priority**: High  
**Type**: Negative

**Request**:
```json
POST /api/packages/assign
Authorization: Bearer {admin_token}

{
  "packageId": "pkg_id",
  "volunteerId": "vol_id",
  "quantity": 1
  // Missing requestId
}
```

**Expected Result**:
- Status: 400 Bad Request
- Validation error

---

### TC-ASSIGN-010: Assign Package - Invalid UUID Format
**Priority**: Medium  
**Type**: Negative

**Request**:
```json
POST /api/packages/assign
Authorization: Bearer {admin_token}

{
  "packageId": "pkg_id",
  "volunteerId": "vol_id",
  "quantity": 1,
  "requestId": "not-a-valid-uuid"
}
```

**Expected Result**:
- Status: 400 Bad Request
- Validation error

---

## 3. Package Distribution Tests

### TC-DIST-001: Distribute Package - Valid Data
**Priority**: Critical  
**Type**: Positive

**Setup**: Volunteer has 3 packages assigned

**Request**:
```json
POST /api/packages/distribute
Authorization: Bearer {volunteer_token}

{
  "packageId": "pkg_id",
  "quantity": 1,
  "distributionDate": "2024-01-15T14:30:00Z",
  "location": {
    "cityId": "city_id",
    "areaId": "area_id",
    "address": "Relief Camp Site A",
    "coordinates": {"lat": 24.8607, "lng": 67.0011}
  },
  "beneficiaryInfo": {
    "name": "Ahmed Khan",
    "phone": "+923001234567",
    "familySize": 6,
    "idProof": "42101-1234567-8"
  },
  "campaignId": "campaign_id",
  "requestId": "uuid"
}
```

**Expected Result**:
- Status: 201 Created
- Response: {"success": true, "distributionId": "..."}
- 3 transactions created (OUT for each item)
- Volunteer stock decreased
- PackageDistribution record created

**Verification**:
```bash
GET /api/stock/volunteer/{vol_id}
# Rice: 15 - 5 = 10
# Oil: 6 - 2 = 4
# Sugar: 3 - 1 = 2
```

---

### TC-DIST-002: Distribute Package - Insufficient Volunteer Stock
**Priority**: Critical  
**Type**: Negative

**Setup**: Volunteer has only 1 package worth of stock

**Request**:
```json
POST /api/packages/distribute
Authorization: Bearer {volunteer_token}

{
  "packageId": "pkg_id",
  "quantity": 3,  // Trying to distribute 3 packages
  "distributionDate": "2024-01-15T14:30:00Z",
  "location": {...},
  "beneficiaryInfo": {...},
  "requestId": "uuid"
}
```

**Expected Result**:
- Status: 400 Bad Request
- Error: "Insufficient volunteer stock for {item_name}"
- No transactions created
- Stock unchanged

---

### TC-DIST-003: Distribute Package - Idempotency Test
**Priority**: Critical  
**Type**: Positive

**Request 1**:
```json
POST /api/packages/distribute
{
  "packageId": "pkg_id",
  "quantity": 1,
  "distributionDate": "2024-01-15T14:30:00Z",
  "location": {...},
  "beneficiaryInfo": {...},
  "requestId": "same-uuid-456"
}
```

**Request 2** (Same requestId):
```json
POST /api/packages/distribute
{
  "packageId": "pkg_id",
  "quantity": 1,
  "distributionDate": "2024-01-15T14:30:00Z",
  "location": {...},
  "beneficiaryInfo": {...},
  "requestId": "same-uuid-456"  // Same UUID
}
```

**Expected Result**:
- Request 1: Status 201, distribution created
- Request 2: Status 200, returns existing distribution
- Response 2 includes: "duplicate": true
- Only 1 distribution created
- Stock deducted only once

---

### TC-DIST-004: Distribute Package - Missing Beneficiary Name
**Priority**: High  
**Type**: Negative

**Request**:
```json
POST /api/packages/distribute
Authorization: Bearer {volunteer_token}

{
  "packageId": "pkg_id",
  "quantity": 1,
  "distributionDate": "2024-01-15T14:30:00Z",
  "location": {...},
  "beneficiaryInfo": {
    "phone": "+923001234567"
    // Missing name
  },
  "requestId": "uuid"
}
```

**Expected Result**:
- Status: 400 Bad Request
- Validation error

---

### TC-DIST-005: Distribute Package - Invalid City/Area
**Priority**: Medium  
**Type**: Negative

**Request**:
```json
POST /api/packages/distribute
Authorization: Bearer {volunteer_token}

{
  "packageId": "pkg_id",
  "quantity": 1,
  "distributionDate": "2024-01-15T14:30:00Z",
  "location": {
    "cityId": "non_existent_city",
    "areaId": "non_existent_area"
  },
  "beneficiaryInfo": {...},
  "requestId": "uuid"
}
```

**Expected Result**:
- Status: 400 Bad Request
- Error about invalid city/area

---

### TC-DIST-006: Distribute Package - Admin Can Distribute
**Priority**: High  
**Type**: Positive

**Request**:
```json
POST /api/packages/distribute
Authorization: Bearer {admin_token}

{
  "packageId": "pkg_id",
  "quantity": 1,
  "distributionDate": "2024-01-15T14:30:00Z",
  "location": {...},
  "beneficiaryInfo": {...},
  "requestId": "uuid"
}
```

**Expected Result**:
- Status: 201 Created
- Admin can distribute packages
- Deducts from admin's stock

---

### TC-DIST-007: Distribute Package - Optional Fields
**Priority**: Medium  
**Type**: Positive

**Request**:
```json
POST /api/packages/distribute
Authorization: Bearer {volunteer_token}

{
  "packageId": "pkg_id",
  "quantity": 1,
  "distributionDate": "2024-01-15T14:30:00Z",
  "location": {
    "cityId": "city_id",
    "areaId": "area_id"
    // No address, no coordinates
  },
  "beneficiaryInfo": {
    "name": "Ahmed Khan"
    // No phone, familySize, idProof
  },
  // No campaignId
  "requestId": "uuid"
}
```

**Expected Result**:
- Status: 201 Created
- Distribution created with minimal data
- Optional fields null/undefined

---

## 4. Stock Summary Tests

### TC-STOCK-001: Stock Summary - Central Warehouse
**Priority**: High  
**Type**: Positive

**Setup**:
- Package: 5kg Rice, 2L Oil, 1kg Sugar
- Central stock: 50kg Rice, 20L Oil, 10kg Sugar

**Request**:
```
GET /api/packages/{pkg_id}/stock-summary?type=central
Authorization: Bearer {admin_token}
```

**Expected Result**:
- Status: 200 OK
- maxPackages: 10 (limited by Rice: 50/5=10)
- Items array shows:
  - Rice: possiblePackages = 10
  - Oil: possiblePackages = 10
  - Sugar: possiblePackages = 10

---

### TC-STOCK-002: Stock Summary - Bottleneck Item
**Priority**: High  
**Type**: Positive

**Setup**:
- Package: 5kg Rice, 2L Oil, 1kg Sugar
- Central stock: 100kg Rice, 50L Oil, 3kg Sugar

**Request**:
```
GET /api/packages/{pkg_id}/stock-summary?type=central
Authorization: Bearer {admin_token}
```

**Expected Result**:
- Status: 200 OK
- maxPackages: 3 (limited by Sugar: 3/1=3)
- Items array shows:
  - Rice: possiblePackages = 20
  - Oil: possiblePackages = 25
  - Sugar: possiblePackages = 3 (bottleneck)

---

### TC-STOCK-003: Stock Summary - Volunteer Stock
**Priority**: High  
**Type**: Positive

**Setup**: Volunteer has 15kg Rice, 6L Oil, 3kg Sugar

**Request**:
```
GET /api/packages/{pkg_id}/stock-summary?type=volunteer&volunteerId={vol_id}
Authorization: Bearer {volunteer_token}
```

**Expected Result**:
- Status: 200 OK
- maxPackages: 3
- Calculated from volunteer's stock

---

### TC-STOCK-004: Stock Summary - Zero Stock
**Priority**: Medium  
**Type**: Positive

**Setup**: Central warehouse empty

**Request**:
```
GET /api/packages/{pkg_id}/stock-summary?type=central
Authorization: Bearer {admin_token}
```

**Expected Result**:
- Status: 200 OK
- maxPackages: 0
- All possiblePackages = 0

---

### TC-STOCK-005: Stock Summary - Missing Volunteer ID
**Priority**: Medium  
**Type**: Negative

**Request**:
```
GET /api/packages/{pkg_id}/stock-summary?type=volunteer
Authorization: Bearer {admin_token}
```

**Expected Result**:
- Status: 400 Bad Request
- Error about missing volunteerId

---

### TC-STOCK-006: Stock Summary - Invalid Package ID
**Priority**: Medium  
**Type**: Negative

**Request**:
```
GET /api/packages/invalid_id/stock-summary?type=central
Authorization: Bearer {admin_token}
```

**Expected Result**:
- Status: 404 Not Found
- Error: "Package not found or inactive"

---

## 5. Integration Tests

### TC-INT-001: Complete Package Lifecycle
**Priority**: Critical  
**Type**: Integration

**Steps**:
1. Create package (Admin)
2. Add stock to central warehouse (Admin)
3. Check stock summary (Admin)
4. Assign 5 packages to volunteer (Admin)
5. Verify central stock decreased
6. Verify volunteer stock increased
7. Volunteer distributes 2 packages
8. Verify volunteer stock decreased
9. Check remaining stock summary

**Expected Result**: All operations succeed, stock calculations accurate

---

### TC-INT-002: Multiple Volunteers Same Package
**Priority**: High  
**Type**: Integration

**Steps**:
1. Create package
2. Assign 3 packages to Volunteer A
3. Assign 3 packages to Volunteer B
4. Verify both volunteers have correct stock
5. Volunteer A distributes 1 package
6. Volunteer B distributes 2 packages
7. Verify independent stock tracking

**Expected Result**: Each volunteer's stock tracked independently

---

### TC-INT-003: Concurrent Package Assignment
**Priority**: High  
**Type**: Integration

**Steps**:
1. Central warehouse has stock for 10 packages
2. Admin assigns 6 packages to Volunteer A (concurrent request 1)
3. Admin assigns 6 packages to Volunteer B (concurrent request 2)
4. One should succeed, one should fail with insufficient stock

**Expected Result**: Atomic transactions prevent over-assignment

---

### TC-INT-004: Package Update After Assignment
**Priority**: Medium  
**Type**: Integration

**Steps**:
1. Create package: 5kg Rice, 2L Oil
2. Assign 3 packages to volunteer
3. Update package to: 10kg Rice, 3L Oil
4. Verify existing assignment unchanged
5. New assignment uses updated quantities

**Expected Result**: Historical assignments preserved

---

### TC-INT-005: Transaction Rollback on Failure
**Priority**: Critical  
**Type**: Integration

**Steps**:
1. Package has 3 items
2. Central warehouse has stock for 2 items only
3. Attempt to assign package
4. Verify no partial transactions created
5. Verify stock unchanged

**Expected Result**: All-or-nothing, no partial updates

---

## 6. Performance Tests

### TC-PERF-001: Assign 100 Packages
**Priority**: Medium  
**Type**: Performance

**Test**: Assign 100 packages to 10 volunteers (10 each)

**Expected Result**:
- Total time < 10 seconds
- Average time per assignment < 500ms
- No database errors

---

### TC-PERF-002: Stock Summary with Large Package
**Priority**: Medium  
**Type**: Performance

**Test**: Package with 20 items, calculate stock summary

**Expected Result**:
- Response time < 500ms
- Accurate calculation

---

### TC-PERF-003: Concurrent Distributions
**Priority**: Medium  
**Type**: Performance

**Test**: 50 volunteers distribute packages simultaneously

**Expected Result**:
- All succeed or fail gracefully
- No race conditions
- Stock calculations accurate

---

## 7. Security Tests

### TC-SEC-001: Unauthorized Access - No Token
**Priority**: High  
**Type**: Security

**Request**:
```
POST /api/packages
// No Authorization header
```

**Expected Result**:
- Status: 401 Unauthorized

---

### TC-SEC-002: Unauthorized Access - Invalid Token
**Priority**: High  
**Type**: Security

**Request**:
```
POST /api/packages
Authorization: Bearer invalid_token
```

**Expected Result**:
- Status: 401 Unauthorized

---

### TC-SEC-003: SQL Injection Attempt
**Priority**: High  
**Type**: Security

**Request**:
```json
POST /api/packages
{
  "name": "'; DROP TABLE packages; --",
  "items": [{"itemId": "rice_id", "quantity": 5}]
}
```

**Expected Result**:
- No database damage
- Request handled safely

---

### TC-SEC-004: XSS Attempt in Package Name
**Priority**: Medium  
**Type**: Security

**Request**:
```json
POST /api/packages
{
  "name": "<script>alert('xss')</script>",
  "items": [{"itemId": "rice_id", "quantity": 5}]
}
```

**Expected Result**:
- Input sanitized
- No script execution

---

## Test Execution Checklist

### Pre-Test Setup
- [ ] Backend server running
- [ ] Database seeded with test data
- [ ] Firebase tokens obtained
- [ ] Test environment isolated

### Test Execution
- [ ] Run all CRUD tests
- [ ] Run all assignment tests
- [ ] Run all distribution tests
- [ ] Run all stock summary tests
- [ ] Run integration tests
- [ ] Run performance tests
- [ ] Run security tests

### Post-Test Verification
- [ ] Database integrity maintained
- [ ] No orphaned transactions
- [ ] Stock calculations accurate
- [ ] Audit trail complete

---

## Test Summary Template

```
Total Test Cases: 60+
- CRUD Tests: 15
- Assignment Tests: 10
- Distribution Tests: 7
- Stock Summary Tests: 6
- Integration Tests: 5
- Performance Tests: 3
- Security Tests: 4

Priority Breakdown:
- Critical: 8
- High: 30
- Medium: 20
- Low: 2

Expected Pass Rate: 100%
```

---

## Automated Test Script Template

```javascript
// Example using Jest/Mocha
describe('Package Feature Tests', () => {
  
  describe('Package CRUD', () => {
    test('TC-PKG-001: Create package with valid data', async () => {
      const response = await request(app)
        .post('/api/packages')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Package',
          items: [{ itemId: riceId, quantity: 5 }]
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
    });
  });
  
  describe('Package Assignment', () => {
    test('TC-ASSIGN-001: Assign package with valid data', async () => {
      const response = await request(app)
        .post('/api/packages/assign')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          packageId: pkgId,
          volunteerId: volId,
          quantity: 3,
          requestId: uuidv4()
        });
      
      expect(response.status).toBe(201);
      expect(response.body.data.success).toBe(true);
    });
  });
  
  // Add more test suites...
});
```

---

**Total Test Cases**: 60+  
**Coverage**: CRUD, Assignment, Distribution, Stock, Integration, Performance, Security  
**Priority**: Critical business flows covered  
**Ready for**: Manual and automated testing
