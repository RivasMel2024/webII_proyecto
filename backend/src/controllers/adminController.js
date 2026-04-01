import pool from "../config/database.js";

export const getDashboardStats = async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(c.id) as total_cupones_vendidos,
        SUM(c.precio_pagado) as ingresos_totales,
        SUM(c.precio_pagado * (e.porcentaje_comision / 100)) as comisiones_totales,
        COUNT(DISTINCT c.cliente_id) as clientes_activos
      FROM cupones c
      INNER JOIN ofertas o ON c.oferta_id = o.id
      INNER JOIN empresas e ON o.empresa_id = e.id
    `;

    const { rows } = await pool.query(statsQuery);
    
    // También traemos conteo de ofertas pendientes por revisar
    const { rows: pendingOffers } = await pool.query(
      "SELECT COUNT(*) FROM ofertas WHERE estado = 'en_espera'"
    );

    res.json({ 
      success: true, 
      data: {
        ...rows[0],
        ofertas_pendientes: pendingOffers[0].count
      } 
    });
  } catch (error) {
    console.error("Error en stats:", error);
    res.status(500).json({ success: false, message: "Error al calcular estadísticas" });
  }
};