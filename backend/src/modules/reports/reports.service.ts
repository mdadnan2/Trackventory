import mongoose from 'mongoose';
import { InventoryTransaction, TransactionType, TransactionDirection } from '../../database/models/InventoryTransaction';
import { Distribution } from '../../database/models/Distribution';
import { Item } from '../../database/models/Item';
import { User } from '../../database/models/User';
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination';

export class ReportsService {
  async getCurrentStockSummary(page?: number, limit?: number) {
    const { page: p, limit: l } = getPaginationParams(page, limit);
    const centralStock = await InventoryTransaction.aggregate([
      {
        $match: {
          type: { $in: [TransactionType.STOCK_IN, TransactionType.ISSUE_TO_VOLUNTEER] }
        }
      },
      {
        $group: {
          _id: '$itemId',
          totalIn: {
            $sum: {
              $cond: [{ $eq: ['$direction', TransactionDirection.IN] }, '$quantity', 0]
            }
          },
          totalOut: {
            $sum: {
              $cond: [{ $eq: ['$direction', TransactionDirection.OUT] }, '$quantity', 0]
            }
          }
        }
      },
      {
        $project: {
          itemId: '$_id',
          centralStock: { $subtract: ['$totalIn', '$totalOut'] }
        }
      }
    ]);

    const volunteerStock = await InventoryTransaction.aggregate([
      {
        $match: {
          type: { $in: [TransactionType.ISSUE_TO_VOLUNTEER, TransactionType.DISTRIBUTION, TransactionType.DAMAGE] }
        }
      },
      {
        $group: {
          _id: '$itemId',
          totalIn: {
            $sum: {
              $cond: [{ $eq: ['$direction', TransactionDirection.IN] }, '$quantity', 0]
            }
          },
          totalOut: {
            $sum: {
              $cond: [{ $eq: ['$direction', TransactionDirection.OUT] }, '$quantity', 0]
            }
          }
        }
      },
      {
        $project: {
          itemId: '$_id',
          volunteerStock: { $max: [{ $subtract: ['$totalIn', '$totalOut'] }, 0] }
        }
      }
    ]);

    const distributed = await InventoryTransaction.aggregate([
      {
        $match: { type: TransactionType.DISTRIBUTION }
      },
      {
        $group: {
          _id: '$itemId',
          totalDistributed: { $sum: '$quantity' }
        }
      }
    ]);

    const damaged = await InventoryTransaction.aggregate([
      {
        $match: { type: TransactionType.DAMAGE }
      },
      {
        $group: {
          _id: '$itemId',
          totalDamaged: { $sum: '$quantity' }
        }
      }
    ]);

    const itemIds = [
      ...new Set([
        ...centralStock.map(s => s.itemId),
        ...volunteerStock.map(s => s.itemId)
      ])
    ];

    const items = await Item.find({ _id: { $in: itemIds } });

    const summary = items.map(item => {
      const central = centralStock.find(s => s.itemId.equals(item._id));
      const volunteer = volunteerStock.find(s => s.itemId.equals(item._id));
      const dist = distributed.find(d => d._id.equals(item._id));
      const dmg = damaged.find(d => d._id.equals(item._id));

      return {
        item: {
          id: item._id,
          name: item.name,
          category: item.category,
          unit: item.unit
        },
        centralStock: central?.centralStock || 0,
        volunteerStock: volunteer?.volunteerStock || 0,
        totalDistributed: dist?.totalDistributed || 0,
        totalDamaged: dmg?.totalDamaged || 0
      };
    });

    const skip = (p - 1) * l;
    const paginatedSummary = summary.slice(skip, skip + l);
    return createPaginatedResponse(paginatedSummary, summary.length, p, l);
  }

