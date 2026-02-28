# Cart-Based Assignment System Implementation

## Overview
Implemented a cart-based system for the "Assign to Volunteer" tab in the Stock page, matching the functionality of the Distribution page for consistency and better UX.

## Key Features Implemented

### 1. ✅ Cart System
- **Add to Cart**: Items/packages added to cart before submission
- **Cart Display**: Visual cart with item details and quantities
- **Remove from Cart**: Delete items from cart
- **Update Quantities**: Inline quantity editing in cart

### 2. ✅ Central Stock Tracking
- **Load Central Stock**: Fetches central warehouse inventory on page load
- **Real-Time Availability**: Shows available stock for each item/package
- **Dynamic Updates**: Recalculates as cart changes

### 3. ✅ Stock Impact Calculation
```typescript
calculateStockImpact() {
  // Calculates total stock needed from cart
  // Handles both items and packages
  // Expands packages to individual items
}
```

### 4. ✅ Duplicate Prevention
- Items/packages in cart are **disabled** in dropdown
- Forces users to update quantity in cart
- Prevents confusion and errors

### 5. ✅ Package Stock Calculation
```typescript
getMaxPackageQuantity(packageId) {
  // Checks ALL items in package
  // Returns minimum possible packages
  // Accounts for cart impact
}
```

### 6. ✅ Live Stock Validation
- **Before Adding**: Checks if stock available
- **Before Updating**: Validates new quantity
- **Visual Feedback**: Shows remaining stock after assignment

### 7. ✅ Visual Cart Display
```
┌─────────────────────────────────────┐
│ 🛒 Assignment Cart        2 items   │
├─────────────────────────────────────┤
│ 📦 Family Relief Kit                │
│    Rice ×10  Wheat ×6  Oil ×4       │
│    Qty: [2]                    [×]  │
├─────────────────────────────────────┤
│ 📋 Water Bottles                    │
│    Qty: [50]                   [×]  │
├─────────────────────────────────────┤
│ STOCK IMPACT                        │
│ Rice: -10 → 90 left                 │
│ Wheat: -6 → 44 left                 │
│ Oil: -4 → 16 left                   │
│ Water: -50 → 150 left               │
└─────────────────────────────────────┘
```

## Technical Implementation

### New State Variables
```typescript
const [cart, setCart] = useState<CartItem[]>([]);
const [centralStock, setCentralStock] = useState<any[]>([]);
const [selectedOption, setSelectedOption] = useState<string>('');
const [quantity, setQuantity] = useState<number | ''>('');
```

### Cart Item Type
```typescript
type CartItem = {
  id: string;
  type: 'item' | 'package';
  referenceId: string;
  name: string;
  quantity: number | '';
  items?: Array<{ 
    itemId: string; 
    quantity: number; 
    name: string 
  }>;
};
```

### Key Functions

#### 1. Load Central Stock
```typescript
const loadCentralStock = async () => {
  const stockRes = await stockAPI.getCentralStock();
  setCentralStock(stockRes.data.data);
};
```

#### 2. Calculate Stock Impact
```typescript
const calculateStockImpact = () => {
  const impact: Record<string, number> = {};
  cart.forEach(entry => {
    if (entry.type === 'item') {
      impact[entry.referenceId] += entry.quantity;
    } else {
      entry.items?.forEach(pkgItem => {
        impact[pkgItem.itemId] += pkgItem.quantity * entry.quantity;
      });
    }
  });
  return impact;
};
```

#### 3. Get Remaining Stock
```typescript
const getRemainingStock = (itemId: string) => {
  const impact = calculateStockImpact();
  const stock = centralStock.find(s => s.itemId === itemId);
  return (stock?.stock || 0) - (impact[itemId] || 0);
};
```

#### 4. Validate & Add to Cart
```typescript
const addToCart = () => {
  // 1. Check if item/package selected
  // 2. Validate stock availability
  // 3. Check for duplicates
  // 4. Add to cart with proper structure
  // 5. Clear selection
};
```

#### 5. Update Cart Quantity
```typescript
const updateCartQuantity = (id: string, newQuantity: number) => {
  // 1. Calculate impact without this item
  // 2. Check if new quantity is valid
  // 3. For packages, check ALL items
  // 4. Update cart if valid
};
```

