import { Router } from "express";
import { getRubros } from "../controllers/rubrosController.js";

const router = Router();

/**
 * GET /api/rubros
 * Obtiene todos los rubros (categorías) activos
 * Para mostrar en el filtro de categorías del frontend
 */
router.get("/", getRubros);

export default router;
