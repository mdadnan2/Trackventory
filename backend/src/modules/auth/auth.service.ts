import { User } from '../../database/models/User';
import { auth } from '../../utils/firebase';
import { UnauthorizedError } from '../../utils/errors';

export class AuthService {
  async login(idToken: string) {
    const decodedToken = await auth.verifyIdToken(idToken);
    const user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedError('User not authorized');
    }

    return {
      user: {
        _id: user._id,
        id: user._id,
        firebaseUid: user.firebaseUid,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    };
  }
}
