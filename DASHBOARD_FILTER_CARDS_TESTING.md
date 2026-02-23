# Dashboard Filter Cards - Quick Testing Guide

## 🚀 Quick Start

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Access Dashboard
```
http://localhost:3000/dashboard
```

---

## ✅ Testing Checklist

### **Card 1: Filter Dropdown**

#### Test 1: Default Filter (Today)
- [ ] Dashboard loads with "Today" selected
- [ ] Date range shows today's date
- [ ] Metrics display correctly

#### Test 2: Week Filter
- [ ] Select "This Week" from dropdown
- [ ] Date range shows Sunday to today
- [ ] Metrics update automatically
- [ ] If today is Sunday, shows only today
- [ ] If today is Saturday, shows full week

#### Test 3: Month Filter
- [ ] Select "This Month" from dropdown
- [ ] Date range shows 1st of month to today
- [ ] Metrics update correctly

#### Test 4: Year Filter
- [ ] Select "This Year" from dropdown
- [ ] Date range shows Jan 1 to today
- [ ] Metrics update correctly

#### Test 5: Custom Range
- [ ] Select "Custom Range" from dropdown
- [ ] Two date pickers appear
- [ ] Select "From" date
- [ ] Select "To" date
- [ ] Metrics update after both dates selected
- [ ] Can select past dates
- [ ] Can select future dates (should show 0 or current data)

---

### **Card 2: In Stock**

#### Test 6: Total Display
- [ ] Large number displays correctly
- [ ] Number formatted with commas (e.g., 12,450)
- [ ] Shows 0 if no stock

#### Test 7: Breakdown
- [ ] Central stock shows correct value
- [ ] Volunteers stock shows correct value
- [ ] Central + Volunteers = Total
- [ ] Values update when filter changes

#### Test 8: Loading State
- [ ] Skeleton animation shows while loading
- [ ] Smooth transition to actual data
- [ ] No flash of wrong data

---

### **Card 3: With Volunteers**

#### Test 9: Items Count
- [ ] Total items displays correctly
- [ ] "items" label shows below number
- [ ] Number formatted with commas

#### Test 10: Volunteer Count
- [ ] Shows correct number of volunteers
- [ ] Format: "Across X volunteers"
- [ ] Volunteer count highlighted in purple
- [ ] Shows 0 if no volunteers have stock

#### Test 11: Loading State
- [ ] Skeleton animation shows while loading
- [ ] Smooth transition to actual data

---

## 🔍 Edge Cases

### Test 12: No Data Scenarios
- [ ] Empty database shows 0 for all metrics
- [ ] No volunteers with stock shows 0 volunteers
- [ ] No central stock shows 0 central

### Test 13: Large Numbers
- [ ] Test with 1,000+ items
- [ ] Test with 10,000+ items
- [ ] Test with 100,000+ items
- [ ] Numbers format correctly with commas

### Test 14: Date Edge Cases
- [ ] Select same date for From and To (custom)
- [ ] Select To date before From date
- [ ] Select dates far in the past
- [ ] Select dates in the future

### Test 15: Filter Switching
- [ ] Switch from Today to Week
- [ ] Switch from Week to Month
- [ ] Switch from Month to Year
- [ ] Switch from Year to Custom
- [ ] Switch from Custom back to Today
- [ ] Rapid filter switching (no errors)

---

## 🎨 Visual Testing

### Test 16: Layout
- [ ] Three cards in a row on desktop
- [ ] Cards stack on mobile
- [ ] Equal height cards
- [ ] Proper spacing between cards

### Test 17: Icons
- [ ] Calendar icon shows in Card 1 (Indigo)
- [ ] Package icon shows in Card 2 (Green)
- [ ] Users icon shows in Card 3 (Purple)
- [ ] Icons are white on gradient background

### Test 18: Typography
- [ ] Card titles are bold and readable
- [ ] Large numbers are prominent
- [ ] Breakdown text is smaller but clear
- [ ] Date range label is visible

### Test 19: Colors
- [ ] Card 1: Indigo gradient
- [ ] Card 2: Green gradient
- [ ] Card 3: Purple gradient
- [ ] Consistent border colors
- [ ] Proper text contrast

### Test 20: Animations
- [ ] Cards fade in on load
- [ ] Stagger effect (Card 1 → 2 → 3)
- [ ] Smooth transitions
- [ ] Loading skeletons pulse

---

## 🔧 API Testing

### Test 21: API Endpoint
```bash
# Test without dates (all data)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/reports/dashboard-metrics

# Test with date range
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/reports/dashboard-metrics?startDate=2024-01-01&endDate=2024-12-31"
```

Expected Response:
```json
{
  "success": true,
  "data": {
    "inStock": {
      "total": 12450,
      "central": 8200,
      "volunteers": 4250
    },
    "withVolunteers": {
      "totalItems": 4250,
      "volunteersCount": 23
    }
  }
}
```

