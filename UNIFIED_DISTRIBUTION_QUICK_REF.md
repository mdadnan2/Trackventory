# 🚀 Unified Distribution - Quick Reference

## 📋 Key Functions Reference

### **Frontend (distribution/page.tsx)**

```typescript
// Calculate total stock usage from cart
calculateStockImpact(): Record<string, number>
// Returns: { itemId: totalQuantity, ... }

// Get remaining stock after cart deductions
getRemainingStock(itemId: string): number
// Returns: available stock minus cart usage

// Calculate max packages based on bottleneck
getMaxPackageQuantity(packageId: string): number
// Returns: minimum possible packages from all items

// Validate if item/package can be added
canAddToCart(type: 'item' | 'package', id: string, qty: number): boolean
// Returns: true if sufficient stock available

// Add item/package to cart with validation
addToCart(): void
// Validates stock and adds to cart array

// Remove item from cart
removeFromCart(id: string): void
// Removes and recalculates stock impact

// Generate grouped dropdown options
getDropdownOptions(): Array<{ label: string; options: Array<...> }>
// Returns: [{ label: "📦 PACKAGES", options: [...] }, ...]
```

---

## 🔧 API Endpoints

### **POST /api/distribution**

**Request:**
```json
{
  "volunteerId": "optional_volunteer_id",
  "state": "Gujarat",
  "city": "Ahmedabad",
  "pinCode": "380001",
  "area": "Satellite",
  "campaignId": "optional_campaign_id",
  "items": [
    { "itemId": "item_id_1", "quantity": 10 },
    { "itemId": "item_id_2", "quantity": 5 }
  ],
  "packages": [
    { "packageId": "pkg_id_1", "quantity": 2 },
    { "packageId": "pkg_id_2", "quantity": 3 }
  ],
  "requestId": "unique_request_id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "distribution_id",
    "volunteerId": "volunteer_id",
    "items": [...],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors:**
```json
{
  "error": "Insufficient volunteer stock for Rice. Available: 10, Required: 15"
}
```

---

## 📦 Data Structures

### **CartItem Type**
```typescript
type CartItem = {
  id: string;                    // Unique cart item ID
  type: 'item' | 'package';      // Item or package
  referenceId: string;           // itemId or packageId
  name: string;                  // Display name
  quantity: number;              // Quantity to distribute
  items?: Array<{                // Only for packages
    itemId: string;
    quantity: number;
    name: string;
  }>;
};
```

### **Stock Impact Map**
```typescript
Record<string, number>
// Example:
{
  "item_id_1": 15,  // Total quantity needed
  "item_id_2": 8,
  "item_id_3": 22
}
```

---

## 🎯 Common Patterns

### **Pattern 1: Add Item to Cart**
```typescript
const addItemToCart = (itemId: string, quantity: number) => {
  // 1. Check if can add
  if (!canAddToCart('item', itemId, quantity)) {
    showError('Insufficient stock!');
    return;
  }
  
  // 2. Get item details
  const item = items.find(i => i._id === itemId);
  
  // 3. Add to cart
  setCart([...cart, {
    id: `item_${itemId}_${Date.now()}`,
    type: 'item',
    referenceId: itemId,
    name: item.name,
    quantity
  }]);
};
```

### **Pattern 2: Add Package to Cart**
```typescript
const addPackageToCart = (packageId: string, quantity: number) => {
  // 1. Check if can add
  if (!canAddToCart('package', packageId, quantity)) {
    showError('Insufficient stock!');
    return;
  }
  
  // 2. Get package details
  const pkg = packages.find(p => p._id === packageId);
  
  // 3. Expand package items
  const expandedItems = pkg.items.map(i => ({
    itemId: typeof i.itemId === 'string' ? i.itemId : i.itemId._id,
    quantity: i.quantity,
    name: typeof i.itemId === 'string' 
      ? items.find(item => item._id === i.itemId)?.name || ''
      : i.itemId.name
  }));
  
  // 4. Add to cart
  setCart([...cart, {
    id: `package_${packageId}_${Date.now()}`,
    type: 'package',
    referenceId: packageId,
    name: pkg.name,
    quantity,
    items: expandedItems
  }]);
};
```

### **Pattern 3: Calculate Stock Impact**
```typescript
const calculateStockImpact = () => {
  const impact: Record<string, number> = {};
  
  cart.forEach(entry => {
    if (entry.type === 'item') {
      // Direct item
      impact[entry.referenceId] = 
        (impact[entry.referenceId] || 0) + entry.quantity;
    } else {
      // Package - expand items
      entry.items?.forEach(pkgItem => {
        impact[pkgItem.itemId] = 
          (impact[pkgItem.itemId] || 0) + 
          (pkgItem.quantity * entry.quantity);
      });
    }
  });
  
  return impact;
};
```

### **Pattern 4: Validate Before Submit**
```typescript
const validateBeforeSubmit = () => {
  if (cart.length === 0) {
    return { valid: false, error: 'Cart is empty' };
  }
  
  const impact = calculateStockImpact();
  
  for (const [itemId, required] of Object.entries(impact)) {
    const stock = myStock.find(s => s.itemId === itemId);
    const available = stock?.stock || 0;
    
    if (required > available) {
      const item = items.find(i => i._id === itemId);
      return {
        valid: false,
        error: `Insufficient ${item?.name}. Need: ${required}, Have: ${available}`
      };
    }
  }
  
  return { valid: true };
};
```

---

## 🔍 Debugging Tips

### **Check Stock Calculation**
```typescript
// Log stock impact
console.log('Stock Impact:', calculateStockImpact());

