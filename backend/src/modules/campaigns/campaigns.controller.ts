import { Response, NextFunction } from 'express';
import { CampaignsService } from './campaigns.service';
import { createCampaignSchema, updateCampaignSchema } from './campaigns.validation';
import { sendSuccess } from '../../utils/response';
import { UserRequest } from '../../middleware/attachUser';

const campaignsService = new CampaignsService();

export class CampaignsController {
  async createCampaign(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const data = createCampaignSchema.parse(req.body);
      const campaign = await campaignsService.createCampaign(data);
      sendSuccess(res, campaign, 201);
    } catch (error) {
      next(error);
    }
  }

  async getCampaigns(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string);
      const limit = parseInt(req.query.limit as string);
      const result = await campaignsService.getCampaigns(page, limit);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getCampaignById(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const campaign = await campaignsService.getCampaignById(req.params.id);
      sendSuccess(res, campaign);
    } catch (error) {
      next(error);
    }
  }

  async updateCampaign(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const data = updateCampaignSchema.parse(req.body);
      const campaign = await campaignsService.updateCampaign(req.params.id, data);
      sendSuccess(res, campaign);
    } catch (error) {
      next(error);
    }
  }
}
