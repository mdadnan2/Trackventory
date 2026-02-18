import { Response, NextFunction } from 'express';
import { UsersService } from './users.service';
import { createUserSchema, updateUserSchema } from './users.validation';
import { sendSuccess } from '../../utils/response';
import { UserRequest } from '../../middleware/attachUser';

const usersService = new UsersService();

export class UsersController {
  async createUser(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const data = createUserSchema.parse(req.body);
      const user = await usersService.createUser(data);
      sendSuccess(res, user, 201);
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string);
      const limit = parseInt(req.query.limit as string);
      const result = await usersService.getUsers(page, limit);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const user = await usersService.getUserById(req.params.id);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const data = updateUserSchema.parse(req.body);
      const user = await usersService.updateUser(req.params.id, data);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }
}
