import dotenv from 'dotenv';
dotenv.config();

import { connectDatabase } from '../database/connection';
import { User, UserRole } from '../database/models/User';
import { auth } from '../utils/firebase';

const createUser = async () => {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error('Usage: npm run create-user <name> <email> <role>');
    console.error('Example: npm run create-user "John Doe" john@example.com ADMIN');
    console.error('Roles: ADMIN, VOLUNTEER');
    process.exit(1);
  }

  const [name, email, role] = args;

  if (!Object.values(UserRole).includes(role as UserRole)) {
    console.error(`Invalid role. Must be: ${Object.values(UserRole).join(', ')}`);
    process.exit(1);
  }

  try {
    await connectDatabase();

    // Create in Firebase
    const firebaseUser = await auth.createUser({ email, displayName: name });
    console.log(`✓ Firebase user created: ${firebaseUser.uid}`);

    // Create in database
    const user = await User.create({ 
      firebaseUid: firebaseUser.uid, 
      name, 
      email, 
      role: role as UserRole 
    });
    
    console.log('✓ Database user created:');
    console.log(JSON.stringify(user, null, 2));
    console.log(`\n⚠️  Send password reset email to: ${email}`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createUser();
