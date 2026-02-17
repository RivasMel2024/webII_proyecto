import express from "express";
import { getHealth, getStatus } from "../controllers/healthController.js";
import { testConnection } from "../controllers/testController.js";

import cuponsRoutes from "./cupons.js";
import clientesRoutes from "./clientes.js";
import ofertasRoutes from "./ofertasRoutes.js";
import rubrosRoutes from "./rubros.js";

const router = express.Router();

// Rutas de salud
router.get("/health", getHealth);
router.get("/status", getStatus);

// Ruta de prueba de conexión
router.get("/test-connection", testConnection);

// Rutas de cupones
router.use("/cupones", cuponsRoutes);

// Rutas de clientes
router.use("/clientes", clientesRoutes);

// Rutas de ofertas
router.use("/ofertas", ofertasRoutes);

// Rutas de rubros (categorías)
router.use("/rubros", rubrosRoutes);

export default router;
