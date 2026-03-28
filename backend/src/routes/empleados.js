import { Router } from "express";
import {
  getAllEmpleados,
  getEmpleadoById,
  createEmpleado,
  updateEmpleado,
  deleteEmpleado,
} from "../controllers/empleadosController.js";
import { verifyJwt } from "../middleware/authJwt.js";
import { requireRole } from "../middleware/rbac.js";
import { ROLES } from "../utils/roles.js";

const router = Router();

const adminOrEmpresa = requireRole(ROLES.ADMIN_CUPONERA, ROLES.ADMIN_EMPRESA);

router.get("/", verifyJwt, adminOrEmpresa, getAllEmpleados);
router.get("/:id", verifyJwt, adminOrEmpresa, getEmpleadoById);
router.post("/", verifyJwt, adminOrEmpresa, createEmpleado);
router.put("/:id", verifyJwt, adminOrEmpresa, updateEmpleado);
router.delete("/:id", verifyJwt, adminOrEmpresa, deleteEmpleado);

export default router;
