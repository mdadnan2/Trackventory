import { Response, NextFunction } from 'express';
import { ReportsService } from './reports.service';
import { sendSuccess } from '../../utils/response';
import { UserRequest } from '../../middleware/attachUser';

const reportsService = new ReportsService();

export class ReportsController {
  async getCurrentStockSummary(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string);
      const limit = parseInt(req.query.limit as string);
      const summary = await reportsService.getCurrentStockSummary(page, limit);
      sendSuccess(res, summary);
    } catch (error) {
      next(error);
    }
  }

  async getVolunteerStockSummary(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string);
      const limit = parseInt(req.query.limit as string);
      const summary = await reportsService.getVolunteerStockSummary(page, limit);
      sendSuccess(res, summary);
    } catch (error) {
      next(error);
    }
  }

  async getCampaignDistributionSummary(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const campaignId = req.query.campaignId as string;
      const page = parseInt(req.query.page as string);
      const limit = parseInt(req.query.limit as string);
      const summary = await reportsService.getCampaignDistributionSummary(campaignId, page, limit);
      sendSuccess(res, summary);
    } catch (error) {
      next(error);
    }
  }

  async getRepeatDistributionHistory(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string);
      const limit = parseInt(req.query.limit as string);
      const history = await reportsService.getRepeatDistributionHistory(page, limit);
      sendSuccess(res, history);
    } catch (error) {
      next(error);
    }
  }
}
