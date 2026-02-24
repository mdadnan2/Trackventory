# 📦 Package Feature - Test Scenarios

## 🎯 Quick Test Scenarios (30 minutes)

### **Scenario 1: Create Your First Package**
**Goal**: Create a basic package with 3 items

**Steps**:
1. Login as Admin
2. Click "Packages" in sidebar
3. Click "Create Package" button
4. Enter:
   - Name: "Family Relief Kit"
   - Description: "Basic food supplies for family of 4"
   - Add 3 items:
     - Rice: 5 kg
     - Cooking Oil: 2 L
     - Sugar: 1 kg
5. Click "Create"

**Expected Result**:
✅ Package created successfully
✅ Package appears in grid
✅ Shows 3 items
✅ All item details visible

---

### **Scenario 2: Check Stock Availability**
**Goal**: See how many packages can be made

**Steps**:
1. On package card, click "Stock" button
2. View stock summary modal

**Expected Result**:
✅ Shows "Available Packages" count
✅ Shows item breakdown
✅ Identifies bottleneck item (lowest possible packages)

**Example**:
```
Available Packages: 10

Item Breakdown:
- Rice: 50kg available → 10 packages possible
- Oil: 30L available → 15 packages possible
- Sugar: 10kg available → 10 packages possible

Bottleneck: Rice & Sugar (10 packages max)
```

---

### **Scenario 3: Assign Package to Volunteer**
**Goal**: Assign 3 packages to a volunteer

**Prerequisites**: 
- Central warehouse has sufficient stock
- At least 1 volunteer exists

**Steps**:
1. Click "Assign" on package card
2. Select volunteer from dropdown
3. Enter quantity: 3
4. Click "Assign"

**Expected Result**:
✅ Success message shown
✅ Central stock decreased by (3 × package items)
✅ Volunteer stock increased
✅ Can verify in Stock page

**Verify**:
- Go to Stock page
- Check central warehouse stock decreased
- Check volunteer stock increased

---

### **Scenario 4: Insufficient Stock Error**
**Goal**: Test stock validation

**Setup**: 
- Package requires 5kg Rice per package
- Central warehouse has only 10kg Rice

**Steps**:
1. Try to assign 5 packages (needs 25kg Rice)
2. Click "Assign"

**Expected Result**:
❌ Error message: "Insufficient central stock for Rice. Required: 25, Available: 10"
✅ No assignment created
✅ Stock unchanged

---

### **Scenario 5: Edit Package**
**Goal**: Update package contents

**Steps**:
1. Click "Edit" icon on package card
2. Change:
   - Name: "Enhanced Family Kit"
   - Update Rice quantity: 5 → 10 kg
   - Add new item: Lentils 2 kg
3. Click "Update"

**Expected Result**:
✅ Package updated
✅ New quantities shown
✅ New item appears
✅ Existing assignments unchanged (historical data preserved)

---

### **Scenario 6: Delete Package**
**Goal**: Soft delete a package

**Steps**:
1. Click "Delete" icon (trash)
2. Confirm deletion

**Expected Result**:
✅ Package removed from list
✅ Package still in database (isActive = false)
✅ Cannot assign deleted package

---

### **Scenario 7: Mobile Package Distribution**
**Goal**: Volunteer distributes package from mobile

**Prerequisites**:
- Volunteer has packages assigned
- Mobile view (< 768px width)

**Steps**:
1. Login as Volunteer on mobile
2. Navigate to package distribution
3. **Step 1**: Select "Family Relief Kit"
4. **Step 2**: Enter quantity: 1
5. **Step 3**: Select campaign (or skip)
6. **Step 4**: Enter location:
   - City: Karachi
   - Area: Gulshan
   - Address: Block 5
7. **Step 5**: Enter beneficiary:
   - Name: Ahmed Khan
   - Phone: +923001234567
   - Family Size: 6
8. **Step 6**: Review and confirm
9. Click "Confirm Distribution"

