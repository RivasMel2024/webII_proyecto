import express from 'express';
import {
  login,
  registerCliente,
  verifyCliente,
  forgotPassword,
  resetPassword,
  changePassword,
} from '../controllers/authController.js';
import { verifyJwt } from '../middleware/authJwt.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', registerCliente);
router.get('/verify', verifyCliente);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', verifyJwt, changePassword);

export default router;
