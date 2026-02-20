import pool from '../config/database.js';
import { successResponse, errorResponse } from '../utils/responses.js';
import { sendEmail } from '../services/mailer.js';

/**
 * Obtener todos los cupones
 */
export const getAllCoupons = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM cupones');
    connection.release();
    
    successResponse(res, rows, 'Cupones obtenidos correctamente');
  } catch (error) {
    errorResponse(res, 'Error al obtener cupones', 500, error.message);
  }
};

/**
 * Obtener cupón por ID
 */
export const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM cupones WHERE id = ?', [id]);
    connection.release();
    
    if (rows.length === 0) {
      return errorResponse(res, 'Cupón no encontrado', 404);
    }
    
    successResponse(res, rows[0], 'Cupón obtenido correctamente');
  } catch (error) {
    errorResponse(res, 'Error al obtener cupón', 500, error.message);
  }
};

/**
 * Crear nuevo cupón
 */
export const createCoupon = async (req, res) => {
  try {
    return errorResponse(
      res,
      'Endpoint no disponible. La compra de cupones se realiza con POST /api/cupones/comprar',
      501
    );
  } catch (error) {
    errorResponse(res, 'Error al crear cupón', 500, error.message);
  }
};

/**
 * Actualizar cupón
 */
export const updateCoupon = async (req, res) => {
  try {
    return errorResponse(res, 'Endpoint no disponible', 501);
  } catch (error) {
    errorResponse(res, 'Error al actualizar cupón', 500, error.message);
  }
};

/**
 * Eliminar cupón
 */
export const deleteCoupon = async (req, res) => {
  try {
    return errorResponse(res, 'Usa DELETE /api/cupones/:id', 410);
  } catch (error) {
    errorResponse(res, 'Error al eliminar cupón', 500, error.message);
  }
};

/**
 * Obtener cupones de un cliente (por cliente_id)
 * 
 */
export const getCuponesByCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;

    const connection = await pool.getConnection();

    const [rows] = await connection.query(
      `SELECT 
          id, codigo, estado, precio_pagado, fecha_compra, fecha_canje,
          oferta_titulo, oferta_descripcion, fecha_limite_uso,
          empresa_nombre, empresa_direccion, empresa_telefono
       FROM v_cupones_clientes
       WHERE cliente_id = ?
       ORDER BY fecha_compra DESC`,
      [clienteId]
    );

    connection.release();

    return successResponse(res, rows, 'Cupones del cliente obtenidos correctamente');
  } catch (error) {
    return errorResponse(res, 'Error al obtener cupones del cliente', 500, error.message);
  }
};

// Eliminar cupón por ID (para uso interno, no expuesto en rutas públicas)
export const deleteCupon = async (req, res) => {
  try {
    const { id } = req.params;
    const cuponId = Number(id);

    if (!cuponId) {
      return res.status(400).json({
        success: false,
        message: "ID de cupón inválido",
      });
    }

    const connection = await pool.getConnection();

    const [result] = await connection.query(
      "DELETE FROM cupones WHERE id = ?",
      [cuponId]
    );

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Cupón no encontrado",
      });
    }

    return res.json({
      success: true,
      message: "Cupón eliminado correctamente",
    });

  } catch (error) {
    console.error("deleteCupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar cupón",
    });
  }
};

/**
 * Comprar uno o varios cupones (CLIENTE)
 * Body: { ofertaId, cantidad?, tarjeta? }
 */
