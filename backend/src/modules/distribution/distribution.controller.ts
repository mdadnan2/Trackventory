import { Response, NextFunction } from 'express';
import { DistributionService } from './distribution.service';
import { createDistributionSchema, reportDamageSchema } from './distribution.validation';
import { sendSuccess } from '../../utils/response';
import { UserRequest } from '../../middleware/attachUser';

const distributionService = new DistributionService();

export class DistributionController {
  async createDistribution(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const data = createDistributionSchema.parse(req.body);
      const distribution = await distributionService.createDistribution(req.user!._id.toString(), data);
      sendSuccess(res, distribution, 201);
    } catch (error) {
      next(error);
    }
  }

  async reportDamage(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const data = reportDamageSchema.parse(req.body);
      const result = await distributionService.reportDamage(req.user!._id.toString(), data);
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  async getDistributions(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string);
      const limit = parseInt(req.query.limit as string);
      const filters = {
        volunteerId: req.query.volunteerId as string,
        cityId: req.query.cityId as string,
        campaignId: req.query.campaignId as string
      };
      const result = await distributionService.getDistributions(page, limit, filters);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}
