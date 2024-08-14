import express from 'express';
import { login, logout } from '../controllers/authController';

const router = express.Router();

router.post('/logout', logout);
router.post('/login', login);

export default router;
