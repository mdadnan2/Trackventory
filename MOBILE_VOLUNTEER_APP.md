# Mobile Volunteer Field Operations App

## Overview

A complete mobile-first field operations interface for volunteers to manage distributions entirely from their phones during real-world operations. Built with POS-machine efficiency: **Speed > Decoration, Accuracy > Analytics**.

## Role-Based Rendering

### Admin Users
- **Always see desktop UI** (even on mobile devices)
- Full access to admin features
- No mobile interface available

### Volunteer Users
- **Mobile UI on screens < 768px** (automatic)
- **Desktop UI on screens ≥ 768px** (with optional toggle)
- Complete field operations capability
- Never need a laptop

## Architecture

```
components/mobile-volunteer/
├── MobileLayout.tsx              # Layout with bottom nav + offline banner
├── ScreenContainer.tsx           # Page wrapper with header
├── ActionCard.tsx                # Touch-friendly card
├── QuantityStepper.tsx           # Large +/- buttons (56px)
├── StickyActionBar.tsx           # Bottom action button
└── mobile-pages/
    ├── home.tsx                  # Dashboard with quick actions
    ├── distribute.tsx            # 5-step distribution flow
    ├── stock.tsx                 # Stock with damage/loss/return
    ├── history.tsx               # Timeline view
    └── more.tsx                  # Profile + settings
```

## Navigation Structure

### Bottom Navigation (5 tabs)
1. **Home** - Dashboard overview
2. **Distribute** - Distribution flow
3. **Stock** - Inventory with quick actions
4. **History** - Distribution timeline
5. **More** - Profile, exceptions, logout

### Inside "More"
- Report Damage
- Report Loss
- Return Items
- Profile Info
- Pending Sync Status
- Logout

## Core Features

### Normal Flow
✅ Check assigned stock
✅ View active campaigns
✅ Record distribution (5-step flow)
✅ View distribution history
✅ View remaining stock
✅ Profile / logout

### Exception Flow
✅ Report damaged items
✅ Report lost items
✅ Return unused items
✅ Quick action buttons in stock cards
✅ Retry failed submissions
✅ Offline queue with auto-sync

## Distribution Flow (5 Steps)

### Step 1: Select Campaign
- Shows active campaigns only
- Single-select with radio buttons
- Skip if no campaigns active
- Auto-select if only one campaign

### Step 2: Select Items
- Shows volunteer's assigned stock
- Quantity stepper for each item
- Max = available stock
- Large touch targets (56px buttons)

### Step 3: Location
- City dropdown
- Area dropdown (filtered by city)
- Full-width selects (56px height)

### Step 4: Beneficiaries
- Number of people receiving items
- Quantity stepper
- Min = 1

### Step 5: Confirm
- Review all selections
- Shows campaign, items, location, beneficiaries
- Green "Confirm Distribution" button
- Optimistic UI update on submit

## Exception Handling

### Quick Actions in Stock Cards
Each stock item has 3 action buttons:
- **Damage** (orange) - Report damaged items
- **Loss** (red) - Report lost items
- **Return** (blue) - Return unused items

### Action Flow
1. Tap action button
2. Select quantity (stepper)
3. Confirm
4. Optimistic UI update
5. If API fails → queue for retry

## Offline Support

### Offline Queue System
- **Auto-queue failed actions**
- **Optimistic UI updates** (instant feedback)
- **Auto-retry every 20 seconds**
- **Persistent storage** (localStorage)
- **Sync status indicator** (top banner)

### Queue Banner
```
🔴 3 actions pending sync
```
- Shows when queue has items
- Orange background
- Sticky at top
- Dismissible from "More" page

### Queued Action Types
- `DISTRIBUTION` - Distribution records
- `DAMAGE` - Damaged items
- `LOSS` - Lost items
- `RETURN` - Returned items

## UX Principles

### One-Hand Thumb Usage
- Bottom navigation (thumb zone)
- Large buttons (min 48px, primary 56px)
- Sticky actions at bottom
- No top-corner interactions

### Outdoor Brightness
- High contrast colors
- No subtle grays
- Bold text (font-semibold minimum)
- Large numbers (text-3xl, text-4xl)

### Touch Targets
- **Minimum**: 48x48px
- **Primary actions**: 56x56px (h-14)
- **Steppers**: 56x56px buttons
- **Cards**: Full-width, 16px padding

### No Desktop Patterns
- ❌ No tables
- ❌ No dense grids
- ❌ No side-by-side inputs
- ❌ No hover states
- ✅ Cards only
- ✅ Single column
- ✅ Full-width buttons
- ✅ Active states (scale-98)

## Performance Optimizations

### Fast Loading
- Skeleton loaders (no spinners)
- Instant screen transitions
- Optimistic UI updates
- No heavy shadows

