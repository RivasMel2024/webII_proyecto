import pool from "../config/database.js";
import { successResponse, errorResponse } from "../utils/responses.js";

// Home: Top ofertas para vender (aunque nadie haya comprado)
export const getTopOffers = async (req, res) => {
  try {
    const limit = Number(req.query.limit || 6);

    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `
      SELECT
        o.id AS oferta_id,
        o.titulo,
        o.descripcion,
        o.precio_regular,
        o.precio_oferta,
        ROUND((1 - (o.precio_oferta / NULLIF(o.precio_regular,0))) * 100) AS descuento_pct,
        o.fecha_limite_uso,
        COUNT(c.id) AS vendidos
      FROM ofertas o
      LEFT JOIN cupones c ON c.oferta_id = o.id
      WHERE o.estado = 'aprobada'
        AND CURDATE() BETWEEN o.fecha_inicio_oferta AND o.fecha_fin_oferta
      GROUP BY
        o.id, o.titulo, o.descripcion, o.precio_regular, o.precio_oferta, o.fecha_limite_uso
      ORDER BY vendidos DESC, descuento_pct DESC
      LIMIT ?
      `,
      [limit]
    );

    connection.release();
    return successResponse(res, rows, "Top ofertas obtenidas correctamente");
  } catch (error) {
    return errorResponse(res, "Error al obtener top ofertas", 500, error.message);
  }
};


export const getAllOffers = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [rows] = await connection.query(`
      SELECT
        o.id AS oferta_id,
        o.titulo,
        o.descripcion,
        o.precio_regular,
        o.precio_oferta,
        ROUND((1 - (o.precio_oferta / NULLIF(o.precio_regular,0))) * 100) AS descuento_pct,
        o.fecha_limite_uso,
        o.estado
      FROM ofertas o
      WHERE o.estado = 'aprobada'
      ORDER BY o.id DESC
    `);

    connection.release();
    return successResponse(res, rows, "Ofertas obtenidas correctamente");
  } catch (error) {
    return errorResponse(res, "Error al obtener ofertas", 500, error.message);
  }
};