**Expected Result**:
✅ Success message
✅ Volunteer stock decreased
✅ Distribution recorded
✅ Can view in distribution history

---

### **Scenario 8: Duplicate Item Prevention**
**Goal**: Test validation

**Steps**:
1. Create package
2. Add Rice: 5 kg
3. Try to add Rice again: 3 kg
4. Click "Create"

**Expected Result**:
❌ Error: "Duplicate items in package"
✅ Package not created

---

### **Scenario 9: Responsive Design Test**
**Goal**: Test on different screen sizes

**Steps**:
1. Open packages page
2. Resize browser:
   - Mobile: 375px width
   - Tablet: 768px width
   - Desktop: 1440px width

**Expected Result**:
✅ Mobile: 1 column, bottom sheet modals
✅ Tablet: 2 columns, centered modals
✅ Desktop: 3 columns, full features
✅ All buttons accessible
✅ Text readable at all sizes

---

### **Scenario 10: Idempotency Test**
**Goal**: Test duplicate request handling

**Steps**:
1. Assign package to volunteer
2. Note the request (network tab)
3. Immediately try to assign same package again (simulate network retry)

**Expected Result**:
✅ Second request returns existing assignment
✅ Response includes "duplicate: true"
✅ Stock deducted only once
✅ Only 1 assignment record created

---

## 🔥 Edge Cases to Test

### **Edge Case 1: Zero Stock**
- Central warehouse empty
- Try to assign package
- Should show: "Available Packages: 0"

### **Edge Case 2: Partial Stock**
- Package needs: 5kg Rice, 2L Oil
- Warehouse has: 10kg Rice, 1L Oil
- Should show: "Available Packages: 0" (Oil is bottleneck)

### **Edge Case 3: Empty Package**
- Try to create package with no items
- Should fail validation

### **Edge Case 4: Negative Quantity**
- Try to enter -5 quantity
- Should fail validation

### **Edge Case 5: Very Large Package**
- Create package with 20+ items
- Should work but may be slow

---

## 📱 Mobile-Specific Tests

### **Test 1: Touch Interactions**
- All buttons at least 48px tall
- Easy to tap on small screens
- No accidental taps

### **Test 2: Portrait/Landscape**
- Rotate device
- Layout adjusts properly
- No content cut off

### **Test 3: Small Screen (iPhone SE)**
- Test on 375px width
- All content visible
- Scrolling works

### **Test 4: Bottom Sheet Modals**
- Swipe down to close (if implemented)
- Backdrop tap closes modal
- Smooth animations

---

## 🎭 User Role Tests

### **Admin Tests**
✅ Can create packages
✅ Can edit packages
✅ Can delete packages
✅ Can assign packages
✅ Can view all packages

### **Volunteer Tests**
✅ Can view packages
✅ Can distribute packages (mobile)
✅ Cannot create packages
✅ Cannot edit packages
✅ Cannot delete packages
✅ Cannot assign packages

---

## ⚡ Performance Tests

### **Test 1: Large Package List**
- Create 50+ packages
- Page loads in < 3 seconds
- Scrolling smooth

### **Test 2: Package with Many Items**
- Create package with 15 items
- Modal loads quickly
- No lag when adding items

### **Test 3: Stock Summary Calculation**
- Package with 10 items
- Stock summary loads in < 500ms
- Accurate calculations

---

## 🔄 Integration Tests

### **Test 1: End-to-End Flow**
```
1. Admin creates package
2. Admin adds stock to warehouse
3. Admin assigns package to volunteer
4. Volunteer distributes package
5. Verify all stock movements correct
```

### **Test 2: Multiple Volunteers**
```
1. Assign same package to 3 volunteers
2. Each gets independent stock
3. Each distributes independently
4. Stock tracking accurate for all
```

### **Test 3: Package Update Impact**
```
1. Create package (5kg Rice)
2. Assign to volunteer
3. Update package (10kg Rice)
4. Verify old assignment unchanged
5. New assignments use new quantity
```

