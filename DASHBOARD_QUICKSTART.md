# Dashboard Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies (Already Done)
```bash
cd frontend
npm install
```

Dependencies installed:
- ✅ framer-motion (animations)
- ✅ recharts (charts)
- ✅ lucide-react (icons)

### 2. Start Development Server
```bash
npm run dev
```

### 3. View Dashboard
Open http://localhost:3000 and login

## 📁 New File Structure

```
frontend/
├── components/
│   ├── dashboard/          # Dashboard-specific components
│   │   ├── stat-card.tsx
│   │   ├── charts.tsx
│   │   ├── quick-actions.tsx
│   │   └── recent-activity.tsx
│   ├── layout/             # Layout components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MobileSidebar.tsx
│   └── ui/                 # Reusable UI components
│       ├── loading-skeleton.tsx
│       └── empty-state.tsx
```

## 🎨 Using Components

### Stat Card
```tsx
import StatCard from '@/components/dashboard/stat-card';
import { Warehouse } from 'lucide-react';

<StatCard
  title="Central Stock"
  value={1234}
  description="Items in warehouse"
  icon={Warehouse}
  color="bg-gradient-to-br from-blue-500 to-blue-600"
  index={0}
/>
```

### Charts
```tsx
import Charts from '@/components/dashboard/charts';

const data = [
  { name: 'Rice', distributed: 3200 },
  { name: 'Wheat', distributed: 2800 }
];

<Charts itemData={data} />
```

### Quick Actions
```tsx
import QuickActions from '@/components/dashboard/quick-actions';

<QuickActions isAdmin={true} />
```

### Recent Activity
```tsx
import RecentActivity from '@/components/dashboard/recent-activity';

const activities = [
  {
    volunteer: 'John Doe',
    action: 'Distributed',
    item: 'Rice',
    quantity: 50,
    time: '2 hours ago'
  }
];

<RecentActivity activities={activities} />
```

### Loading Skeleton
```tsx
import DashboardSkeleton from '@/components/ui/loading-skeleton';

{loading && <DashboardSkeleton />}
```

### Empty State
```tsx
import EmptyState from '@/components/ui/empty-state';
import { Package } from 'lucide-react';

<EmptyState
  icon={Package}
  title="No items found"
  description="Get started by adding your first item"
  action={{
    label: 'Add Item',
    onClick: () => router.push('/dashboard/items')
  }}
/>
```

## 🎭 Animation Patterns

### Page Fade In
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
>
  {content}
</motion.div>
```

### Stagger Children
```tsx
<div className="grid gap-6">
  {items.map((item, index) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      {item}
    </motion.div>
  ))}
</div>
```

### Hover Effects
```tsx
<motion.div
  whileHover={{ scale: 1.05, y: -4 }}
  className="card"
>
  {content}
</motion.div>
```

## 🎨 Styling Patterns

### Card
```tsx
<div className="bg-white rounded-2xl p-6 border border-slate-200">
  {content}
</div>
```

### Button Primary
```tsx
<button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
  Click Me
</button>
```

### Button Secondary
```tsx
<button className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">
  Cancel
</button>
```

### Input
```tsx
<input
  type="text"
  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
/>
```

### Badge
```tsx
<span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
  Active
</span>
```

## 🎯 Common Patterns

### Section Header
```tsx
<div className="mb-6">
  <h2 className="text-xl font-semibold text-slate-900">Section Title</h2>
  <p className="text-sm text-slate-500 mt-1">Description text</p>
</div>
```

### Grid Layout
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {items}
</div>
```

### Table
```tsx
<div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
  <table className="w-full">
    <thead className="bg-slate-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
          Column
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-200">
      <tr className="hover:bg-slate-50 transition-colors">
        <td className="px-6 py-4 text-sm text-slate-900">Data</td>
      </tr>
    </tbody>
  </table>
</div>
```

## 🎨 Icon Usage

```tsx
import { Package, Users, TrendingUp } from 'lucide-react';

// In component
<Package size={20} className="text-slate-600" />
<Users size={24} className="text-white" />
<TrendingUp size={18} />
```

## 📱 Responsive Utilities

```tsx
// Hide on mobile, show on desktop
<div className="hidden lg:block">Desktop only</div>

// Show on mobile, hide on desktop
<div className="lg:hidden">Mobile only</div>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

// Responsive padding
<div className="p-4 lg:p-8">

// Responsive text
<h1 className="text-2xl lg:text-3xl">
```

## 🔧 Customization

### Adding New Stat Card
1. Import icon from lucide-react
2. Add StatCard component
3. Set gradient color
4. Provide data

### Adding New Chart
1. Prepare data in correct format
2. Import chart type from recharts
3. Customize colors and styling
4. Add to Charts component

### Adding New Quick Action
1. Add to actions array in quick-actions.tsx
2. Set icon, title, description
3. Set href route
4. Choose gradient color

## 🐛 Troubleshooting

### Animations not working
- Check framer-motion is installed
- Ensure component is client component ('use client')

### Charts not displaying
- Verify recharts is installed
- Check data format matches expected structure
- Ensure ResponsiveContainer has height

### Icons not showing
- Verify lucide-react is installed
- Check import statement
- Ensure icon name is correct

### Styles not applying
- Run `npm run dev` to rebuild
- Check Tailwind config includes component paths
- Verify class names are correct

## 📚 Resources

### Documentation
- Framer Motion: https://www.framer.com/motion/
- Recharts: https://recharts.org/
- Lucide Icons: https://lucide.dev/
- Tailwind CSS: https://tailwindcss.com/

### Design Inspiration
- Stripe Dashboard
- Linear App
- Vercel Dashboard
- Notion Interface

## ✅ Checklist for New Pages

- [ ] Add route to sidebar navigation
- [ ] Create page component
- [ ] Add loading state
- [ ] Add empty state
- [ ] Implement responsive layout
- [ ] Add animations
- [ ] Test on mobile
- [ ] Test on tablet
- [ ] Test on desktop

## 🎉 You're Ready!

The dashboard is now fully refactored with:
- ✅ Modern SaaS design
- ✅ Smooth animations
- ✅ Full responsiveness
- ✅ Clean component architecture
- ✅ No backend changes

Start building amazing features! 🚀
