import { Router } from 'express';
import { PackagesController } from './packages.controller';
import { verifyFirebaseToken } from '../../middleware/verifyFirebaseToken';
import { attachUser } from '../../middleware/attachUser';
import { roleGuard } from '../../middleware/roleGuard';
import { UserRole } from '../../database/models/User';

const router = Router();
const packagesController = new PackagesController();

router.use(verifyFirebaseToken);
router.use(attachUser);

router.post('/', roleGuard(UserRole.ADMIN), packagesController.createPackage.bind(packagesController));
router.get('/', packagesController.getPackages.bind(packagesController));
router.get('/:id', packagesController.getPackageById.bind(packagesController));
router.get('/:id/stock-summary', packagesController.getPackageStockSummary.bind(packagesController));
router.patch('/:id', roleGuard(UserRole.ADMIN), packagesController.updatePackage.bind(packagesController));
router.delete('/:id', roleGuard(UserRole.ADMIN), packagesController.deletePackage.bind(packagesController));

router.post('/assign', roleGuard(UserRole.ADMIN), packagesController.assignPackage.bind(packagesController));
router.post('/self-assign', packagesController.selfAssignPackage.bind(packagesController));
router.post('/distribute', packagesController.distributePackage.bind(packagesController));

export default router;
