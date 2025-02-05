import { Router } from 'express';
import { getAshleyBarStools} from '../controllers/ashleyController.js';

const router = Router();

// router.get('/ashleyCouches', getAshleyCouches);
// router.get('/ashleyCoffeeTables', getAshleyCoffeeTables);
// router.get('/ashleyAccentChairs', getAshleyAccentChairs);
router.get('/ashleyBarStools', getAshleyBarStools);

export default router;