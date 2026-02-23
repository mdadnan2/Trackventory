import mongoose from 'mongoose';
import { Distribution } from '../../database/models/Distribution';
import { InventoryTransaction, TransactionType, TransactionDirection } from '../../database/models/InventoryTransaction';
import { Campaign } from '../../database/models/Campaign';
import { Item } from '../../database/models/Item';
import { BadRequestError, NotFoundError, ConflictError } from '../../utils/errors';
import { withTransaction } from '../../utils/transaction';
import { StockService } from '../stock/stock.service';
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination';

const stockService = new StockService();

export class DistributionService {
  async createDistribution(
    volunteerId: string | undefined,
    data: {
      state: string;
      city: string;
      pinCode: string;
      area: string;
      campaignId?: string;
      items: Array<{ itemId: string; quantity: number }>;
      requestId: string;
    },
    performedBy: string
  ) {
    return withTransaction(async (session) => {
      const existingDistribution = await Distribution.findOne({ requestId: data.requestId }).session(session);
      if (existingDistribution) {
        throw new ConflictError('Distribution already recorded (duplicate requestId)');
      }

      if (data.campaignId) {
        const campaign = await Campaign.findById(data.campaignId).session(session);
        if (!campaign) {
          throw new NotFoundError('Campaign not found');
        }
      }

      const itemIds = data.items.map(i => new mongoose.Types.ObjectId(i.itemId));
      const foundItems = await Item.find({ _id: { $in: itemIds }, isActive: true }).session(session);
      
      if (foundItems.length !== itemIds.length) {
        throw new BadRequestError('Some items not found or inactive');
      }

      // Check stock availability
      if (volunteerId) {
        // Distribution from volunteer stock
        const volunteerStock = await stockService.getVolunteerStock(volunteerId, undefined, session);
        const stockMap = new Map(volunteerStock.map(s => [s.itemId.toString(), s.stock]));

        for (const item of data.items) {
          const available = stockMap.get(item.itemId) || 0;
          if (available < item.quantity) {
            const itemName = foundItems.find(i => i._id.toString() === item.itemId)?.name || item.itemId;
            throw new BadRequestError(`Insufficient volunteer stock for ${itemName}. Available: ${available}, Requested: ${item.quantity}`);
          }
        }
      } else {
        // Distribution from central stock
        const centralStock = await stockService.getCentralStock();
        const stockMap = new Map(centralStock.map(s => [s.itemId.toString(), s.stock]));

        for (const item of data.items) {
          const available = stockMap.get(item.itemId) || 0;
          if (available < item.quantity) {
            const itemName = foundItems.find(i => i._id.toString() === item.itemId)?.name || item.itemId;
            throw new BadRequestError(`Insufficient central stock for ${itemName}. Available: ${available}, Requested: ${item.quantity}`);
          }
        }
      }

      const distribution = await Distribution.create([{
        volunteerId: volunteerId ? new mongoose.Types.ObjectId(volunteerId) : new mongoose.Types.ObjectId(performedBy),
        state: data.state,
        city: data.city,
        pinCode: data.pinCode,
        area: data.area,
        campaignId: data.campaignId ? new mongoose.Types.ObjectId(data.campaignId) : undefined,
        items: data.items.map(i => ({
          itemId: new mongoose.Types.ObjectId(i.itemId),
          quantity: i.quantity
        })),
        requestId: data.requestId
      }], { session });

      const transactions = data.items.map(item => ({
        itemId: new mongoose.Types.ObjectId(item.itemId),
        type: volunteerId ? TransactionType.DISTRIBUTION : TransactionType.CENTRAL_DISTRIBUTION,
        direction: TransactionDirection.OUT,
        quantity: item.quantity,
        referenceType: 'Distribution',
        referenceId: distribution[0]._id,
        performedBy: volunteerId ? new mongoose.Types.ObjectId(volunteerId) : new mongoose.Types.ObjectId(performedBy)
      }));

      await InventoryTransaction.insertMany(transactions, { session });

      return distribution[0];
    });
  }

  async reportDamage(
    volunteerId: string | undefined,
    data: {
      items: Array<{ itemId: string; quantity: number }>;
      requestId: string;
    },
    performedBy: string
  ) {
    return withTransaction(async (session) => {
      const existingTransaction = await InventoryTransaction.findOne({
        type: TransactionType.DAMAGE,
        referenceId: data.requestId
      }).session(session);
      
      if (existingTransaction) {
        throw new ConflictError('Damage already recorded (duplicate requestId)');
      }

      const itemIds = data.items.map(i => new mongoose.Types.ObjectId(i.itemId));
      const foundItems = await Item.find({ _id: { $in: itemIds }, isActive: true }).session(session);
      
      if (foundItems.length !== itemIds.length) {
        throw new BadRequestError('Some items not found or inactive');
      }

      // Check stock availability
      if (volunteerId) {
        // Damage from volunteer stock
        const volunteerStock = await stockService.getVolunteerStock(volunteerId, undefined, session);
        const stockMap = new Map(volunteerStock.map(s => [s.itemId.toString(), s.stock]));

        for (const item of data.items) {
          const available = stockMap.get(item.itemId) || 0;
          if (available < item.quantity) {
            const itemName = foundItems.find(i => i._id.toString() === item.itemId)?.name || item.itemId;
            throw new BadRequestError(`Insufficient volunteer stock for ${itemName}. Available: ${available}, Requested: ${item.quantity}`);
          }
        }
      } else {
        // Damage from central stock
        const centralStock = await stockService.getCentralStock();
        const stockMap = new Map(centralStock.map(s => [s.itemId.toString(), s.stock]));

        for (const item of data.items) {
          const available = stockMap.get(item.itemId) || 0;
          if (available < item.quantity) {
            const itemName = foundItems.find(i => i._id.toString() === item.itemId)?.name || item.itemId;
            throw new BadRequestError(`Insufficient central stock for ${itemName}. Available: ${available}, Requested: ${item.quantity}`);
          }
        }
      }

      const transactions = data.items.map(item => ({
        itemId: new mongoose.Types.ObjectId(item.itemId),
        type: volunteerId ? TransactionType.DAMAGE : TransactionType.CENTRAL_DAMAGE,
        direction: TransactionDirection.OUT,
        quantity: item.quantity,
        referenceType: 'DamageReport',
        referenceId: data.requestId,
        performedBy: volunteerId ? new mongoose.Types.ObjectId(volunteerId) : new mongoose.Types.ObjectId(performedBy)
      }));

      await InventoryTransaction.insertMany(transactions, { session });

      return { success: true, message: 'Damage reported successfully' };
    });
  }

  async getDistributions(page?: number, limit?: number, filters?: any) {
    const { page: p, limit: l } = getPaginationParams(page, limit);
    const skip = (p - 1) * l;
    const query: any = {};

    if (filters?.volunteerId) query.volunteerId = new mongoose.Types.ObjectId(filters.volunteerId);
    if (filters?.city) query.city = filters.city;
    if (filters?.campaignId) query.campaignId = new mongoose.Types.ObjectId(filters.campaignId);

    console.log('Distribution Query:', query);

    const [distributions, total] = await Promise.all([
      Distribution.find(query)
        .populate('volunteerId', 'name email')
        .populate('campaignId', 'name')
        .populate('items.itemId', 'name unit')
        .skip(skip)
        .limit(l)
        .sort({ createdAt: -1 }),
      Distribution.countDocuments(query)
    ]);

    console.log('Found distributions:', distributions.length, 'Total:', total);

    return createPaginatedResponse(distributions, total, p, l);
  }
}