#### 6. Get Dropdown Options
```typescript
const getDropdownOptions = () => {
  // 1. Calculate max quantity for each package
  // 2. Calculate remaining stock for each item
  // 3. Disable items/packages in cart
  // 4. Disable items/packages with 0 stock
  // 5. Return formatted options with headers
};
```

## UI Components

### 1. Cart Display
- **Header**: Gradient background with cart icon and item count
- **Items**: Individual cards with icons, names, and quantities
- **Package Expansion**: Shows constituent items
- **Inline Editing**: Quantity input with validation
- **Remove Button**: Appears on hover

### 2. Stock Impact Panel
- **Color Coding**:
  - 🔴 Red: Insufficient stock (negative)
  - 🟡 Amber: High usage (>80%)
  - 🔵 Blue: Normal usage
- **Shows**: Item name, quantity used, remaining stock

### 3. Add to Cart Section
- **Dropdown**: Combined items/packages with headers
- **Quantity Input**: Numeric input with focus select
- **Add Button**: Disabled when invalid
- **Validation**: Real-time stock checking

## Workflow Comparison

### Before (Row-Based)
```
1. Select volunteer
2. Add row 1: Item A, Qty 10
3. Add row 2: Item B, Qty 5
4. Add row 3: Package X, Qty 2
5. Submit (no preview, no validation)
```

### After (Cart-Based)
```
1. Select volunteer
2. Add Item A (10) → See in cart + stock impact
3. Add Item B (5) → See in cart + stock impact
4. Add Package X (2) → See in cart + stock impact
5. Review cart and stock impact
6. Submit with confidence
```

## Benefits

### 1. **Error Prevention**
- ✅ Can't over-assign stock
- ✅ Can't add duplicates
- ✅ Can't submit empty cart
- ✅ Real-time validation

### 2. **Better UX**
- ✅ Visual feedback before submission
- ✅ Clear stock impact display
- ✅ Easy to modify assignments
- ✅ Consistent with distribution page

### 3. **Transparency**
- ✅ See exactly what will be assigned
- ✅ Know remaining stock after assignment
- ✅ Understand package contents
- ✅ Prevent resource conflicts

### 4. **Consistency**
- ✅ Same pattern as distribution page
- ✅ Familiar interface for users
- ✅ Reduced training time
- ✅ Predictable behavior

## Testing Checklist

- [x] Load central stock on page load
- [x] Add items to cart
- [x] Add packages to cart
- [x] Update quantities in cart
- [x] Remove items from cart
- [x] Disable duplicates in dropdown
- [x] Show available stock in dropdown
- [x] Calculate stock impact correctly
- [x] Validate stock before adding
- [x] Validate stock before updating
- [x] Show package contents in cart
- [x] Calculate max packages correctly
- [x] Submit cart successfully
- [x] Clear cart after submission
- [x] Handle errors gracefully

## Edge Cases Handled

1. **Empty Cart**: Submit button disabled
2. **No Volunteer**: Error message on submit
3. **Insufficient Stock**: Can't add to cart
4. **Package Partial Stock**: Shows max possible packages
5. **Duplicate Add**: Warning message
6. **Quantity Update Exceeds Stock**: Error message
7. **Empty Quantity**: Allows empty, validates on blur

## Performance Considerations

- **Memoization**: Could add useMemo for expensive calculations
- **Debouncing**: Could debounce quantity updates
- **Lazy Loading**: Central stock loaded once on mount
- **Optimistic Updates**: Cart updates immediately

## Future Enhancements

1. **Bulk Operations**: Assign same items to multiple volunteers
2. **Templates**: Save common assignment patterns
3. **History**: Show recent assignments
4. **Undo**: Undo last cart action
5. **Export**: Export cart as CSV/PDF
6. **Barcode**: Scan items to add to cart

## Migration Notes

- **No Breaking Changes**: Existing API endpoints unchanged
- **Backward Compatible**: Old assignments still work
- **No Data Migration**: Pure frontend change
- **Instant Rollout**: No deployment dependencies

## Conclusion

The cart-based assignment system provides a **robust, user-friendly, and error-proof** way to assign stock to volunteers. It matches the distribution page pattern, ensuring consistency across the application and reducing cognitive load for users.
