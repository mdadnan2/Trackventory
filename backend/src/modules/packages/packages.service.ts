import { Package } from '../../database/models/Package';
import { Item } from '../../database/models/Item';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import mongoose from 'mongoose';

export class PackagesService {
  async createPackage(data: { name: string; items: Array<{ itemId: string; quantity: number }> }) {
    const itemIds = data.items.map(i => new mongoose.Types.ObjectId(i.itemId));
    const items = await Item.find({ _id: { $in: itemIds }, isActive: true });
    
    if (items.length !== itemIds.length) {
      throw new BadRequestError('Some items not found or inactive');
    }

    const pkg = await Package.create(data);
    return pkg;
  }

  async getPackages(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    const [packages, total] = await Promise.all([
      Package.find({ isActive: true }).populate('items.itemId').skip(skip).limit(limit).sort({ name: 1 }),
      Package.countDocuments({ isActive: true })
    ]);

    return { packages, total, page, pages: Math.ceil(total / limit) };
  }

  async getPackageById(id: string) {
    const pkg = await Package.findById(id).populate('items.itemId');
    if (!pkg) {
      throw new NotFoundError('Package not found');
    }
    return pkg;
  }

  async updatePackage(id: string, data: any) {
    if (data.items) {
      const itemIds = data.items.map((i: any) => new mongoose.Types.ObjectId(i.itemId));
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
}
