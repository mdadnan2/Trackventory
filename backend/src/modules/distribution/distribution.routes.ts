import { Router } from 'express';
import { DistributionController } from './distribution.controller';
import { verifyFirebaseToken } from '../../middleware/verifyFirebaseToken';
import { attachUser } from '../../middleware/attachUser';

const router = Router();
const distributionController = new DistributionController();

router.use(verifyFirebaseToken);
router.use(attachUser);

router.post('/', distributionController.createDistribution.bind(distributionController));
router.post('/damage', distributionController.reportDamage.bind(distributionController));
router.get('/', distributionController.getDistributions.bind(distributionController));

export default router;
