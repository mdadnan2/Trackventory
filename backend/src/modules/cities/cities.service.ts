import { City } from '../../database/models/City';
import { ConflictError, NotFoundError } from '../../utils/errors';
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination';

export class CitiesService {
  async createCity(data: { name: string }) {
    const existing = await City.findOne({ name: data.name });
    if (existing) {
      throw new ConflictError('City already exists');
    }

    const city = await City.create(data);
    return city;
  }

  async getCities(page?: number, limit?: number) {
    const { page: p, limit: l } = getPaginationParams(page, limit);
    const skip = (p - 1) * l;
    const [cities, total] = await Promise.all([
      City.find().skip(skip).limit(l).sort({ name: 1 }),
      City.countDocuments()
    ]);

    return createPaginatedResponse(cities, total, p, l);
  }

  async getCityById(id: string) {
    const city = await City.findById(id);
    if (!city) {
      throw new NotFoundError('City not found');
    }
    return city;
  }
}
