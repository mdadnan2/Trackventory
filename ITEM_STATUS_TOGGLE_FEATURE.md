# Item Status Toggle Feature

## Overview
Added the ability to toggle item status between Active and Inactive with proper validation to ensure data integrity.

## Business Rules

### Activation
- Can activate an item at any time without restrictions
- No confirmation required

### Deactivation
- **Requires confirmation popup** before deactivation
- **Validation checks** before allowing deactivation:
  1. Central warehouse stock must be zero
  2. All volunteers' stock for this item must be zero
  
### Error Messages
- **Central warehouse has stock**: "Cannot deactivate item. Central warehouse currently holds inventory for this item."
- **Volunteers have stock**: "Cannot deactivate item. One or more volunteers currently hold inventory for this item."

## Implementation Details

### Backend Changes

#### 1. Item Service (`backend/src/modules/items/items.service.ts`)
- Added `toggleItemStatus(id, isActive)` method
- Validates stock levels before deactivation:
  - Calculates central warehouse stock from transactions
  - Calculates volunteer stock from transactions
  - Throws `BadRequestError` if any stock exists

#### 2. Item Controller (`backend/src/modules/items/items.controller.ts`)
- Added `toggleStatus` endpoint handler
- Extracts `isActive` from request body
- Calls service method and returns result

#### 3. Item Routes (`backend/src/modules/items/items.routes.ts`)
- Added `PATCH /api/items/:id/toggle-status` endpoint
- Protected with Admin role guard

### Frontend Changes

#### 1. API Service (`frontend/services/api.ts`)
- Added `toggleStatus(id, isActive)` method to `itemsAPI`

#### 2. Items Page (`frontend/app/dashboard/items/page.tsx`)
- Replaced static status badge with interactive toggle switch
- Added confirmation modal for deactivation
- Handles activation immediately without confirmation
- Shows error messages from backend validation

#### 3. UI Components
- Toggle switch with Tailwind CSS styling
- Confirmation modal with clear messaging
- Professional error handling with alerts

## API Endpoint

### Toggle Item Status
```
PATCH /api/items/:id/toggle-status
```

**Headers:**
```
Authorization: Bearer <firebase-token>
```

**Body:**
```json
{
  "isActive": true | false
}

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "_id": "item-id",
    "name": "Item Name",
    "category": "Category",
    "unit": "kg",
    "isActive": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (Error - Stock Exists):**
```json
{
  "success": false,
  "error": "Cannot deactivate item. Central warehouse currently holds inventory for this item."
}
```

## Stock Calculation Logic

### Central Warehouse Stock
```
Stock = (STOCK_IN + RETURN_TO_CENTRAL) - ISSUE_TO_VOLUNTEER
```

### Volunteer Stock
```
Stock = ISSUE_TO_VOLUNTEER - (DISTRIBUTION + DAMAGE + RETURN_TO_CENTRAL)
```

## User Experience

1. **Admin views Items page** → Sees toggle switches in Status column
2. **Admin clicks toggle to activate** → Item activates immediately
3. **Admin clicks toggle to deactivate** → Confirmation modal appears
4. **Admin confirms deactivation** → Backend validates stock levels
5. **If stock exists** → Error message displayed, item remains active
6. **If no stock** → Item deactivated successfully

## Security
- Only Admin users can toggle item status
- Backend validates all requests
- Stock calculations performed server-side
- No client-side manipulation possible

## Testing Checklist

- [ ] Activate an inactive item (should work immediately)
- [ ] Deactivate an item with central warehouse stock (should fail)
- [ ] Deactivate an item with volunteer stock (should fail)
- [ ] Deactivate an item with zero stock everywhere (should succeed)
- [ ] Cancel deactivation in confirmation modal (should not change status)
- [ ] Verify only Admin can access toggle functionality
- [ ] Verify error messages are clear and professional

## Future Enhancements

- Add bulk status toggle for multiple items
- Show stock levels in confirmation modal
- Add activity log for status changes
- Email notifications to admins on status changes
