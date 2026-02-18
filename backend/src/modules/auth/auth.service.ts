import { User } from '../../database/models/User';
import { auth } from '../../utils/firebase';
import { UnauthorizedError } from '../../utils/errors';

export class AuthService {
  async login(idToken: string) {
    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;

    // Check if user exists in database by email
    let user = await User.findOne({ email });

    if (!user) {
      throw new UnauthorizedError('You don\'t have access. Please contact administrator.');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError('Your account has been blocked. Please contact administrator.');
    }

    // First time login - update user with Google details
    if (!user.isOnboarded) {
      user.firebaseUid = uid;
      user.name = name || user.name;
      user.email = email || user.email;
      user.isOnboarded = true;
      await user.save();
    }

    return {
      user: {
        _id: user._id,
        id: user._id,
        firebaseUid: user.firebaseUid,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        isOnboarded: user.isOnboarded
      }
    };
  }
}
