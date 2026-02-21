import { Response, NextFunction } from 'express';
import { StockService } from './stock.service';
import { addStockSchema, assignStockSchema, returnStockSchema } from './stock.validation';
import { sendSuccess } from '../../utils/response';
import { UserRequest } from '../../middleware/attachUser';

const stockService = new StockService();

export class StockController {
  async getCentralStock(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const itemId = req.query.itemId as string;
      const stock = await stockService.getCentralStock(itemId);
      sendSuccess(res, stock);
    } catch (error) {
      next(error);
    }
  }

  async getVolunteerStock(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const volunteerId = req.params.volunteerId;
      const itemId = req.query.itemId as string;
      const stock = await stockService.getVolunteerStock(volunteerId, itemId);
      sendSuccess(res, stock);
    } catch (error) {
      next(error);
    }
  }

  async addStock(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const data = addStockSchema.parse(req.body);
      const result = await stockService.addStock(data.items, req.user!._id.toString());
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  async assignStock(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const data = assignStockSchema.parse(req.body);
      const result = await stockService.assignStock(data.volunteerId, data.items, req.user!._id.toString());
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  async returnStock(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const data = returnStockSchema.parse(req.body);
      const volunteerId = req.user!.role === 'ADMIN' ? data.volunteerId : req.user!._id.toString();
      const result = await stockService.returnStock(volunteerId, data.items, req.user!._id.toString(), data.notes);
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }
}
