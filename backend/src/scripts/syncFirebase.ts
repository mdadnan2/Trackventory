import dotenv from 'dotenv';
dotenv.config();

import { connectDatabase } from '../database/connection';
import { User } from '../database/models/User';
import { auth } from '../utils/firebase';

const syncToFirebase = async () => {
  try {
    await connectDatabase();
    
    const users = await User.find();
    console.log(`Found ${users.length} users in database\n`);

    for (const user of users) {
      try {
        // Check if already exists in Firebase
        await auth.getUser(user.firebaseUid);
        console.log(`✓ ${user.email} - Already in Firebase`);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          // Create in Firebase with the same UID
          await auth.createUser({
            uid: user.firebaseUid,
            email: user.email,
            displayName: user.name
          });
          console.log(`✓ ${user.email} - Created in Firebase`);
        } else {
          console.error(`✗ ${user.email} - Error:`, error.message);
        }
      }
    }

    console.log('\n✓ Sync completed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

syncToFirebase();
