import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Apply authentication to all dashboard routes
router.use(authenticate);

router.get('/stats', getDashboardStats);

export default router;