### No Charts on Mobile
- Big numbers instead
- Simple stats cards
- Text-based summaries

### Minimal Re-renders
- Optimized hooks
- Local state management
- No unnecessary API calls

## Data Flow

### API Reuse
- **No backend changes**
- Uses existing endpoints
- Maps actions to transaction types:
  - `DISTRIBUTION` → distributionAPI.create()
  - `DAMAGE` → distributionAPI.reportDamage()
  - `LOSS` → distributionAPI.reportDamage() (backend maps)
  - `RETURN` → distributionAPI.reportDamage() (backend maps)

### Optimistic Updates
```typescript
// 1. Update UI immediately
setStock(prev => prev.map(item => ({
  ...item,
  stock: item.stock - quantity
})));

// 2. Call API
try {
  await api.submit();
} catch {
  // 3. Queue for retry
  addToQueue('DAMAGE', payload);
}
```

## Accessibility

### ARIA Labels
- All buttons have `aria-label`
- Screen reader friendly
- Semantic HTML

### Keyboard Support
- Tab navigation works
- Enter to submit
- Escape to cancel

### Color Contrast
- WCAG AA compliant
- High contrast mode ready

## Component API

### ScreenContainer
```tsx
<ScreenContainer
  title="Distribution"
  subtitle="Step 1 of 5"
  showBack={true}
  action={<button>...</button>}
>
  {children}
</ScreenContainer>
```

### ActionCard
```tsx
<ActionCard onClick={() => navigate()}>
  {children}
</ActionCard>
```

### QuantityStepper
```tsx
<QuantityStepper
  value={quantity}
  onChange={setQuantity}
  max={availableStock}
  min={0}
  label="Quantity"
/>
```

### StickyActionBar
```tsx
<StickyActionBar
  onClick={handleSubmit}
  disabled={!canSubmit}
  loading={submitting}
  variant="primary" // or "danger" or "success"
>
  Confirm Action
</StickyActionBar>
```

## Testing Checklist

### Role-Based Rendering
- [ ] Admin always sees desktop
- [ ] Volunteer sees mobile on small screens
- [ ] Volunteer can toggle on large screens

### Distribution Flow
- [ ] All 5 steps work
- [ ] Can skip campaign if none active
- [ ] Quantity limited by stock
- [ ] Location dropdowns filter correctly
- [ ] Confirm shows all data
- [ ] Stock updates after submit

### Exception Handling
- [ ] Damage button works
- [ ] Loss button works
- [ ] Return button works
- [ ] Quantity stepper limits correctly
- [ ] Optimistic updates work

### Offline Support
- [ ] Failed actions queue
- [ ] Banner shows pending count
- [ ] Auto-retry works
- [ ] Queue persists on refresh
- [ ] Can clear queue manually

### Touch Interactions
- [ ] All buttons are 48px+ height
- [ ] Active states work (scale-98)
- [ ] One-hand thumb usage comfortable
- [ ] No accidental taps

### Performance
- [ ] Screens load instantly
- [ ] No layout shifts
- [ ] Skeleton loaders show
- [ ] No janky animations

## Browser Support

- Chrome/Edge (mobile & desktop)
- Safari (iOS & macOS)
- Firefox (mobile & desktop)
- Samsung Internet

## Device Support

- iPhone 6+ (375px width)
- Android phones (360px+ width)
- Tablets (768px+ shows desktop)
- Notched devices (safe-area support)

## Known Limitations

1. **No offline data sync** - Only queues failed actions
2. **No camera integration** - No barcode scanning yet
3. **No push notifications** - No real-time alerts
4. **No multi-language** - English only
5. **No dark mode** - Light theme only

## Future Enhancements

- [ ] Swipe gestures for navigation
- [ ] Pull-to-refresh on lists
- [ ] Camera for barcode scanning
- [ ] Offline data caching
- [ ] Push notifications
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Haptic feedback
- [ ] Voice input
- [ ] GPS location auto-fill

## Maintenance

### Adding New Actions
1. Add to `useOfflineQueue` types
2. Create action handler in page
3. Add to queue on failure
4. Map to backend endpoint

### Modifying Flow Steps
1. Update step count in subtitle
2. Add step UI in component
3. Update canProceed logic
4. Test all transitions

### Changing Colors
- Primary: `blue-600`
- Success: `green-600`
- Danger: `red-600`
- Warning: `orange-600`

## Support

For issues or questions:
1. Check console for errors
2. Verify role-based rendering
3. Test offline queue status
4. Clear localStorage if needed

---

**Status**: ✅ Production Ready
**Target Users**: Field Volunteers
**Design Philosophy**: POS Machine Efficiency
**Key Metric**: Actions per minute in field conditions
