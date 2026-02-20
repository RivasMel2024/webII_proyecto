import express from "express";
import db from "../config/database.js"; 
import { verifyJwt } from "../middleware/authJwt.js";
import { requireRole } from "../middleware/rbac.js";
import { ROLES } from "../utils/roles.js";

const router = express.Router();

router.get("/", verifyJwt, requireRole(ROLES.ADMIN_CUPONERA), async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        id,
        CONCAT(nombres, ' ', apellidos) AS nombre,
        dui
      FROM clientes
      ORDER BY id
    `);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ success: false, message: "Error al obtener clientes" });
  }
});

export default router;
