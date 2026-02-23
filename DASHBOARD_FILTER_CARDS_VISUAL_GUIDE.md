# Dashboard Filter Cards - Visual Guide

## 📐 Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ADMIN DASHBOARD                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐ │
│  │  📅 Filter Period    │  │  📦 In Stock         │  │  👥 With Volunteers│
│  │  Select date range   │  │  Total inventory     │  │  Field inventory   │
│  │                      │  │                      │  │                    │
│  │  [Today        ▼]    │  │      12,450          │  │      4,250         │
│  │                      │  │                      │  │      items         │
│  │  📅 Dec 21, 2024     │  │  ─────────────────   │  │  ─────────────────│
│  │                      │  │  Central: 8,200      │  │  Across 23         │
│  │                      │  │  Volunteers: 4,250   │  │  volunteers        │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────┘ │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    EXISTING STATS CARDS                               │  │
│  │  [Central Stock] [With Volunteers] [Distributed] [Damaged]           │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         CHARTS                                        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Card 1: Filter Dropdown (Detailed)

```
┌─────────────────────────────────────┐
│  📅  Filter Period                  │
│      Select date range              │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Today                      ▼ │ │  ← Dropdown
│  └───────────────────────────────┘ │
│                                     │
│  📅 Dec 21, 2024                    │  ← Date range label
└─────────────────────────────────────┘

Dropdown Options:
├─ Today (default)
├─ This Week
├─ This Month
├─ This Year
└─ Custom Range
```

### Custom Range Mode:
```
┌─────────────────────────────────────┐
│  📅  Filter Period                  │
│      Select date range              │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Custom Range             ▼  │ │
│  └───────────────────────────────┘ │
│                                     │
│  From                               │
│  ┌───────────────────────────────┐ │
│  │  [Date Picker]                │ │
│  └───────────────────────────────┘ │
│                                     │
│  To                                 │
│  ┌───────────────────────────────┐ │
│  │  [Date Picker]                │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 📦 Card 2: In Stock (Detailed)

```
┌─────────────────────────────────────┐
│  📦  In Stock                       │
│      Total inventory                │
│                                     │
│         12,450                      │  ← Large total
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Central:        8,200              │  ← Breakdown
│  Volunteers:     4,250              │
└─────────────────────────────────────┘

Color Scheme:
- Icon Background: Green gradient (from-green-500 to-green-600)
- Total Number: Large, bold, slate-900
- Breakdown: Small, slate-600 labels, slate-900 values
```

---

## 👥 Card 3: With Volunteers (Detailed)

```
┌─────────────────────────────────────┐
│  👥  With Volunteers                │
│      Field inventory                │
│                                     │
│         4,250                       │  ← Large total
│         items                       │  ← Label
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Across 23 volunteers               │  ← Volunteer count
└─────────────────────────────────────┘

Color Scheme:
- Icon Background: Purple gradient (from-purple-500 to-purple-600)
- Total Number: Large, bold, slate-900
- Volunteer Count: Purple-600 highlight
```

---

## 🔄 Filter Behavior

### Today Filter
```
Start: 2024-12-21 00:00:00
End:   2024-12-21 15:30:45 (current time)
```

### Week Filter (Current week: Sunday to Saturday)
```
If today is Friday (Dec 20, 2024):
Start: 2024-12-15 00:00:00 (Last Sunday)
End:   2024-12-20 15:30:45 (Now)
```

### Month Filter
```
If today is Dec 21, 2024:
Start: 2024-12-01 00:00:00
End:   2024-12-21 15:30:45 (Now)
```

### Year Filter
```
If today is Dec 21, 2024:
Start: 2024-01-01 00:00:00
End:   2024-12-21 15:30:45 (Now)
```

### Custom Filter
```
User selects:
From: 2024-06-01
To:   2024-12-31

Start: 2024-06-01 00:00:00
End:   2024-12-31 23:59:59
```

---

## 📱 Responsive Breakpoints

### Desktop (lg: 1024px+)
```
┌────────────┬────────────┬────────────┐
│  Filter    │  In Stock  │  Volunteers│
└────────────┴────────────┴────────────┘
```

### Tablet (md: 768px - 1023px)
```
┌────────────┬────────────┬────────────┐
│  Filter    │  In Stock  │  Volunteers│
└────────────┴────────────┴────────────┘
(May wrap to 2 rows if needed)
```

### Mobile (< 768px)
```
┌────────────┐
│  Filter    │
├────────────┤
│  In Stock  │
├────────────┤
│  Volunteers│
└────────────┘
```

---

## 🎭 Animation Sequence

```
Card 1 (Filter)     → Appears at 0ms
Card 2 (In Stock)   → Appears at 100ms
Card 3 (Volunteers) → Appears at 200ms

Animation: Fade in + Slide up (opacity 0→1, y: 20→0)
Duration: 300ms
Easing: Default (ease-out)
```

---

## 🎨 Color Palette

### Card 1 - Filter (Indigo)
```css
Background: from-indigo-500 to-indigo-600
Icon: white
Border: slate-200
Text: slate-900
```

### Card 2 - In Stock (Green)
```css
Background: from-green-500 to-green-600
Icon: white
Border: slate-200
Text: slate-900
```

### Card 3 - Volunteers (Purple)
```css
Background: from-purple-500 to-purple-600
Icon: white
Border: slate-200
Text: slate-900
Highlight: purple-600
```

---

## 📊 Data Update Flow

```
┌─────────────┐
│ User Action │
│ (Select     │
│  Filter)    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Calculate   │
│ Date Range  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ API Call    │
│ /dashboard- │
│  metrics    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Backend     │
│ Aggregation │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Update UI   │
│ (All 3      │
│  Cards)     │
└─────────────┘
```

---

## 🔢 Number Formatting

```javascript
// Input: 12450
// Output: "12,450"

// Input: 1234567
// Output: "1,234,567"

// Uses: .toLocaleString()
```

---

## ⚡ Loading States

### Skeleton Animation
```
┌─────────────────────────────────────┐
│  📦  In Stock                       │
│      Total inventory                │
│                                     │
│  ████████████                       │  ← Animated
│                                     │
│  ████████                           │  ← Animated
│  ████████                           │  ← Animated
└─────────────────────────────────────┘

Animation: Pulse (opacity 50% → 100%)
Color: slate-200
```

---

## 🎯 User Interactions

### Filter Dropdown
```
Click → Opens dropdown
Select option → Closes dropdown + Updates metrics
```

### Custom Date Picker
```
Select "Custom Range" → Shows date inputs
Pick "From" date → Updates start date
Pick "To" date → Updates end date + Fetches metrics
```

### No Click Actions on Cards 2 & 3
```
Cards 2 and 3 are display-only (no interactions)
```

---

## 📏 Spacing & Sizing

```css
Card Padding: 24px (p-6)
Card Gap: 24px (gap-6)
Icon Size: 24px
Icon Padding: 12px (p-3)
Border Radius: 16px (rounded-2xl)
Border Width: 1px
```

---

## ✨ Visual Hierarchy

```
1. Large Numbers (4xl font) - Primary focus
2. Card Titles (lg font) - Secondary
3. Descriptions (sm font) - Tertiary
4. Breakdown values (sm font) - Detail
```

---

This visual guide provides a complete reference for the dashboard filter cards implementation!
