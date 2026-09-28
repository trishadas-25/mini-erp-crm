import { Router } from 'express';
import { getChallans, createChallan, updateChallanStatus } from '../controllers/challanController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate); // Protect all challan routes

router.get('/', getChallans);
router.post('/', createChallan);
router.put('/:id', updateChallanStatus);

export default router;
