import pool from "../config/database.js";
import { successResponse, errorResponse } from "../utils/responses.js";

/**
 * Obtiene todos los rubros activos
 * Para mostrar en el dropdown de categorías del frontend
 */
export const getRubros = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        nombre,
        activo
      FROM rubros
      WHERE activo = TRUE
      ORDER BY nombre ASC
    `);

    return successResponse(res, result.rows, "Rubros obtenidos correctamente");
  } catch (error) {
    return errorResponse(res, "Error al obtener rubros", 500, error.message);
  }
};
