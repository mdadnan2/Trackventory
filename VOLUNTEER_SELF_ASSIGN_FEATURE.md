# Volunteer Self-Assign Stock Feature

## Overview
Volunteers can now request stock directly from central inventory without admin intervention. The volunteer stock page has been redesigned with a modern tabbed interface matching the admin stock page style.

## ✅ Implementation Complete

### Backend Changes

#### 1. New Validation Schema
**File**: `backend/src/modules/stock/stock.validation.ts`
```typescript
export const selfAssignStockSchema = z.object({
  items: z.array(z.object({
    itemId: z.string(),
    quantity: z.number().min(1)
  })).min(1),
  notes: z.string().optional()
});
```

#### 2. New Controller Method
**File**: `backend/src/modules/stock/stock.controller.ts`
```typescript
async selfAssignStock(req: UserRequest, res: Response, next: NextFunction) {
  try {
    const data = selfAssignStockSchema.parse(req.body);
    const volunteerId = req.user!._id.toString();
    const result = await stockService.assignStock(volunteerId, data.items, volunteerId, data.notes);
    sendSuccess(res, result, 201);
  } catch (error) {
    next(error);
  }
}
```

#### 3. New Route
**File**: `backend/src/modules/stock/stock.routes.ts`
```typescript
router.post('/self-assign', stockController.selfAssignStock.bind(stockController));
```
- **Endpoint**: `POST /api/stock/self-assign`
- **Access**: All authenticated users (Admin & Volunteer)
- **Auto-fills**: volunteerId from JWT token

### Frontend Changes

#### 1. New API Method
**File**: `frontend/services/api.ts`
```typescript
selfAssignStock: (data: any) => {
  console.log('Calling selfAssignStock:', data);
  return api.post('/stock/self-assign', data);
}
```

#### 2. Redesigned Volunteer Stock Page
**File**: `frontend/app/dashboard/stock/page.tsx`

**New Features**:
- ✅ Modern tabbed interface (Request Stock, Transfer Stock, Return Stock)
- ✅ Self-assign functionality in "Request Stock" tab
- ✅ Clean table layout for stock display
- ✅ Summary cards showing Total Items, Total Quantity, Low Stock
- ✅ Consistent UI with admin stock page

**Tab Structure**:
1. **Request Stock** - Volunteer can request items from central warehouse
2. **Transfer Stock** - Transfer items to other volunteers
3. **Return Stock** - Return items to central warehouse

## 🎯 Key Features

### 1. Self-Service Stock Request
- Volunteers select items and quantities
- System validates against central stock availability
- Immediate assignment (no approval needed)
- Full audit trail maintained

### 2. Modern UI Design
- Tabbed interface for all stock operations
- Responsive table layout
- Status badges (Good Stock, Low Stock, Empty)
- Summary statistics at a glance

### 3. Complete Functionality
All volunteer stock operations in one place:
- Request stock from central
- Transfer to other volunteers
- Return to central warehouse
- View current inventory

## 📊 Business Logic

### Self-Assign Flow
1. Volunteer selects items and quantities
2. Frontend calls `POST /api/stock/self-assign`
3. Backend validates:
   - Items exist and are active
   - Central stock has sufficient quantity
   - User is authenticated
4. Creates assignment transaction
5. Updates ledger (OUT from central, IN to volunteer)
6. Returns success response

### Authorization
- **Endpoint**: Open to all authenticated users
- **Volunteer ID**: Auto-extracted from JWT token
- **Performed By**: Same as volunteer ID (self-assignment)

## 🔒 Security

- ✅ JWT token verification required
- ✅ Volunteer ID from token (cannot spoof)
- ✅ Central stock validation (prevents over-assignment)
- ✅ Full audit trail in ledger
- ✅ Zod schema validation

## 📝 API Documentation

### Self-Assign Stock
**Endpoint**: `POST /api/stock/self-assign`

