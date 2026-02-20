import React, { useState } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../styles/login.css';
import { forgotPassword } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const result = await forgotPassword({ email });
      setMessage(result.message || 'Solicitud enviada.');
    } catch (err) {
      setError(err.message || 'Error al solicitar recuperación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="login-container">
      <Card className="login-card">
        <Card.Body className="p-4">
          <h2 className="login-title">Recuperar Acceso</h2>
          <p className="text-center mb-4" style={{ color: '#666', fontSize: '0.9rem' }}>
            Ingresa tu correo electrónico y te enviaremos información para restablecer tu contraseña.
          </p>
          
          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-4">
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

            <Button className="btn-login-submit" type="submit" disabled={loading}>
              {loading ? 'ENVIANDO...' : 'ENVIAR'}
            </Button>
          </Form>
          
          <div className="login-footer-text">
            <span>¿Recordaste tu contraseña? <Link to="/login">Regresar</Link></span>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ForgotPassword;