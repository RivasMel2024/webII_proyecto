import { Router } from "express";
import { getDashboardStats } from "../controllers/adminController.js";
import { getOfertasAdmin } from "../controllers/ofertasController.js";
import { verifyJwt } from "../middleware/authJwt.js";
import { requireRole } from "../middleware/rbac.js";
import { ROLES } from "../utils/roles.js";

const router = Router();

// Todas las rutas aquí dentro requieren ser ADMIN_CUPONERA
router.use(verifyJwt, requireRole(ROLES.ADMIN_CUPONERA));

/**
 * GET /api/admin/stats
 * Dashboard financiero (Ingresos, Comisiones, Cupones)
 */
router.get("/stats", getDashboardStats);

/**
 * GET /api/admin/ofertas
 * Listado completo de ofertas para revisión (Pendientes, Aprobadas, Rechazadas)
 */
router.get("/ofertas", getOfertasAdmin);

export default router;