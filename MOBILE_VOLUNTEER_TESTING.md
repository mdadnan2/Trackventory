# 📱 Mobile Volunteer Interface - Testing & Troubleshooting Guide

## 🧪 Testing Strategy

### Test Pyramid

```
                    ┌─────────────┐
                    │   E2E Tests │  (Manual/Automated)
                    └─────────────┘
                  ┌─────────────────┐
                  │ Integration Tests│  (API + UI)
                  └─────────────────┘
              ┌───────────────────────┐
              │    Component Tests     │  (Unit Tests)
              └───────────────────────┘
          ┌─────────────────────────────┐
          │    Visual Regression Tests   │
          └─────────────────────────────┘
```

---

## ✅ Manual Testing Checklist

### Pre-Testing Setup

- [ ] Backend server running on `http://localhost:5000`
- [ ] Frontend server running on `http://localhost:3000`
- [ ] MongoDB connected and seeded with test data
- [ ] Firebase authentication configured
- [ ] Test volunteer account created
- [ ] Test admin account created
- [ ] Browser DevTools open (Console + Network tabs)

### Device Testing Matrix

| Device | Screen Size | Browser | Priority |
|--------|-------------|---------|----------|
| iPhone SE | 375x667 | Safari | High |
| iPhone 12 | 390x844 | Safari | High |
| Samsung Galaxy S21 | 360x800 | Chrome | High |
| Pixel 5 | 393x851 | Chrome | Medium |
| iPad Mini | 768x1024 | Safari | High (Desktop UI) |
| Desktop | 1920x1080 | Chrome | High |

---

## 🎯 Feature Testing

### 1. Authentication Flow

**Test Case**: Volunteer Login
```
Steps:
1. Navigate to http://localhost:3000
2. Click "Sign in with Google"
3. Select volunteer test account
4. Verify redirect to /dashboard

Expected:
✓ User logged in successfully
✓ Mobile UI shows on mobile screen
✓ Desktop UI shows on desktop screen
✓ User data loaded in AuthContext
✓ No console errors

Actual: _____________
Status: [ ] Pass [ ] Fail
```

**Test Case**: Admin Login
```
Steps:
1. Navigate to http://localhost:3000
2. Click "Sign in with Google"
3. Select admin test account
4. Verify redirect to /dashboard

Expected:
✓ User logged in successfully
✓ Desktop UI shows on all screen sizes
✓ Admin-only features visible
✓ No console errors

Actual: _____________
Status: [ ] Pass [ ] Fail
```

---

### 2. Home Screen

**Test Case**: Dashboard Load
```
Steps:
1. Login as volunteer on mobile device
2. Observe home screen

Expected:
✓ Active campaign banner shows (if campaigns exist)
✓ Total stock count displays correctly
✓ Today's distribution count shows
✓ Low stock alert shows (if applicable)
✓ Quick action buttons visible
✓ Stock preview shows first 5 items
✓ Bottom navigation visible
✓ All data loads within 3 seconds

Actual: _____________
Status: [ ] Pass [ ] Fail
```

**Test Case**: Quick Actions
```
Steps:
1. Tap "Record Distribution" button
2. Verify navigation to distribution page
3. Go back to home
4. Tap "View Stock" button
5. Verify navigation to stock page

Expected:
✓ Navigation works smoothly
✓ No layout shift
✓ Back button returns to home
✓ Bottom nav updates active state

Actual: _____________
Status: [ ] Pass [ ] Fail
```

---

### 3. Distribution Flow

**Test Case**: Complete Distribution (Happy Path)
```
Steps:
1. Navigate to Distribute tab
2. Step 1: Select campaign (or skip if none)
3. Step 2: Select items and quantities
4. Step 3: Fill location details
5. Step 4: Set beneficiary count
6. Step 5: Review and confirm

Expected:
✓ All steps load correctly
✓ Continue button enables when valid
✓ Continue button disabled when invalid
✓ Back button works in all steps
✓ Quantity steppers work smoothly
✓ Location dropdowns populate correctly
✓ Confirmation shows all details
✓ Submit succeeds
✓ Success message shows
✓ Stock updates optimistically
✓ Returns to home or stock page

Actual: _____________
Status: [ ] Pass [ ] Fail
```

