# 📱 Mobile Volunteer Interface - Quick Reference

## 🚀 Quick Start

### Check if Mobile UI is Active

```typescript
import { useAuth } from '@/hooks/useAuth'
import { useIsMobile } from '@/hooks/useIsMobile'

const { user } = useAuth()
const isMobile = useIsMobile()

// Mobile UI shows when:
if (isMobile && user?.role === 'VOLUNTEER') {
  return <MobileComponent />
}
```

### Component Imports

```typescript
// Layout & Structure
import MobileVolunteerLayout from '@/components/mobile-volunteer/MobileLayout'
import ScreenContainer from '@/components/mobile-volunteer/ScreenContainer'

// UI Components
import ActionCard from '@/components/mobile-volunteer/ActionCard'
import QuantityStepper from '@/components/mobile-volunteer/QuantityStepper'
import StickyActionBar from '@/components/mobile-volunteer/StickyActionBar'

// Pages
import MobileHome from '@/components/mobile-volunteer/mobile-pages/home'
import MobileDistribute from '@/components/mobile-volunteer/mobile-pages/distribute'
import MobileStock from '@/components/mobile-volunteer/mobile-pages/stock'
import MobileHistory from '@/components/mobile-volunteer/mobile-pages/history'
import MobileMore from '@/components/mobile-volunteer/mobile-pages/more'

// Hooks
import { useOfflineQueue } from '@/hooks/useOfflineQueue'
```

---

## 🎨 Component Cheat Sheet

### ScreenContainer

```tsx
<ScreenContainer 
  title="Page Title"
  subtitle="Optional subtitle"
  showBack={true}           // Show back button
  showMenu={false}          // Show menu button
  action={<CustomButton />} // Optional right action
>
  {children}
</ScreenContainer>
```

### ActionCard

```tsx
// Basic card
<ActionCard>
  <div>Content</div>
</ActionCard>

// Clickable card
<ActionCard onClick={() => handleClick()}>
  <div>Clickable content</div>
</ActionCard>

// Custom styling
<ActionCard className="bg-blue-50 border-blue-200">
  <div>Styled content</div>
</ActionCard>
```

### QuantityStepper

```tsx
<QuantityStepper
  value={quantity}
  onChange={setQuantity}
  max={100}              // Optional max value
  min={0}                // Optional min value (default: 0)
  label="Quantity"       // Optional label
/>
```

### StickyActionBar

```tsx
<StickyActionBar
  onClick={handleSubmit}
  disabled={!isValid}
  loading={isSubmitting}
  variant="primary"      // 'primary' | 'danger' | 'success'
>
  Button Text
</StickyActionBar>
```

---

## 🔌 API Quick Reference

### Distribution

```typescript
import { distributionAPI } from '@/services/api'

// Create distribution
await distributionAPI.create({
  items: [{ itemId: '123', quantity: 10 }],
  state: 'Maharashtra',
  city: 'Mumbai',
  pinCode: '400001',
  area: 'Andheri',
  campaignId: 'campaign123' // Optional
})

// Report damage
await distributionAPI.reportDamage({
  items: [{ itemId: '123', quantity: 5 }]
})

// Get distributions
const res = await distributionAPI.getAll({
  volunteerId: user._id,
  page: 1,
  limit: 50
})
```

### Stock

```typescript
import { stockAPI } from '@/services/api'

// Get volunteer stock
const res = await stockAPI.getVolunteerStock(volunteerId)
const stock = res.data.data

// Transfer stock
await stockAPI.transferStock({
  fromVolunteerId: user._id,
  toVolunteerId: 'volunteer123',
  items: [{ itemId: '123', quantity: 10 }]
})

// Return stock
await stockAPI.returnStock({
  volunteerId: user._id,
  items: [{ itemId: '123', quantity: 10 }],
  notes: 'Unused items'
})
```

### Campaigns

```typescript
import { campaignsAPI } from '@/services/api'

// Get active campaigns
const res = await campaignsAPI.getAll(1, 100)
const active = res.data.data.data.filter(c => c.status === 'ACTIVE')
```

