import { Item } from '../../database/models/Item';
import { ConflictError, NotFoundError } from '../../utils/errors';

export class ItemsService {
  async createItem(data: { name: string; category: string; unit: string }) {
    const existing = await Item.findOne({ name: data.name });
    if (existing) {
      throw new ConflictError('Item already exists');
    }

    const item = await Item.create(data);
    return item;
  }

  async getItems(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Item.find({ isActive: true }).skip(skip).limit(limit).sort({ name: 1 }),
      Item.countDocuments({ isActive: true })
    ]);

    return { items, total, page, pages: Math.ceil(total / limit) };
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
