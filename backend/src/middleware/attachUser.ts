import { Response, NextFunction } from 'express';
import { User, IUser } from '../database/models/User';
import { AuthRequest } from './verifyFirebaseToken';
import { UnauthorizedError } from '../utils/errors';

export interface UserRequest extends AuthRequest {
  user?: IUser;
}

export const attachUser = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findOne({ firebaseUid: req.firebaseUid });
    
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedError('User not found or blocked');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
