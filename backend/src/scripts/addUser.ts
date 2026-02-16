import dotenv from 'dotenv';
dotenv.config();

import { connectDatabase } from '../database/connection';
import { User, UserRole } from '../database/models/User';

const addUser = async () => {
  const args = process.argv.slice(2);
  
  if (args.length < 4) {
    console.error('Usage: npm run add-user <firebaseUid> <name> <email> <role>');
    console.error('Example: npm run add-user abc123 "John Doe" john@example.com ADMIN');
    console.error('Roles: ADMIN, VOLUNTEER');
    process.exit(1);
  }

  const [firebaseUid, name, email, role] = args;

  if (!Object.values(UserRole).includes(role as UserRole)) {
    console.error(`Invalid role. Must be: ${Object.values(UserRole).join(', ')}`);
    process.exit(1);
  }

  try {
    await connectDatabase();
    
    const existing = await User.findOne({ $or: [{ firebaseUid }, { email }] });
    if (existing) {
      console.error('User already exists with this Firebase UID or email');
      process.exit(1);
    }

    const user = await User.create({ firebaseUid, name, email, role: role as UserRole });
    console.log('✓ User created successfully:');
    console.log(JSON.stringify(user, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error creating user:', error);
    process.exit(1);
  }
};

addUser();
