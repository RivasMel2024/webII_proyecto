import React from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { Link } from "react-router-dom";
import '../styles/login.css'; 

const Login = () => {
  return (
    <Container className="login-container">
      <Card className="login-card">
        <Card.Body className="p-4">
          <h2 className="login-title">Ingresar</h2>
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="login-label">Correo Electrónico</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="ejemplo@correo.com" 
                className="login-input" 
                required 
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="login-label">Contraseña</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="********" 
                className="login-input" 
                required 
              />
            </Form.Group>

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

            <Button className="btn-login-submit" type="submit">
              ENTRAR
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