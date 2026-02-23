# Dashboard Metrics API Documentation

## Endpoint Overview

**Endpoint**: `/api/reports/dashboard-metrics`  
**Method**: `GET`  
**Authentication**: Required (Firebase JWT Token)  
**Authorization**: Admin only (recommended)

---

## Description

Returns aggregated metrics for the admin dashboard including:
- Total inventory stock (central + volunteers)
- Stock breakdown by location
- Number of volunteers currently holding items

Supports date range filtering to show metrics for specific time periods.

---

## Request

### Headers
```http
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: application/json
```

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `startDate` | ISO 8601 DateTime | No | Start of date range (inclusive) | `2024-01-01T00:00:00.000Z` |
| `endDate` | ISO 8601 DateTime | No | End of date range (inclusive) | `2024-12-31T23:59:59.999Z` |

### Example Requests

#### Get All-Time Metrics
```bash
GET /api/reports/dashboard-metrics
```

#### Get Metrics for Date Range
```bash
GET /api/reports/dashboard-metrics?startDate=2024-01-01T00:00:00.000Z&endDate=2024-12-31T23:59:59.999Z
```

#### Get Today's Metrics
```bash
GET /api/reports/dashboard-metrics?startDate=2024-12-21T00:00:00.000Z&endDate=2024-12-21T23:59:59.999Z
```

---

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "inStock": {
      "total": 12450,
      "central": 8200,
      "volunteers": 4250
    },
    "withVolunteers": {
      "totalItems": 4250,
      "volunteersCount": 23
    }
  }
}
```

### Response Fields

#### `inStock` Object
| Field | Type | Description |
|-------|------|-------------|
| `total` | Number | Total items in stock (central + volunteers) |
| `central` | Number | Items in central warehouse |
| `volunteers` | Number | Items with volunteers in the field |

#### `withVolunteers` Object
| Field | Type | Description |
|-------|------|-------------|
| `totalItems` | Number | Total items currently with volunteers |
| `volunteersCount` | Number | Number of volunteers holding items (stock > 0) |

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

**Causes**:
- Missing `Authorization` header
- Invalid Firebase token
- Expired token

### 400 Bad Request
```json
{
  "success": false,
  "error": "Bad Request",
  "message": "Invalid date format"
}
```

**Causes**:
- Invalid date format (not ISO 8601)
- `endDate` before `startDate`

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "Error calculating metrics"
}
```

**Causes**:
- Database connection error
- Aggregation pipeline error

---

## Business Logic

### Stock Calculations

#### Central Stock
```
Central Stock = (STOCK_IN + RETURN_TO_CENTRAL) - ISSUE_TO_VOLUNTEER
```

**Transaction Types**:
- `STOCK_IN` (IN): Items added to central warehouse
- `RETURN_TO_CENTRAL` (IN): Items returned from volunteers
- `ISSUE_TO_VOLUNTEER` (OUT): Items assigned to volunteers

#### Volunteer Stock
```
Volunteer Stock = ISSUE_TO_VOLUNTEER - (DISTRIBUTION + DAMAGE + RETURN_TO_CENTRAL)
```

**Transaction Types**:
- `ISSUE_TO_VOLUNTEER` (IN): Items received from central
- `DISTRIBUTION` (OUT): Items distributed to beneficiaries
- `DAMAGE` (OUT): Items reported as damaged
- `RETURN_TO_CENTRAL` (OUT): Items returned to central

#### Total Stock
```
Total Stock = Central Stock + Volunteer Stock
```

### Volunteer Count
- Counts unique volunteers with `stock > 0`
- Excludes volunteers with no current stock
- Based on `performedBy` field in transactions

### Date Filtering
- When dates provided, filters `InventoryTransaction.createdAt`
- Inclusive of both start and end dates
- Without dates, returns all-time metrics

---

## Database Queries

### Aggregation Pipeline

The endpoint uses MongoDB aggregation pipelines to calculate metrics efficiently:

1. **Match Stage**: Filter by date range (if provided)
2. **Group Stage**: Group by item and calculate totals
3. **Project Stage**: Calculate stock levels
4. **Group Stage**: Sum across all items
5. **Return**: Aggregated metrics

---

## Performance

### Query Optimization
- Uses indexed fields (`createdAt`, `type`, `direction`)
- Aggregation runs on database server
- Minimal data transfer

### Expected Response Times
- Small dataset (< 1,000 transactions): < 100ms
- Medium dataset (1,000 - 10,000 transactions): < 500ms
- Large dataset (> 10,000 transactions): < 1,000ms

### Caching Recommendations
- Cache results for 5-10 minutes for frequently accessed ranges
- Invalidate cache on new transactions
- Use Redis or in-memory cache

---

## Usage Examples

