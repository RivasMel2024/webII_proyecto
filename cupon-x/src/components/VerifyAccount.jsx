import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Container, Card } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import '../styles/login.css';
import { verifyAccount } from '../services/api';

const useQuery = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};

const VerifyAccount = () => {
  const query = useQuery();
  const token = query.get('token') || '';

  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verificando...');
  const hasVerified = useRef(false); // Previene doble verificación en StrictMode

  useEffect(() => {
    const run = async () => {
      // Prevenir doble ejecución (React.StrictMode ejecuta efectos dos veces en desarrollo)
      if (hasVerified.current) return;
      hasVerified.current = true;

      if (!token) {
        setStatus('error');
        setMessage('Token no encontrado en la URL.');
        return;
      }

      try {
        const result = await verifyAccount({ token });
        setStatus('ok');
        setMessage(result.message || 'Cuenta verificada correctamente.');
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'No se pudo verificar la cuenta.');
      }
    };

    run();
  }, [token]);

  return (
    <Container className="login-container">
      <Card className="login-card">
        <Card.Body className="p-4">
          <h2 className="login-title">Verificación</h2>
          <p
            className={status === 'error' ? 'text-danger text-center' : 'text-success text-center'}
            style={{ whiteSpace: 'pre-line' }}
          >
            {message}
          </p>
          <div className="login-footer-text">
            <span>
              <Link to="/login">Ir a iniciar sesión</Link>
            </span>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default VerifyAccount;
