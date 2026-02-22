import { Item } from '../../database/models/Item';
import { InventoryTransaction, TransactionDirection } from '../../database/models/InventoryTransaction';
import { ConflictError, NotFoundError, BadRequestError } from '../../utils/errors';
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination';
import mongoose from 'mongoose';

export class ItemsService {
  async createItem(data: { name: string; category: string; unit: string }) {
    const existing = await Item.findOne({ name: data.name });
    if (existing) {
      throw new ConflictError('Item already exists');
    }

    const item = await Item.create(data);
    return item;
  }

  async getItems(page?: number, limit?: number) {
    const { page: p, limit: l } = getPaginationParams(page, limit);
    const skip = (p - 1) * l;
    const [items, total] = await Promise.all([
      Item.find().skip(skip).limit(l).sort({ name: 1 }),
      Item.countDocuments()
    ]);

    return createPaginatedResponse(items, total, p, l);
  }

  async getItemById(id: string) {
    const item = await Item.findById(id);
    if (!item) {
      throw new NotFoundError('Item not found');
    }
    return item;
  }

  async updateItem(id: string, data: any) {
    const item = await Item.findByIdAndUpdate(id, data, { new: true });
    if (!item) {
      throw new NotFoundError('Item not found');
    }
    return item;
  }

  async toggleItemStatus(id: string, isActive: boolean) {
    const item = await Item.findById(id);
    if (!item) {
      throw new NotFoundError('Item not found');
    }

    if (!isActive) {
      const itemObjectId = new mongoose.Types.ObjectId(id);
      
      // Check central warehouse stock
      const centralStock = await InventoryTransaction.aggregate([
        { $match: { itemId: itemObjectId } },
        {
          $group: {
            _id: null,
            totalStockIn: {
              $sum: {
                $cond: [
                  { $and: [
                    { $eq: ['$type', 'STOCK_IN'] },
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
                    { $eq: ['$type', 'ISSUE_TO_VOLUNTEER'] },
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
                    { $eq: ['$type', 'RETURN_TO_CENTRAL'] },
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
            stock: { $subtract: [{ $add: ['$totalStockIn', '$totalReturned'] }, '$totalIssued'] }
          }
        }
      ]);

      const centralQuantity = centralStock[0]?.stock || 0;
      if (centralQuantity > 0) {
        throw new BadRequestError('Cannot deactivate item. Central warehouse currently holds inventory for this item.');
      }

      // Check volunteer stock
      const volunteerStock = await InventoryTransaction.aggregate([
        { $match: { itemId: itemObjectId } },
        {
          $group: {
            _id: '$performedBy',
            totalReceived: {
              $sum: {
                $cond: [
                  { $and: [
                    { $eq: ['$type', 'ISSUE_TO_VOLUNTEER'] },
                    { $eq: ['$direction', TransactionDirection.IN] }
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
                    { $eq: ['$type', 'DISTRIBUTION'] },
                    { $eq: ['$direction', TransactionDirection.OUT] }
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
                    { $eq: ['$type', 'DAMAGE'] },
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
                    { $eq: ['$type', 'RETURN_TO_CENTRAL'] },
                    { $eq: ['$direction', TransactionDirection.OUT] }
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
            stock: { $subtract: ['$totalReceived', { $add: ['$totalDistributed', '$totalDamaged', '$totalReturned'] }] }
          }
        },
        { $match: { stock: { $gt: 0 } } }
      ]);

      if (volunteerStock.length > 0) {
        throw new BadRequestError('Cannot deactivate item. One or more volunteers currently hold inventory for this item.');
      }
    }

    item.isActive = isActive;
    await item.save();
    return item;
  }
}
