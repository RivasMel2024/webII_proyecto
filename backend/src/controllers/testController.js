import pool from '../config/database.js';

export const testConnection = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Hacer una consulta simple para verificar la conexión
    await connection.execute('SELECT 1');
    
    connection.release();
    
    res.json({
      success: true,
      message: 'Conexión realizada con éxito',
      database: process.env.DB_NAME,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en la conexión a la base de datos',
      error: error.message
    });
  }
};
