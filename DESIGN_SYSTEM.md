# 🎨 Trackventory Design System

**Modern, Scalable, Enterprise-Grade UI/UX**

---

## 📋 Overview

Trackventory's design system provides a cohesive, professional interface inspired by modern SaaS applications like Stripe, Linear, and Vercel. Built with **Next.js 14**, **Tailwind CSS**, and **Framer Motion**.

### Design Principles

1. **Clarity** - Clear visual hierarchy and intuitive navigation
2. **Consistency** - Unified components and patterns across all pages
3. **Accessibility** - WCAG 2.1 AA compliant with proper focus states
4. **Performance** - Optimized animations and minimal re-renders
5. **Scalability** - Reusable components and design tokens

---

## 🎨 Design Tokens

### Colors

```typescript
// Primary (Blue)
primary-50: #eff6ff
primary-600: #2563eb
primary-700: #1d4ed8

// Success (Green)
success-50: #f0fdf4
success-600: #16a34a

// Warning (Orange)
warning-50: #fffbeb
warning-600: #d97706

// Danger (Red)
danger-50: #fef2f2
danger-600: #dc2626

// Neutral (Slate)
neutral-50: #f8fafc
neutral-200: #e2e8f0
neutral-600: #475569
neutral-900: #0f172a
```

### Spacing Scale

```
xs: 8px   (0.5rem)
sm: 12px  (0.75rem)
md: 16px  (1rem)
lg: 24px  (1.5rem)
xl: 32px  (2rem)
2xl: 48px (3rem)
```

### Border Radius

```
sm: 8px   (0.5rem)
md: 12px  (0.75rem)
lg: 16px  (1rem)
xl: 20px  (1.25rem)
2xl: 24px (1.5rem)
```

### Shadows

```
sm: 0 1px 2px rgba(0,0,0,0.05)
md: 0 4px 6px rgba(0,0,0,0.1)
lg: 0 10px 15px rgba(0,0,0,0.1)
```

---

## 🧩 Core Components

### Button

**Variants:** `primary` | `secondary` | `danger` | `ghost`

```tsx
import Button from '@/components/ui/button';
import { Plus } from 'lucide-react';

<Button variant="primary" icon={Plus}>
  Add Item
</Button>
```

**Features:**
- Hover scale animation
- Loading state with spinner
- Icon support
- Disabled state

---

### Card

**Padding:** `none` | `sm` | `md` | `lg`

```tsx
import Card from '@/components/ui/card';

<Card padding="md" hover>
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>
```

**Features:**
- Soft shadows
- Optional hover effect
- Flexible padding
- Rounded corners (2xl)

---

### Input

```tsx
import Input from '@/components/ui/input';

<Input
  label="Email Address"
  placeholder="you@example.com"
  error="Invalid email"
  helperText="We'll never share your email"
/>
```

**Features:**
- Label support
- Error states
- Helper text
- Focus ring

---

### Select

```tsx
import Select from '@/components/ui/select';

<Select
  label="Category"
  options={[
    { value: 'food', label: 'Food' },
    { value: 'medical', label: 'Medical' }
  ]}
/>
```

---

### Badge

**Variants:** `success` | `danger` | `warning` | `info` | `default`

```tsx
import Badge from '@/components/ui/badge';

<Badge variant="success">Active</Badge>
<Badge variant="danger">Inactive</Badge>
```

---

### Modal

```tsx
import Modal from '@/components/ui/modal';

<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Create Item"
  description="Add a new inventory item"
>
  <form>...</form>
</Modal>
```

**Features:**
- Backdrop blur
- Smooth animations
- Scroll handling
- Close button

---

### Drawer

**Positions:** `left` | `right` | `bottom`

```tsx
import Drawer from '@/components/ui/drawer';

<Drawer
  isOpen={showDrawer}
  onClose={() => setShowDrawer(false)}
  title="Filters"
  position="right"
>
  <div>Drawer content</div>
</Drawer>
```

---

### Table

```tsx
import Table from '@/components/ui/table';

<Table
  columns={[
    { key: 'name', label: 'Name', render: (item) => <span>{item.name}</span> },
    { key: 'status', label: 'Status', render: (item) => <Badge>{item.status}</Badge> }
  ]}
  data={items}
  keyExtractor={(item) => item._id}
  onRowClick={(item) => console.log(item)}
/>
```

**Features:**
- Striped rows
- Hover states
- Custom cell rendering
- Click handlers

---

### StatCard

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

**Features:**
- Icon with colored background
- Trend indicators
- Hover animation
- Multiple variants

---

### PageHeader

```tsx
import PageHeader from '@/components/ui/page-header';
import Button from '@/components/ui/button';

<PageHeader
  title="Inventory Items"
  description="Manage your inventory catalog"
  actions={
    <Button icon={Plus}>Add Item</Button>
  }
/>
```

---

### EmptyState

```tsx
import EmptyState from '@/components/ui/empty-state';
import { Package } from 'lucide-react';

<EmptyState
  icon={Package}
  title="No items yet"
  description="Get started by adding your first item"
  action={{ label: 'Add Item', onClick: () => setShowModal(true) }}
/>
```

