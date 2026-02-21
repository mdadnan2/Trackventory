import mongoose from 'mongoose';
import { InventoryTransaction, TransactionType, TransactionDirection } from '../../database/models/InventoryTransaction';
import { VolunteerStockAssignment } from '../../database/models/VolunteerStockAssignment';
import { Item } from '../../database/models/Item';
import { User, UserRole } from '../../database/models/User';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { withTransaction } from '../../utils/transaction';

export class StockService {
  async getCentralStock(itemId?: string) {
    const match: any = {};
    
    if (itemId) {
      match.itemId = new mongoose.Types.ObjectId(itemId);
    }

    const result = await InventoryTransaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$itemId',
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
          }
        }
      },
      {
        $project: {
          itemId: '$_id',
          stock: { $subtract: [{ $add: ['$totalStockIn', '$totalReturned'] }, '$totalIssued'] }
        }
      }
    ]);

    const items = await Item.find({ _id: { $in: result.map(r => r.itemId) } });
    
    return result.map(r => ({
      itemId: r.itemId,
      item: items.find(i => i._id.equals(r.itemId)),
      stock: r.stock
    }));
  }

  async getVolunteerStock(volunteerId: string, itemId?: string) {
    const match: any = {};
    
    if (itemId) {
      match.itemId = new mongoose.Types.ObjectId(itemId);
    }

    const result = await InventoryTransaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$itemId',
          totalReceived: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$type', TransactionType.ISSUE_TO_VOLUNTEER] },
                  { $eq: ['$direction', TransactionDirection.IN] },
                  { $eq: ['$performedBy', new mongoose.Types.ObjectId(volunteerId)] }
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
                  { $eq: ['$performedBy', new mongoose.Types.ObjectId(volunteerId)] }
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
                  { $eq: ['$performedBy', new mongoose.Types.ObjectId(volunteerId)] }
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
                  { $eq: ['$performedBy', new mongoose.Types.ObjectId(volunteerId)] }
                ]},
                '$quantity',
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          itemId: '$_id',
          stock: { $subtract: ['$totalReceived', { $add: ['$totalDistributed', '$totalDamaged', '$totalReturned'] }] }
        }
      },
      {
        $match: {
          stock: { $gt: 0 }
        }
      }
    ]);

    const items = await Item.find({ _id: { $in: result.map(r => r.itemId) } });
    
    return result.map(r => ({
      itemId: r.itemId,
      item: items.find(i => i._id.equals(r.itemId)),
      stock: r.stock
    }));
  }

  async addStock(items: Array<{ itemId: string; quantity: number }>, performedBy: string) {
    return withTransaction(async (session) => {
      const itemIds = items.map(i => new mongoose.Types.ObjectId(i.itemId));
      const query = Item.find({ _id: { $in: itemIds }, isActive: true });
      const foundItems = session ? await query.session(session) : await query;
      
      if (foundItems.length !== itemIds.length) {
        throw new BadRequestError('Some items not found or inactive');
      }

      const transactions = items.map(item => ({
        itemId: new mongoose.Types.ObjectId(item.itemId),
        type: TransactionType.STOCK_IN,
        direction: TransactionDirection.IN,
        quantity: item.quantity,
        performedBy: new mongoose.Types.ObjectId(performedBy)
      }));

      if (session) {
        await InventoryTransaction.insertMany(transactions, { session });
      } else {
        await InventoryTransaction.insertMany(transactions);
      }

      return { success: true, message: 'Stock added successfully' };
    });
  }

  async assignStock(volunteerId: string, items: Array<{ itemId: string; quantity: number }>, performedBy: string) {
    return withTransaction(async (session) => {
      const volunteerQuery = User.findOne({ _id: volunteerId, role: UserRole.VOLUNTEER, status: 'ACTIVE' });
      const volunteer = session ? await volunteerQuery.session(session) : await volunteerQuery;
      if (!volunteer) {
        throw new NotFoundError('Volunteer not found or inactive');
      }

      const itemIds = items.map(i => new mongoose.Types.ObjectId(i.itemId));
      const itemQuery = Item.find({ _id: { $in: itemIds }, isActive: true });
      const foundItems = session ? await itemQuery.session(session) : await itemQuery;
      
      if (foundItems.length !== itemIds.length) {
        throw new BadRequestError('Some items not found or inactive');
      }

      const centralStock = await this.getCentralStock();
      const stockMap = new Map(centralStock.map(s => [s.itemId.toString(), s.stock]));

      for (const item of items) {
        const available = stockMap.get(item.itemId) || 0;
        if (available < item.quantity) {
          throw new BadRequestError(`Insufficient central stock for item ${item.itemId}`);
        }
      }

      const assignmentData = [{
        volunteerId: new mongoose.Types.ObjectId(volunteerId),
        items: items.map(i => ({
          itemId: new mongoose.Types.ObjectId(i.itemId),
          quantity: i.quantity
        }))
      }];
      const assignment = session 
        ? await VolunteerStockAssignment.create(assignmentData, { session })
        : await VolunteerStockAssignment.create(assignmentData);

      const transactions = [];
      
      for (const item of items) {
        // OUT from central warehouse
        transactions.push({
          itemId: new mongoose.Types.ObjectId(item.itemId),
          type: TransactionType.ISSUE_TO_VOLUNTEER,
          direction: TransactionDirection.OUT,
          quantity: item.quantity,
          referenceType: 'VolunteerStockAssignment',
          referenceId: assignment[0]._id,
          performedBy: new mongoose.Types.ObjectId(performedBy)
        });
        
        // IN to volunteer
        transactions.push({
          itemId: new mongoose.Types.ObjectId(item.itemId),
          type: TransactionType.ISSUE_TO_VOLUNTEER,
          direction: TransactionDirection.IN,
          quantity: item.quantity,
          referenceType: 'VolunteerStockAssignment',
          referenceId: assignment[0]._id,
          performedBy: new mongoose.Types.ObjectId(volunteerId)
        });
      }

      if (session) {
        await InventoryTransaction.insertMany(transactions, { session });
      } else {
        await InventoryTransaction.insertMany(transactions);
      }

      return { success: true, message: 'Stock assigned to volunteer', assignmentId: assignment[0]._id };
    });
  }

  async returnStock(volunteerId: string, items: Array<{ itemId: string; quantity: number }>, performedBy: string, notes?: string) {
    return withTransaction(async (session) => {
      const volunteerQuery = User.findOne({ _id: volunteerId, role: UserRole.VOLUNTEER, status: 'ACTIVE' });
      const volunteer = session ? await volunteerQuery.session(session) : await volunteerQuery;
      if (!volunteer) {
        throw new NotFoundError('Volunteer not found or inactive');
      }

      const itemIds = items.map(i => new mongoose.Types.ObjectId(i.itemId));
      const itemQuery = Item.find({ _id: { $in: itemIds }, isActive: true });
      const foundItems = session ? await itemQuery.session(session) : await itemQuery;
      
      if (foundItems.length !== itemIds.length) {
        throw new BadRequestError('Some items not found or inactive');
      }

      const volunteerStock = await this.getVolunteerStock(volunteerId);
      const stockMap = new Map(volunteerStock.map(s => [s.itemId.toString(), s.stock]));

      for (const item of items) {
        const available = stockMap.get(item.itemId) || 0;
        if (available < item.quantity) {
          throw new BadRequestError(`Insufficient volunteer stock for item ${item.itemId}`);
        }
      }

      const transactions = [];
      
      for (const item of items) {
        // OUT from volunteer
        transactions.push({
          itemId: new mongoose.Types.ObjectId(item.itemId),
          type: TransactionType.RETURN_TO_CENTRAL,
          direction: TransactionDirection.OUT,
          quantity: item.quantity,
          performedBy: new mongoose.Types.ObjectId(volunteerId)
        });
        
        // IN to central warehouse
        transactions.push({
          itemId: new mongoose.Types.ObjectId(item.itemId),
          type: TransactionType.RETURN_TO_CENTRAL,
          direction: TransactionDirection.IN,
          quantity: item.quantity,
          performedBy: new mongoose.Types.ObjectId(performedBy)
        });
      }

      if (session) {
        await InventoryTransaction.insertMany(transactions, { session });
      } else {
        await InventoryTransaction.insertMany(transactions);
      }

      return { success: true, message: 'Stock returned to central warehouse' };
    });
  }
}
