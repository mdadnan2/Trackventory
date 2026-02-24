# 🎨 Component Showcase

**Visual Guide to Trackventory UI Components**

---

## 🎯 Button Component

### Variants

```tsx
import Button from '@/components/ui/button';
import { Plus, Save, Trash2 } from 'lucide-react';

// Primary (default)
<Button variant="primary" icon={Plus}>
  Add Item
</Button>

// Secondary
<Button variant="secondary" icon={Save}>
  Save Draft
</Button>

// Danger
<Button variant="danger" icon={Trash2}>
  Delete
</Button>

// Ghost
<Button variant="ghost">
  Cancel
</Button>
```

### States

```tsx
// Loading
<Button loading>Processing...</Button>

// Disabled
<Button disabled>Unavailable</Button>

// With icon only
<Button icon={Plus} />
```

---

## 🎴 Card Component

### Padding Options

```tsx
import Card from '@/components/ui/card';

// No padding (for tables)
<Card padding="none">
  <Table />
</Card>

// Small padding
<Card padding="sm">
  <p>Compact content</p>
</Card>

// Medium padding (default)
<Card padding="md">
  <h3>Standard Card</h3>
  <p>Regular content</p>
</Card>

// Large padding
<Card padding="lg">
  <h2>Feature Card</h2>
  <p>Spacious content</p>
</Card>
```

### With Hover

```tsx
<Card hover>
  <h3>Clickable Card</h3>
  <p>Hover to see effect</p>
</Card>
```

---

## 📝 Input Component

### Basic Usage

```tsx
import Input from '@/components/ui/input';

<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

### With Error

```tsx
<Input
  label="Password"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  error="Password must be at least 8 characters"
/>
```

### With Helper Text

```tsx
<Input
  label="Username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  helperText="Choose a unique username"
/>
```

### Required Field

```tsx
<Input
  label="Full Name"
  required
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
```

---

## 🔽 Select Component

### Basic Usage

```tsx
import Select from '@/components/ui/select';

<Select
  label="Category"
  options={[
    { value: '', label: 'Select category' },
    { value: 'food', label: 'Food' },
    { value: 'medical', label: 'Medical' },
    { value: 'clothing', label: 'Clothing' }
  ]}
  value={category}
  onChange={(e) => setCategory(e.target.value)}
/>
```

### With Error

```tsx
<Select
  label="Priority"
  options={priorityOptions}
  value={priority}
  onChange={(e) => setPriority(e.target.value)}
  error="Please select a priority level"
/>
```

---

## 🏷️ Badge Component

### Variants

```tsx
import Badge from '@/components/ui/badge';

// Success (green)
<Badge variant="success">Active</Badge>

// Danger (red)
<Badge variant="danger">Inactive</Badge>

// Warning (orange)
<Badge variant="warning">Pending</Badge>

// Info (blue)
<Badge variant="info">New</Badge>

// Default (gray)
<Badge variant="default">Draft</Badge>
```

### Usage in Table

```tsx
<Table
  columns={[
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <Badge variant={item.isActive ? 'success' : 'danger'}>
          {item.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    }
  ]}
  data={items}
/>
```

---

## 📊 StatCard Component

### Basic Usage

```tsx
import StatCard from '@/components/ui/stat-card';
import { Package, Users, TrendingUp, AlertTriangle } from 'lucide-react';

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <StatCard
    title="Total Items"
    value="1,234"
    icon={Package}
    variant="primary"
  />
  
  <StatCard
    title="Active Users"
    value="56"
    icon={Users}
    variant="success"
  />
  
  <StatCard
    title="Distributions"
    value="892"
    icon={TrendingUp}
    variant="warning"
  />
  
  <StatCard
    title="Alerts"
    value="3"
    icon={AlertTriangle}
    variant="danger"
  />
</div>
```

### With Trend

```tsx
<StatCard
  title="Monthly Revenue"
  value="$12,345"
  icon={TrendingUp}
  variant="success"
  trend={{ value: 12, label: 'vs last month' }}
/>
```

---

## 📋 Table Component

### Basic Usage

```tsx
import Table from '@/components/ui/table';
import Badge from '@/components/ui/badge';
import { Package } from 'lucide-react';

