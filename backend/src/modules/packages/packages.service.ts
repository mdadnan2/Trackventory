import { Package } from '../../database/models/Package';
import { PackageAssignment } from '../../database/models/PackageAssignment';
import { PackageDistribution } from '../../database/models/PackageDistribution';
import { Item } from '../../database/models/Item';
import { User, UserRole } from '../../database/models/User';
import { InventoryTransaction, TransactionType, TransactionDirection } from '../../database/models/InventoryTransaction';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import mongoose from 'mongoose';
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination';
import { withTransaction } from '../../utils/transaction';

export class PackagesService {
  async createPackage(data: { name: string; description?: string; items: Array<{ itemId: string; quantity: number }> }, createdBy: string) {
    // Check for duplicate name among active packages
    const existingPackage = await Package.findOne({ name: data.name, isActive: true });
    if (existingPackage) {
      throw new BadRequestError('A package with this name already exists');
    }

    const itemIds = data.items.map(i => new mongoose.Types.ObjectId(i.itemId));
    
    // Check for duplicate items first
    const uniqueItems = new Set(data.items.map(i => i.itemId));
    if (uniqueItems.size !== data.items.length) {
      throw new BadRequestError('Duplicate items in package');
    }
    
    // Then check if items exist
    const items = await Item.find({ _id: { $in: itemIds }, isActive: true });
    if (items.length !== itemIds.length) {
      throw new BadRequestError('Some items not found or inactive');
    }

    const pkg = await Package.create({ ...data, createdBy: new mongoose.Types.ObjectId(createdBy) });
    return pkg.populate('items.itemId');
  }

  async getPackages(page?: number, limit?: number) {
    const { page: p, limit: l } = getPaginationParams(page, limit);
    const skip = (p - 1) * l;
    const [packages, total] = await Promise.all([
      Package.find({ isActive: true }).populate('items.itemId').skip(skip).limit(l).sort({ name: 1 }),
      Package.countDocuments({ isActive: true })
    ]);

    return createPaginatedResponse(packages, total, p, l);
  }

  async getPackageById(id: string) {
    const pkg = await Package.findById(id).populate('items.itemId');
    if (!pkg) {
      throw new NotFoundError('Package not found');
    }
    return pkg;
  }

  async updatePackage(id: string, data: any) {
    if (data.name) {
      // Check for duplicate name among active packages (excluding current package)
      const existingPackage = await Package.findOne({ 
        name: data.name, 
        isActive: true,
        _id: { $ne: id }
      });
      if (existingPackage) {
        throw new BadRequestError('A package with this name already exists');
      }
    }

    if (data.items) {
      const itemIds = data.items.map((i: any) => new mongoose.Types.ObjectId(i.itemId));
      
      // Check for duplicate items first
      const uniqueItems = new Set(data.items.map((i: any) => i.itemId));
      if (uniqueItems.size !== data.items.length) {
        throw new BadRequestError('Duplicate items in package');
      }
      
      // Then check if items exist
      const items = await Item.find({ _id: { $in: itemIds }, isActive: true });
      if (items.length !== itemIds.length) {
        throw new BadRequestError('Some items not found or inactive');
      }
    }

    const pkg = await Package.findByIdAndUpdate(id, data, { new: true }).populate('items.itemId');
    if (!pkg) {
      throw new NotFoundError('Package not found');
    }
    return pkg;
  }

