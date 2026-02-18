import { Response, NextFunction } from 'express';
import { CitiesService } from './cities.service';
import { createCitySchema } from './cities.validation';
import { sendSuccess } from '../../utils/response';
import { UserRequest } from '../../middleware/attachUser';

const citiesService = new CitiesService();

export class CitiesController {
  async createCity(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const data = createCitySchema.parse(req.body);
      const city = await citiesService.createCity(data);
      sendSuccess(res, city, 201);
    } catch (error) {
      next(error);
    }
  }

  async getCities(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string);
      const limit = parseInt(req.query.limit as string);
      const result = await citiesService.getCities(page, limit);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getCityById(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const city = await citiesService.getCityById(req.params.id);
      sendSuccess(res, city);
    } catch (error) {
      next(error);
    }
  }
}
