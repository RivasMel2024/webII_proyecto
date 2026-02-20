import React, { useMemo, useState } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/login.css';
import { resetPassword } from '../services/api';

const useQuery = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const token = query.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const result = await resetPassword({ token, newPassword });
      setMessage(result.message || 'Contraseña actualizada');
      setTimeout(() => navigate('/login'), 800);
    } catch (err) {
      setError(err.message || 'Error al restablecer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="login-container">
      <Card className="login-card">
        <Card.Body className="p-4">
          <h2 className="login-title">Restablecer Contraseña</h2>

          {!token ? (
            <p className="text-danger text-center">Token no encontrado en la URL.</p>
          ) : null}

          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="login-label">Nueva contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Mínimo 8 caracteres"
                className="login-input"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={!token}
              />
            </Form.Group>

            {error ? (
              <div className="text-danger mb-3" style={{ fontSize: '0.9rem', whiteSpace: 'pre-line' }}>
                {error}
              </div>
            ) : null}
            {message ? (
              <div className="text-success mb-3" style={{ fontSize: '0.9rem', whiteSpace: 'pre-line' }}>
                {message}
              </div>
            ) : null}

            <Button className="btn-login-submit" type="submit" disabled={loading || !token}>
              {loading ? 'GUARDANDO...' : 'GUARDAR'}
            </Button>
          </Form>

          <div className="login-footer-text">
            <span>
              <Link to="/login">Regresar</Link>
            </span>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ResetPassword;
