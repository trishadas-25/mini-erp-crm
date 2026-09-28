import { Router } from 'express';
import { getCustomers, getCustomerById, createCustomer, updateCustomer } from '../controllers/customerController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate); // Protect all customer routes

router.get('/', getCustomers);
router.post('/', createCustomer);
router.get('/:id', getCustomerById);
router.put('/:id', updateCustomer);

export default router;
