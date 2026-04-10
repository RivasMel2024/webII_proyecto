import express from "express";
import {
  getTopEmpresas,
  getAllEmpresas,
  getAllEmpresasAdmin,
  getEmpresaById,
  getOfertasByEmpresa,
  getMiEmpresa,
  updateMiEmpresa,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
} from "../controllers/empresasController.js";
import { verifyJwt } from "../middleware/authJwt.js";
import { requireRole } from "../middleware/rbac.js";
import { ROLES } from "../utils/roles.js";

const router = express.Router();

router.get("/top", getTopEmpresas);
router.get("/admin/all", verifyJwt, requireRole(ROLES.ADMIN_CUPONERA), getAllEmpresasAdmin);
router.get("/mi-empresa", verifyJwt, requireRole(ROLES.ADMIN_EMPRESA), getMiEmpresa);
router.patch("/mi-empresa", verifyJwt, requireRole(ROLES.ADMIN_EMPRESA), updateMiEmpresa);
router.get("/", getAllEmpresas);
router.get("/:id", getEmpresaById);
router.get("/:id/ofertas", getOfertasByEmpresa);

router.post("/", verifyJwt, requireRole(ROLES.ADMIN_CUPONERA), createEmpresa);
router.put("/:id", verifyJwt, requireRole(ROLES.ADMIN_CUPONERA), updateEmpresa);
router.delete("/:id", verifyJwt, requireRole(ROLES.ADMIN_CUPONERA), deleteEmpresa);

export default router;