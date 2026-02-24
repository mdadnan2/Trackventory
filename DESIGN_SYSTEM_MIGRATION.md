# 🔄 Component Migration Guide

**Visual Before/After Examples**

---

## 🎯 Overview

This guide shows how to migrate from old patterns to the new design system.

---

## 1️⃣ Page Headers

### ❌ BEFORE

```tsx
<div className="mb-6">
  <div className="flex justify-between items-center">
    <h1 className="text-2xl font-bold">Items</h1>
    <button className="bg-blue-500 text-white px-4 py-2 rounded">
      Add Item
    </button>
  </div>
</div>
```

**Issues:**
- Inconsistent spacing
- No description support
- Manual flex layout
- Hardcoded colors

### ✅ AFTER

```tsx
import PageHeader from '@/components/ui/page-header';
import Button from '@/components/ui/button';
import { Plus } from 'lucide-react';

<PageHeader
  title="Inventory Items"
  description="Manage your inventory catalog and item categories"
  actions={
    <Button icon={Plus} onClick={handleAdd}>
      Add Item
    </Button>
  }
/>
```

**Benefits:**
- Consistent spacing (mb-8)
- Built-in description
- Flexible actions slot
- Design system colors
- Icon support

---

## 2️⃣ Cards

### ❌ BEFORE

```tsx
<div className="bg-white p-6 rounded-lg shadow">
  <h2 className="text-xl font-semibold mb-4">Card Title</h2>
  <p>Card content</p>
</div>
```

**Issues:**
- Inconsistent border radius
- No hover states
- Manual padding
- Basic shadow

### ✅ AFTER

```tsx
import Card from '@/components/ui/card';

<Card padding="md" hover>
  <h2 className="text-xl font-semibold mb-4">Card Title</h2>
  <p>Card content</p>
</Card>
```

**Benefits:**
- Consistent 2xl radius
- Optional hover effect
- Flexible padding options
- Soft shadow + border
- Reusable component

---

## 3️⃣ Tables

### ❌ BEFORE

```tsx
<table className="w-full">
  <thead className="bg-gray-100">
    <tr>
      <th className="px-4 py-2 text-left">Name</th>
      <th className="px-4 py-2 text-left">Status</th>
    </tr>
  </thead>
  <tbody>
    {items.map(item => (
      <tr key={item._id} className="border-b">
        <td className="px-4 py-2">{item.name}</td>
        <td className="px-4 py-2">{item.status}</td>
      </tr>
    ))}
  </tbody>
</table>
```

**Issues:**
- Repetitive markup
- No hover states
- Manual cell rendering
- Inconsistent spacing

### ✅ AFTER

```tsx
import Table from '@/components/ui/table';
import Badge from '@/components/ui/badge';

<Table
  columns={[
    {
      key: 'name',
      label: 'Name',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Package size={20} className="text-blue-600" />
          </div>
          <span className="font-medium">{item.name}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <Badge variant={item.isActive ? 'success' : 'default'}>
          {item.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    }
  ]}
  data={items}
  keyExtractor={(item) => item._id}
  onRowClick={(item) => handleRowClick(item)}
/>
```

**Benefits:**
- Clean, declarative API
- Built-in hover states
- Custom cell rendering
- Consistent spacing
- Click handlers
- Striped rows

---

## 4️⃣ Forms

### ❌ BEFORE

```tsx
<form>
  <div className="mb-4">
    <label className="block text-sm font-medium mb-1">
      Item Name
    </label>
    <input
      type="text"
      className="w-full px-3 py-2 border rounded"
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
    {errors.name && (
      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
    )}
  </div>

  <div className="mb-4">
    <label className="block text-sm font-medium mb-1">
      Category
    </label>
    <select className="w-full px-3 py-2 border rounded">
      <option>Food</option>
      <option>Medical</option>
    </select>
  </div>

  <div className="flex gap-2">
    <button type="button" className="px-4 py-2 border rounded">
      Cancel
    </button>
    <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
      Save
    </button>
  </div>
</form>
```

**Issues:**
- Repetitive label/error markup
- Inconsistent spacing
- Manual error handling
- Basic styling

### ✅ AFTER

```tsx
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import Button from '@/components/ui/button';

<form className="space-y-5">
  <Input
    label="Item Name"
    placeholder="e.g., Rice, Wheat, Oil"
    value={name}
    onChange={(e) => setName(e.target.value)}
    error={errors.name}
    helperText="Enter the item name"
    required
  />

  <Select
    label="Category"
    options={[
      { value: 'food', label: 'Food' },
      { value: 'medical', label: 'Medical' }
    ]}
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    error={errors.category}
  />

  <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
    <Button variant="secondary" type="button" onClick={onCancel}>
      Cancel
    </Button>
    <Button type="submit">Save Changes</Button>
  </div>
</form>
```

**Benefits:**
- Built-in label/error handling
- Consistent spacing (space-y-5)
- Helper text support
- Focus states
- Better UX

---

## 5️⃣ Modals

### ❌ BEFORE

```tsx
{showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white rounded-lg p-6 max-w-md w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Modal Title</h2>
        <button onClick={closeModal}>×</button>
      </div>
      <div>{/* Content */}</div>
    </div>
  </div>
)}
```

**Issues:**
- No animations
- Manual backdrop
- No scroll handling
- Basic close button

### ✅ AFTER

