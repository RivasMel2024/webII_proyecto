import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Modal, Badge, Row, Col } from 'react-bootstrap';
import { FaCalendarAlt, FaTicketAlt, FaCheckCircle, FaTag, FaBuilding } from 'react-icons/fa';
import { getAdminOfertas, aprobarOfertaApi, rechazarOfertaApi } from '../services/api';

// Preview visual del cupón (sin botones de compra)
const CouponPreview = ({ oferta }) => {
  const descuento = oferta.precio_regular && oferta.precio_oferta
    ? Math.round((1 - oferta.precio_oferta / oferta.precio_regular) * 100)
    : null;

  return (
    <div className="border rounded-3 overflow-hidden shadow-sm" style={{ maxWidth: 340, margin: '0 auto' }}>
      {/* Imagen */}
      <div style={{ height: 180, background: '#f1f3f5', overflow: 'hidden' }}>
        <img
          src={oferta.imagen_url || 'https://placehold.co/340x180?text=Sin+Imagen'}
          alt={oferta.titulo}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.src = 'https://placehold.co/340x180?text=Sin+Imagen'; }}
        />
      </div>

      {/* Body */}
      <div className="p-3 bg-white">
        {/* Empresa + descuento */}
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span className="badge bg-secondary" style={{ fontSize: 11 }}>
            <FaBuilding className="me-1" />{oferta.empresa_nombre}
          </span>
          {descuento && (
            <span className="badge" style={{ background: '#c1121f', fontSize: 12 }}>
              -{descuento}%
            </span>
          )}
        </div>

        {/* Título */}
        <h6 className="fw-bold mb-1" style={{ fontSize: 15 }}>{oferta.titulo}</h6>

        {/* Precio */}
        <div className="d-flex align-items-baseline gap-2 mb-2">
          <span style={{ fontSize: 22, fontWeight: 700, color: '#c1121f' }}>
            ${Number(oferta.precio_oferta).toFixed(2)}
          </span>
          {oferta.precio_regular && (
            <span className="text-muted text-decoration-line-through" style={{ fontSize: 13 }}>
              ${Number(oferta.precio_regular).toFixed(2)}
            </span>
          )}
        </div>

        {/* Descripción */}
        <p className="text-muted mb-2" style={{ fontSize: 13, lineHeight: 1.4 }}>
          <FaCheckCircle className="me-1 text-success" />
          {oferta.descripcion || 'Sin descripción'}
        </p>

        {/* Código simulado */}
        <div className="d-flex align-items-center gap-2 p-2 rounded mb-2"
          style={{ background: '#f8f9fa', border: '1px dashed #dee2e6', fontSize: 13 }}>
          <FaTicketAlt style={{ color: '#c1121f' }} />
          <span className="fw-semibold text-muted">{oferta.empresa_nombre?.slice(0,3).toUpperCase()}—PREVIEW</span>
        </div>

        {/* Fechas */}
        <div style={{ fontSize: 12, color: '#6c757d' }}>
          <FaCalendarAlt className="me-1" />
          Vence: {oferta.fecha_limite_uso
            ? new Date(oferta.fecha_limite_uso).toLocaleDateString('es-SV')
            : 'Sin fecha'}
        </div>
      </div>
    </div>
  );
};