---

## 🌐 Offline Queue

### Basic Usage

```typescript
import { useOfflineQueue } from '@/hooks/useOfflineQueue'

const { queue, addToQueue, removeFromQueue, clearQueue } = useOfflineQueue()

// Add to queue on API failure
try {
  await distributionAPI.create(payload)
} catch (error) {
  addToQueue('DISTRIBUTION', payload)
  // Show success message (optimistic UI)
}

// Check queue status
if (queue.length > 0) {
  console.log(`${queue.length} actions pending`)
}

// Clear queue
clearQueue()
```

### Queue Types

```typescript
type ActionType = 
  | 'DISTRIBUTION'
  | 'DAMAGE'
  | 'LOSS'
  | 'RETURN'
  | 'TRANSFER'
```

---

## 🎯 Common Patterns

### Loading State

```tsx
const [loading, setLoading] = useState(true)

useEffect(() => {
  loadData()
}, [])

const loadData = async () => {
  try {
    setLoading(true)
    const res = await api.getData()
    setData(res.data.data)
  } catch (error) {
    console.error(error)
  } finally {
    setLoading(false)
  }
}

if (loading) {
  return (
    <ScreenContainer title="Loading">
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
        ))}
      </div>
    </ScreenContainer>
  )
}
```

### Empty State

```tsx
{items.length === 0 ? (
  <ActionCard>
    <div className="text-center py-12 text-slate-500">
      <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
      <p>No items found</p>
    </div>
  </ActionCard>
) : (
  items.map(item => <ItemCard key={item.id} item={item} />)
)}
```

### Optimistic Update

```tsx
const handleAction = async () => {
  // Update UI immediately
  setData(prev => prev.map(item => 
    item.id === targetId 
      ? { ...item, stock: item.stock - quantity }
      : item
  ))

  try {
    await api.performAction(payload)
  } catch (error) {
    // Revert on failure
    loadData()
    addToQueue('ACTION', payload)
  }
}
```

### Multi-Step Form

```tsx
const [step, setStep] = useState(1)
const [formData, setFormData] = useState({
  field1: '',
  field2: '',
  field3: ''
})

const canProceed = {
  1: formData.field1 !== '',
  2: formData.field2 !== '',
  3: formData.field3 !== ''
}

return (
  <ScreenContainer title={`Step ${step} of 3`} showBack={step > 1}>
    <div className="space-y-4 pb-24">
      {step === 1 && <Step1 data={formData} onChange={setFormData} />}
      {step === 2 && <Step2 data={formData} onChange={setFormData} />}
      {step === 3 && <Step3 data={formData} onChange={setFormData} />}
    </div>
    
    <StickyActionBar
      onClick={() => {
        if (step < 3) setStep(step + 1)
        else handleSubmit()
      }}
      disabled={!canProceed[step]}
    >
      {step === 3 ? 'Submit' : 'Continue'}
    </StickyActionBar>
  </ScreenContainer>
)
```

---

## 🎨 Styling Patterns

### Card with Icon and Text

```tsx
<ActionCard>
  <div className="flex items-center gap-3">
    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
      <Icon className="text-blue-600" size={24} />
    </div>
    <div>
      <div className="font-semibold text-slate-900">Title</div>
      <div className="text-sm text-slate-500">Subtitle</div>
    </div>
  </div>
</ActionCard>
```

### Card with Value Display

```tsx
<ActionCard>
  <div className="flex items-center justify-between">
    <div>
      <div className="font-semibold text-slate-900">Item Name</div>
      <div className="text-sm text-slate-500">Category</div>
    </div>
    <div className="text-right">
      <div className="text-3xl font-bold text-slate-900">42</div>
      <div className="text-xs text-slate-500">units</div>
    </div>
  </div>
</ActionCard>
```

### Status Badge

```tsx
<span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
  status === 'good' ? 'bg-green-100 text-green-700' :
  status === 'low' ? 'bg-orange-100 text-orange-700' :
  'bg-red-100 text-red-700'
}`}>
  {status}
