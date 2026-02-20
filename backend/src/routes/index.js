import express from "express";
import { getHealth, getStatus } from "../controllers/healthController.js";
import { testConnection } from "../controllers/testController.js";

import cuponsRoutes from "./cupons.js";
import clientesRoutes from "./clientes.js";
import ofertasRoutes from "./ofertasRoutes.js";
import empresasRoutes from "./empresas.js";

const router = express.Router();

// Rutas de salud
router.get("/health", getHealth);
router.get("/status", getStatus);

// Ruta de prueba de conexión
router.get("/test-connection", testConnection);

// Rutas
router.use("/cupones", cuponsRoutes);
router.use("/clientes", clientesRoutes);
router.use("/ofertas", ofertasRoutes);
router.use("/empresas", empresasRoutes);

export default router;