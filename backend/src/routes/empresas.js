import express from "express";
import {
  getTopEmpresas,
  getAllEmpresas,
  getEmpresaById,
  getOfertasByEmpresa,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
} from "../controllers/empresasController.js";
import { verifyJwt } from "../middleware/authJwt.js";
import { requireRole } from "../middleware/rbac.js";
import { ROLES } from "../utils/roles.js";

const router = express.Router();

router.get("/top", getTopEmpresas);
router.get("/", getAllEmpresas);
router.get("/:id", getEmpresaById);
router.get("/:id/ofertas", getOfertasByEmpresa);

router.post("/", verifyJwt, requireRole(ROLES.ADMIN_CUPONERA), createEmpresa);
router.put("/:id", verifyJwt, requireRole(ROLES.ADMIN_CUPONERA), updateEmpresa);
router.delete("/:id", verifyJwt, requireRole(ROLES.ADMIN_CUPONERA), deleteEmpresa);

export default router;