**Test Case**: Distribution Validation
```
Steps:
1. Navigate to Distribute tab
2. Try to continue without selecting items
3. Try to enter quantity > available stock
4. Try to continue without location
5. Try to submit with 0 beneficiaries

Expected:
✓ Continue button disabled when invalid
✓ Quantity stepper respects max value
✓ Form validation prevents submission
✓ Error messages clear and helpful

Actual: _____________
Status: [ ] Pass [ ] Fail
```

**Test Case**: Distribution Offline Mode
```
Steps:
1. Navigate to Distribute tab
2. Turn off network (DevTools → Network → Offline)
3. Complete distribution flow
4. Submit

Expected:
✓ Request fails gracefully
✓ Action added to offline queue
✓ Sync indicator appears at top
✓ Success message still shows (optimistic)
✓ Stock updates locally
✓ Queue count shows in More tab

Actual: _____________
Status: [ ] Pass [ ] Fail
```

---

### 4. Stock Management

**Test Case**: View Stock
```
Steps:
1. Navigate to Stock tab
2. Observe stock list

Expected:
✓ All assigned items display
✓ Quantities show correctly
✓ Status badges show (Empty/Low/Good)
✓ Action buttons visible for each item
✓ Empty state shows if no stock

Actual: _____________
Status: [ ] Pass [ ] Fail
```

**Test Case**: Report Damage
```
Steps:
1. Navigate to Stock tab
2. Tap "Damage" button on an item
3. Set quantity using stepper
4. Tap "Confirm Report Damage"

Expected:
✓ Action mode screen shows
✓ Item details display correctly
✓ Quantity stepper works
✓ Max value is current stock
✓ Submit succeeds
✓ Stock updates optimistically
✓ Returns to stock list
✓ Success message shows

Actual: _____________
Status: [ ] Pass [ ] Fail
```

**Test Case**: Transfer Stock
```
Steps:
1. Navigate to Stock tab
2. Tap "Transfer" button on an item
3. Set quantity
4. Select target volunteer
5. Tap "Confirm Transfer Stock"

Expected:
✓ Volunteer dropdown populates
✓ Current volunteer excluded from list
✓ Submit button disabled until volunteer selected
✓ Transfer succeeds
✓ Stock updates locally
✓ Success message shows

Actual: _____________
Status: [ ] Pass [ ] Fail
```

**Test Case**: Return Stock
```
Steps:
1. Navigate to Stock tab
2. Tap "Return" button on an item
3. Set quantity
4. Tap "Confirm Return Items"

Expected:
✓ Return flow works
✓ Stock updates
✓ Success message shows

Actual: _____________
Status: [ ] Pass [ ] Fail
```

---

### 5. History Screen

**Test Case**: View History
```
Steps:
1. Navigate to History tab
2. Observe distribution list

Expected:
✓ Distributions grouped by date
✓ Only current volunteer's distributions show
✓ Most recent first
✓ All details display correctly
✓ Campaign badge shows if applicable
✓ Empty state shows if no distributions

Actual: _____________
Status: [ ] Pass [ ] Fail
```

**Test Case**: History Filtering
```
Steps:
1. Create distributions on different dates
2. Navigate to History tab
3. Verify grouping

Expected:
✓ Today's distributions under "Today"
✓ Yesterday's under "Yesterday"
✓ Older grouped by date
✓ Chronological order maintained

Actual: _____________
Status: [ ] Pass [ ] Fail
```

---

### 6. More Screen

**Test Case**: Profile Display
```
Steps:
1. Navigate to More tab
2. Observe profile information

Expected:
✓ User avatar shows
✓ Name displays correctly
✓ Email displays correctly
✓ Role displays correctly
✓ Sign out button visible

Actual: _____________
Status: [ ] Pass [ ] Fail
```

**Test Case**: Offline Queue Display
```
Steps:
1. Create offline actions (turn off network)
2. Navigate to More tab
3. Observe queue status

Expected:
✓ Queue count shows
✓ Sync indicator visible
✓ Clear queue button works
✓ Queue persists across page reloads

Actual: _____________
Status: [ ] Pass [ ] Fail
```

**Test Case**: Sign Out
```
Steps:
1. Navigate to More tab
2. Tap "Sign Out" button

Expected:
✓ User logged out
✓ Redirect to landing page
✓ AuthContext cleared
✓ No errors in console

Actual: _____________
Status: [ ] Pass [ ] Fail
```

---

### 7. Navigation

