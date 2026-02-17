import { Router } from "express";
import { 
  getTopOffers, 
  getAllOffers,
  getOfertasVigentes
} from "../controllers/ofertasController.js";

const router = Router();

// ============================================================
// rutas de ofertas
// ============================================================

/**
 * GET /api/ofertas/top
 * Obtiene las mejores ofertas (más vendidas)
 * Query params: limit (número de ofertas a retornar)
 */
router.get("/top", getTopOffers);

/**
 * GET /api/ofertas
 * Obtiene todas las ofertas aprobadas (sin filtro de vigencia estricto)
 */
router.get("/", getAllOffers);

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

export default router;
