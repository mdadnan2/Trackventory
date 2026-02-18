import { Item } from '../../database/models/Item';
import { ConflictError, NotFoundError } from '../../utils/errors';
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination';

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
      Item.find({ isActive: true }).skip(skip).limit(l).sort({ name: 1 }),
      Item.countDocuments({ isActive: true })
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
}