**Test Case**: Bottom Navigation
```
Steps:
1. Tap each tab in bottom nav
2. Verify navigation

Expected:
✓ All tabs navigate correctly
✓ Active state updates
✓ Icon weight changes when active
✓ No layout shift
✓ Smooth transitions

Actual: _____________
Status: [ ] Pass [ ] Fail
```

**Test Case**: Back Navigation
```
Steps:
1. Navigate through multiple screens
2. Use back button
3. Use browser back button

Expected:
✓ Back button works in all screens
✓ Browser back works correctly
✓ State preserved when going back
✓ No broken states

Actual: _____________
Status: [ ] Pass [ ] Fail
```

---

## 🎨 UI/UX Testing

### Visual Testing

**Test Case**: Touch Targets
```
Steps:
1. Measure all interactive elements
2. Verify minimum size

Expected:
✓ All buttons ≥ 48px height
✓ Primary CTAs 56-64px height
✓ Icons 20-24px size
✓ Easy to tap with thumb

Actual: _____________
Status: [ ] Pass [ ] Fail
```

**Test Case**: Typography
```
Steps:
1. Check text readability at 360px width
2. Verify font sizes

Expected:
✓ Title text: 18px+
✓ Body text: 14px+
✓ Small text: 12px+
✓ All text readable without zoom

Actual: _____________
Status: [ ] Pass [ ] Fail
```

**Test Case**: Spacing
```
Steps:
1. Check spacing between elements
2. Verify padding

Expected:
✓ Cards have 16px padding
✓ Sections have 16px gap
✓ Bottom padding 96px for nav
✓ No overlapping elements

Actual: _____________
Status: [ ] Pass [ ] Fail
```

**Test Case**: Colors & Contrast
```
Steps:
1. Check color contrast ratios
2. Test in bright sunlight (if possible)

Expected:
✓ Text contrast ratio ≥ 4.5:1
✓ Status colors distinguishable
✓ Readable in various lighting
✓ No color-only indicators

Actual: _____________
Status: [ ] Pass [ ] Fail
```

---

## 📱 Responsive Testing

**Test Case**: Screen Size Transitions
```
Steps:
1. Start at 360px width
2. Gradually increase to 768px
3. Continue to 1920px

Expected:
✓ Mobile UI at < 768px (volunteer)
✓ Desktop UI at ≥ 768px (volunteer)
✓ Desktop UI at all sizes (admin)
✓ No layout breaks at any size
✓ Smooth transition at breakpoint

Actual: _____________
Status: [ ] Pass [ ] Fail
```

**Test Case**: Orientation Change
```
Steps:
1. Test in portrait mode
2. Rotate to landscape
3. Rotate back to portrait

Expected:
✓ Layout adapts correctly
✓ No content cut off
✓ State preserved
✓ No errors

Actual: _____________
Status: [ ] Pass [ ] Fail
```

**Test Case**: Safe Area Insets (iOS)
```
Steps:
1. Test on iPhone with notch
2. Check bottom navigation
3. Check sticky buttons

Expected:
✓ Bottom nav respects safe area
✓ Content not hidden by notch
✓ Buttons accessible
✓ No overlap with system UI

Actual: _____________
Status: [ ] Pass [ ] Fail
```

---

## ⚡ Performance Testing

**Test Case**: Initial Load Time
```
Steps:
1. Clear cache
2. Navigate to app
3. Measure time to interactive

Expected:
✓ First contentful paint < 1.5s
✓ Time to interactive < 3s
✓ No layout shift
✓ Progressive loading

Actual: _____________
Status: [ ] Pass [ ] Fail
```

**Test Case**: Page Transitions
```
Steps:
1. Navigate between tabs
2. Measure transition time

Expected:
✓ Transitions < 300ms
✓ Smooth animations
✓ No janky scrolling
✓ 60fps maintained

Actual: _____________
Status: [ ] Pass [ ] Fail
```

**Test Case**: API Response Handling
```
Steps:
1. Throttle network to 3G
2. Perform actions
3. Measure response time

Expected:
✓ Loading states show immediately
✓ Optimistic updates work
✓ No UI blocking
✓ Graceful degradation

Actual: _____________
Status: [ ] Pass [ ] Fail
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Mobile UI Not Showing

**Symptoms**:
- Desktop UI shows on mobile device
- Volunteer sees admin layout

**Debug Steps**:
```typescript
// Add to page component
console.log('User:', user)
console.log('Role:', user?.role)
console.log('Is Mobile:', isMobile)
console.log('Window Width:', window.innerWidth)
console.log('Should Show Mobile:', isMobile && user?.role === 'VOLUNTEER')
```

**Common Causes**:
1. `useIsMobile()` not working
2. User role not set correctly
3. Conditional render logic wrong

**Solutions**:
```typescript
// Check useIsMobile hook
const [isMobile, setIsMobile] = useState(false)