**Headers**:
```
Authorization: Bearer <firebase-jwt-token>
```

**Request Body**:
```json
{
  "items": [
    {
      "itemId": "item_id_here",
      "quantity": 10
    }
  ],
  "notes": "Optional notes"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Stock assigned to volunteer",
    "assignmentId": "assignment_id_here"
  }
}
```

**Error Response** (400):
```json
{
  "error": "Insufficient central stock for item xyz"
}
```

## 🎨 UI Screenshots

### Volunteer Stock Page - Request Stock Tab
```
┌─────────────────────────────────────────────────────┐
│ [Request Stock] [Transfer Stock] [Return Stock]     │
├─────────────────────────────────────────────────────┤
│ Request Stock from Central Warehouse                │
│ Request items to be assigned to you from central    │
│                                                      │
│ Item: [Select Item ▼]    Quantity: [___]  [-]      │
│                                                      │
│ [+ Add Another Item]              [Request Stock]   │
└─────────────────────────────────────────────────────┘
```

### My Stock Table
```
┌─────────────────────────────────────────────────────┐
│ My Stock                                             │
│ Your current inventory status                        │
│                                                      │
│ Total Items: 5  Total Quantity: 150  Low Stock: 2   │
├──────────┬──────────┬───────┬──────┬────────────────┤
│ Item     │ Category │ Stock │ Unit │ Status         │
├──────────┼──────────┼───────┼──────┼────────────────┤
│ Rice     │ Food     │ 50    │ kg   │ 🟢 Good Stock  │
│ Water    │ Beverage │ 100   │ L    │ 🟢 Good Stock  │
│ Blankets │ Shelter  │ 5     │ pcs  │ 🟡 Low Stock   │
└──────────┴──────────┴───────┴──────┴────────────────┘
```

## 🧪 Testing

### Test Scenario 1: Successful Self-Assign
1. Login as volunteer
2. Navigate to Stock page
3. Click "Request Stock" tab
4. Select item and quantity
5. Click "Request Stock"
6. ✅ Success toast appears
7. ✅ Stock appears in "My Stock" table

### Test Scenario 2: Insufficient Central Stock
1. Request quantity > central stock
2. ❌ Error toast: "Insufficient central stock"

### Test Scenario 3: Multiple Items
1. Click "Add Another Item"
2. Select multiple items
3. Submit request
4. ✅ All items assigned atomically

## 🔄 Comparison: Before vs After

### Before
- ❌ Volunteers wait for admin to assign stock
- ❌ Manual coordination required
- ❌ Delays in field operations
- ❌ Old card-based UI

### After
- ✅ Volunteers self-serve stock requests
- ✅ Immediate assignment
- ✅ Faster field deployment
- ✅ Modern tabbed interface
- ✅ All operations in one place

## 📋 Database Impact

### Transactions Created
For each self-assign request:
1. **OUT from Central**:
   - Type: `ISSUE_TO_VOLUNTEER`
   - Direction: `OUT`
   - PerformedBy: Admin/System

2. **IN to Volunteer**:
   - Type: `ISSUE_TO_VOLUNTEER`
   - Direction: `IN`
   - PerformedBy: Volunteer (self)

### Collections Affected
- `inventory_transactions` - New ledger entries
- `volunteer_stock_assignments` - Assignment record

## 🚀 Deployment Notes

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

### Environment Variables
No new environment variables required.

## 📚 Related Documentation
- [Stock Management API](API_DOCUMENTATION.md#stock-management)
- [Volunteer Transfer Feature](VOLUNTEER_TRANSFER_FEATURE.md)
- [Stock Return Feature](STOCK_RETURN_FEATURE.md)

## ✨ Future Enhancements
- [ ] Admin approval workflow (optional)
- [ ] Stock request limits per volunteer
- [ ] Request history/tracking
- [ ] Email notifications on assignment
- [ ] Bulk request templates

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: 2024