<Table
  columns={[
    {
      key: 'name',
      label: 'Item Name',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Package size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-slate-500">{item.category}</p>
          </div>
        </div>
      )
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (item) => (
        <span className="font-semibold">{item.stock}</span>
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

---

## 🪟 Modal Component

### Basic Usage

```tsx
import Modal from '@/components/ui/modal';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';

<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Create New Item"
  description="Add a new inventory item to your catalog"
>
  <form onSubmit={handleSubmit} className="space-y-5">
    <Input
      label="Item Name"
      placeholder="e.g., Rice, Wheat, Oil"
      value={name}
      onChange={(e) => setName(e.target.value)}
      required
    />
    
    <Input
      label="Category"
      placeholder="e.g., Food, Medical"
      value={category}
      onChange={(e) => setCategory(e.target.value)}
      required
    />
    
    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
      <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>
        Cancel
      </Button>
      <Button type="submit">Create Item</Button>
    </div>
  </form>
</Modal>
```

---

## 📱 Drawer Component

### Right Drawer

```tsx
import Drawer from '@/components/ui/drawer';

<Drawer
  isOpen={showDrawer}
  onClose={() => setShowDrawer(false)}
  title="Filters"
  position="right"
>
  <div className="space-y-4">
    <Select label="Category" options={categories} />
    <Select label="Status" options={statuses} />
    <Button>Apply Filters</Button>
  </div>
</Drawer>
```

### Bottom Drawer (Mobile)

```tsx
<Drawer
  isOpen={showDrawer}
  onClose={() => setShowDrawer(false)}
  title="Quick Actions"
  position="bottom"
>
  <div className="space-y-3">
    <Button className="w-full">Add Item</Button>
    <Button className="w-full" variant="secondary">Export</Button>
  </div>
</Drawer>
```

---

## 📄 PageHeader Component

### Basic Usage

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

### Multiple Actions

```tsx
<PageHeader
  title="Stock Management"
  description="Track and manage inventory across locations"
  actions={
    <div className="flex items-center gap-3">
      <Button variant="secondary" icon={Filter}>
        Filter
      </Button>
      <Button variant="secondary" icon={Download}>
        Export
      </Button>
      <Button icon={Plus}>
        Add Stock
      </Button>
    </div>
  }
/>
```

---

## 📦 Section Component

### Basic Usage

```tsx
import Section from '@/components/ui/section';

<Section
  title="Personal Information"
  description="Update your personal details"
>
  <div className="space-y-4">
    <Input label="Full Name" />
    <Input label="Email" type="email" />
  </div>
</Section>
```

### Without Title

```tsx
<Section>
  <div className="grid grid-cols-2 gap-4">
    <StatCard />
    <StatCard />
  </div>
</Section>
```

---

## 🎭 EmptyState Component

### Basic Usage

```tsx
import EmptyState from '@/components/ui/empty-state';
import { Package } from 'lucide-react';

<EmptyState
  icon={Package}
  title="No items yet"
  description="Get started by adding your first inventory item"
  action={{
    label: 'Add Item',
    onClick: () => setShowModal(true)
  }}
/>
```

### Without Action

```tsx
<EmptyState
  icon={Search}
  title="No results found"
  description="Try adjusting your search or filter criteria"
/>
```

---

## ⏳ Skeleton Component

### Table Skeleton

```tsx
import { SkeletonTable } from '@/components/ui/skeleton';

{loading ? (
  <SkeletonTable />
) : (
  <Table data={items} />
)}
```

### Card Skeleton

```tsx
import { SkeletonCard } from '@/components/ui/skeleton';

{loading ? (
  <div className="grid grid-cols-3 gap-6">
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
  </div>
) : (
  <div className="grid grid-cols-3 gap-6">
    {items.map(item => <Card key={item.id}>{item.name}</Card>)}
  </div>
)}
```

### Custom Skeleton

```tsx
import Skeleton from '@/components/ui/skeleton';

<div className="space-y-3">
  <Skeleton className="h-8 w-48" />
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-3/4" />
</div>
```

---

## 🔖 Tabs Component

### Basic Usage

```tsx
import Tabs from '@/components/ui/tabs';
import { useState } from 'react';

const [activeTab, setActiveTab] = useState('overview');

<Tabs
  tabs={[
    { id: 'overview', label: 'Overview' },
    { id: 'details', label: 'Details' },
    { id: 'history', label: 'History' }
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>

{activeTab === 'overview' && <OverviewContent />}
{activeTab === 'details' && <DetailsContent />}
{activeTab === 'history' && <HistoryContent />}
```

---

## 🎨 Complete Page Example

```tsx
import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/page-header';
import Card from '@/components/ui/card';
import Table from '@/components/ui/table';
import Button from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import Input from '@/components/ui/input';
import EmptyState from '@/components/ui/empty-state';
import { SkeletonTable } from '@/components/ui/skeleton';
import { Plus, Package } from 'lucide-react';

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    // Fetch items...
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Inventory Items"
        description="Manage your inventory catalog"
        actions={
          <Button icon={Plus} onClick={() => setShowModal(true)}>
            Add Item
          </Button>
        }
      />

      {/* Main Content */}
      <Card padding="none">
        {loading ? (
          <div className="p-6">
            <SkeletonTable />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No items yet"
            description="Get started by adding your first item"
            action={{
              label: 'Add Item',
              onClick: () => setShowModal(true)
            }}
          />
        ) : (
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
        )}
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add New Item"
        description="Create a new inventory item"
      >
        <form className="space-y-5">
          <Input label="Item Name" required />
          <Input label="Category" required />
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
```

---

## 🎯 Common Patterns

### Search Bar

```tsx
<div className="p-6 border-b border-slate-200">
  <div className="relative">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
    <input
      type="text"
      placeholder="Search items..."
      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
</div>
```

### Filter Bar

```tsx
<div className="flex items-center gap-3 p-6 border-b border-slate-200">
  <Select
    options={[
      { value: 'all', label: 'All Categories' },
      { value: 'food', label: 'Food' }
    ]}
  />
  <Select
    options={[
      { value: 'all', label: 'All Status' },
      { value: 'active', label: 'Active' }
    ]}
  />
  <Button variant="secondary">Reset</Button>
</div>
```

### Action Bar

```tsx
<div className="flex items-center justify-between p-6 border-b border-slate-200">
  <div className="flex items-center gap-3">
    <Button variant="secondary" icon={Filter}>Filter</Button>
    <Button variant="secondary" icon={Download}>Export</Button>
  </div>
  <Button icon={Plus}>Add New</Button>
</div>
```

---

**Explore components in `/components/ui/` for full implementation details!**
