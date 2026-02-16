# Dashboard Visual Guide

## 🎨 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER (Fixed Top)                                         │
│  [Search Bar]              [🔔] [User Avatar] [Sign Out]   │
└─────────────────────────────────────────────────────────────┘
┌──────────┬──────────────────────────────────────────────────┐
│          │                                                  │
│ SIDEBAR  │  MAIN CONTENT                                    │
│ (Fixed)  │                                                  │
│          │  ┌─────────────────────────────────────────┐    │
│ Logo     │  │ Dashboard                               │    │
│          │  │ Welcome back, User Name                 │    │
│ • Dash   │  └─────────────────────────────────────────┘    │
│ • Items  │                                                  │
│ • Stock  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│ • Users  │  │ 1,234│ │  567 │ │ 8,901│ │  23  │          │
│ • Cities │  │Central│ │Volunt│ │Distri│ │Damage│          │
│ • Distri │  └──────┘ └──────┘ └──────┘ └──────┘          │
│ • Report │                                                  │
│          │  ┌─────────────────┐ ┌─────────────────┐       │
│          │  │ Line Chart      │ │ Bar Chart       │       │
│          │  │ (Trend)         │ │ (Items)         │       │
│          │  └─────────────────┘ └─────────────────┘       │
│          │                                                  │
│          │  Quick Actions                                   │
│          │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│          │  │ Add  │ │Manage│ │Record│ │ View │          │
│          │  │Stock │ │Items │ │Distri│ │Report│          │
│          │  └──────┘ └──────┘ └──────┘ └──────┘          │
│          │                                                  │
│          │  Recent Activity                                 │
│          │  ┌─────────────────────────────────────────┐   │
│          │  │ Volunteer | Action | Item | Qty | Time │   │
│          │  ├─────────────────────────────────────────┤   │
│          │  │ John Doe  | Distri | Rice | 50  | 2h   │   │
│          │  └─────────────────────────────────────────┘   │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

## 📱 Mobile Layout

```
┌─────────────────────────────────┐
│ [☰] HEADER        [🔔] [Avatar]│
│ [Search Bar]                    │
└─────────────────────────────────┘
│                                 │
│  Dashboard                      │
│  Welcome back, User             │
│                                 │
│  ┌───────────────────────────┐ │
│  │ 1,234                     │ │
│  │ Central Stock             │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │ 567                       │ │
│  │ With Volunteers           │ │
│  └───────────────────────────┘ │
│                                 │
│  [Charts Full Width]            │
│                                 │
│  [Actions Stacked]              │
│                                 │
│  [Table Scrollable →]           │
│                                 │
└─────────────────────────────────┘
```

## 🎨 Color Palette

### Primary Colors
```
Blue:   #3b82f6 (Primary actions)
Purple: #8b5cf6 (Secondary accent)
Green:  #10b981 (Success/Distributed)
Red:    #ef4444 (Danger/Damaged)
Orange: #f59e0b (Warning/Reports)
```

### Neutral Colors
```
Background: #f8fafc (slate-50)
Cards:      #ffffff (white)
Borders:    #e2e8f0 (slate-200)
Text:       #0f172a (slate-900)
Muted:      #64748b (slate-500)
```

## 🎭 Component States

### Stat Card
```
Default:  White bg, subtle shadow
Hover:    Lift up 4px, larger shadow
Active:   -
```

### Quick Action Card
```
Default:  White bg, gradient icon
Hover:    Scale 1.05, lift up, gradient overlay
Active:   -
```

### Sidebar Item
```
Default:  Gray text
Hover:    Light gray bg, slide right 4px
Active:   Blue text, blue bg, blue indicator bar
```

### Table Row
```
Default:  White bg
Hover:    Light gray bg
Active:   -
```

## 📐 Spacing System

```
xs:  4px   (gap-1)
sm:  8px   (gap-2)
md:  16px  (gap-4)
lg:  24px  (gap-6)
xl:  32px  (gap-8)
2xl: 48px  (gap-12)
```

## 🔤 Typography Scale

```
3xl: 30px  (Page titles)
2xl: 24px  (Section titles)
xl:  20px  (Card titles)
lg:  18px  (Subsections)
base: 16px (Body text)
sm:  14px  (Secondary text)
xs:  12px  (Labels, badges)
```

## 🎬 Animation Timings

```
Fast:   150ms (Hover states)
Normal: 200ms (Transitions)
Slow:   300ms (Page transitions)
Spring: Custom (Sidebar, modals)
```

## 🎯 Interactive Elements

### Buttons
```css
Primary:   Blue bg, white text, hover lift
Secondary: Gray bg, dark text, hover darken
Danger:    Red bg, white text, hover lift
```

### Inputs
```css
Default: Gray border, rounded-xl
Focus:   Blue ring, white bg
Error:   Red border, red ring
```

### Cards
```css
Default: White bg, subtle border
Hover:   Lift, larger shadow
```

## 📊 Chart Styling

### Line Chart
```
Line:  Blue (#3b82f6), 3px width
Dots:  Blue fill, 4px radius
Grid:  Light gray, dashed
```

### Bar Chart
```
Bars:  Purple (#8b5cf6), rounded tops
Grid:  Light gray, dashed
```

## 🎨 Gradient Combinations

```
Blue:   from-blue-500 to-blue-600
Purple: from-purple-500 to-purple-600
Green:  from-green-500 to-green-600
Red:    from-red-500 to-red-600
Orange: from-orange-500 to-orange-600
```

## 🔍 Accessibility

- ✅ Semantic HTML
- ✅ ARIA labels where needed
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ Color contrast (WCAG AA)
- ✅ Screen reader friendly

## 🎪 Animation Sequence

### Page Load
```
1. Fade in (0ms)
2. Stat cards stagger (0-300ms)
3. Charts appear (400-500ms)
4. Actions stagger (600-900ms)
5. Activity table (800ms+)
```

### Hover Effects
```
Cards:   Scale + Lift
Buttons: Lift + Shadow
Links:   Slide right
```

## 📱 Breakpoint Behavior

### Desktop (>1024px)
- Sidebar visible
- 4 columns for stats
- 2 columns for charts
- 4 columns for actions

### Tablet (768-1024px)
- Sidebar visible
- 2 columns for stats
- 2 columns for charts
- 2 columns for actions

### Mobile (<768px)
- Sidebar → Drawer
- 1 column for all
- Full width charts
- Stacked actions