const GestionOfertas = () => {
  const [ofertas, setOfertas] = useState([]);
  const [filtro, setFiltro] = useState('en_espera');

  // Modal de preview (aprobar/rechazar desde ahí)
  const [previewOferta, setPreviewOferta] = useState(null);
  const [rechazando, setRechazando] = useState(false);
  const [razon, setRazon] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const cargarOfertas = async () => {
    const res = await getAdminOfertas(filtro);
    if (res.success) setOfertas(res.data);
  };

  useEffect(() => { cargarOfertas(); }, [filtro]);

  const abrirPreview = (oferta) => {
    setPreviewOferta(oferta);
    setRechazando(false);
    setRazon('');
    setActionMsg('');
  };

  const cerrarPreview = () => {
    setPreviewOferta(null);
    setRechazando(false);
    setRazon('');
    setActionMsg('');
  };

  const handleAprobar = async () => {
    setActionLoading(true);
    setActionMsg('');
    try {
      const res = await aprobarOfertaApi(previewOferta.id);
      if (res.success) {
        cerrarPreview();
        cargarOfertas();
      }
    } catch (err) {
      setActionMsg(err.message || 'Error al aprobar');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRechazar = async () => {
    if (!razon.trim()) { setActionMsg('Debes escribir una razón de rechazo.'); return; }
    setActionLoading(true);
    setActionMsg('');
    try {
      const res = await rechazarOfertaApi(previewOferta.id, razon.trim());
      if (res.success) {
        cerrarPreview();
        cargarOfertas();
      }
    } catch (err) {
      setActionMsg(err.message || 'Error al rechazar');
    } finally {
      setActionLoading(false);
    }
  };

  const mostrarAcciones = filtro !== 'aprobada';

  return (
    <div className="gestion-ofertas">

      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-4">
        <div>
          <h4 className="fw-bold mb-1">Revisión de Ofertas</h4>
          <small className="text-muted">Aprueba o rechaza ofertas enviadas por empresas</small>
        </div>
        <Form.Select
          className="select-filtro"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        >
          <option value="en_espera">Pendientes</option>
          <option value="aprobada">Aprobadas</option>
          <option value="rechazada">Rechazadas</option>
          <option value="">Todas</option>
        </Form.Select>
      </div>

      {/* TABLA */}
      <div className="table-container">
        <Table className="custom-table align-middle" responsive>
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Título</th>
              <th>Precio</th>
              <th>Estado</th>
              {mostrarAcciones && <th className="text-center">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {ofertas.map(o => (
              <tr key={o.id}>
                <td className="fw-semibold">{o.empresa_nombre}</td>
                <td>{o.titulo}</td>
                <td>${Number(o.precio_oferta).toFixed(2)}</td>
                <td>
                  <span className={`estado-badge estado-${o.estado}`}>
                    {o.estado.replace('_', ' ')}
                  </span>
                </td>
                {mostrarAcciones && (
                  <td className="text-center">
                    {o.estado === 'en_espera' && (
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => abrirPreview(o)}
                      >
                        Preview
                      </Button>
                    )}
                    {o.estado === 'rechazada' && (
                      <div className="razon-rechazo">
                        <small>{o.razon_rechazo}</small>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* MODAL PREVIEW */}
      <Modal show={!!previewOferta} onHide={cerrarPreview} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">
            Preview de Oferta
            <Badge bg="warning" text="dark" className="ms-2" style={{ fontSize: 12 }}>
              Revisión
            </Badge>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4">
          {previewOferta && (
            <Row className="g-4">
              {/* PREVIEW VISUAL */}
              <Col md={5}>
                <p className="text-muted mb-2" style={{ fontSize: 12 }}>
                  Así se verá el cupón para los clientes:
                </p>
                <CouponPreview oferta={previewOferta} />
              </Col>

              {/* DETALLES */}
              <Col md={7}>
                <h6 className="fw-bold mb-3">Datos de la oferta</h6>
                <div className="row g-2" style={{ fontSize: 14 }}>
                  <div className="col-6">
                    <small className="text-muted d-block">Empresa</small>
                    <strong>{previewOferta.empresa_nombre}</strong>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Estado</small>
                    <span className={`estado-badge estado-${previewOferta.estado}`}>
                      {previewOferta.estado.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="col-12 mt-2">
                    <small className="text-muted d-block">Título</small>
                    <strong>{previewOferta.titulo}</strong>
                  </div>
                  <div className="col-12">
                    <small className="text-muted d-block">Descripción</small>
                    <span>{previewOferta.descripcion || '—'}</span>
                  </div>
                  <div className="col-6 mt-2">
                    <small className="text-muted d-block">Precio regular</small>
                    <strong>${Number(previewOferta.precio_regular).toFixed(2)}</strong>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Precio oferta</small>
                    <strong style={{ color: '#c1121f' }}>${Number(previewOferta.precio_oferta).toFixed(2)}</strong>
                  </div>
                  <div className="col-6 mt-1">
                    <small className="text-muted d-block">Inicio oferta</small>
                    <span>{previewOferta.fecha_inicio_oferta ? new Date(previewOferta.fecha_inicio_oferta).toLocaleDateString('es-SV') : '—'}</span>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Fin oferta</small>
                    <span>{previewOferta.fecha_fin_oferta ? new Date(previewOferta.fecha_fin_oferta).toLocaleDateString('es-SV') : '—'}</span>
                  </div>
                  <div className="col-6 mt-1">
                    <small className="text-muted d-block">Límite de uso</small>
                    <span>{previewOferta.fecha_limite_uso ? new Date(previewOferta.fecha_limite_uso).toLocaleDateString('es-SV') : '—'}</span>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Creada</small>
                    <span>{previewOferta.created_at ? new Date(previewOferta.created_at).toLocaleDateString('es-SV') : '—'}</span>
                  </div>
                </div>

                {/* SECCIÓN RECHAZAR */}
                {previewOferta.estado === 'en_espera' && (
                  <div className="mt-4">
                    {!rechazando ? (
                      <div className="d-flex gap-2">
                        <Button
                          className="btn-aprobar flex-grow-1"
                          onClick={handleAprobar}
                          disabled={actionLoading}
                        >
                          {actionLoading ? 'Aprobando...' : '✓ Confirmar Aprobación'}
                        </Button>
                        <Button
                          className="btn-rechazar"
                          onClick={() => { setRechazando(true); setActionMsg(''); }}
                          disabled={actionLoading}
                        >
                          Rechazar
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Form.Label className="fw-semibold">Razón del rechazo</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Ej: Le falta descripción detallada, la imagen no es clara..."
                          value={razon}
                          onChange={(e) => { setRazon(e.target.value); setActionMsg(''); }}
                          className="input-custom mb-2"
                        />
                        <div className="d-flex gap-2">
                          <Button
                            className="btn-rechazar flex-grow-1"
                            onClick={handleRechazar}
                            disabled={actionLoading}
                          >
                            {actionLoading ? 'Rechazando...' : 'Confirmar Rechazo'}
                          </Button>
                          <Button
                            variant="outline-secondary"
                            onClick={() => { setRechazando(false); setRazon(''); setActionMsg(''); }}
                            disabled={actionLoading}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                    {actionMsg && <p className="text-danger mt-2 mb-0 small">{actionMsg}</p>}
                  </div>
                )}
              </Col>
            </Row>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={cerrarPreview} disabled={actionLoading}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GestionOfertas;
