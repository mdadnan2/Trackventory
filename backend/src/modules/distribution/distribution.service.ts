import mongoose from 'mongoose';
import { Distribution } from '../../database/models/Distribution';
import { InventoryTransaction, TransactionType, TransactionDirection } from '../../database/models/InventoryTransaction';
import { Campaign } from '../../database/models/Campaign';
import { Item } from '../../database/models/Item';
import { Package } from '../../database/models/Package';
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
      packages: Array<{ packageId: string; quantity: number }>;
      requestId: string;
    },
    performedBy: string
  ) {
    if (!volunteerId) {
      throw new BadRequestError('Volunteer ID is required');
    }
    
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

      // Expand packages into items
      const expandedItems = [...data.items];
      const stockRequirements = new Map<string, number>();
      
      // Add individual items to requirements
      data.items.forEach(item => {
        stockRequirements.set(item.itemId, (stockRequirements.get(item.itemId) || 0) + item.quantity);
      });
      
      // Process packages
      if (data.packages.length > 0) {
        const packageIds = data.packages.map(p => new mongoose.Types.ObjectId(p.packageId));
        const foundPackages = await Package.find({ _id: { $in: packageIds }, isActive: true }).session(session);
        
        if (foundPackages.length !== packageIds.length) {
          throw new BadRequestError('Some packages not found or inactive');
        }
        
        // Expand packages into items and add to requirements
        for (const pkgData of data.packages) {
          const pkg = foundPackages.find(p => p._id.toString() === pkgData.packageId);
          if (!pkg) continue;
          
          pkg.items.forEach(pkgItem => {
            const itemId = pkgItem.itemId.toString();
            const totalQty = pkgItem.quantity * pkgData.quantity;
            
            stockRequirements.set(itemId, (stockRequirements.get(itemId) || 0) + totalQty);
            expandedItems.push({ itemId, quantity: totalQty });
          });
        }
      }

      // Validate all items exist
      const allItemIds = Array.from(stockRequirements.keys()).map(id => new mongoose.Types.ObjectId(id));
      const foundItems = await Item.find({ _id: { $in: allItemIds }, isActive: true }).session(session);
      
      if (foundItems.length !== allItemIds.length) {
        throw new BadRequestError('Some items not found or inactive');
      }

      // Check stock availability
      if (volunteerId) {
        const volunteerStock = await stockService.getVolunteerStock(volunteerId, undefined, session);
        const stockMap = new Map(volunteerStock.map(s => [s.itemId.toString(), s.stock]));

        for (const [itemId, required] of stockRequirements) {
          const available = stockMap.get(itemId) || 0;
          if (available < required) {
            const itemName = foundItems.find(i => i._id.toString() === itemId)?.name || itemId;
            throw new BadRequestError(`Insufficient volunteer stock for ${itemName}. Available: ${available}, Required: ${required}`);
          }
        }
      } else {
        const centralStock = await stockService.getCentralStock();
        const stockMap = new Map(centralStock.map(s => [s.itemId.toString(), s.stock]));

        for (const [itemId, required] of stockRequirements) {
          const available = stockMap.get(itemId) || 0;
          if (available < required) {
            const itemName = foundItems.find(i => i._id.toString() === itemId)?.name || itemId;
            throw new BadRequestError(`Insufficient central stock for ${itemName}. Available: ${available}, Required: ${required}`);
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
        items: expandedItems.map(i => ({
          itemId: new mongoose.Types.ObjectId(i.itemId),
          quantity: i.quantity
        })),
        requestId: data.requestId
      }], { session });

      const transactions = expandedItems.map(item => ({
        itemId: new mongoose.Types.ObjectId(item.itemId),
        type: volunteerId ? TransactionType.DISTRIBUTION : TransactionType.CENTRAL_DISTRIBUTION,
        direction: TransactionDirection.OUT,
        quantity: item.quantity,
        referenceType: 'Distribution',
        referenceId: distribution[0]._id,
        performedBy: volunteerId ? new mongoose.Types.ObjectId(volunteerId) : new mongoose.Types.ObjectId(performedBy),
        metadata: data.packages.length > 0 ? { hasPackages: true } : undefined
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
    if (!volunteerId) {
      throw new BadRequestError('Volunteer ID is required');
    }
    
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

    const [distributions, packageDistributions, totalDist, totalPkg] = await Promise.all([
      Distribution.find(query)
        .populate('volunteerId', 'name email')
        .populate('campaignId', 'name')
        .populate('items.itemId', 'name unit')
        .sort({ createdAt: -1 }),
      filters?.volunteerId ? 
        mongoose.model('PackageDistribution').find({ volunteerId: query.volunteerId })
          .populate('volunteerId', 'name email')
          .populate('campaignId', 'name')
          .populate('location.cityId', 'name')
          .populate({
            path: 'packageId',
            populate: { path: 'items.itemId', select: 'name unit' }
          })
          .sort({ createdAt: -1 }) : [],
      Distribution.countDocuments(query),
      filters?.volunteerId ? mongoose.model('PackageDistribution').countDocuments({ volunteerId: query.volunteerId }) : 0
    ]);

    const pkgDists = (packageDistributions as any[]).map(pd => ({
      _id: pd._id,
      volunteerId: pd.volunteerId,
      campaignId: pd.campaignId,
      createdAt: pd.createdAt,
      city: pd.location?.cityId?.name || '',
      area: pd.location?.address || '',
      pinCode: '',
      items: pd.packageId?.items?.map((item: any) => ({
        itemId: item.itemId,
        quantity: item.quantity * pd.quantity
      })) || [],
      isPackage: true,
      packageName: pd.packageId?.name
    }));

    const combined = [...distributions, ...pkgDists].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = totalDist + totalPkg;
    const paginated = combined.slice(skip, skip + l);

    return createPaginatedResponse(paginated, total, p, l);
  }
}
