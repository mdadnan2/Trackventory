import { Request, Response, NextFunction } from 'express';
import { auth } from '../utils/firebase';
import { UnauthorizedError } from '../utils/errors';

export interface AuthRequest extends Request {
  firebaseUid?: string;
}

export const verifyFirebaseToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.firebaseUid = decodedToken.uid;
    
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid token'));
  }
};
