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
      ORDER BY nombre ASC
    `);

    return successResponse(res, result.rows, "Rubros obtenidos correctamente");
  } catch (error) {
    return errorResponse(res, "Error al obtener rubros", 500, error.message);
  }
};

export const createRubro = async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre) return errorResponse(res, "El nombre es obligatorio", 400);

    const existe = await pool.query("SELECT id FROM rubros WHERE nombre ILIKE $1", [nombre.trim()]);
    if (existe.rows.length) return errorResponse(res, "Ya existe un rubro con ese nombre", 409);

    const result = await pool.query(
      "INSERT INTO rubros (nombre, activo) VALUES ($1, TRUE) RETURNING id, nombre, activo",
      [nombre.trim()]
    );

    return successResponse(res, result.rows[0], "Rubro creado correctamente", 201);
  } catch (error) {
    return errorResponse(res, "Error al crear rubro", 500, error.message);
  }
};

export const updateRubro = async (req, res) => {
  try {
    const rubroId = Number(req.params.id);
    const { nombre, activo } = req.body;

    const existe = await pool.query("SELECT id FROM rubros WHERE id = $1", [rubroId]);
    if (!existe.rows.length) return errorResponse(res, "Rubro no encontrado", 404);

    const result = await pool.query(
      `UPDATE rubros SET
        nombre = COALESCE($1, nombre),
        activo = COALESCE($2, activo)
       WHERE id = $3
       RETURNING id, nombre, activo`,
      [nombre ?? null, activo ?? null, rubroId]
    );

    return successResponse(res, result.rows[0], "Rubro actualizado correctamente");
  } catch (error) {
    return errorResponse(res, "Error al actualizar rubro", 500, error.message);
  }
};

export const deleteRubro = async (req, res) => {
  try {
    const rubroId = Number(req.params.id);

    const existe = await pool.query("SELECT id FROM rubros WHERE id = $1", [rubroId]);
    if (!existe.rows.length) return errorResponse(res, "Rubro no encontrado", 404);

    // Soft delete para no romper FKs con empresas
    await pool.query("UPDATE rubros SET activo = FALSE WHERE id = $1", [rubroId]);

    return successResponse(res, null, "Rubro desactivado correctamente");
  } catch (error) {
    return errorResponse(res, "Error al eliminar rubro", 500, error.message);
  }
};