```tsx
import Modal from '@/components/ui/modal';

<Modal
  isOpen={showModal}
  onClose={closeModal}
  title="Create Item"
  description="Add a new inventory item for tracking"
>
  <form className="space-y-5">
    {/* Form content */}
  </form>
</Modal>
```

**Benefits:**
- Smooth animations (Framer Motion)
- Backdrop blur
- Scroll handling
- Styled close button
- Description support
- Escape key handling

---

## 6️⃣ Empty States

### ❌ BEFORE

```tsx
{items.length === 0 && (
  <div className="text-center py-8 text-gray-500">
    <p>No items found</p>
  </div>
)}
```

**Issues:**
- Plain text only
- No icon
- No action button
- Poor UX

### ✅ AFTER

```tsx
import EmptyState from '@/components/ui/empty-state';
import { Package } from 'lucide-react';

{items.length === 0 && (
  <EmptyState
    icon={Package}
    title="No items yet"
    description="Get started by adding your first inventory item"
    action={{
      label: 'Add Item',
      onClick: () => setShowModal(true)
    }}
  />
)}
```

**Benefits:**
- Visual icon
- Clear messaging
- Call-to-action button
- Better UX
- Consistent styling

---

## 7️⃣ Loading States

### ❌ BEFORE

```tsx
{loading && <div>Loading...</div>}
{!loading && <table>...</table>}
```

**Issues:**
- Plain text
- Layout shift
- Poor UX

### ✅ AFTER

```tsx
import { SkeletonTable } from '@/components/ui/skeleton';

{loading ? (
  <SkeletonTable />
) : (
  <Table columns={columns} data={items} />
)}
```

**Benefits:**
- Visual placeholder
- No layout shift
- Better perceived performance
- Professional look

---

## 8️⃣ Stat Cards

### ❌ BEFORE

```tsx
<div className="bg-white p-6 rounded-lg shadow">
  <div className="text-sm text-gray-600">Total Items</div>
  <div className="text-3xl font-bold mt-2">1,234</div>
</div>
```

**Issues:**
- No icon
- No hover effect
- Basic styling
- No trend indicator

### ✅ AFTER

```tsx
import StatCard from '@/components/ui/stat-card';
import { Package } from 'lucide-react';

<StatCard
  title="Total Items"
  value="1,234"
  icon={Package}
  variant="primary"
  trend={{ value: 12, label: 'vs last month' }}
/>
```

**Benefits:**
- Icon with colored background
- Hover animation
- Trend indicators
- Multiple variants
- Consistent design

---

## 9️⃣ Badges

### ❌ BEFORE

```tsx
<span className={`px-2 py-1 rounded text-xs ${
  item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
}`}>
  {item.isActive ? 'Active' : 'Inactive'}
</span>
```

**Issues:**
- Inline conditional styling
- Inconsistent colors
- Manual variant logic

### ✅ AFTER

```tsx
import Badge from '@/components/ui/badge';

<Badge variant={item.isActive ? 'success' : 'default'}>
  {item.isActive ? 'Active' : 'Inactive'}
</Badge>
```

**Benefits:**
- Semantic variants
- Consistent colors
- Cleaner code
- Reusable

---

## 🔟 Buttons

### ❌ BEFORE

```tsx
<button
  onClick={handleClick}
  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
>
  Add Item
</button>
```

**Issues:**
- Manual hover states
- No loading state
- No icon support
- Hardcoded colors

### ✅ AFTER

```tsx
import Button from '@/components/ui/button';
import { Plus } from 'lucide-react';

<Button
  onClick={handleClick}
  icon={Plus}
  loading={isLoading}
  variant="primary"
>
  Add Item
</Button>
```

**Benefits:**
- Built-in hover animation
- Loading spinner
- Icon support
- Multiple variants
- Disabled state

---

## 📊 Migration Priority

### High Priority (Do First)
1. ✅ **Items Page** - Already done
2. 🔄 **Dashboard** - Stat cards and layout
3. 🔄 **Stock Management** - Tables and forms

### Medium Priority
4. 🔄 **Distribution** - Forms and modals
5. 🔄 **Reports** - Cards and charts
6. 🔄 **Users** - Table and forms

### Low Priority
7. 🔄 **Campaigns** - Cards and lists
8. 🔄 **Profile** - Forms
9. 🔄 **History** - Tables

---

## ✅ Migration Checklist

For each page:

- [ ] Replace page header
- [ ] Wrap content in Card components
- [ ] Update tables to use Table component
- [ ] Replace form inputs with Input/Select
- [ ] Update buttons to use Button component
- [ ] Add loading states with Skeleton
- [ ] Add empty states with EmptyState
- [ ] Update modals to use Modal component
- [ ] Replace badges with Badge component
- [ ] Test responsive layout
- [ ] Test keyboard navigation
- [ ] Verify accessibility

---

## 🎯 Quick Wins

**Easiest changes with biggest impact:**

1. **Replace all buttons** → Instant visual upgrade
2. **Add PageHeader** → Consistent page structure
3. **Add EmptyState** → Better UX when no data
4. **Add SkeletonTable** → Professional loading
5. **Replace badges** → Consistent status indicators

---

## 📚 Resources

- **Full Design System**: `DESIGN_SYSTEM.md`
- **Quick Start**: `DESIGN_SYSTEM_QUICKSTART.md`
- **Component Source**: `/components/ui/`
- **Example**: `/app/dashboard/items/page.tsx`

---

**Happy Migrating! 🚀**
