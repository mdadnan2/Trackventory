import { Router } from 'express';
import { UsersController } from './users.controller';
import { verifyFirebaseToken } from '../../middleware/verifyFirebaseToken';
import { attachUser } from '../../middleware/attachUser';
import { roleGuard } from '../../middleware/roleGuard';
import { UserRole } from '../../database/models/User';

const router = Router();
const usersController = new UsersController();

router.use(verifyFirebaseToken);
router.use(attachUser);

router.post('/', roleGuard(UserRole.ADMIN), usersController.createUser.bind(usersController));
router.get('/', roleGuard(UserRole.ADMIN), usersController.getUsers.bind(usersController));
router.get('/:id', roleGuard(UserRole.ADMIN), usersController.getUserById.bind(usersController));
router.patch('/:id', roleGuard(UserRole.ADMIN), usersController.updateUser.bind(usersController));

export default router;
