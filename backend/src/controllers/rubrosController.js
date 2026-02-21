import pool from "../config/database.js";
import { successResponse, errorResponse } from "../utils/responses.js";

/**
 * Obtiene todos los rubros activos
 * Para mostrar en el dropdown de categorías del frontend
 */
export const getRubros = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [rows] = await connection.query(`
      SELECT
        id,
        nombre,
        activo
      FROM rubros
      WHERE activo = 1
      ORDER BY nombre ASC
    `);

    connection.release();
    return successResponse(res, rows, "Rubros obtenidos correctamente");
  } catch (error) {
    return errorResponse(res, "Error al obtener rubros", 500, error.message);
  }
};
