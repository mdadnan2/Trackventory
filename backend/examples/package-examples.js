/**
 * Package Feature - Example Usage & Testing
 * 
 * This file contains example API calls for testing the package feature.
 * Use tools like Postman, Insomnia, or curl to test these endpoints.
 */

const BASE_URL = 'http://localhost:5000/api';
const AUTH_TOKEN = 'your-firebase-id-token';

// ============================================================================
// 1. CREATE PACKAGE (Admin Only)
// ============================================================================

const createPackageExample = {
  method: 'POST',
  url: `${BASE_URL}/packages`,
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: {
    name: 'Family Relief Kit',
    description: 'Basic food supplies for family of 4 for one week',
    items: [
      {
        itemId: '507f1f77bcf86cd799439011', // Rice
        quantity: 5 // 5 kg
      },
      {
        itemId: '507f1f77bcf86cd799439012', // Cooking Oil
        quantity: 2 // 2 liters
      },
      {
        itemId: '507f1f77bcf86cd799439013', // Sugar
        quantity: 1 // 1 kg
      },
      {
        itemId: '507f1f77bcf86cd799439014', // Lentils
        quantity: 2 // 2 kg
      }
    ]
  }
};

// ============================================================================
// 2. GET ALL PACKAGES
// ============================================================================

const getAllPackagesExample = {
  method: 'GET',
  url: `${BASE_URL}/packages?page=1&limit=10`,
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`
  }
};

// ============================================================================
// 3. GET PACKAGE BY ID
// ============================================================================

const getPackageByIdExample = {
  method: 'GET',
  url: `${BASE_URL}/packages/507f1f77bcf86cd799439015`,
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`
  }
};

// ============================================================================
// 4. UPDATE PACKAGE (Admin Only)
// ============================================================================

const updatePackageExample = {
  method: 'PATCH',
  url: `${BASE_URL}/packages/507f1f77bcf86cd799439015`,
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: {
    name: 'Enhanced Family Relief Kit',
    description: 'Updated with more items',
    items: [
      {
        itemId: '507f1f77bcf86cd799439011',
        quantity: 10 // Increased from 5 to 10
      },
      {
        itemId: '507f1f77bcf86cd799439012',
        quantity: 3 // Increased from 2 to 3
      }
    ]
  }
};

// ============================================================================
// 5. DELETE PACKAGE (Admin Only)
// ============================================================================

const deletePackageExample = {
  method: 'DELETE',
  url: `${BASE_URL}/packages/507f1f77bcf86cd799439015`,
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`
  }
};

// ============================================================================
// 6. ASSIGN PACKAGE TO VOLUNTEER (Admin Only)
// ============================================================================

const assignPackageExample = {
  method: 'POST',
  url: `${BASE_URL}/packages/assign`,
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: {
    packageId: '507f1f77bcf86cd799439015',
    volunteerId: '507f1f77bcf86cd799439020',
    quantity: 5, // Assigning 5 packages
    requestId: '550e8400-e29b-41d4-a716-446655440000' // UUID v4
  }
};

// ============================================================================
// 7. DISTRIBUTE PACKAGE (Volunteer or Admin)
// ============================================================================

const distributePackageExample = {
  method: 'POST',
  url: `${BASE_URL}/packages/distribute`,
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: {
    packageId: '507f1f77bcf86cd799439015',
    quantity: 2, // Distributing 2 packages
    distributionDate: '2024-01-15T14:30:00Z',
    location: {
      cityId: '507f1f77bcf86cd799439030',
      areaId: '507f1f77bcf86cd799439031',
      address: 'Relief Camp Site A, Block 5',
      coordinates: {
        lat: 24.8607,
        lng: 67.0011
      }
    },
    beneficiaryInfo: {
      name: 'Ahmed Khan',
      phone: '+923001234567',
      familySize: 6,
      idProof: '42101-1234567-8'
    },
    campaignId: '507f1f77bcf86cd799439040',
    requestId: '550e8400-e29b-41d4-a716-446655440001' // UUID v4
  }
};

// ============================================================================
// 8. GET PACKAGE STOCK SUMMARY - Central Warehouse
// ============================================================================

const getPackageStockSummaryCentralExample = {
  method: 'GET',
  url: `${BASE_URL}/packages/507f1f77bcf86cd799439015/stock-summary?type=central`,
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`
  }
};

// ============================================================================
// 9. GET PACKAGE STOCK SUMMARY - Volunteer Stock
// ============================================================================

const getPackageStockSummaryVolunteerExample = {
  method: 'GET',
  url: `${BASE_URL}/packages/507f1f77bcf86cd799439015/stock-summary?type=volunteer&volunteerId=507f1f77bcf86cd799439020`,
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`
  }
};

// ============================================================================
// CURL EXAMPLES
// ============================================================================

// Create Package
const curlCreatePackage = `
curl -X POST ${BASE_URL}/packages \\
  -H "Authorization: Bearer ${AUTH_TOKEN}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Family Relief Kit",
    "description": "Basic food supplies",
    "items": [
      {"itemId": "507f1f77bcf86cd799439011", "quantity": 5},
      {"itemId": "507f1f77bcf86cd799439012", "quantity": 2}
    ]
  }'
