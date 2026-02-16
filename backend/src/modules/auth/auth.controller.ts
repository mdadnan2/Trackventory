import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { loginSchema } from './auth.validation';
import { sendSuccess } from '../../utils/response';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { idToken } = loginSchema.parse(req.body);
      const result = await authService.login(idToken);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}