  async deletePackage(id: string) {
    const pkg = await Package.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!pkg) {
      throw new NotFoundError('Package not found');
    }
    return { success: true, message: 'Package deleted successfully' };
  }

  private async getCentralStockForItem(itemId: mongoose.Types.ObjectId, session?: any): Promise<number> {
    const pipeline = [
      { $match: { itemId } },
      {
        $group: {
          _id: null,
          totalStockIn: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$type', TransactionType.STOCK_IN] },
                  { $eq: ['$direction', TransactionDirection.IN] }
                ]},
                '$quantity',
                0
              ]
            }
          },
          totalIssued: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$type', TransactionType.ISSUE_TO_VOLUNTEER] },
                  { $eq: ['$direction', TransactionDirection.OUT] }
                ]},
                '$quantity',
                0
              ]
            }
          },
          totalReturned: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$type', TransactionType.RETURN_TO_CENTRAL] },
                  { $eq: ['$direction', TransactionDirection.IN] }
                ]},
                '$quantity',
                0
              ]
            }
          },
          totalCentralDistribution: {
            $sum: {
              $cond: [
                { $eq: ['$type', TransactionType.CENTRAL_DISTRIBUTION] },
                '$quantity',
                0
              ]
            }
          },
          totalCentralDamage: {
            $sum: {
              $cond: [
                { $eq: ['$type', TransactionType.CENTRAL_DAMAGE] },
                '$quantity',
                0
              ]
            }
          }
        }
      }
    ];

    const aggregation = InventoryTransaction.aggregate(pipeline);
    const result = session ? await aggregation.session(session) : await aggregation;
    
    if (result.length === 0) return 0;
    
    const stock = result[0].totalStockIn + result[0].totalReturned - 
                  result[0].totalIssued - result[0].totalCentralDistribution - result[0].totalCentralDamage;
    return stock;
  }

  private async getVolunteerStockForItem(volunteerId: mongoose.Types.ObjectId, itemId: mongoose.Types.ObjectId, session?: any): Promise<number> {
    const pipeline = [
      { $match: { itemId } },
      {
        $group: {
          _id: null,
          totalReceived: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$type', TransactionType.ISSUE_TO_VOLUNTEER] },
                  { $eq: ['$direction', TransactionDirection.IN] },
                  { $eq: ['$performedBy', volunteerId] }
                ]},
                '$quantity',
                0
              ]
            }
          },
          totalDistributed: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$type', TransactionType.DISTRIBUTION] },
                  { $eq: ['$direction', TransactionDirection.OUT] },
                  { $eq: ['$performedBy', volunteerId] }
                ]},
                '$quantity',
                0
              ]
            }
          },
          totalDamaged: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$type', TransactionType.DAMAGE] },
                  { $eq: ['$direction', TransactionDirection.OUT] },
                  { $eq: ['$performedBy', volunteerId] }
                ]},
                '$quantity',
                0
              ]
            }
          },
          totalReturned: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$type', TransactionType.RETURN_TO_CENTRAL] },
                  { $eq: ['$direction', TransactionDirection.OUT] },
                  { $eq: ['$performedBy', volunteerId] }
                ]},
                '$quantity',
                0
              ]
            }
          },
          totalTransferredOut: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$type', TransactionType.VOLUNTEER_TRANSFER] },
                  { $eq: ['$direction', TransactionDirection.OUT] },
                  { $eq: ['$performedBy', volunteerId] }
                ]},
                '$quantity',
                0
              ]
            }
          },
          totalTransferredIn: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$type', TransactionType.VOLUNTEER_TRANSFER] },
                  { $eq: ['$direction', TransactionDirection.IN] },
                  { $eq: ['$performedBy', volunteerId] }
                ]},
                '$quantity',
                0
              ]
            }
          }
        }
      }
    ];

    const aggregation = InventoryTransaction.aggregate(pipeline);
    const result = session ? await aggregation.session(session) : await aggregation;
    
    if (result.length === 0) return 0;
    
    const stock = result[0].totalReceived + result[0].totalTransferredIn - 
                  result[0].totalDistributed - result[0].totalDamaged - 
                  result[0].totalReturned - result[0].totalTransferredOut;
    return stock;
  }

  async assignPackage(data: { packageId: string; volunteerId: string; quantity: number; requestId: string }, assignedBy: string) {
    return withTransaction(async (session) => {
      const existingAssignment = await PackageAssignment.findOne({ requestId: data.requestId }).session(session);
      if (existingAssignment) {
        return { success: true, message: 'Package already assigned', assignmentId: existingAssignment._id, duplicate: true };
      }

      const pkg = await Package.findOne({ _id: data.packageId, isActive: true }).populate('items.itemId').session(session);
      if (!pkg) {
        throw new NotFoundError('Package not found or inactive');
      }

      const volunteer = await User.findOne({ _id: data.volunteerId, role: UserRole.VOLUNTEER, status: 'ACTIVE' }).session(session);
      if (!volunteer) {
        throw new NotFoundError('Volunteer not found or inactive');
      }

      for (const item of pkg.items) {
        const requiredQty = item.quantity * data.quantity;
        // Extract ObjectId properly from populated or unpopulated itemId
        const itemObjectId = typeof item.itemId === 'object' && '_id' in item.itemId 
          ? new mongoose.Types.ObjectId((item.itemId as any)._id) 
          : new mongoose.Types.ObjectId(item.itemId as any);
        const availableStock = await this.getCentralStockForItem(itemObjectId, session);
        
        if (availableStock < requiredQty) {
          const itemDoc = item.itemId as any;
          const itemName = typeof item.itemId === 'object' && 'name' in item.itemId ? itemDoc.name : 'Unknown Item';
          throw new BadRequestError(`Insufficient central stock for ${itemName}. Required: ${requiredQty}, Available: ${availableStock}`);
        }
      }

      const transactionIds: mongoose.Types.ObjectId[] = [];
      const assignmentId = new mongoose.Types.ObjectId();

      for (const item of pkg.items) {
        const qty = item.quantity * data.quantity;
        // Extract ObjectId properly
        const itemObjectId = typeof item.itemId === 'object' && '_id' in item.itemId 
          ? new mongoose.Types.ObjectId((item.itemId as any)._id) 
          : new mongoose.Types.ObjectId(item.itemId as any);
        
        const outTxn = await InventoryTransaction.create([{
          itemId: itemObjectId,
          type: TransactionType.ISSUE_TO_VOLUNTEER,
          direction: TransactionDirection.OUT,
          quantity: qty,
          referenceType: 'PackageAssignment',
          referenceId: assignmentId,
          packageAssignmentId: assignmentId,
          performedBy: new mongoose.Types.ObjectId(assignedBy)
        }], { session });
        
        const inTxn = await InventoryTransaction.create([{
          itemId: itemObjectId,
          type: TransactionType.ISSUE_TO_VOLUNTEER,
          direction: TransactionDirection.IN,
          quantity: qty,
          referenceType: 'PackageAssignment',
          referenceId: assignmentId,
          packageAssignmentId: assignmentId,
          performedBy: new mongoose.Types.ObjectId(data.volunteerId)
        }], { session });
        
        transactionIds.push(outTxn[0]._id, inTxn[0]._id);
      }

      await PackageAssignment.create([{
        _id: assignmentId,
        packageId: new mongoose.Types.ObjectId(data.packageId),
        volunteerId: new mongoose.Types.ObjectId(data.volunteerId),
        quantity: data.quantity,
        assignedBy: new mongoose.Types.ObjectId(assignedBy),
        transactionIds,
        requestId: data.requestId
      }], { session });

      return { success: true, message: 'Package assigned successfully', assignmentId };
    });
  }

  async distributePackage(data: any, volunteerId: string) {
    return withTransaction(async (session) => {
      const existingDistribution = await PackageDistribution.findOne({ requestId: data.requestId }).session(session);
      if (existingDistribution) {
        return { success: true, message: 'Package already distributed', distributionId: existingDistribution._id, duplicate: true };
      }

      const pkg = await Package.findOne({ _id: data.packageId, isActive: true }).populate('items.itemId').session(session);
      if (!pkg) {
        throw new NotFoundError('Package not found or inactive');
      }

      for (const item of pkg.items) {
        const requiredQty = item.quantity * data.quantity;
        // Extract ObjectId properly from populated or unpopulated itemId
        const itemObjectId = typeof item.itemId === 'object' && '_id' in item.itemId 
          ? new mongoose.Types.ObjectId((item.itemId as any)._id) 
          : new mongoose.Types.ObjectId(item.itemId as any);
        const availableStock = await this.getVolunteerStockForItem(new mongoose.Types.ObjectId(volunteerId), itemObjectId, session);
        
        if (availableStock < requiredQty) {
          const itemDoc = item.itemId as any;
          const itemName = typeof item.itemId === 'object' && 'name' in item.itemId ? itemDoc.name : 'Unknown Item';
          throw new BadRequestError(`Insufficient volunteer stock for ${itemName}. Required: ${requiredQty}, Available: ${availableStock}`);
        }
      }

      const transactionIds: mongoose.Types.ObjectId[] = [];
      const distributionId = new mongoose.Types.ObjectId();

      for (const item of pkg.items) {
        const qty = item.quantity * data.quantity;
        // Extract ObjectId properly
        const itemObjectId = typeof item.itemId === 'object' && '_id' in item.itemId 
          ? new mongoose.Types.ObjectId((item.itemId as any)._id) 
          : new mongoose.Types.ObjectId(item.itemId as any);
        
        const txn = await InventoryTransaction.create([{
          itemId: itemObjectId,
          type: TransactionType.DISTRIBUTION,
          direction: TransactionDirection.OUT,
          quantity: qty,
          referenceType: 'PackageDistribution',
          referenceId: distributionId,
          packageDistributionId: distributionId,
          performedBy: new mongoose.Types.ObjectId(volunteerId)
        }], { session });
        
        transactionIds.push(txn[0]._id);
      }

      await PackageDistribution.create([{
        _id: distributionId,
        packageId: new mongoose.Types.ObjectId(data.packageId),
        volunteerId: new mongoose.Types.ObjectId(volunteerId),
        quantity: data.quantity,
        distributionDate: new Date(data.distributionDate),
        location: {
          cityId: new mongoose.Types.ObjectId(data.location.cityId),
          areaId: new mongoose.Types.ObjectId(data.location.areaId),
          address: data.location.address,
          coordinates: data.location.coordinates
        },
        beneficiaryInfo: data.beneficiaryInfo,
        campaignId: data.campaignId ? new mongoose.Types.ObjectId(data.campaignId) : undefined,
        transactionIds,
        requestId: data.requestId
      }], { session });

      return { success: true, message: 'Package distributed successfully', distributionId };
    });
  }

  async getPackageStockSummary(packageId: string, location?: { type: 'central' | 'volunteer'; volunteerId?: string }) {
    const pkg = await Package.findOne({ _id: packageId, isActive: true }).populate('items.itemId');
    if (!pkg) {
      throw new NotFoundError('Package not found or inactive');
    }

    const possiblePackages: number[] = [];

    for (const item of pkg.items) {
      let availableStock = 0;
      
      // Extract ObjectId from populated item
      const itemObjectId = typeof item.itemId === 'object' && '_id' in item.itemId 
        ? (item.itemId as any)._id 
        : item.itemId;
      
      if (!location || location.type === 'central') {
        availableStock = await this.getCentralStockForItem(itemObjectId);
      } else if (location.type === 'volunteer' && location.volunteerId) {
        availableStock = await this.getVolunteerStockForItem(new mongoose.Types.ObjectId(location.volunteerId), itemObjectId);
      }
      
      const possible = Math.floor(availableStock / item.quantity);
      possiblePackages.push(possible);
    }

    const maxPackages = Math.min(...possiblePackages);
    
    return {
      packageId: pkg._id,
      packageName: pkg.name,
      maxPackages,
      items: pkg.items.map((item, index) => {
        const itemDoc = item.itemId as any;
        return {
          itemId: typeof item.itemId === 'object' && '_id' in item.itemId ? itemDoc._id : item.itemId,
          itemName: itemDoc.name,
          quantityPerPackage: item.quantity,
          possiblePackages: possiblePackages[index]
        };
      })
    };
  }
}
