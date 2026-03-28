import express from "express";
import { getHealth, getStatus } from "../controllers/healthController.js";
import { testConnection } from "../controllers/testController.js";

import cuponsRoutes from "./cupons.js";
import clientesRoutes from "./clientes.js";
import ofertasRoutes from "./ofertasRoutes.js";
import authRoutes from "./auth.js";
import rubrosRoutes from "./rubros.js";
import empresasRoutes from "./empresas.js";
import empleadosRoutes from "./empleados.js";

const router = express.Router();

// Rutas de salud
router.get("/health", getHealth);
router.get("/status", getStatus);

// Ruta de prueba de conexión
// router.get("/test-connection", testConnection);

// Auth (JWT)
router.use('/auth', authRoutes);

// Rutas de cupones
router.use("/cupones", cuponsRoutes);
router.use("/clientes", clientesRoutes);


// Rutas de ofertas y rubros
router.use("/ofertas", ofertasRoutes);
router.use("/rubros", rubrosRoutes);

// Rutas de empresas
router.use("/empresas", empresasRoutes);

// Rutas de empleados
router.use("/empleados", empleadosRoutes);

export default router;