useEffect(() => {
  const checkMobile = () => {
    console.log('Checking mobile:', window.innerWidth)
    setIsMobile(window.innerWidth < 768)
  }
  checkMobile()
  window.addEventListener('resize', checkMobile)
  return () => window.removeEventListener('resize', checkMobile)
}, [])

// Verify user role
if (user?.role !== 'VOLUNTEER') {
  console.error('User is not a volunteer:', user?.role)
}

// Check conditional render
if (isMobile && user?.role === 'VOLUNTEER') {
  console.log('Rendering mobile UI')
  return <MobileComponent />
} else {
  console.log('Rendering desktop UI')
  return <DesktopComponent />
}
```

---

### Issue 2: Bottom Navigation Overlapping Content

**Symptoms**:
- Content hidden behind bottom nav
- Can't scroll to bottom items

**Debug Steps**:
```typescript
// Check content wrapper
<div className="min-h-screen bg-slate-100 pb-20">
  {children}
</div>

// Check if pb-20 is applied
console.log('Content padding:', 
  document.querySelector('.content-wrapper')?.style.paddingBottom
)
```

**Solutions**:
```typescript
// Add padding to content
<div className="space-y-4 pb-24">
  {/* Content */}
</div>

// Or use margin on last element
<div className="space-y-4">
  {/* Content */}
  <div className="h-24" /> {/* Spacer */}
</div>
```

---

### Issue 3: Offline Queue Not Working

**Symptoms**:
- Failed requests not queued
- Queue not persisting
- Sync indicator not showing

**Debug Steps**:
```typescript
// Check localStorage
console.log('Queue in localStorage:', 
  localStorage.getItem('offline_queue')
)

// Check queue state
const { queue } = useOfflineQueue()
console.log('Queue state:', queue)

// Check if addToQueue is called
const { addToQueue } = useOfflineQueue()
console.log('Adding to queue:', payload)
addToQueue('DISTRIBUTION', payload)
```

**Solutions**:
```typescript
// Ensure localStorage is available
if (typeof window !== 'undefined' && window.localStorage) {
  localStorage.setItem('offline_queue', JSON.stringify(queue))
}

// Verify queue is loaded on mount
useEffect(() => {
  const stored = localStorage.getItem('offline_queue')
  if (stored) {
    try {
      setQueue(JSON.parse(stored))
    } catch (error) {
      console.error('Failed to parse queue:', error)
      localStorage.removeItem('offline_queue')
    }
  }
}, [])

// Ensure queue is saved on change
useEffect(() => {
  if (queue.length > 0) {
    localStorage.setItem('offline_queue', JSON.stringify(queue))
  }
}, [queue])
```

---

### Issue 4: API Calls Failing

**Symptoms**:
- 401 Unauthorized errors
- Network errors
- CORS errors

**Debug Steps**:
```typescript
// Check Firebase token
const user = auth.currentUser
if (user) {
  const token = await user.getIdToken()
  console.log('Token:', token)
} else {
  console.error('No user logged in')
}

// Check API request
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)
console.log('Request headers:', config.headers)

// Check response
api.interceptors.response.use(
  (response) => {
    console.log('API Success:', response.config.url, response.data)
    return response
  },
  (error) => {
    console.error('API Error:', error.config?.url, error.response?.data)
    return Promise.reject(error)
  }
)
```

**Solutions**:
```typescript
// Verify environment variables
NEXT_PUBLIC_API_URL=http://localhost:5000/api

// Check token is being sent
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token expiration
if (error.response?.status === 401) {
  // Refresh token
  const user = auth.currentUser
  if (user) {
    await user.getIdToken(true) // Force refresh
    // Retry request
  }
}
```

---

### Issue 5: Quantity Stepper Not Working

**Symptoms**:
- Plus/minus buttons not responding
- Value not updating
- Max value not respected

**Debug Steps**:
```typescript
// Check state
console.log('Current value:', value)
console.log('Max value:', max)
console.log('Min value:', min)

