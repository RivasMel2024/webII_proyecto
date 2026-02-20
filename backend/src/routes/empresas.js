import express from "express";
import {
  getTopEmpresas,
  getAllEmpresas,
  getEmpresaById,
  getOfertasByEmpresa,
} from "../controllers/empresasController.js";

const router = express.Router();

router.get("/top", getTopEmpresas);
router.get("/", getAllEmpresas);
router.get("/:id", getEmpresaById);
router.get("/:id/ofertas", getOfertasByEmpresa);

export default router;