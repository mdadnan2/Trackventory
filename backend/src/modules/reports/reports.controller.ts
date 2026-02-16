import { Response, NextFunction } from 'express';
import { ReportsService } from './reports.service';
import { sendSuccess } from '../../utils/response';
import { UserRequest } from '../../middleware/attachUser';

const reportsService = new ReportsService();

export class ReportsController {
  async getCurrentStockSummary(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const summary = await reportsService.getCurrentStockSummary();
      sendSuccess(res, summary);
    } catch (error) {
      next(error);
    }
  }

  async getVolunteerStockSummary(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const summary = await reportsService.getVolunteerStockSummary();
      sendSuccess(res, summary);
    } catch (error) {
      next(error);
    }
  }

  async getCampaignDistributionSummary(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const campaignId = req.query.campaignId as string;
      const summary = await reportsService.getCampaignDistributionSummary(campaignId);
      sendSuccess(res, summary);
    } catch (error) {
      next(error);
    }
  }

  async getRepeatDistributionHistory(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const history = await reportsService.getRepeatDistributionHistory();
      sendSuccess(res, history);
    } catch (error) {
      next(error);
    }
  }
}
