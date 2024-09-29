import { Router } from 'express';
import { getAshleyCouches, getAshleyCoffeeTables} from '../controllers/ashleyController.js';

const router = Router();

router.get('/ashleyCouches', getAshleyCouches);
router.get('/ashleyCoffeeTables', getAshleyCoffeeTables);


export default router;