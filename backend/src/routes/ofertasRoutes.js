import { Router } from "express";
import { 
  getTopOffers, 
  getAllOffers,
  getOfertasVigentes,
  createOferta,
  aprobarOferta,
  rechazarOferta,
  reenviarOferta,
  descartarOferta,
  getMisOfertas,
  getMisMetricas,
  getOfertaDetalle
} from "../controllers/ofertasController.js";
import { verifyJwt } from "../middleware/authJwt.js";
import { requireRole } from "../middleware/rbac.js";
import { ROLES } from "../utils/roles.js";

const router = Router();

// ============================================================
// Rutas de ofertas
// ============================================================

/**
 * GET /api/ofertas/top
 * Obtiene las mejores ofertas (más vendidas)
 * Query params: limit (número de ofertas a retornar)
 */
router.get("/top", getTopOffers);

/**
 * GET /api/ofertas
 * Obtiene todas las ofertas aprobadas
 */
router.get("/", getAllOffers);
router.get("/:id", getOfertaDetalle);

/**
 * GET /api/ofertas/vigentes
 * Obtiene ofertas vigentes con filtros opcionales
 * 
 * Query params:
 *   - rubro_id: Filtrar por ID de rubro (ej: /vigentes?rubro_id=1)
 *   - search: Buscar por palabra clave (ej: /vigentes?search=pizza)
 *   - Combinar: /vigentes?rubro_id=1&search=hamburguesa
 * 
 * Validaciones:
 *   - Estado = 'aprobada'
 *   - Fecha actual entre fecha_inicio y fecha_fin
 *   - Cantidad de cupones NO agotada (si aplica)
 */
router.get("/vigentes", getOfertasVigentes);

// ==============================
// Gestión de ciclo de vida
// ==============================

// Crear oferta (solo ADMIN_EMPRESA)
router.post("/", verifyJwt, requireRole(ROLES.ADMIN_EMPRESA), createOferta);

// Listado de ofertas de la empresa autenticada
router.get("/mis-ofertas", verifyJwt, requireRole(ROLES.ADMIN_EMPRESA), getMisOfertas);

// Métricas de la empresa autenticada
router.get("/mis-metricas", verifyJwt, requireRole(ROLES.ADMIN_EMPRESA), getMisMetricas);

// Aprobación/Rechazo (solo ADMIN_CUPONERA)
router.patch("/:id/aprobar", verifyJwt, requireRole(ROLES.ADMIN_CUPONERA), aprobarOferta);
router.patch("/:id/rechazar", verifyJwt, requireRole(ROLES.ADMIN_CUPONERA), rechazarOferta);

// Reenvío/Descarte (solo ADMIN_EMPRESA dueño)
router.patch("/:id/reenviar", verifyJwt, requireRole(ROLES.ADMIN_EMPRESA), reenviarOferta);
router.patch("/:id/descartar", verifyJwt, requireRole(ROLES.ADMIN_EMPRESA), descartarOferta);

export default router;
