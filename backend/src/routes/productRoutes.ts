import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, addStockMovement } from '../controllers/productController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate); // Protect all product routes

router.get('/', getProducts);
router.post('/', createProduct);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.post('/:id/stock', addStockMovement);

export default router;
