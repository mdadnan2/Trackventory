import { Response, NextFunction } from 'express';
import { PackagesService } from './packages.service';
import { createPackageSchema, updatePackageSchema, assignPackageSchema, distributePackageSchema, selfAssignPackageSchema } from './packages.validation';
import { sendSuccess } from '../../utils/response';
import { UserRequest } from '../../middleware/attachUser';

const packagesService = new PackagesService();

export class PackagesController {
  async createPackage(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const data = createPackageSchema.parse(req.body);
      const pkg = await packagesService.createPackage(data, req.user!._id.toString());
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

  async deletePackage(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const result = await packagesService.deletePackage(req.params.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async assignPackage(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const data = assignPackageSchema.parse(req.body);
      const result = await packagesService.assignPackage(data, req.user!._id.toString());
      sendSuccess(res, result, result.duplicate ? 200 : 201);
    } catch (error) {
      next(error);
    }
  }

  async distributePackage(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const data = distributePackageSchema.parse(req.body);
      const result = await packagesService.distributePackage(data, req.user!._id.toString());
      sendSuccess(res, result, result.duplicate ? 200 : 201);
    } catch (error) {
      next(error);
    }
  }

  async getPackageStockSummary(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { type, volunteerId } = req.query;
      const location = type ? { type: type as 'central' | 'volunteer', volunteerId: volunteerId as string } : undefined;
      const result = await packagesService.getPackageStockSummary(req.params.id, location);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async selfAssignPackage(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const data = selfAssignPackageSchema.parse(req.body);
      const volunteerId = req.user!._id.toString();
      const result = await packagesService.assignPackage(
        { ...data, volunteerId },
        volunteerId
      );
      sendSuccess(res, result, result.duplicate ? 200 : 201);
    } catch (error) {
      next(error);
    }
  }
}
