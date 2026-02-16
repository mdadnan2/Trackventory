// Sample Data Seed Script
// Run this in MongoDB shell or Compass after creating your first admin user

// 1. Sample Cities
db.cities.insertMany([
  { name: "New York", createdAt: new Date() },
  { name: "Los Angeles", createdAt: new Date() },
  { name: "Chicago", createdAt: new Date() },
  { name: "Houston", createdAt: new Date() },
  { name: "Phoenix", createdAt: new Date() }
]);

// 2. Sample Items
db.items.insertMany([
  { name: "Rice", category: "Food", unit: "kg", isActive: true, createdAt: new Date() },
  { name: "Wheat Flour", category: "Food", unit: "kg", isActive: true, createdAt: new Date() },
  { name: "Cooking Oil", category: "Food", unit: "liters", isActive: true, createdAt: new Date() },
  { name: "Blankets", category: "Clothing", unit: "pieces", isActive: true, createdAt: new Date() },
  { name: "Water Bottles", category: "Beverages", unit: "bottles", isActive: true, createdAt: new Date() },
  { name: "Canned Beans", category: "Food", unit: "cans", isActive: true, createdAt: new Date() },
  { name: "Soap", category: "Hygiene", unit: "bars", isActive: true, createdAt: new Date() },
  { name: "Toothpaste", category: "Hygiene", unit: "tubes", isActive: true, createdAt: new Date() }
]);

// 3. Sample Campaign
db.campaigns.insertMany([
  {
    name: "Winter Relief 2024",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-03-31"),
    status: "ACTIVE",
    createdAt: new Date()
  },
  {
    name: "Summer Food Drive",
    startDate: new Date("2024-06-01"),
    endDate: new Date("2024-08-31"),
    status: "ACTIVE",
    createdAt: new Date()
  }
]);

// 4. Sample Package
// First, get item IDs
const riceId = db.items.findOne({ name: "Rice" })._id;
const flourId = db.items.findOne({ name: "Wheat Flour" })._id;
const oilId = db.items.findOne({ name: "Cooking Oil" })._id;

db.packages.insertOne({
  name: "Basic Food Package",
  items: [
    { itemId: riceId, quantity: 5 },
    { itemId: flourId, quantity: 3 },
    { itemId: oilId, quantity: 2 }
  ],
  isActive: true,
  createdAt: new Date()
});

// 5. Sample Volunteer User (replace firebaseUid with actual value)
db.users.insertOne({
  firebaseUid: "VOLUNTEER-FIREBASE-UID",
  name: "John Volunteer",
  email: "volunteer@example.com",
  role: "VOLUNTEER",
  status: "ACTIVE",
  createdAt: new Date()
});

// Note: To add initial stock and assign to volunteers, use the API endpoints
// This ensures proper transaction recording in inventory_transactions

console.log("Sample data inserted successfully!");
console.log("Next steps:");
console.log("1. Use the admin dashboard to add initial stock");
console.log("2. Assign stock to volunteers");
console.log("3. Volunteers can then record distributions");
