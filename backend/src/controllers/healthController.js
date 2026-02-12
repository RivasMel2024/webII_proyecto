import pool from '../config/database.js';

export const getHealth = (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
};

export const getStatus = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    
    res.json({
      status: 'OK',
      message: 'Backend and Database are running',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: error.message
    });
  }
};
