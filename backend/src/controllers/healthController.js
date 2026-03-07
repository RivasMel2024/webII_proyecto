import pool from '../config/database.js';

export const getHealth = (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
};

export const getStatus = async (req, res) => {
  try {
    await pool.query('SELECT 1');
    
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
