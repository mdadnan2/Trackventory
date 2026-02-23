# 🔄 Volunteer-to-Volunteer Stock Transfer Feature

## Overview

This feature enables volunteers to transfer inventory items from their stock to another volunteer's stock, facilitating field-level resource redistribution without requiring admin intervention or returning items to the central warehouse.

## Business Logic

### Key Principles

1. **Immutable Audit Trail**: All transfers recorded as `VOLUNTEER_TRANSFER` transactions
2. **Atomic Operations**: Transfer is all-or-nothing using database transactions
3. **Stock Validation**: Source volunteer must have sufficient stock
4. **Bidirectional Recording**: Both OUT (from source) and IN (to target) transactions created
5. **Authorization**: Volunteers can transfer their own stock; Admins can facilitate any transfer

## API Endpoint

### POST `/api/stock/transfer`

Transfer stock from one volunteer to another.

**Authentication**: Required (Firebase Token)

**Authorization**: 
- Volunteers can transfer their own stock
- Admins can transfer between any volunteers

**Request Body**:
```json
{
  "fromVolunteerId": "volunteer1_id",
  "toVolunteerId": "volunteer2_id",
  "items": [
    {
      "itemId": "item_id",
      "quantity": 10
    }
  ],
  "notes": "Optional transfer reason"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Stock transferred successfully"
  }
}
```

**Error Responses**:

- `400 Bad Request`: Insufficient stock, invalid items, or same volunteer transfer
- `404 Not Found`: Source or target volunteer not found or inactive
- `401 Unauthorized`: Invalid or missing authentication token

## Database Changes

### Transaction Type

Added new enum value to `TransactionType`:
```typescript
VOLUNTEER_TRANSFER = 'VOLUNTEER_TRANSFER'
```

### Transaction Records

Each transfer creates **2 transactions**:

1. **OUT Transaction** (Source Volunteer):
```javascript
{
  itemId: ObjectId,
  type: 'VOLUNTEER_TRANSFER',
  direction: 'OUT',
  quantity: 10,
  performedBy: fromVolunteerId,
  referenceType: 'VolunteerTransfer',
  referenceId: toVolunteerId
}
```

2. **IN Transaction** (Target Volunteer):
```javascript
{
  itemId: ObjectId,
  type: 'VOLUNTEER_TRANSFER',
  direction: 'IN',
  quantity: 10,
  performedBy: toVolunteerId,
  referenceType: 'VolunteerTransfer',
  referenceId: fromVolunteerId
}
```

## Stock Calculation Impact

The `getVolunteerStock` method now includes transfer transactions:

```typescript
stock = (totalReceived + totalTransferredIn) - 
        (totalDistributed + totalDamaged + totalReturned + totalTransferredOut)
```

## Validation Rules

1. ✅ Source volunteer must exist and be active
2. ✅ Target volunteer must exist and be active
3. ✅ Source and target volunteers must be different
4. ✅ All items must exist and be active
5. ✅ Source volunteer must have sufficient stock for each item
6. ✅ Quantities must be positive integers

## Usage Examples

### Example 1: Volunteer Self-Transfer

**Scenario**: Volunteer A transfers 50 water bottles to Volunteer B

```bash
POST /api/stock/transfer
Authorization: Bearer <volunteer_a_token>

{
  "fromVolunteerId": "volunteer_a_id",
  "toVolunteerId": "volunteer_b_id",
  "items": [
    {
      "itemId": "water_bottle_id",
      "quantity": 50
    }
  ],
  "notes": "Volunteer B needs more water for their distribution area"
}
```

### Example 2: Admin-Facilitated Transfer

**Scenario**: Admin transfers multiple items between two volunteers

```bash
POST /api/stock/transfer
Authorization: Bearer <admin_token>

{
  "fromVolunteerId": "volunteer_c_id",
  "toVolunteerId": "volunteer_d_id",
  "items": [
    {
      "itemId": "rice_bag_id",
      "quantity": 20
    },
    {
      "itemId": "cooking_oil_id",
      "quantity": 15
    }
  ],
  "notes": "Rebalancing stock across field teams"
}
```

## Frontend Integration

### API Service Method

```typescript
import { stockAPI } from '@/services/api';

// Transfer stock
const response = await stockAPI.transferStock({
  fromVolunteerId: 'volunteer1_id',
  toVolunteerId: 'volunteer2_id',
  items: [
    { itemId: 'item1_id', quantity: 10 }
  ],
  notes: 'Transfer reason'
});
```

## Security Considerations

1. **Authorization Check**: Volunteers can only transfer their own stock (enforced in controller)
2. **Stock Validation**: Prevents over-transfer by checking available stock
3. **Active User Check**: Only active volunteers can participate in transfers
4. **Transaction Atomicity**: Rollback on any failure ensures data consistency
5. **Audit Trail**: Complete history of who transferred what to whom

## Use Cases

### Field Operations
- **Resource Rebalancing**: Redistribute supplies between field teams based on demand
- **Emergency Response**: Quick transfer to volunteers in high-need areas
- **Team Collaboration**: Share resources without central warehouse involvement

### Operational Benefits
- **Reduced Logistics**: No need to return to central warehouse
- **Faster Response**: Direct peer-to-peer transfers
- **Flexibility**: Field-level decision making
- **Accountability**: Complete audit trail maintained

## Testing Checklist

- [ ] Transfer with sufficient stock succeeds
- [ ] Transfer with insufficient stock fails with 400
- [ ] Transfer to non-existent volunteer fails with 404
- [ ] Transfer to same volunteer fails with 400
- [ ] Transfer with inactive items fails with 400
- [ ] Volunteer can transfer own stock
- [ ] Volunteer cannot transfer another volunteer's stock
- [ ] Admin can transfer between any volunteers
- [ ] Stock calculations reflect transfers correctly
- [ ] Transaction rollback on failure
- [ ] Multiple items transfer atomically

## Future Enhancements

- [ ] Transfer approval workflow (optional)
- [ ] Transfer notifications (SMS/Email)
- [ ] Transfer history report
- [ ] Bulk transfer operations
- [ ] Transfer limits/quotas
- [ ] Geographic proximity validation

---

**Implementation Date**: 2024
**Status**: ✅ Complete
**Backward Compatible**: Yes
