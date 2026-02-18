import { Campaign, CampaignStatus } from '../../database/models/Campaign';
import { NotFoundError } from '../../utils/errors';
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination';

export class CampaignsService {
  async createCampaign(data: { name: string; startDate: string; endDate: string }) {
    const campaign = await Campaign.create({
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate)
    });
    return campaign;
  }

  async getCampaigns(page?: number, limit?: number) {
    const { page: p, limit: l } = getPaginationParams(page, limit);
    const skip = (p - 1) * l;
    const [campaigns, total] = await Promise.all([
      Campaign.find().skip(skip).limit(l).sort({ createdAt: -1 }),
      Campaign.countDocuments()
    ]);

    return createPaginatedResponse(campaigns, total, p, l);
  }

  async getCampaignById(id: string) {
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }
    return campaign;
  }

  async updateCampaign(id: string, data: any) {
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    const campaign = await Campaign.findByIdAndUpdate(id, data, { new: true });
    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }
    return campaign;
  }
}
