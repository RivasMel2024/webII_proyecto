import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getAuthUser, changePassword } from '../services/api';
import '../styles/profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentUser = getAuthUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setMessage('Contraseña actualizada exitosamente');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowChangePassword(false);
    } catch (err) {
      setError(err.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  // Iniciales para avatar
  const iniciales = `${user.nombres?.[0] || ''}${user.apellidos?.[0] || ''}`.toUpperCase();

  return (
    <Container className="profile-container">
      <Card className="profile-card">
        <Card.Body>

          {/* Header */}
          <div className="profile-header text-center">
            <div className="profile-avatar">
              {user.nombres?.[0] || "U"}
            </div>
            <h3 className="profile-name">
              {user.nombres} {user.apellidos}
            </h3>
            <p className="profile-email">
              {user.email || user.correo}
            </p>
          </div>

          {/* Info */}
          <div className="profile-info">
            <Row>
              <Col md={6}>
                <div className="profile-item">
                  <span>Teléfono</span>
                  <p>{user.telefono || 'N/A'}</p>
                </div>
              </Col>

              <Col md={6}>
                <div className="profile-item">
                  <span>Rol</span>
                  <p>{user.role || 'CLIENTE'}</p>
                </div>
              </Col>
            </Row>

            {user.dui && (
              <div className="profile-item">
                <span>DUI</span>
                <p>{user.dui}</p>
              </div>
            )}

            {user.direccion && (
              <div className="profile-item">
                <span>Dirección</span>
                <p>{user.direccion}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          {!showChangePassword ? (
            <Button 
              className="btn-profile-primary w-100"
              onClick={() => setShowChangePassword(true)}
            >
              Cambiar Contraseña
            </Button>
          ) : (
            <div className="profile-password mt-4">
              <h5 className="mb-3">Cambiar Contraseña</h5>

              <Form onSubmit={handlePasswordChange}>
                <Form.Group className="mb-3">
                  <Form.Label>Contraseña Actual</Form.Label>
                  <Form.Control
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Nueva Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirmar Nueva Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                  />
                </Form.Group>

                {error && <div className="text-danger mb-2">{error}</div>}
                {message && <div className="text-success mb-2">{message}</div>}

                <div className="d-flex gap-2">
                  <Button type="submit" className="btn-profile-primary flex-grow-1" disabled={loading}>
                    {loading ? 'Actualizando...' : 'Actualizar'}
                  </Button>

                  <Button
                    className="btn-profile-secondary"
                    onClick={() => {
                      setShowChangePassword(false);
                      setError('');
                      setMessage('');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </Form>
            </div>
          )}

        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile;
