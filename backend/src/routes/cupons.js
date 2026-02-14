import express from 'express';
import {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getCuponesByCliente,
  deleteCupon
} from '../controllers/cuponsController.js';

const router = express.Router();

// Rutas CRUD para cupones
router.get('/', getAllCoupons);
router.get('/clientes/:clienteId/cupones', getCuponesByCliente);
router.get('/:id', getCouponById);
router.delete("/:id", deleteCupon);

router.post('/', createCoupon);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

export default router;
