import express from 'express';
import { createOrder, verifyPayment, getCount } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);
router.get('/get-count', getCount);

export default router;