  async getVolunteerStockSummary(page?: number, limit?: number) {
    const { page: p, limit: l } = getPaginationParams(page, limit);
    const result = await InventoryTransaction.aggregate([
      {
        $match: {
          type: { $in: [TransactionType.ISSUE_TO_VOLUNTEER, TransactionType.DISTRIBUTION, TransactionType.DAMAGE] }
        }
      },
      {
        $group: {
          _id: { volunteerId: '$performedBy', itemId: '$itemId' },
          totalIn: {
            $sum: {
              $cond: [{ $eq: ['$direction', TransactionDirection.IN] }, '$quantity', 0]
            }
          },
          totalOut: {
            $sum: {
              $cond: [{ $eq: ['$direction', TransactionDirection.OUT] }, '$quantity', 0]
            }
          }
        }
      },
      {
        $project: {
          volunteerId: '$_id.volunteerId',
          itemId: '$_id.itemId',
          stock: { $subtract: ['$totalIn', '$totalOut'] }
        }
      },
      {
        $match: { stock: { $gt: 0 } }
      }
    ]);

    const volunteerIds = [...new Set(result.map(r => r.volunteerId))];
    const itemIds = [...new Set(result.map(r => r.itemId))];

    const [volunteers, items] = await Promise.all([
      User.find({ _id: { $in: volunteerIds } }),
      Item.find({ _id: { $in: itemIds } })
    ]);

    const grouped = result.reduce((acc, r) => {
      const volunteerId = r.volunteerId.toString();
      if (!acc[volunteerId]) {
        const volunteer = volunteers.find(v => v._id.equals(r.volunteerId));
        acc[volunteerId] = {
          volunteer: {
            id: volunteer?._id,
            name: volunteer?.name,
            email: volunteer?.email
          },
          items: []
        };
      }

      const item = items.find(i => i._id.equals(r.itemId));
      acc[volunteerId].items.push({
        item: {
          id: item?._id,
          name: item?.name,
          unit: item?.unit
        },
        stock: r.stock
      });

      return acc;
    }, {} as any);

    const summary = Object.values(grouped);
    const skip = (p - 1) * l;
    const paginatedResult = summary.slice(skip, skip + l);
    return createPaginatedResponse(paginatedResult, summary.length, p, l);
  }

  async getCampaignDistributionSummary(campaignId?: string, page?: number, limit?: number) {
    const { page: p, limit: l } = getPaginationParams(page, limit);
    const match: any = {};
    if (campaignId) {
      match.campaignId = new mongoose.Types.ObjectId(campaignId);
    }

    const result = await Distribution.aggregate([
      { $match: match },
      { $unwind: '$items' },
      {
        $group: {
          _id: {
            campaignId: '$campaignId',
            itemId: '$items.itemId'
          },
          totalQuantity: { $sum: '$items.quantity' },
          distributionCount: { $sum: 1 }
        }
      }
    ]);

    const itemIds = [...new Set(result.map(r => r._id.itemId))];
    const items = await Item.find({ _id: { $in: itemIds } });

    const summary = result.map(r => ({
      campaignId: r._id.campaignId,
      item: items.find(i => i._id.equals(r._id.itemId)),
      totalQuantity: r.totalQuantity,
      distributionCount: r.distributionCount
    }));

    const skip = (p - 1) * l;
    const paginatedSummary = summary.slice(skip, skip + l);
    return createPaginatedResponse(paginatedSummary, summary.length, p, l);
  }

  async getRepeatDistributionHistory(page?: number, limit?: number) {
    const { page: p, limit: l } = getPaginationParams(page, limit);
    const result = await Distribution.aggregate([
      {
        $group: {
          _id: { cityId: '$cityId', area: '$area' },
          distributions: {
            $push: {
              id: '$_id',
              volunteerId: '$volunteerId',
              items: '$items',
              createdAt: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      },
      { $sort: { count: -1 } }
    ]);

    const skip = (p - 1) * l;
    const paginatedResult = result.slice(skip, skip + l);
    return createPaginatedResponse(paginatedResult, result.length, p, l);
  }
}
