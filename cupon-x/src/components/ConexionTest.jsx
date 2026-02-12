import { useState, useEffect } from 'react';
import { testConnection } from '../services/api';

export default function ConexionTest() {
  const [mensaje, setMensaje] = useState('');
  const [estado, setEstado] = useState('pendiente'); // pendiente, exito, error

  useEffect(() => {
    const verificarConexion = async () => {
      try {
        setEstado('pendiente');
        const resultado = await testConnection();
        setMensaje(resultado.message);
        setEstado('exito');
      } catch (error) {
        setMensaje(error.message);
        setEstado('error');
      }
    };

    verificarConexion();
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      {estado === 'pendiente' && <p>Verificando conexión...</p>}
      {estado === 'exito' && (
        <div style={{ color: 'green', fontSize: '18px', fontWeight: 'bold' }}>
          ✓ {mensaje}
        </div>
      )}
      {estado === 'error' && (
        <div style={{ color: 'red', fontSize: '18px', fontWeight: 'bold' }}>
          ✗ Error: {mensaje}
        </div>
      )}
    </div>
  );
}
