import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { FaHistory, FaTicketAlt, FaCalendarCheck, FaQrcode, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getCuponesByCliente, getAuthUser } from '../services/api';
import "../styles/variables.css";

const HistorialPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cupones, setCupones] = useState([]);
  const user = getAuthUser();

  useEffect(() => {
    const loadCupones = async () => {
      if (!user?.id) {
        setError('Debes iniciar sesión para ver tu historial');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await getCuponesByCliente(user.id);
        
        if (!result?.success) {
          throw new Error(result?.message || 'Error al cargar cupones');
        }

        setCupones(result.data || []);
      } catch (err) {
        setError(err.message || 'Error al cargar el historial');
      } finally {
        setLoading(false);
      }
    };

    loadCupones();
  }, [user?.id]);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getStatusBadge = (estado) => {
    const e = (estado || '').toLowerCase();
    if (e === 'disponible') return { bg: 'success', text: 'DISPONIBLE' };
    if (e === 'canjeado') return { bg: 'secondary', text: 'CANJEADO' };
    if (e === 'vencido') return { bg: 'danger', text: 'VENCIDO' };
    return { bg: 'dark', text: estado?.toUpperCase() || 'N/A' };
  };

  return (
    <Container className="py-5">
      <div className="d-flex align-items-center mb-4">
        <Link to="/" className="text-decoration-none me-3" style={{color: 'var(--color-text)'}}>
          <FaArrowLeft size={20} />
        </Link>
        <h2 className="fw-bold mb-0">Mi Historial <FaHistory className="ms-2" /></h2>
      </div>

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-3 text-muted">Cargando historial...</p>
        </div>
      )}

      {error && (
        <Alert variant="danger">{error}</Alert>
      )}

      {!loading && !error && cupones.length === 0 && (
        <Alert variant="info" className="text-center py-5">
          <FaTicketAlt size={50} className="mb-3 text-muted" />
          <h4>No tienes cupones aún</h4>
          <p className="text-muted">¡Comienza a comprar cupones para verlos aquí!</p>
          <Button as={Link} to="/coupons" variant="primary" className="mt-3">
            Ver Cupones Disponibles
          </Button>
        </Alert>
      )}

      <Row>
        {cupones.map((cupon) => {
          const status = getStatusBadge(cupon.estado);
          return (
            <Col md={6} lg={4} key={cupon.id} className="mb-4">
              <Card className={`history-ticket ${cupon.estado === 'canjeado' ? 'ticket-used' : ''}`}>
                <Card.Body className="p-0 d-flex flex-column">
                  
                  {/* Parte superior del ticket */}
                  <div className="ticket-top p-3 text-center">
                    <Badge bg={status.bg} className="mb-2">
                      {status.text}
                    </Badge>
                    <h5 className="fw-bold mb-1">{cupon.oferta_titulo || 'Cupón'}</h5>
                    <p className="small mb-0 text-muted">{cupon.oferta_descripcion}</p>
                    <div className="small text-muted mt-2">
                      <strong>{cupon.empresa_nombre}</strong>
                    </div>
                  </div>

                  {/* Línea divisoria decorativa (Corte de ticket) */}
                  <div className="ticket-divider">
                    <div className="notch left"></div>
                    <div className="dots"></div>
                    <div className="notch right"></div>
                  </div>

                  {/* Parte inferior del ticket */}
                  <div className="ticket-bottom p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="small text-muted">
                        <FaCalendarCheck className="me-1" /> 
                        {formatDate(cupon.fecha_compra)}
                      </div>
                      <div className="fw-bold text-primary-dark">
                        {cupon.codigo}
                      </div>
                    </div>
                    
                    <div className="small text-muted mb-3">
                      Vence: {formatDate(cupon.fecha_limite_uso)}
                    </div>
                    
                    {cupon.estado === 'disponible' ? (
                      <Button variant="outline-dark" className="w-100 d-flex align-items-center justify-content-center">
                        <FaQrcode className="me-2" /> VER DETALLES
                      </Button>
                    ) : cupon.estado === 'canjeado' ? (
                      <Button variant="light" disabled className="w-100">
                        CUPÓN UTILIZADO
                      </Button>
                    ) : (
                      <Button variant="light" disabled className="w-100">
                        CUPÓN VENCIDO
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default HistorialPage;