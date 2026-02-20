import express from "express";
import db from "../config/database.js";

const router = express.Router();

router.get("/", async (req, res) => {
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