// Check onChange
const handleChange = (newValue: number) => {
  console.log('Changing from', value, 'to', newValue)
  onChange(newValue)
}
```

**Solutions**:
```typescript
// Ensure onChange is called correctly
<QuantityStepper
  value={quantity}
  onChange={(newValue) => {
    console.log('New value:', newValue)
    setQuantity(newValue)
  }}
  max={availableStock}
/>

// Verify min/max logic
const handleIncrement = () => {
  const newValue = Math.min(max, value + 1)
  console.log('Increment:', value, '->', newValue)
  onChange(newValue)
}

const handleDecrement = () => {
  const newValue = Math.max(min, value - 1)
  console.log('Decrement:', value, '->', newValue)
  onChange(newValue)
}
```

---

### Issue 6: State Not Persisting

**Symptoms**:
- Form data lost on navigation
- Stock not updating after action
- History not refreshing

**Debug Steps**:
```typescript
// Check if data is being set
console.log('Setting data:', newData)
setData(newData)
console.log('Data after set:', data) // May not update immediately

// Check useEffect dependencies
useEffect(() => {
  console.log('Effect running, data:', data)
  loadData()
}, [data]) // Is this correct?
```

**Solutions**:
```typescript
// Use functional updates
setData(prev => {
  console.log('Previous data:', prev)
  const newData = [...prev, newItem]
  console.log('New data:', newData)
  return newData
})

// Reload data after action
const handleAction = async () => {
  await api.performAction()
  await loadData() // Refresh from server
}

// Use optimistic updates correctly
const handleAction = async () => {
  // Update UI immediately
  setData(prev => prev.map(item => 
    item.id === targetId 
      ? { ...item, stock: item.stock - quantity }
      : item
  ))
  
  try {
    await api.performAction()
  } catch (error) {
    // Revert on failure
    await loadData()
  }
}
```

---

## 🔍 Browser DevTools Tips

### Console Commands

```javascript
// Check current user
console.log('User:', JSON.parse(localStorage.getItem('user')))

// Check offline queue
console.log('Queue:', JSON.parse(localStorage.getItem('offline_queue')))

// Check screen size
console.log('Width:', window.innerWidth, 'Height:', window.innerHeight)

// Check if mobile
console.log('Is Mobile:', window.innerWidth < 768)

// Force mobile view
Object.defineProperty(window, 'innerWidth', { value: 375 })
window.dispatchEvent(new Event('resize'))

// Clear all localStorage
localStorage.clear()

// Check API base URL
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)
```

### Network Tab

- Filter by `XHR` to see API calls
- Check request headers for Authorization token
- Check response status codes
- Check response payloads
- Throttle to `Slow 3G` to test offline mode

### Application Tab

- Check `Local Storage` for offline queue
- Check `Session Storage` for temporary data
- Check `Cookies` for auth tokens
- Clear storage to reset state

---

## 📊 Performance Profiling

### Lighthouse Audit

```bash
# Run Lighthouse
npm install -g lighthouse
lighthouse http://localhost:3000/dashboard --view

# Target scores
Performance: > 90
Accessibility: > 95
Best Practices: > 90
SEO: > 90
```

### React DevTools Profiler

1. Install React DevTools extension
2. Open Profiler tab
3. Start recording
4. Perform actions
5. Stop recording
6. Analyze render times

**Look for**:
- Components rendering unnecessarily
- Slow renders (> 16ms)
- Large component trees
- Expensive calculations

---

## 🚀 Automated Testing (Future)

### Unit Tests (Jest + React Testing Library)

```typescript
// Example: QuantityStepper.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import QuantityStepper from './QuantityStepper'

