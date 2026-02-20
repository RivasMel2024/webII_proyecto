import pool from '../config/database.js';
import { successResponse, errorResponse } from '../utils/responses.js';

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
    const { nombre, descripcion, descuento, codigo, fecha_inicio, fecha_fin } = req.body;
    
    // Validaciones básicas
    if (!nombre || !codigo) {
      return errorResponse(res, 'Nombre y código son requeridos', 400);
    }
    
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO cupones (nombre, descripcion, descuento, codigo, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, descripcion, descuento, codigo, fecha_inicio, fecha_fin]
    );
    connection.release();
    
    successResponse(res, { id: result.insertId }, 'Cupón creado exitosamente', 201);
  } catch (error) {
    errorResponse(res, 'Error al crear cupón', 500, error.message);
  }
};

/**
 * Actualizar cupón
 */
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, descuento, codigo, fecha_inicio, fecha_fin } = req.body;
    
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'UPDATE cupones SET nombre = ?, descripcion = ?, descuento = ?, codigo = ?, fecha_inicio = ?, fecha_fin = ? WHERE id = ?',
      [nombre, descripcion, descuento, codigo, fecha_inicio, fecha_fin, id]
    );
    connection.release();
    
    if (result.affectedRows === 0) {
      return errorResponse(res, 'Cupón no encontrado', 404);
    }
    
    successResponse(res, { id }, 'Cupón actualizado exitosamente');
  } catch (error) {
    errorResponse(res, 'Error al actualizar cupón', 500, error.message);
  }
};

/**
 * Eliminar cupón
 */
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    
    const connection = await pool.getConnection();
    const [result] = await connection.query('DELETE FROM cupones WHERE id = ?', [id]);
    connection.release();
    
    if (result.affectedRows === 0) {
      return errorResponse(res, 'Cupón no encontrado', 404);
    }
    
    successResponse(res, null, 'Cupón eliminado exitosamente');
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
