import dotenv from 'dotenv';
dotenv.config();

import { connectDatabase } from '../database/connection';
import { Item } from '../database/models/Item';

const seedItems = async () => {
  try {
    await connectDatabase();

    const items = [
      { name: "Rice", category: "Food", unit: "kg" },
      { name: "Wheat Flour", category: "Food", unit: "kg" },
      { name: "Cooking Oil", category: "Food", unit: "liters" },
      { name: "Sugar", category: "Food", unit: "kg" },
      { name: "Lentils", category: "Food", unit: "kg" },
      { name: "Canned Beans", category: "Food", unit: "cans" },
      { name: "Water Bottles", category: "Beverages", unit: "bottles" },
      { name: "Blankets", category: "Clothing", unit: "pieces" },
      { name: "Soap", category: "Hygiene", unit: "bars" },
      { name: "Toothpaste", category: "Hygiene", unit: "tubes" },
      { name: "Shampoo", category: "Hygiene", unit: "bottles" },
      { name: "Towels", category: "Clothing", unit: "pieces" }
    ];

    for (const itemData of items) {
      try {
        const existing = await Item.findOne({ name: itemData.name });
        if (existing) {
          console.log(`⊘ Skipped ${itemData.name} - already exists`);
          continue;
        }

        await Item.create(itemData);
        console.log(`✓ Created item: ${itemData.name}`);
      } catch (error: any) {
        console.error(`✗ Failed ${itemData.name}:`, error.message);
      }
    }

    console.log('\n✓ Items seed completed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedItems();