describe('QuantityStepper', () => {
  it('increments value on plus button click', () => {
    const onChange = jest.fn()
    render(<QuantityStepper value={5} onChange={onChange} max={10} />)
    
    const plusButton = screen.getByLabelText('Increase quantity')
    fireEvent.click(plusButton)
    
    expect(onChange).toHaveBeenCalledWith(6)
  })
  
  it('respects max value', () => {
    const onChange = jest.fn()
    render(<QuantityStepper value={10} onChange={onChange} max={10} />)
    
    const plusButton = screen.getByLabelText('Increase quantity')
    fireEvent.click(plusButton)
    
    expect(onChange).not.toHaveBeenCalled()
  })
})
```

### Integration Tests (Cypress)

```typescript
// Example: distribution.cy.ts
describe('Distribution Flow', () => {
  beforeEach(() => {
    cy.login('volunteer@test.com')
    cy.visit('/dashboard/distribution')
  })
  
  it('completes distribution successfully', () => {
    // Step 1: Select campaign
    cy.contains('Winter Aid Campaign').click()
    cy.contains('Continue').click()
    
    // Step 2: Select items
    cy.get('[data-testid="quantity-stepper-plus"]').first().click()
    cy.contains('Continue').click()
    
    // Step 3: Location
    cy.get('select[name="state"]').select('Maharashtra')
    cy.get('select[name="city"]').select('Mumbai')
    cy.get('input[name="pinCode"]').type('400001')
    cy.get('input[name="area"]').type('Andheri')
    cy.contains('Continue').click()
    
    // Step 4: Beneficiaries
    cy.get('[data-testid="beneficiary-stepper-plus"]').click()
    cy.contains('Continue').click()
    
    // Step 5: Confirm
    cy.contains('Confirm Distribution').click()
    
    // Verify success
    cy.contains('Distribution recorded successfully')
  })
})
```

---

## 📝 Test Report Template

```markdown
# Mobile Volunteer Interface - Test Report

**Date**: _______________
**Tester**: _______________
**Build**: _______________
**Environment**: _______________

## Summary

- Total Tests: ___
- Passed: ___
- Failed: ___
- Blocked: ___
- Pass Rate: ___%

## Critical Issues

1. **Issue**: _______________
   **Severity**: Critical/High/Medium/Low
   **Steps to Reproduce**: _______________
   **Expected**: _______________
   **Actual**: _______________
   **Screenshot**: _______________

## Test Results by Feature

### Authentication
- [ ] Volunteer Login: Pass/Fail
- [ ] Admin Login: Pass/Fail
- [ ] Sign Out: Pass/Fail

### Home Screen
- [ ] Dashboard Load: Pass/Fail
- [ ] Quick Actions: Pass/Fail

### Distribution
- [ ] Complete Flow: Pass/Fail
- [ ] Validation: Pass/Fail
- [ ] Offline Mode: Pass/Fail

### Stock Management
- [ ] View Stock: Pass/Fail
- [ ] Report Damage: Pass/Fail
- [ ] Transfer Stock: Pass/Fail
- [ ] Return Stock: Pass/Fail

### History
- [ ] View History: Pass/Fail
- [ ] Filtering: Pass/Fail

### More
- [ ] Profile Display: Pass/Fail
- [ ] Offline Queue: Pass/Fail
- [ ] Sign Out: Pass/Fail

### Navigation
- [ ] Bottom Nav: Pass/Fail
- [ ] Back Navigation: Pass/Fail

### UI/UX
- [ ] Touch Targets: Pass/Fail
- [ ] Typography: Pass/Fail
- [ ] Spacing: Pass/Fail
- [ ] Colors: Pass/Fail

### Responsive
- [ ] Screen Transitions: Pass/Fail
- [ ] Orientation: Pass/Fail
- [ ] Safe Areas: Pass/Fail

### Performance
- [ ] Load Time: Pass/Fail
- [ ] Transitions: Pass/Fail
- [ ] API Handling: Pass/Fail

## Recommendations

1. _______________
2. _______________
3. _______________

## Sign-off

**Tester**: _______________ **Date**: _______________
**Reviewer**: _______________ **Date**: _______________
```

---

## 🎯 Acceptance Criteria

### Must Have (P0)

- [ ] Volunteer can login and see mobile UI on mobile devices
- [ ] Admin always sees desktop UI
- [ ] All 5 distribution steps work correctly
- [ ] Stock actions (damage, loss, return, transfer) work
- [ ] History shows correct data
- [ ] Offline queue stores failed requests
- [ ] No critical bugs or crashes

### Should Have (P1)

- [ ] Loading states show for all async operations
- [ ] Error messages are clear and helpful
- [ ] Optimistic updates work correctly
- [ ] Touch targets are minimum 48px
- [ ] Text is readable at 360px width
- [ ] Performance meets targets (< 3s load)

### Nice to Have (P2)

- [ ] Smooth animations and transitions
- [ ] Progressive loading of images
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Works offline completely

---

**Testing Guide Version**: 1.0.0
**Last Updated**: 2024
