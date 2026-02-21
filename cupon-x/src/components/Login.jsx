import React, { useState } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { Link, useNavigate } from "react-router-dom";
import '../styles/login.css'; 
import { login as loginApi, setAuthSession } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await loginApi({ email, password });
      setAuthSession({ token: result.token, user: result.user });
      // Redirección simple: Admin Cuponera → cupones-clientes; otros → home
      if (result.user?.role === 'ADMIN_CUPONERA') navigate('/cupones-clientes');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="login-container">
      <Card className="login-card">
        <Card.Body className="p-4">
          <h2 className="login-title">Ingresar</h2>
          
          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="login-label">Correo Electrónico</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="ejemplo@correo.com" 
                className="login-input" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="login-label">Contraseña</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="********" 
                className="login-input" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            {error ? (
              <div className="text-danger mb-3" style={{ fontSize: '0.9rem' }}>
                {error}
              </div>
            ) : null}

            {/* Link de recuperación alineado a la derecha */}
            <div className="text-end mb-4">
              <Link 
                to="/forgot-password" 
                className="forgot-password-link"
                style={{ 
                  fontSize: '0.85rem', 
                  color: 'var(--color-primary)', 
                  fontWeight: '600', 
                  textDecoration: 'none' 
                }}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button className="btn-login-submit" type="submit" disabled={loading}>
              {loading ? 'ENTRANDO...' : 'ENTRAR'}
            </Button>
          </Form>

          <div className="login-footer-text">
            <span>
              ¿No tienes cuenta? 
              <Link to="/register">Regístrate</Link>
            </span>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;