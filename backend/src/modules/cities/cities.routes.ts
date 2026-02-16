import { Router } from 'express';
import { CitiesController } from './cities.controller';
import { verifyFirebaseToken } from '../../middleware/verifyFirebaseToken';
import { attachUser } from '../../middleware/attachUser';
import { roleGuard } from '../../middleware/roleGuard';
import { UserRole } from '../../database/models/User';

const router = Router();
const citiesController = new CitiesController();

router.use(verifyFirebaseToken);
router.use(attachUser);

router.post('/', roleGuard(UserRole.ADMIN), citiesController.createCity.bind(citiesController));
router.get('/', citiesController.getCities.bind(citiesController));
router.get('/:id', citiesController.getCityById.bind(citiesController));

export default router;
