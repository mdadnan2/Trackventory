import { Router } from 'express';
import { StockController } from './stock.controller';
import { verifyFirebaseToken } from '../../middleware/verifyFirebaseToken';
import { attachUser } from '../../middleware/attachUser';
import { roleGuard } from '../../middleware/roleGuard';
import { UserRole } from '../../database/models/User';

const router = Router();
const stockController = new StockController();

router.use(verifyFirebaseToken);
router.use(attachUser);

router.get('/central', stockController.getCentralStock.bind(stockController));
router.get('/volunteer/:volunteerId', stockController.getVolunteerStock.bind(stockController));
router.post('/add', roleGuard(UserRole.ADMIN), stockController.addStock.bind(stockController));
router.post('/assign', roleGuard(UserRole.ADMIN), stockController.assignStock.bind(stockController));

export default router;
