# 🎨 Unified Distribution - Visual Guide

## 📱 User Interface Flow

### **Step 1: Empty Cart**
```
┌────────────────────────────────────────────────────────┐
│ 🔵 Record Distribution  │  ⚠️ Report Damage           │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Add Items or Packages                                 │
│  ┌──────────────────────────────┐ ┌────┐ ┌────────┐  │
│  │ Select Item or Package... ▼  │ │ 1  │ │  Add   │  │
│  └──────────────────────────────┘ └────┘ └────────┘  │
│                                                        │
│  Location Details                                      │
│  State: [Select State ▼]                              │
│  City: [Select City ▼]                                │
│  Pin Code: [______]                                   │
│  Area: [______]                                       │
│  Campaign: [No Campaign ▼]                            │
│                                                        │
│                    [Record Distribution (0 items)] ❌  │
└────────────────────────────────────────────────────────┘
```

---

### **Step 2: Dropdown Opened**
```
┌────────────────────────────────────────────────────────┐
│  Add Items or Packages                                 │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Select Item or Package...                      ▼ │ │
│  ├──────────────────────────────────────────────────┤ │
│  │ 📦 PACKAGES                                      │ │
│  │   📦 Family Relief Kit (5 available)             │ │
│  │   📦 Emergency Food Pack (12 available)          │ │
│  │   📦 Winter Clothing Bundle (0 available) 🚫     │ │
│  ├──────────────────────────────────────────────────┤ │
│  │ 📋 INDIVIDUAL ITEMS                              │ │
│  │   📋 Rice - 50 kg (available)                    │ │
│  │   📋 Cooking Oil - 30 L (available)              │ │
│  │   📋 Water Bottles - 50 (available)              │ │
│  │   📋 Blankets - 0 (available) 🚫                 │ │
│  └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

---

### **Step 3: Items Added to Cart**
```
┌────────────────────────────────────────────────────────┐
│  🛒 Distribution Cart                      3 item(s)   │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 📦 Family Relief Kit × 2                    [X]  │ │
│  │    • Rice × 10 kg                                │ │
│  │    • Cooking Oil × 4 L                           │ │
│  │    • Water Bottles × 12                          │ │
│  ├──────────────────────────────────────────────────┤ │
│  │ 📋 Rice × 5 kg                              [X]  │ │
│  ├──────────────────────────────────────────────────┤ │
│  │ 📋 Water Bottles × 10                       [X]  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  Stock Impact:                                         │
│  ┌────────────────────┬────────────────────┐          │
│  │ Rice               │ Cooking Oil        │          │
│  │ Using: 15          │ Using: 4           │          │
│  │ Remaining: 35      │ Remaining: 26      │          │
│  ├────────────────────┴────────────────────┤          │
│  │ Water Bottles                           │          │
│  │ Using: 22                               │          │
│  │ Remaining: 28                           │          │
│  └─────────────────────────────────────────┘          │
└────────────────────────────────────────────────────────┘
```

---

### **Step 4: Insufficient Stock Warning**
```
┌────────────────────────────────────────────────────────┐
│  Add Items or Packages                                 │
│  ┌──────────────────────────────────┐ ┌────┐ ┌────┐  │
│  │ Rice - 35 kg (available)      ▼  │ │ 40 │ │Add │  │
│  └──────────────────────────────────┘ └────┘ └────┘  │
│                                                        │
│  ⚠️ Insufficient stock!                                │
│  You're trying to add 40 kg but only 35 kg available  │
│  (15 kg already in cart)                              │
└────────────────────────────────────────────────────────┘
```

---

## 🔢 Stock Calculation Examples

### **Example 1: Simple Package Distribution**

**Initial Stock:**
```
Rice: 50 kg
Oil: 30 L
Water: 50 bottles
```

**Package Definition:**
```
Family Relief Kit = {
  Rice: 5 kg
  Oil: 2 L
  Water: 6 bottles
}
```

**User Action:** Add 3 Family Relief Kits

**Calculation:**
```javascript
// Frontend calculates:
stockImpact = {
  rice: 3 × 5 = 15 kg
  oil: 3 × 2 = 6 L
  water: 3 × 6 = 18 bottles
}

// Remaining stock:
rice: 50 - 15 = 35 kg ✅
oil: 30 - 6 = 24 L ✅
water: 50 - 18 = 32 bottles ✅

// Max packages available:
Math.min(
  50 ÷ 5 = 10,  // rice
  30 ÷ 2 = 15,  // oil
  50 ÷ 6 = 8    // water (bottleneck)
) = 8 packages
```

---

### **Example 2: Mixed Distribution**

**Cart Contents:**
```
1. Family Relief Kit × 2
2. Rice × 10 kg
3. Water Bottles × 5
```

**Stock Impact Calculation:**
```javascript
// Step 1: Calculate package impact
packageImpact = {
  rice: 2 × 5 = 10 kg
  oil: 2 × 2 = 4 L
  water: 2 × 6 = 12 bottles
}

// Step 2: Add individual items
totalImpact = {
  rice: 10 + 10 = 20 kg
  oil: 4 + 0 = 4 L
  water: 12 + 5 = 17 bottles
}

