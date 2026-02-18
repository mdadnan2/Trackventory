import { Response, NextFunction } from 'express';
import { PackagesService } from './packages.service';
import { createPackageSchema, updatePackageSchema } from './packages.validation';
import { sendSuccess } from '../../utils/response';
import { UserRequest } from '../../middleware/attachUser';

const packagesService = new PackagesService();

export class PackagesController {
  async createPackage(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const data = createPackageSchema.parse(req.body);
      const pkg = await packagesService.createPackage(data);
      sendSuccess(res, pkg, 201);
    } catch (error) {
      next(error);
    }
  }

  async getPackages(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string);
      const limit = parseInt(req.query.limit as string);
      const result = await packagesService.getPackages(page, limit);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getPackageById(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const pkg = await packagesService.getPackageById(req.params.id);
      sendSuccess(res, pkg);
    } catch (error) {
      next(error);
    }
  }

  async updatePackage(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const data = updatePackageSchema.parse(req.body);
      const pkg = await packagesService.updatePackage(req.params.id, data);
      sendSuccess(res, pkg);
    } catch (error) {
      next(error);
    }
  }
}
