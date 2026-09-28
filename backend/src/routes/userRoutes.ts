import express from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController';
import { authenticate, authorize } from '../middlewares/auth';

const router = express.Router();

// Apply authentication and ADMIN authorization to all user routes
router.use(authenticate);
router.use(authorize(['ADMIN']));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