`;

// Assign Package
const curlAssignPackage = `
curl -X POST ${BASE_URL}/packages/assign \\
  -H "Authorization: Bearer ${AUTH_TOKEN}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "packageId": "507f1f77bcf86cd799439015",
    "volunteerId": "507f1f77bcf86cd799439020",
    "quantity": 5,
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  }'
`;

// Distribute Package
const curlDistributePackage = `
curl -X POST ${BASE_URL}/packages/distribute \\
  -H "Authorization: Bearer ${AUTH_TOKEN}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "packageId": "507f1f77bcf86cd799439015",
    "quantity": 2,
    "distributionDate": "2024-01-15T14:30:00Z",
    "location": {
      "cityId": "507f1f77bcf86cd799439030",
      "areaId": "507f1f77bcf86cd799439031",
      "address": "Relief Camp Site A"
    },
    "beneficiaryInfo": {
      "name": "Ahmed Khan",
      "familySize": 6
    },
    "requestId": "550e8400-e29b-41d4-a716-446655440001"
  }'
`;

// Get Stock Summary
const curlGetStockSummary = `
curl -X GET "${BASE_URL}/packages/507f1f77bcf86cd799439015/stock-summary?type=central" \\
  -H "Authorization: Bearer ${AUTH_TOKEN}"
`;

// ============================================================================
// TESTING SCENARIOS
// ============================================================================

/**
 * SCENARIO 1: Complete Package Lifecycle
 * 
 * 1. Admin creates "Winter Relief Kit" package
 * 2. Admin checks central warehouse stock summary
 * 3. Admin assigns 10 packages to Volunteer A
 * 4. Volunteer A checks their stock summary
 * 5. Volunteer A distributes 3 packages to beneficiaries
 * 6. Volunteer A checks remaining stock
 */

/**
 * SCENARIO 2: Insufficient Stock Handling
 * 
 * 1. Admin creates package requiring 50kg Rice
 * 2. Central warehouse only has 30kg Rice
 * 3. Admin tries to assign package
 * 4. System returns error: "Insufficient central stock for Rice"
 * 5. Admin adds more stock to central warehouse
 * 6. Admin successfully assigns package
 */

/**
 * SCENARIO 3: Idempotency Testing
 * 
 * 1. Admin assigns package with requestId: "uuid-1"
 * 2. Network fails, admin retries with same requestId
 * 3. System detects duplicate requestId
 * 4. Returns existing assignment without creating duplicates
 * 5. Response includes "duplicate: true" flag
 */

/**
 * SCENARIO 4: Multi-Item Package Distribution
 * 
 * Package: "Family Relief Kit"
 * - 5kg Rice
 * - 2L Oil
 * - 1kg Sugar
 * 
 * Volunteer has:
 * - 20kg Rice (can make 4 packages)
 * - 10L Oil (can make 5 packages)
 * - 2kg Sugar (can make 2 packages)
 * 
 * Stock summary shows: maxPackages = 2 (limited by Sugar)
 * Volunteer can distribute maximum 2 complete packages
 */

/**
 * SCENARIO 5: Package Update Impact
 * 
 * 1. Package "Basic Kit" contains: 5kg Rice, 2L Oil
 * 2. 10 packages assigned to volunteers
 * 3. Admin updates package to: 10kg Rice, 3L Oil
 * 4. Already assigned packages remain unchanged (historical data)
 * 5. New assignments use updated quantities
 */

// ============================================================================
// VALIDATION TESTING
// ============================================================================

// Test 1: Duplicate items in package (should fail)
const testDuplicateItems = {
  body: {
    name: 'Invalid Package',
    items: [
      { itemId: '507f1f77bcf86cd799439011', quantity: 5 },
      { itemId: '507f1f77bcf86cd799439011', quantity: 3 } // Duplicate
    ]
  }
  // Expected: 400 Bad Request - "Duplicate items in package"
};

// Test 2: Non-existent item (should fail)
const testNonExistentItem = {
  body: {
    name: 'Invalid Package',
    items: [
      { itemId: 'non-existent-id', quantity: 5 }
    ]
  }
  // Expected: 400 Bad Request - "Some items not found or inactive"
};

// Test 3: Zero quantity (should fail)
const testZeroQuantity = {
  body: {
    name: 'Invalid Package',
    items: [
      { itemId: '507f1f77bcf86cd799439011', quantity: 0 }
    ]
  }
  // Expected: 400 Bad Request - Validation error
};

// Test 4: Empty items array (should fail)
const testEmptyItems = {
  body: {
    name: 'Invalid Package',
    items: []
  }
  // Expected: 400 Bad Request - "Must contain at least 1 item"
};

// Test 5: Duplicate package name (should fail)
const testDuplicateName = {
  body: {
    name: 'Family Relief Kit', // Already exists
    items: [
      { itemId: '507f1f77bcf86cd799439011', quantity: 5 }
    ]
  }
  // Expected: 400 Bad Request - Duplicate key error
};

// ============================================================================
// PERFORMANCE TESTING
// ============================================================================

/**
 * Load Test: Assign 100 packages to 10 volunteers
 * - Each volunteer gets 10 packages
 * - Each package has 5 items
 * - Total transactions: 100 × 5 × 2 = 1000 transactions
 * - Should complete in < 5 seconds
 */

/**
 * Stress Test: Distribute 1000 packages simultaneously
 * - 50 volunteers distributing concurrently
 * - Each distributes 20 packages
 * - Test database transaction handling
 * - Test idempotency under load
 */

// ============================================================================
// EXPORT FOR TESTING TOOLS
// ============================================================================

module.exports = {
  createPackageExample,
  getAllPackagesExample,
  getPackageByIdExample,
  updatePackageExample,
  deletePackageExample,
  assignPackageExample,
  distributePackageExample,
  getPackageStockSummaryCentralExample,
  getPackageStockSummaryVolunteerExample,
  curlCreatePackage,
  curlAssignPackage,
  curlDistributePackage,
  curlGetStockSummary
};
