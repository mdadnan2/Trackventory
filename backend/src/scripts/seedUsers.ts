import dotenv from 'dotenv';
dotenv.config();

import { connectDatabase } from '../database/connection';
import { User, UserRole } from '../database/models/User';
import { auth } from '../utils/firebase';

const seedUsers = async () => {
  try {
    await connectDatabase();

    const users = [
      { name: "Admin User", email: "admin@trackventory.com", role: UserRole.ADMIN },
      { name: "John Volunteer", email: "john@trackventory.com", role: UserRole.VOLUNTEER },
      { name: "Sarah Volunteer", email: "sarah@trackventory.com", role: UserRole.VOLUNTEER },
      { name: "Mike Volunteer", email: "mike@trackventory.com", role: UserRole.VOLUNTEER }
    ];

    for (const userData of users) {
      try {
        // Check if exists
        const existing = await User.findOne({ email: userData.email });
        if (existing) {
          console.log(`⊘ Skipped ${userData.email} - already exists`);
          continue;
        }

        // Create in Firebase
        const firebaseUser = await auth.createUser({ 
          email: userData.email, 
          displayName: userData.name 
        });

        // Create in database
        await User.create({ 
          firebaseUid: firebaseUser.uid, 
          name: userData.name, 
          email: userData.email, 
          role: userData.role 
        });

        console.log(`✓ Created ${userData.role}: ${userData.email}`);
      } catch (error: any) {
        console.error(`✗ Failed ${userData.email}:`, error.message);
      }
    }

    console.log('\n✓ Seed completed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedUsers();
