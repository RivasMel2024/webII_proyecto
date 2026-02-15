import React from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';

const Login = () => {
  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh', marginTop: '50px' }}>
      <Card className="p-4 shadow-sm" style={{ width: '100%', maxWidth: '400px', borderRadius: '20px' }}>
        <Card.Body>
          <h2 className="text-center mb-4" style={{ color: 'var(--color-text)', fontWeight: '800' }}>Ingresar</h2>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Correo Electrónico</Form.Label>
              <Form.Control type="email" placeholder="ejemplo@correo.com" required />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control type="password" placeholder="********" required />
            </Form.Group>

            <Button className="w-100 btn-action-full" type="submit">
              ENTRAR
            </Button>
          </Form>
          <div className="text-center mt-3">
            <small>¿No tienes cuenta? <a href="#" style={{ color: 'var(--color-primary)' }}>Regístrate</a></small>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;