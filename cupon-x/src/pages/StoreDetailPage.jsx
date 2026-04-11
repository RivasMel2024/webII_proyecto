import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaTag } from 'react-icons/fa';
import { getEmpresaById, getOfertasByEmpresa } from '../services/api';
import CouponCard from '../components/CouponCard';

export default function StoreDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [empresa, setEmpresa] = useState(null);
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [resEmp, resOfertas] = await Promise.all([
          getEmpresaById(id),
          getOfertasByEmpresa(id),
        ]);
        setEmpresa(resEmp?.data || null);
        setOfertas(Array.isArray(resOfertas?.data) ? resOfertas.data : []);
      } catch (e) {
        setError(e?.message || 'Error cargando tienda');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Adaptar formato de la oferta al que espera CouponCard
  const adapt = (o) => ({
    id: o.oferta_id,
    brand: empresa?.nombre || '',
    category: empresa?.rubro_nombre || '',
    titulo: o.titulo,
    description: o.descripcion || 'Sin descripción',
    price: `$${Number(o.precio_oferta).toFixed(2)}`,
    precio_oferta: o.precio_oferta,
    expiry: o.fecha_limite_uso
      ? new Date(o.fecha_limite_uso).toLocaleDateString('es-SV')
      : 'Sin fecha',
    fecha_limite_uso: o.fecha_limite_uso,
    code: 'Oferta disponible',
    imagen_url: o.imagen_url,
    descuento_pct: o.descuento_pct,
  });

  if (loading) {
    return (
      <div className="py-5 text-center">
        <Spinner animation="border" size="sm" />
        <span className="ms-2">Cargando tienda...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!empresa) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Empresa no encontrada.</Alert>
      </Container>
    );
  }

  return (
    <section className="py-5">
      <Container>

        {/* Botón volver */}
        <button
          onClick={() => navigate(-1)}
          className="btn btn-link p-0 mb-4 text-decoration-none"
          style={{ color: '#c1121f', fontWeight: 600 }}
        >
          <FaArrowLeft className="me-2" />
          Volver a tiendas
        </button>

        {/* Header de empresa */}
        <div
          className="rounded-3 p-4 mb-5 text-white d-flex align-items-center gap-4"
          style={{ background: empresa.color_hex || '#333' }}
        >
          <div
            className="d-flex align-items-center justify-content-center rounded-3 fw-bold text-uppercase"
            style={{
              width: 80,
              height: 80,
              minWidth: 80,
              background: 'rgba(255,255,255,0.15)',
              fontSize: 28,
              letterSpacing: 1,
            }}
          >
            {empresa.nombre.slice(0, 2)}
          </div>
          <div>
            <h2 className="fw-bold mb-1">{empresa.nombre}</h2>
            <div className="mb-1" style={{ opacity: 0.85, fontSize: 14 }}>
              {empresa.rubro_nombre}
            </div>
            {empresa.descripcion && (
              <div style={{ opacity: 0.8, fontSize: 14 }}>{empresa.descripcion}</div>
            )}
          </div>
        </div>

        {/* Título sección cupones */}
        <div className="mb-4 d-flex align-items-center gap-2">
          <FaTag style={{ color: '#c1121f' }} />
          <h4 className="fw-bold mb-0">
            Cupones de <span style={{ color: '#c1121f' }}>{empresa.nombre}</span>
          </h4>
          <span className="text-muted ms-2" style={{ fontSize: 14 }}>
            ({ofertas.length} disponible{ofertas.length !== 1 ? 's' : ''})
          </span>
        </div>

        {ofertas.length === 0 ? (
          <Alert variant="info">Esta tienda no tiene cupones disponibles por el momento.</Alert>
        ) : (
          <Row className="g-4">
            {ofertas.map((o) => (
              <Col key={o.oferta_id} xs={12} sm={6} md={4}>
                <CouponCard data={adapt(o)} />
              </Col>
            ))}
          </Row>
        )}

      </Container>
    </section>
  );
}