---

## 🐛 Bug Scenarios to Check

### **Bug 1: Stock Calculation**
- Assign package
- Check central stock decreased correctly
- Check volunteer stock increased correctly
- Math should be exact

### **Bug 2: Modal Closing**
- Open create modal
- Click backdrop
- Modal should close
- Form should reset

### **Bug 3: Form Validation**
- Submit empty form
- Should show validation errors
- Should not submit

### **Bug 4: Loading States**
- Click assign button
- Button should show "Assigning..."
- Button should be disabled
- Should not allow double-click

---

## ✅ Quick Checklist

### Before Testing
- [ ] Backend server running
- [ ] Frontend server running
- [ ] Logged in as Admin
- [ ] At least 3 items created
- [ ] At least 1 volunteer created
- [ ] Stock added to central warehouse

### During Testing
- [ ] Create package works
- [ ] Edit package works
- [ ] Delete package works
- [ ] Stock summary accurate
- [ ] Assign package works
- [ ] Stock validation works
- [ ] Mobile distribution works
- [ ] Responsive design works

### After Testing
- [ ] No console errors
- [ ] No network errors
- [ ] Stock calculations correct
- [ ] All data saved properly
- [ ] Can refresh without losing data

---

## 🎯 Priority Test Order

### **High Priority (Must Test)**
1. ✅ Create package
2. ✅ Assign package
3. ✅ Stock validation
4. ✅ Mobile distribution
5. ✅ Stock summary

### **Medium Priority (Should Test)**
6. ✅ Edit package
7. ✅ Delete package
8. ✅ Responsive design
9. ✅ Error handling
10. ✅ Idempotency

### **Low Priority (Nice to Test)**
11. ✅ Edge cases
12. ✅ Performance
13. ✅ Multiple users
14. ✅ Large datasets

---

## 📊 Test Results Template

```
Test Date: ___________
Tester: ___________

Scenario 1: Create Package          [ ] Pass  [ ] Fail
Scenario 2: Stock Summary            [ ] Pass  [ ] Fail
Scenario 3: Assign Package           [ ] Pass  [ ] Fail
Scenario 4: Insufficient Stock       [ ] Pass  [ ] Fail
Scenario 5: Edit Package             [ ] Pass  [ ] Fail
Scenario 6: Delete Package           [ ] Pass  [ ] Fail
Scenario 7: Mobile Distribution      [ ] Pass  [ ] Fail
Scenario 8: Duplicate Prevention     [ ] Pass  [ ] Fail
Scenario 9: Responsive Design        [ ] Pass  [ ] Fail
Scenario 10: Idempotency             [ ] Pass  [ ] Fail

Issues Found:
1. ___________________________
2. ___________________________
3. ___________________________

Overall Status: [ ] Ready  [ ] Needs Work
```

---

## 🚀 Quick Start Testing (5 minutes)

**Fastest way to test core functionality:**

1. **Create Package** (1 min)
   - Name: "Test Kit"
   - Add 2 items with quantities
   - Click Create

2. **Check Stock** (30 sec)
   - Click "Stock" button
   - Verify numbers make sense

3. **Assign Package** (1 min)
   - Click "Assign"
   - Select volunteer
   - Enter quantity: 1
   - Click Assign

4. **Verify Stock** (1 min)
   - Go to Stock page
   - Check central decreased
   - Check volunteer increased

5. **Test Mobile** (1.5 min)
   - Resize browser to 375px
   - Check layout looks good
   - Try distribution flow

**If all 5 pass → Core functionality works! ✅**

---

**Total Scenarios**: 10 main + 5 edge cases + 4 mobile + 2 role + 3 performance + 3 integration = **27 test scenarios**

**Estimated Testing Time**: 
- Quick test: 30 minutes
- Full test: 2-3 hours
- Comprehensive: 4-6 hours
