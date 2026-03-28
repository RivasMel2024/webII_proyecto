import { Router } from "express";
import { getRubros, createRubro, updateRubro, deleteRubro } from "../controllers/rubrosController.js";
import { verifyJwt } from "../middleware/authJwt.js";
import { requireRole } from "../middleware/rbac.js";
import { ROLES } from "../utils/roles.js";

const router = Router();

router.get("/", getRubros);
router.post("/", verifyJwt, requireRole(ROLES.ADMIN_CUPONERA), createRubro);
router.put("/:id", verifyJwt, requireRole(ROLES.ADMIN_CUPONERA), updateRubro);
router.delete("/:id", verifyJwt, requireRole(ROLES.ADMIN_CUPONERA), deleteRubro);

export default router;
