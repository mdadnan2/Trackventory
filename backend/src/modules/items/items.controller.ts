import { Response, NextFunction } from 'express';
import { ItemsService } from './items.service';
import { createItemSchema, updateItemSchema } from './items.validation';
import { sendSuccess } from '../../utils/response';
import { UserRequest } from '../../middleware/attachUser';

const itemsService = new ItemsService();

export class ItemsController {
  async createItem(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const data = createItemSchema.parse(req.body);
      const item = await itemsService.createItem(data);
      sendSuccess(res, item, 201);
    } catch (error) {
      next(error);
    }
  }

  async getItems(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string);
      const limit = parseInt(req.query.limit as string);
      const result = await itemsService.getItems(page, limit);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getItemById(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const item = await itemsService.getItemById(req.params.id);
      sendSuccess(res, item);
    } catch (error) {
      next(error);
    }
  }

  async updateItem(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const data = updateItemSchema.parse(req.body);
      const item = await itemsService.updateItem(req.params.id, data);
      sendSuccess(res, item);
    } catch (error) {
      next(error);
    }
  }

  async toggleStatus(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const { isActive } = req.body;
      const item = await itemsService.toggleItemStatus(req.params.id, isActive);
      sendSuccess(res, item);
    } catch (error) {
      next(error);
    }
  }
}
