import { Router } from 'express';
import { getAshleyCouches} from '../controllers/ashleyController.js';

const router = Router();

router.get('/ashleyCouches', getAshleyCouches);


export default router;