</span>
```

### Action Buttons Grid

```tsx
<div className="grid grid-cols-4 gap-2">
  <button className="h-12 bg-purple-50 text-purple-700 rounded-xl text-xs font-medium active:scale-95 transition-transform">
    <Icon size={14} />
    Transfer
  </button>
  <button className="h-12 bg-orange-50 text-orange-700 rounded-xl text-xs font-medium active:scale-95 transition-transform">
    <Icon size={14} />
    Damage
  </button>
  <button className="h-12 bg-red-50 text-red-700 rounded-xl text-xs font-medium active:scale-95 transition-transform">
    <Icon size={14} />
    Loss
  </button>
  <button className="h-12 bg-blue-50 text-blue-700 rounded-xl text-xs font-medium active:scale-95 transition-transform">
    <Icon size={14} />
    Return
  </button>
</div>
```

---

## 🐛 Debug Helpers

### Check Mobile State

```typescript
console.log('User:', user)
console.log('Role:', user?.role)
console.log('Is Mobile:', isMobile)
console.log('Window Width:', window.innerWidth)
console.log('Should Show Mobile:', isMobile && user?.role === 'VOLUNTEER')
```

### Check API Response

```typescript
try {
  const res = await api.getData()
  console.log('API Response:', res.data)
  console.log('Data:', res.data.data)
} catch (error) {
  console.error('API Error:', error.response?.data)
}
```

### Check Queue

```typescript
console.log('Queue Length:', queue.length)
console.log('Queue Items:', queue)
console.log('LocalStorage:', localStorage.getItem('offline_queue'))
```

---

## 📏 Size Reference

### Touch Targets
- Minimum: `48px` height
- Primary buttons: `56-64px` height
- Icons: `20-24px` size
- Large icons: `32px` size

### Spacing
- Card padding: `p-4` (16px)
- Section gap: `space-y-4` (16px)
- Bottom padding: `pb-24` (96px) for sticky nav
- Safe area: `pb-[env(safe-area-inset-bottom)]`

### Typography
- Title: `text-lg font-bold` (18px)
- Subtitle: `text-xs text-slate-500` (12px)
- Body: `text-sm` (14px)
- Large number: `text-3xl font-bold` (30px)

### Colors
```typescript
// Backgrounds
bg-slate-100    // Page background
bg-white        // Card background
bg-slate-50     // Hover state

// Text
text-slate-900  // Primary text
text-slate-600  // Secondary text
text-slate-500  // Tertiary text

// Status
bg-green-100 text-green-700  // Success/Good
bg-orange-100 text-orange-700 // Warning/Low
bg-red-100 text-red-700      // Error/Empty
bg-blue-100 text-blue-700    // Info/Primary
```

---

## ✅ Testing Checklist

### Before Committing

- [ ] Mobile UI shows for volunteers on small screens
- [ ] Desktop UI shows for admins always
- [ ] Desktop UI shows for volunteers on large screens
- [ ] All touch targets are ≥ 48px
- [ ] Loading states implemented
- [ ] Error handling added
- [ ] Optimistic updates work
- [ ] Offline queue tested
- [ ] No console errors
- [ ] Tested on real device

### Test Devices

- iPhone SE (375px width)
- iPhone 12 (390px width)
- Samsung Galaxy S21 (360px width)
- iPad Mini (768px width - should show desktop)

---

## 🚨 Common Issues

### Mobile UI Not Showing

**Problem**: Desktop UI shows on mobile
**Solution**: Check `useIsMobile()` returns true and user role is VOLUNTEER

### Bottom Nav Overlapping Content

**Problem**: Content hidden behind nav
**Solution**: Add `pb-20` to content wrapper

### Sticky Button Not Visible

**Problem**: Button not showing at bottom
**Solution**: Ensure parent has `pb-24` and button is outside scrollable area

### API Calls Failing

**Problem**: 401 Unauthorized
**Solution**: Check Firebase token is valid and being sent in headers

---

## 📚 Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Firebase Auth](https://firebase.google.com/docs/auth)

---

**Last Updated**: 2024
**Version**: 1.0.0