export const comprarCupon = async (req, res) => {
  try {
    const clienteId = req.user?.id;
    const ofertaId = Number(req.body.ofertaId);
    const cantidad = Number(req.body.cantidad || 1);
    const tarjeta = req.body.tarjeta || {};

    if (!clienteId) return errorResponse(res, 'No autenticado', 401);
    if (!ofertaId) return errorResponse(res, 'ofertaId es requerido', 400);
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 20) {
      return errorResponse(res, 'cantidad inválida (1-20)', 400);
    }

    // Pago simulado: validación mínima
    if (tarjeta && Object.keys(tarjeta).length) {
      const numero = String(tarjeta.numero || '').replace(/\s+/g, '');
      const cvv = String(tarjeta.cvv || '').trim();
      if (numero.length < 13 || numero.length > 19) return errorResponse(res, 'Tarjeta inválida', 400);
      if (cvv.length < 3 || cvv.length > 4) return errorResponse(res, 'CVV inválido', 400);
    }

    const connection = await pool.getConnection();
    try {
      const [ofertaRows] = await connection.query('SELECT id, precio_oferta, titulo FROM ofertas WHERE id = ? LIMIT 1', [ofertaId]);
      if (!ofertaRows.length) return errorResponse(res, 'Oferta no encontrada', 404);

      const precioPagado = ofertaRows[0].precio_oferta;
      const codigos = [];

      for (let i = 0; i < cantidad; i += 1) {
        await connection.query('CALL sp_comprar_cupon(?, ?, ?, @codigo, @mensaje)', [ofertaId, clienteId, precioPagado]);
        const [outRows] = await connection.query('SELECT @codigo AS codigo, @mensaje AS mensaje');
        const out = outRows?.[0];

        if (!out?.codigo) {
          return errorResponse(res, out?.mensaje || 'No fue posible completar la compra', 400);
        }
        codigos.push(out.codigo);
      }

      const [clienteRows] = await connection.query('SELECT correo FROM clientes WHERE id = ? LIMIT 1', [clienteId]);
      const correo = clienteRows?.[0]?.correo;

      if (correo) {
        const texto = `Compra confirmada. Oferta: ${ofertaRows[0].titulo}. Códigos: ${codigos.join(', ')}`;
        await sendEmail({
          to: correo,
          subject: 'Confirmación de compra - CuponX',
          text: texto,
          html: `<p>${texto}</p>`,
        });
      }

      return successResponse(res, { codigos }, 'Compra realizada correctamente', 201);
    } finally {
      connection.release();
    }
  } catch (error) {
    return errorResponse(res, 'Error al comprar cupón', 500, error.message);
  }
};

/**
 * Canjear cupón (EMPLEADO)
 * Body: { codigoCupon, duiPresentado }
 */
export const canjearCupon = async (req, res) => {
  try {
    const empleadoId = req.user?.id;
    const empresaId = req.user?.empresaId;
    const codigoCupon = String(req.body.codigoCupon || '').trim();
    const duiPresentado = String(req.body.duiPresentado || '').trim();

    if (!empleadoId || !empresaId) return errorResponse(res, 'No autenticado', 401);
    if (!codigoCupon || !duiPresentado) {
      return errorResponse(res, 'codigoCupon y duiPresentado son requeridos', 400);
    }

    const connection = await pool.getConnection();
    try {
      // Verificar que el cupón pertenezca a la empresa del empleado
      const [scopeRows] = await connection.query(
        `SELECT o.empresa_id
         FROM cupones c
         INNER JOIN ofertas o ON c.oferta_id = o.id
         WHERE c.codigo = ?
         LIMIT 1`,
        [codigoCupon]
      );

      if (!scopeRows.length) return errorResponse(res, 'El cupón no existe', 404);
      if (Number(scopeRows[0].empresa_id) !== Number(empresaId)) {
        return errorResponse(res, 'Cupón no pertenece a tu empresa', 403);
      }

      await connection.query(
        'CALL sp_canjear_cupon(?, ?, ?, @valido, @mensaje)',
        [codigoCupon, duiPresentado, empleadoId]
      );
      const [outRows] = await connection.query('SELECT @valido AS valido, @mensaje AS mensaje');
      const out = outRows?.[0];

      if (!out?.valido) {
        return errorResponse(res, out?.mensaje || 'No se pudo canjear', 400);
      }

      return successResponse(res, { codigo: codigoCupon }, out.mensaje || 'Cupón canjeado', 200);
    } finally {
      connection.release();
    }
  } catch (error) {
    return errorResponse(res, 'Error al canjear cupón', 500, error.message);
  }
};
