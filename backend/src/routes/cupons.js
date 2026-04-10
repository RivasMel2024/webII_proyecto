import express from 'express';
import {
  getAllCoupons,
  getCouponById,
  getCuponesByCliente,
  deleteCupon,
  comprarCupon,
  comprarCarrito,
  canjearCupon
} from '../controllers/cuponsController.js';
import { verifyJwt } from '../middleware/authJwt.js';
import { requireRole, requireSelfClienteOrRole } from '../middleware/rbac.js';
import { ROLES } from '../utils/roles.js';

const router = express.Router();

// Listado general (solo Admin Cuponera)
router.get('/', verifyJwt, requireRole(ROLES.ADMIN_CUPONERA), getAllCoupons);

// Cupones por cliente: CLIENTE (self) o ADMIN_CUPONERA
router.get(
  '/clientes/:clienteId/cupones',
  verifyJwt,
  requireSelfClienteOrRole({ param: 'clienteId', rolesAllowed: [ROLES.ADMIN_CUPONERA] }),
  getCuponesByCliente
);

// Detalle cupón (Admin Cuponera)
router.get('/:id', verifyJwt, requireRole(ROLES.ADMIN_CUPONERA), getCouponById);

// Eliminar cupón (Admin Cuponera)
router.delete('/:id', verifyJwt, requireRole(ROLES.ADMIN_CUPONERA), deleteCupon);

// Compra de cupón individual (CLIENTE)
router.post('/comprar', verifyJwt, requireRole(ROLES.CLIENTE), comprarCupon);

// Compra de carrito completo — un solo correo (CLIENTE)
router.post('/comprar-carrito', verifyJwt, requireRole(ROLES.CLIENTE), comprarCarrito);

// Canje de cupón (solo EMPLEADO: administradores_empresas)
router.post('/canjear', verifyJwt, requireRole(ROLES.EMPLEADO), canjearCupon);

export default router;
