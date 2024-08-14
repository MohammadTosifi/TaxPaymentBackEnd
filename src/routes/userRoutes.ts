import express from 'express';
import { createUser, deleteUser, getAllUsers, getAllUsersForStaff, updateUser } from '../controllers/userController';
import { protect } from '../Middlewares/authMiddleware';
import restrictTo from '../Middlewares/restrictTo';

const router = express.Router();

router.use(protect); // Protect all routes

router.use(restrictTo('Staff', 'Sysadmin')); // Restrict access to Sysadmin only

router.get('/userRoles', getAllUsersForStaff);

router.get('/', getAllUsers);

router.use(restrictTo('Sysadmin')); // Restrict access to Sysadmin only

router.post('/', createUser);
router.delete('/:id', deleteUser);
router.patch('/:id', updateUser);

export default router;