---

### Skeleton

```tsx
import Skeleton, { SkeletonCard, SkeletonTable } from '@/components/ui/skeleton';

// Loading states
<SkeletonTable />
<SkeletonCard />
<Skeleton className="h-8 w-48" />
```

---

### Tabs

```tsx
import Tabs from '@/components/ui/tabs';

<Tabs
  tabs={[
    { id: 'overview', label: 'Overview' },
    { id: 'details', label: 'Details' }
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>
```

**Features:**
- Animated underline
- Smooth transitions
- Keyboard navigation

---

## 📱 Responsive Design

### Breakpoints

```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
```

### Mobile-First Approach

All components are mobile-first with desktop enhancements:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

---

## 🎭 Animations

### Framer Motion Patterns

**Page Transitions:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {content}
</motion.div>
```

**Hover Effects:**
```tsx
<motion.div
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  {content}
</motion.div>
```

**Stagger Children:**
```tsx
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }}
>
  {items.map((item, i) => (
    <motion.div
      key={i}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

---

## ♿ Accessibility

### Focus Management

All interactive elements have visible focus states:

```css
focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
```

### Keyboard Navigation

- Tab through interactive elements
- Enter/Space to activate buttons
- Escape to close modals/drawers
- Arrow keys for tabs

### Screen Reader Support

- Semantic HTML
- ARIA labels where needed
- Alt text for images
- Proper heading hierarchy

---

## 📐 Layout Patterns

### Page Structure

```tsx
<div className="space-y-6">
  <PageHeader
    title="Page Title"
    description="Page description"
    actions={<Button>Action</Button>}
  />

  <Card>
    {/* Main content */}
  </Card>
</div>
```

### Grid Layouts

```tsx
{/* Responsive grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <StatCard />
  <StatCard />
  <StatCard />
</div>
```

### Form Layouts

```tsx
<form className="space-y-5">
  <Input label="Name" />
  <Select label="Category" options={[]} />
  
  <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
    <Button variant="secondary">Cancel</Button>
    <Button type="submit">Save</Button>
  </div>
</form>
```

---

## 🎯 Usage Examples

### Items Page (Modernized)

```tsx
import PageHeader from '@/components/ui/page-header';
import Card from '@/components/ui/card';
import Table from '@/components/ui/table';
import EmptyState from '@/components/ui/empty-state';
import { SkeletonTable } from '@/components/ui/skeleton';

export default function ItemsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Items"
        description="Manage your inventory catalog"
        actions={<Button icon={Plus}>Add Item</Button>}
      />

      <Card padding="none">
        {loading ? (
          <SkeletonTable />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No items yet"
            description="Get started by adding your first item"
          />
        ) : (
          <Table columns={columns} data={items} />
        )}
      </Card>
    </div>
  );
}
```

---

## 🚀 Implementation Status

### ✅ Completed

- [x] Design tokens
- [x] Core UI components (Button, Card, Input, Select, Badge)
- [x] Layout components (PageHeader, Section)
- [x] Feedback components (Modal, Drawer, Toast, EmptyState)
- [x] Data components (Table, Tabs, Skeleton)
- [x] Items page modernization
- [x] Global styles and accessibility

### 🔄 In Progress

- [ ] Dashboard page modernization
- [ ] Stock management page
- [ ] Distribution page
- [ ] Reports page
- [ ] Users page
- [ ] Campaigns page

### 📋 Next Steps

1. **Modernize remaining admin pages** using new components
2. **Update mobile volunteer interface** with consistent styling
3. **Add micro-interactions** (hover states, transitions)
4. **Implement toast notifications** system-wide
5. **Add loading skeletons** to all data-heavy pages
6. **Create Storybook** for component documentation

---

## 📚 Best Practices

### Component Usage

✅ **DO:**
- Use design tokens for colors and spacing
- Implement loading states with skeletons
- Show empty states when no data
- Add proper error handling
- Use semantic HTML

❌ **DON'T:**
- Hardcode colors or spacing values
- Show raw loading text
- Leave empty containers
- Ignore error states
- Use divs for everything

### Performance

- Use `React.memo` for expensive components
- Implement virtualization for long lists
- Lazy load modals and drawers
- Optimize images with Next.js Image
- Minimize bundle size

### Accessibility

- Always include labels for inputs
- Provide alt text for images
- Use proper heading hierarchy (h1 → h2 → h3)
- Test with keyboard navigation
- Ensure sufficient color contrast

---

## 🎨 Design Inspiration

- **Stripe Dashboard** - Clean, professional, data-focused
- **Linear** - Modern, fast, keyboard-first
- **Vercel** - Minimalist, elegant, developer-friendly
- **Notion** - Flexible, intuitive, content-first

---

## 📞 Support

For questions or contributions:
- Review component source code in `/components/ui/`
- Check design tokens in `/styles/design-tokens.ts`
- See examples in modernized pages

---

**Built with ❤️ for humanitarian operations**
