# 🚀 Design System Quick Start

**5-Minute Guide to Modernizing Trackventory Pages**

---

## 📦 What's New

### New Components (`/components/ui/`)

```
✅ card.tsx          - Modern card container
✅ input.tsx         - Form input with label/error
✅ select.tsx        - Dropdown with label/error
✅ stat-card.tsx     - Dashboard metrics card
✅ page-header.tsx   - Page title + actions
✅ section.tsx       - Content grouping
✅ empty-state.tsx   - No data placeholder
✅ skeleton.tsx      - Loading states
✅ table.tsx         - Data table
✅ tabs.tsx          - Tab navigation
✅ drawer.tsx        - Side/bottom panel
```

### Design Tokens (`/styles/design-tokens.ts`)

```typescript
import { colors, spacing, radius, shadows } from '@/styles/design-tokens';
```

---

## 🎯 Before & After

### OLD WAY ❌

```tsx
<div className="bg-white p-4 rounded shadow">
  <h2 className="text-xl font-bold mb-4">Items</h2>
  <button className="bg-blue-500 text-white px-4 py-2 rounded">
    Add
  </button>
  <table>...</table>
</div>
```

### NEW WAY ✅

```tsx
import PageHeader from '@/components/ui/page-header';
import Card from '@/components/ui/card';
import Table from '@/components/ui/table';
import Button from '@/components/ui/button';
import { Plus } from 'lucide-react';

<div className="space-y-6">
  <PageHeader
    title="Inventory Items"
    description="Manage your inventory catalog"
    actions={<Button icon={Plus}>Add Item</Button>}
  />

  <Card padding="none">
    <Table columns={columns} data={items} />
  </Card>
</div>
```

---

## 📋 Page Modernization Checklist

### 1. Update Imports

```tsx
// Replace old imports
import PageHeader from '@/components/ui/page-header';
import Card from '@/components/ui/card';
import Table from '@/components/ui/table';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import EmptyState from '@/components/ui/empty-state';
import { SkeletonTable } from '@/components/ui/skeleton';
```

### 2. Add Page Header

```tsx
<PageHeader
  title="Page Title"
  description="Brief description"
  actions={
    <Button icon={Plus} onClick={handleAdd}>
      Add New
    </Button>
  }
/>
```

### 3. Wrap Content in Cards

```tsx
<Card padding="none">
  {/* Content */}
</Card>
```

### 4. Replace Tables

```tsx
// OLD
<table className="w-full">
  <thead>...</thead>
  <tbody>...</tbody>
</table>

// NEW
<Table
  columns={[
    {
      key: 'name',
      label: 'Name',
      render: (item) => <span>{item.name}</span>
    }
  ]}
  data={items}
  keyExtractor={(item) => item._id}
/>
```

### 5. Add Loading States

```tsx
{loading ? (
  <SkeletonTable />
) : items.length === 0 ? (
  <EmptyState
    icon={Package}
    title="No items yet"
    description="Get started by adding your first item"
    action={{ label: 'Add Item', onClick: handleAdd }}
  />
) : (
  <Table columns={columns} data={items} />
)}
```

### 6. Update Forms

```tsx
// OLD
<div>
  <label>Name</label>
  <input type="text" className="border p-2" />
</div>

// NEW
<Input
  label="Name"
  placeholder="Enter name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  error={errors.name}
/>
```

### 7. Modernize Modals

```tsx
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Create Item"
  description="Add a new inventory item"
>
  <form className="space-y-5">
    <Input label="Name" />
    <Select label="Category" options={[]} />
    
    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button type="submit">Create</Button>
    </div>
  </form>
</Modal>
```

---

## 🎨 Common Patterns

### Stat Cards Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <StatCard
    title="Total Items"
    value="1,234"
    icon={Package}
    variant="primary"
  />
  <StatCard
    title="In Stock"
    value="856"
    icon={Warehouse}
    variant="success"
  />
</div>
```

### Search Bar

```tsx
<div className="p-6 border-b border-slate-200">
  <div className="relative">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
    <input
      type="text"
      placeholder="Search..."
      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
</div>
```

### Action Buttons

```tsx
<div className="flex items-center gap-3">
  <Button variant="secondary" icon={Filter}>
    Filter
  </Button>
  <Button variant="primary" icon={Plus}>
    Add New
  </Button>
</div>
```

### Status Badges

```tsx
<Badge variant={item.isActive ? 'success' : 'default'}>
  {item.isActive ? 'Active' : 'Inactive'}
</Badge>
```

---

## 🎯 Example: Modernize a Page

### Step-by-Step

**1. Start with structure:**

```tsx
export default function MyPage() {
  return (
    <div className="space-y-6">
      {/* Content goes here */}
    </div>
  );
}
```

**2. Add page header:**

```tsx
<PageHeader
  title="My Page"
  description="Page description"
  actions={<Button icon={Plus}>Add</Button>}
/>
```

**3. Add main card:**

```tsx
<Card padding="none">
  {/* Table or content */}
</Card>
```

**4. Add loading/empty states:**

```tsx
<Card padding="none">
  {loading ? (
    <SkeletonTable />
  ) : data.length === 0 ? (
    <EmptyState
      icon={Package}
      title="No data"
      description="Get started"
    />
  ) : (
    <Table columns={columns} data={data} />
  )}
</Card>
```

**5. Add modals:**

```tsx
<Modal isOpen={showModal} onClose={closeModal} title="Title">
  <form>...</form>
</Modal>
```

---

## 🎨 Color Usage

```tsx
// Primary actions
<Button variant="primary">Save</Button>

// Secondary actions
<Button variant="secondary">Cancel</Button>

// Destructive actions
<Button variant="danger">Delete</Button>

// Status badges
<Badge variant="success">Active</Badge>
<Badge variant="danger">Inactive</Badge>
<Badge variant="warning">Pending</Badge>
```

---

## 📱 Mobile Considerations

```tsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Hide on mobile
<div className="hidden md:block">

// Show only on mobile
<div className="md:hidden">

// Responsive padding
<div className="p-4 md:p-6">
```

---

## ✅ Testing Checklist

- [ ] Page loads without errors
- [ ] Loading states show correctly
- [ ] Empty states display when no data
- [ ] Forms validate properly
- [ ] Modals open/close smoothly
- [ ] Buttons have hover states
- [ ] Mobile layout works
- [ ] Keyboard navigation works
- [ ] Focus states visible

---

## 🚀 Next Pages to Modernize

1. **Dashboard** - Update stat cards and charts
2. **Stock Management** - Modernize tables and forms
3. **Distribution** - Update distribution flow
4. **Reports** - Modernize report cards
5. **Users** - Update user management
6. **Campaigns** - Modernize campaign cards

---

## 📚 Resources

- **Design System Docs**: `DESIGN_SYSTEM.md`
- **Component Source**: `/components/ui/`
- **Design Tokens**: `/styles/design-tokens.ts`
- **Example Page**: `/app/dashboard/items/page.tsx`

---

**Happy Coding! 🎉**