// Step 3: Calculate remaining
remaining = {
  rice: 50 - 20 = 30 kg
  oil: 30 - 4 = 26 L
  water: 50 - 17 = 33 bottles
}
```

**Dropdown Updates:**
```
📦 Family Relief Kit (6 available)  // was 8, now 6
📋 Rice (30 kg available)           // was 50, now 30
📋 Oil (26 L available)             // was 30, now 26
📋 Water (33 available)             // was 50, now 33
```

---

### **Example 3: Bottleneck Scenario**

**Stock:**
```
Rice: 100 kg
Oil: 10 L  ⚠️ (bottleneck)
Water: 100 bottles
```

**Package:** Family Relief Kit (5 kg rice, 2 L oil, 6 water)

**Max Packages Calculation:**
```javascript
maxPackages = Math.min(
  100 ÷ 5 = 20,  // rice allows 20
  10 ÷ 2 = 5,    // oil allows 5 ⚠️ BOTTLENECK
  100 ÷ 6 = 16   // water allows 16
) = 5 packages

// Dropdown shows:
📦 Family Relief Kit (5 available)
```

**If user adds 5 packages:**
```javascript
stockImpact = {
  rice: 5 × 5 = 25 kg (75 remaining)
  oil: 5 × 2 = 10 L (0 remaining) ⚠️
  water: 5 × 6 = 30 (70 remaining)
}

// Dropdown updates:
📦 Family Relief Kit (0 available) 🚫
📋 Rice (75 kg available)
📋 Oil (0 L available) 🚫
📋 Water (70 available)
```

---

## 🎯 Real-Time Updates Flow

```
User Action          Frontend Calculation         UI Update
───────────────────────────────────────────────────────────
Add Package    →    Calculate stock impact   →   Update cart
                    ├─ Expand package              Show items
                    ├─ Sum quantities              Update impact
                    └─ Check availability          Disable options
                                                   
Add Item       →    Add to impact map        →   Update remaining
                    Check if allowed               Show warning
                                                   
Remove Item    →    Recalculate impact       →   Re-enable options
                    Update remaining               Update counts
                                                   
Submit         →    Send to backend          →   Show success
                    Backend validates again        Clear cart
```

---

## 🚨 Error Prevention

### **Scenario 1: Concurrent Modifications**
```
Time  User A                    User B
────────────────────────────────────────────
T1    Views: Rice 50 kg         Views: Rice 50 kg
T2    Adds: 30 kg to cart       Adds: 25 kg to cart
T3    Submits ✅                 Submits ❌
      (Stock: 20 kg)            (Error: Only 20 kg available)
```

### **Scenario 2: Package + Item Conflict**
```
Stock: Rice 50 kg

User adds:
1. Family Kit × 8 (uses 40 kg rice)
2. Rice × 15 kg

Frontend: ❌ Blocks at step 2
"Insufficient stock! Only 10 kg available"
```

---

## 📊 Visual Stock Impact Display

### **Color Coding:**
```
┌─────────────────────────────────────┐
│ Stock Impact:                       │
├─────────────────────────────────────┤
│ ✅ Rice                             │
│    Using: 20 | Remaining: 30        │
│    [████████░░] 40% used            │
├─────────────────────────────────────┤
│ ⚠️ Cooking Oil                      │
│    Using: 25 | Remaining: 5         │
│    [█████████░] 83% used            │
├─────────────────────────────────────┤
│ ❌ Water Bottles                    │
│    Using: 50 | Remaining: 0         │
│    [██████████] 100% used           │
└─────────────────────────────────────┘

Legend:
✅ Green  = < 50% used
⚠️ Yellow = 50-90% used
❌ Red    = > 90% used
```

---

## 🎨 Mobile View

```
┌──────────────────────┐
│ 🛒 Cart (3)          │
├──────────────────────┤
│ 📦 Family Kit × 2    │
│    • Rice × 10       │
│    • Oil × 4         │
│    • Water × 12  [X] │
├──────────────────────┤
│ 📋 Rice × 5 kg   [X] │
├──────────────────────┤
│ Impact:              │
│ Rice: -15 (35 left)  │
│ Oil: -4 (26 left)    │
│ Water: -12 (38 left) │
└──────────────────────┘

┌──────────────────────┐
│ Add Items            │
├──────────────────────┤
│ [Select... ▼] [Qty]  │
│           [Add]      │
└──────────────────────┘

┌──────────────────────┐
│ Location             │
├──────────────────────┤
│ State: [______]      │
│ City: [______]       │
│ Pin: [______]        │
│ Area: [______]       │
└──────────────────────┘

┌──────────────────────┐
│ [Record (3 items)]   │
└──────────────────────┘
```

---

## 🔄 State Transitions

```
┌─────────┐
│  Empty  │ ← Initial state
└────┬────┘
     │ Add item/package
     ↓
┌─────────┐
│ Has     │ ← Can add more or submit
│ Items   │
└────┬────┘
     │ Submit
     ↓
┌─────────┐
│ Loading │ ← Backend processing
└────┬────┘
     │ Success
     ↓
┌─────────┐
│ Success │ ← Show toast, clear cart
└────┬────┘
     │ Auto-reset
     ↓
┌─────────┐
│  Empty  │ ← Ready for next distribution
└─────────┘
```

---

**This visual guide complements the technical implementation document.**
