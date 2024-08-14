import express from 'express';
import { createDesKey, createRsaKeyPair, fetchDesKey, fetchRsaPublicKey } from '../controllers/keyManagementController';
import { protect } from '../Middlewares/authMiddleware';
import restrictTo from '../Middlewares/restrictTo';

const router = express.Router();

router.use(protect); // Protect all routes
router.use(restrictTo('Staff')); // Restrict access to Staff only

router.post('/generate-des-key', createDesKey);
router.post('/generate-rsa-key-pair', createRsaKeyPair);
router.get('/des-key', fetchDesKey);
router.get('/rsa-public-key', fetchRsaPublicKey);

export default router;
