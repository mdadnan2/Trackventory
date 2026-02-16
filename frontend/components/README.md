# Modern Dashboard Components

## Overview
This directory contains the refactored modern SaaS-style dashboard components for Trackventory.

## Components Structure

### Layout Components (`components/layout/`)

#### Sidebar.tsx
- Fixed left sidebar with navigation
- Animated active route indicator using Framer Motion
- Role-based menu filtering
- Smooth hover animations

#### Header.tsx
- Fixed top header with search bar
- User profile display
- Notification bell
- Sign out button
- Fully responsive

#### MobileSidebar.tsx
- Mobile drawer navigation
- Animated slide-in/out
- Backdrop overlay
- Hidden on desktop (lg breakpoint)

### Dashboard Components (`components/dashboard/`)

#### stat-card.tsx
- Animated stat cards with count-up effect
- Icon with gradient background
- Hover lift animation
- Staggered entrance animation

#### charts.tsx
- Distribution trend line chart
- Item distribution bar chart
- Built with Recharts
- Responsive containers
- Custom tooltips

#### quick-actions.tsx
- Action cards grid
- Hover scale and glow effects
- Role-based action filtering
- Gradient icon backgrounds

#### recent-activity.tsx
- Activity table with sticky header
- Avatar badges
- Status badges (color-coded)
- Hover row highlighting
- Scrollable content

### UI Components (`components/ui/`)

#### loading-skeleton.tsx
- Shimmer loading animation
- Matches dashboard layout
- Staggered card appearance

## Design System

### Colors
- Background: `#f8fafc` (slate-50)
- Cards: `white` with `border-slate-200`
- Text Primary: `slate-900`
- Text Secondary: `slate-500`
- Accent: `blue-600`

### Spacing
- Card padding: `p-6` (24px)
- Section gaps: `gap-6` (24px)
- Border radius: `rounded-2xl` (16px)

### Typography
- Headings: `font-bold` or `font-semibold`
- Body: `font-medium`
- Descriptions: `text-slate-500`

### Animations
- Page fade-in
- Card stagger (0.1s delay per card)
- Hover lift (y: -4px)
- Count-up numbers
- Smooth transitions (200ms)

## Responsive Breakpoints

- Mobile: < 768px (md)
- Tablet: 768px - 1024px (md-lg)
- Desktop: > 1024px (lg)

### Mobile Behavior
- Sidebar collapses to drawer
- Header adjusts spacing
- Cards stack vertically
- Charts full width
- Tables horizontally scrollable

## Usage

The dashboard automatically adapts based on user role:

### Admin View
- 4 stat cards (Central, Volunteers, Distributed, Damaged)
- 2 charts (Trend + Breakdown)
- 4 quick action cards
- Recent activity table

### Volunteer View
- 2 quick action cards
- Personal stock table

## Dependencies

```json
{
  "framer-motion": "^10.x",
  "recharts": "^2.x",
  "lucide-react": "^0.x"
}
```

## API Integration

No changes to API calls - all existing endpoints remain the same:
- `reportsAPI.getStockSummary()`
- `stockAPI.getVolunteerStock()`

## Performance

- Server components for static content
- Client components only where needed
- Optimized animations (GPU-accelerated)
- Lazy loading for charts
- Minimal re-renders
