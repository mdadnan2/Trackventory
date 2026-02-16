import { City } from '../../database/models/City';
import { ConflictError, NotFoundError } from '../../utils/errors';

export class CitiesService {
  async createCity(data: { name: string }) {
    const existing = await City.findOne({ name: data.name });
    if (existing) {
      throw new ConflictError('City already exists');
    }

    const city = await City.create(data);
    return city;
  }

  async getCities(page: number = 1, limit: number = 100) {
    const skip = (page - 1) * limit;
    const [cities, total] = await Promise.all([
      City.find().skip(skip).limit(limit).sort({ name: 1 }),
      City.countDocuments()
    ]);

    return { cities, total, page, pages: Math.ceil(total / limit) };
  }

  async getCityById(id: string) {
    const city = await City.findById(id);
    if (!city) {
      throw new NotFoundError('City not found');
    }
    return city;
  }
}
