import express from 'express';
import { getHealth, getStatus } from '../controllers/healthController.js';
import { testConnection } from '../controllers/testController.js';
import cuponsRoutes from './cupons.js';

const router = express.Router();

// Rutas de salud
router.get('/health', getHealth);
router.get('/status', getStatus);

// Ruta de prueba de conexión
router.get('/test-connection', testConnection);

// Rutas de cupones
router.use('/cupones', cuponsRoutes);

// Rutas de clientes
router.use('/clientes', clientesRoutes);

export default router;
