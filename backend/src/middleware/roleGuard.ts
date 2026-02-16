import { Response, NextFunction } from 'express';
import { UserRequest } from './attachUser';
import { ForbiddenError } from '../utils/errors';
import { UserRole } from '../database/models/User';

export const roleGuard = (...allowedRoles: UserRole[]) => {
  return (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    next();
  };
};