### Test 22: API Error Handling
- [ ] Invalid date format returns error
- [ ] Missing auth token returns 401
- [ ] Invalid token returns 401
- [ ] Server error returns 500

---

## 📱 Responsive Testing

### Test 23: Desktop (1920x1080)
- [ ] Three cards in a row
- [ ] Proper spacing
- [ ] All content visible

### Test 24: Laptop (1366x768)
- [ ] Three cards in a row
- [ ] Content not cramped
- [ ] Readable text

### Test 25: Tablet (768x1024)
- [ ] Cards may wrap to 2 rows
- [ ] Still readable
- [ ] Touch-friendly dropdowns

### Test 26: Mobile (375x667)
- [ ] Cards stack vertically
- [ ] Full width cards
- [ ] Date pickers work on touch
- [ ] Dropdown works on touch

---

## 🐛 Bug Testing

### Test 27: Console Errors
- [ ] No errors in browser console
- [ ] No warnings in browser console
- [ ] No network errors

### Test 28: Memory Leaks
- [ ] Switch filters multiple times
- [ ] No memory increase
- [ ] No performance degradation

### Test 29: Race Conditions
- [ ] Rapidly switch filters
- [ ] Correct data displays
- [ ] No stale data shown

### Test 30: Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## 📊 Data Validation

### Test 31: Stock Calculations
```
Verify:
Central Stock = STOCK_IN + RETURN_TO_CENTRAL - ISSUE_TO_VOLUNTEER
Volunteer Stock = ISSUE_TO_VOLUNTEER - (DISTRIBUTION + DAMAGE + RETURN)
Total = Central + Volunteer
```

### Test 32: Volunteer Count
```
Verify:
- Only counts volunteers with stock > 0
- Doesn't count volunteers with 0 stock
- Doesn't count duplicate volunteers
```

### Test 33: Date Filtering
```
Verify:
- Only transactions within date range counted
- Transactions on start date included
- Transactions on end date included
- Transactions outside range excluded
```

---

## 🎯 Performance Testing

### Test 34: Load Time
- [ ] Cards load within 1 second
- [ ] API response within 500ms
- [ ] Smooth animations (60fps)

### Test 35: Large Dataset
- [ ] Test with 1,000+ transactions
- [ ] Test with 10,000+ transactions
- [ ] No lag or freezing

### Test 36: Network Conditions
- [ ] Fast 3G: Acceptable load time
- [ ] Slow 3G: Shows loading state
- [ ] Offline: Shows error gracefully

---

## 🔐 Security Testing

### Test 37: Authentication
- [ ] Unauthenticated users can't access
- [ ] Volunteers can't see admin dashboard
- [ ] Only admins see filter cards

### Test 38: Authorization
- [ ] API requires valid token
- [ ] Expired tokens rejected
- [ ] Invalid tokens rejected

---

## ✨ User Experience Testing

### Test 39: First Time User
- [ ] Intuitive filter selection
- [ ] Clear what each card shows
- [ ] Date range label helpful

### Test 40: Power User
- [ ] Quick filter switching
- [ ] Custom range easy to use
- [ ] Metrics update fast

---

## 📝 Test Data Setup

### Create Test Data
```javascript
// Add stock to central
POST /api/stock/add
{
  "itemId": "ITEM_ID",
  "quantity": 1000,
  "requestId": "unique-id"
}

// Assign to volunteer
POST /api/stock/assign
{
  "volunteerId": "VOLUNTEER_ID",
  "itemId": "ITEM_ID",
  "quantity": 500,
  "requestId": "unique-id"
}

// Create distribution
POST /api/distribution
{
  "volunteerId": "VOLUNTEER_ID",
  "items": [{ "itemId": "ITEM_ID", "quantity": 100 }],
  "cityId": "CITY_ID",
  "area": "Test Area",
  "requestId": "unique-id"
}
```

---

## 🎉 Success Criteria

All tests pass when:
- ✅ All 40 tests complete successfully
- ✅ No console errors
- ✅ Smooth user experience
- ✅ Accurate data display
- ✅ Fast load times
- ✅ Responsive on all devices
- ✅ Secure and authenticated

---

## 🚨 Common Issues & Solutions

### Issue 1: Metrics show 0
**Solution**: Check if there's data in the database

### Issue 2: Date range not updating
**Solution**: Check browser console for API errors

### Issue 3: Custom dates not working
**Solution**: Ensure both From and To dates are selected

### Issue 4: Loading forever
**Solution**: Check backend is running and API is accessible

### Issue 5: Cards not showing
**Solution**: Ensure user is logged in as ADMIN

---

## 📞 Support

If tests fail:
1. Check backend logs
2. Check browser console
3. Verify database connection
4. Ensure Firebase auth is working
5. Check API endpoint is accessible

---

**Happy Testing! 🎉**