### JavaScript (Axios)
```javascript
import axios from 'axios';

const getDashboardMetrics = async (startDate, endDate) => {
  try {
    const response = await axios.get('/api/reports/dashboard-metrics', {
      params: { startDate, endDate },
      headers: {
        Authorization: `Bearer ${firebaseToken}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching metrics:', error);
    throw error;
  }
};

// Get today's metrics
const today = new Date();
today.setHours(0, 0, 0, 0);
const metrics = await getDashboardMetrics(
  today.toISOString(),
  new Date().toISOString()
);
```

### cURL
```bash
# Get all-time metrics
curl -X GET \
  'http://localhost:5000/api/reports/dashboard-metrics' \
  -H 'Authorization: Bearer YOUR_FIREBASE_TOKEN'

# Get metrics for specific date range
curl -X GET \
  'http://localhost:5000/api/reports/dashboard-metrics?startDate=2024-01-01T00:00:00.000Z&endDate=2024-12-31T23:59:59.999Z' \
  -H 'Authorization: Bearer YOUR_FIREBASE_TOKEN'
```

### Python (Requests)
```python
import requests
from datetime import datetime

def get_dashboard_metrics(firebase_token, start_date=None, end_date=None):
    url = 'http://localhost:5000/api/reports/dashboard-metrics'
    headers = {'Authorization': f'Bearer {firebase_token}'}
    params = {}
    
    if start_date:
        params['startDate'] = start_date.isoformat()
    if end_date:
        params['endDate'] = end_date.isoformat()
    
    response = requests.get(url, headers=headers, params=params)
    return response.json()['data']

# Get today's metrics
today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
metrics = get_dashboard_metrics(token, start_date=today, end_date=datetime.now())
```

---

## Testing

### Test Cases

#### Test 1: All-Time Metrics
```bash
GET /api/reports/dashboard-metrics
Expected: Returns all transactions since system start
```

#### Test 2: Today's Metrics
```bash
GET /api/reports/dashboard-metrics?startDate=2024-12-21T00:00:00.000Z&endDate=2024-12-21T23:59:59.999Z
Expected: Returns only today's transactions
```

#### Test 3: Custom Range
```bash
GET /api/reports/dashboard-metrics?startDate=2024-06-01T00:00:00.000Z&endDate=2024-12-31T23:59:59.999Z
Expected: Returns transactions from June to December
```

#### Test 4: No Data
```bash
GET /api/reports/dashboard-metrics?startDate=2025-01-01T00:00:00.000Z&endDate=2025-01-31T23:59:59.999Z
Expected: Returns zeros for all metrics
```

#### Test 5: Invalid Date
```bash
GET /api/reports/dashboard-metrics?startDate=invalid-date
Expected: 400 Bad Request
```

#### Test 6: No Auth
```bash
GET /api/reports/dashboard-metrics
(Without Authorization header)
Expected: 401 Unauthorized
```

---

## Rate Limiting

**Recommended Limits**:
- 100 requests per minute per user
- 1,000 requests per hour per user

**Implementation**: Use middleware like `express-rate-limit`

---

## Security Considerations

### Authentication
- ✅ Requires valid Firebase JWT token
- ✅ Token verified on every request
- ✅ Expired tokens rejected

### Authorization
- ⚠️ Currently no role check in backend
- ✅ Frontend restricts to admin users
- 💡 Recommended: Add role check in backend

### Data Privacy
- ✅ No PII exposed in response
- ✅ Only aggregated metrics returned
- ✅ No individual transaction details

### Input Validation
- ✅ Date format validated
- ✅ SQL injection prevented (MongoDB)
- ✅ XSS prevented (no HTML in response)

---

## Monitoring

### Metrics to Track
- Request count per minute
- Average response time
- Error rate (4xx, 5xx)
- Cache hit rate (if caching implemented)

### Logging
```javascript
// Log format
{
  timestamp: "2024-12-21T15:30:45.123Z",
  endpoint: "/api/reports/dashboard-metrics",
  method: "GET",
  userId: "user123",
  params: { startDate: "...", endDate: "..." },
  responseTime: 234,
  status: 200
}
```

---

## Changelog

### Version 1.0.0 (2024-12-21)
- ✅ Initial release
- ✅ Support for date range filtering
- ✅ Central and volunteer stock breakdown
- ✅ Volunteer count calculation

---

## Related Endpoints

- `GET /api/reports/stock-summary` - Detailed stock by item
- `GET /api/reports/volunteer-stock` - Stock by volunteer
- `GET /api/stock/central` - Central warehouse stock
- `GET /api/stock/volunteer/:id` - Specific volunteer stock

---

## Support

For issues or questions:
1. Check backend logs for errors
2. Verify database connection
3. Ensure Firebase auth is configured
4. Review transaction data in database

---

**API Version**: 1.0.0  
**Last Updated**: December 21, 2024  
**Status**: Production Ready ✅
