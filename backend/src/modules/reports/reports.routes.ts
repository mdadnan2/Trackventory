import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { verifyFirebaseToken } from '../../middleware/verifyFirebaseToken';
import { attachUser } from '../../middleware/attachUser';

const router = Router();
const reportsController = new ReportsController();

router.use(verifyFirebaseToken);
router.use(attachUser);

router.get('/stock-summary', reportsController.getCurrentStockSummary.bind(reportsController));
router.get('/volunteer-stock', reportsController.getVolunteerStockSummary.bind(reportsController));
router.get('/campaign-distribution', reportsController.getCampaignDistributionSummary.bind(reportsController));
router.get('/repeat-distribution', reportsController.getRepeatDistributionHistory.bind(reportsController));

export default router;
