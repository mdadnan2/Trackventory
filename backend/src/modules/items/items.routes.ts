import { Router } from 'express';
import { ItemsController } from './items.controller';
import { verifyFirebaseToken } from '../../middleware/verifyFirebaseToken';
import { attachUser } from '../../middleware/attachUser';
import { roleGuard } from '../../middleware/roleGuard';
import { UserRole } from '../../database/models/User';

const router = Router();
const itemsController = new ItemsController();

router.use(verifyFirebaseToken);
router.use(attachUser);

router.post('/', roleGuard(UserRole.ADMIN), itemsController.createItem.bind(itemsController));
router.get('/', itemsController.getItems.bind(itemsController));
router.get('/:id', itemsController.getItemById.bind(itemsController));
router.patch('/:id', roleGuard(UserRole.ADMIN), itemsController.updateItem.bind(itemsController));
router.patch('/:id/toggle-status', roleGuard(UserRole.ADMIN), itemsController.toggleStatus.bind(itemsController));

export default router;
