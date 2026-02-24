// Run this in MongoDB shell or MongoDB Compass

// Connect to your database
use trackventory

// Drop the unique index on name field
db.packages.dropIndex("name_1")

// Verify indexes
db.packages.getIndexes()

console.log("Unique index on 'name' field has been dropped");
console.log("You can now create packages with the same name as deleted packages");
