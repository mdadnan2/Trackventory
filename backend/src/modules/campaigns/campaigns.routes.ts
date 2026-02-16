import { Router } from 'express';
import { CampaignsController } from './campaigns.controller';
import { verifyFirebaseToken } from '../../middleware/verifyFirebaseToken';
import { attachUser } from '../../middleware/attachUser';
import { roleGuard } from '../../middleware/roleGuard';
import { UserRole } from '../../database/models/User';

const router = Router();
const campaignsController = new CampaignsController();

router.use(verifyFirebaseToken);
router.use(attachUser);

router.post('/', roleGuard(UserRole.ADMIN), campaignsController.createCampaign.bind(campaignsController));
router.get('/', campaignsController.getCampaigns.bind(campaignsController));
router.get('/:id', campaignsController.getCampaignById.bind(campaignsController));
router.patch('/:id', roleGuard(UserRole.ADMIN), campaignsController.updateCampaign.bind(campaignsController));

export default router;