// Log remaining stock for specific item
console.log('Remaining Rice:', getRemainingStock('rice_id'));

// Log max packages
console.log('Max Family Kits:', getMaxPackageQuantity('family_kit_id'));
```

### **Verify Cart State**
```typescript
// Log cart contents
console.log('Cart:', cart.map(c => ({
  type: c.type,
  name: c.name,
  qty: c.quantity
})));

// Check if item is in cart
const isInCart = cart.some(c => c.referenceId === itemId);
console.log('Item in cart:', isInCart);
```

### **Backend Validation**
```typescript
// Check what backend receives
console.log('Payload:', {
  items: cart.filter(c => c.type === 'item'),
  packages: cart.filter(c => c.type === 'package')
});
```

---

## ⚠️ Common Pitfalls

### **1. Not Resetting Cart on Tab Switch**
```typescript
// ❌ Wrong
<button onClick={() => setActiveTab('damage')}>

// ✅ Correct
<button onClick={() => {
  setActiveTab('damage');
  setCart([]);
  setSelectedOption('');
  setQuantity(1);
}}>
```

### **2. Not Handling Package Item Types**
```typescript
// ❌ Wrong
const itemId = pkgItem.itemId;  // Might be object

// ✅ Correct
const itemId = typeof pkgItem.itemId === 'string' 
  ? pkgItem.itemId 
  : pkgItem.itemId._id;
```

### **3. Not Validating Empty Cart**
```typescript
// ❌ Wrong
const handleSubmit = async () => {
  await distributionAPI.create(payload);
};

// ✅ Correct
const handleSubmit = async () => {
  if (cart.length === 0) {
    showError('Please add items to cart');
    return;
  }
  await distributionAPI.create(payload);
};
```

### **4. Not Using Atomic Transactions**
```typescript
// ❌ Wrong (Backend)
await Distribution.create(data);
await InventoryTransaction.insertMany(transactions);

// ✅ Correct (Backend)
return withTransaction(async (session) => {
  await Distribution.create([data], { session });
  await InventoryTransaction.insertMany(transactions, { session });
});
```

---

## 🧪 Testing Scenarios

### **Test 1: Simple Item Distribution**
```
1. Add 10 kg Rice to cart
2. Verify remaining stock = original - 10
3. Submit distribution
4. Verify transaction created
5. Verify stock deducted
```

### **Test 2: Package Distribution**
```
1. Add 2 Family Relief Kits
2. Verify all package items show in cart
3. Verify stock impact for each item
4. Submit distribution
5. Verify transactions for all items
```

### **Test 3: Mixed Distribution**
```
1. Add 2 packages
2. Add 5 kg Rice
3. Verify total rice = (2 × pkg_rice) + 5
4. Submit distribution
5. Verify correct quantities deducted
```

### **Test 4: Insufficient Stock**
```
1. Add items until stock low
2. Try to add more than available
3. Verify error message shown
4. Verify item disabled in dropdown
```

### **Test 5: Concurrent Modifications**
```
1. User A adds items to cart
2. User B distributes same items
3. User A tries to submit
4. Verify backend validation catches it
```

---

## 📊 Performance Optimization

### **Memoize Expensive Calculations**
```typescript
import { useMemo } from 'react';

const stockImpact = useMemo(() => 
  calculateStockImpact(), 
  [cart]
);

const dropdownOptions = useMemo(() => 
  getDropdownOptions(), 
  [items, packages, cart]
);
```

### **Debounce Quantity Input**
```typescript
import { debounce } from 'lodash';

const debouncedSetQuantity = useMemo(
  () => debounce(setQuantity, 300),
  []
);
```

---

## 🔐 Security Checklist

- [x] Backend validates all stock availability
- [x] Frontend validation is UX only (not security)
- [x] Atomic transactions prevent race conditions
- [x] Idempotency via requestId
- [x] Role-based access control
- [x] Input sanitization
- [x] SQL injection prevention (MongoDB)

---

## 📚 Related Files

```
Frontend:
├── app/dashboard/distribution/page.tsx    (Main UI)
├── services/api.ts                        (API client)
└── types/index.ts                         (TypeScript types)

Backend:
├── modules/distribution/
│   ├── distribution.controller.ts         (HTTP handlers)
│   ├── distribution.service.ts            (Business logic)
│   └── distribution.validation.ts         (Zod schemas)
└── database/models/
    ├── Distribution.ts                    (Distribution model)
    ├── Package.ts                         (Package model)
    └── InventoryTransaction.ts            (Transaction model)
```

---

**Quick Links:**
- [Full Implementation Guide](UNIFIED_DISTRIBUTION_IMPLEMENTATION.md)
- [Visual Guide](UNIFIED_DISTRIBUTION_VISUAL_GUIDE.md)
- [Package API Docs](PACKAGE_API_DOCUMENTATION.md)
