import express from 'express';
import { createInvoice, getAllInvoices, getInvoice, getUserInvoices, payInvoice, updateInvoice } from '../controllers/invoiceController';
import { protect } from '../Middlewares/authMiddleware';
import restrictTo from '../Middlewares/restrictTo';

const router = express.Router();

router.use(protect); // Protect all routes

router.post('/pay/:invoiceId', restrictTo('User'), payInvoice);
router.get('/users', restrictTo('User'), getUserInvoices);

router.use(restrictTo('Staff')); // Restrict access to Staff only

router.post('/', createInvoice);
router.get('/', getAllInvoices);
router.get('/:invoiceId', getInvoice);
router.patch('/:invoiceId', updateInvoice);

export default router;
