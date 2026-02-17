import React from 'react';
import { Row, Col, Spinner, Alert } from 'react-bootstrap';
import OfertaCard from './OfertaCard';
import { FaSearch } from 'react-icons/fa';

/**
 * Componente OfertasGrid - Grid responsivo de tarjetas de ofertas
 * 
 * @param {Array} ofertas - Lista de ofertas a mostrar
 * @param {boolean} loading - Indica si está cargando
 * @param {string} error - Mensaje de error 
 * @param {string} filtro - Nombre del filtro activo (para mensajes personalizados)
 */
const OfertasGrid = ({ ofertas = [], loading = false, error = null, filtro = '' }) => {
  
  // Estado de carga
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Cargando ofertas...</span>
        </Spinner>
        <p className="mt-3 text-muted">Cargando ofertas vigentes...</p>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <Alert variant="danger" className="text-center">
        <Alert.Heading>Error al cargar ofertas</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  // Sin resultados
  if (!ofertas || ofertas.length === 0) {
    return (
      <div className="text-center py-5">
        <FaSearch size={64} className="text-muted mb-3" />
        <h4 className="text-muted">No se encontraron ofertas</h4>
        <p className="text-muted">
          {filtro 
            ? `No hay ofertas disponibles para: ${filtro}` 
            : 'No hay ofertas vigentes en este momento'}
        </p>
        <p className="text-muted small">
          Intenta cambiar los filtros o buscar con otras palabras clave
        </p>
      </div>
    );
  }

  // Grid de ofertas
  return (
    <div className="ofertas-grid-wrapper">
      {/* Contador de resultados */}
      <div className="mb-3">
        <p className="text-muted">
          {ofertas.length} {ofertas.length === 1 ? 'oferta encontrada' : 'ofertas encontradas'}
          {filtro && ` en ${filtro}`}
        </p>
      </div>

      {/* Grid responsivo */}
      <Row xs={1} sm={2} md={2} lg={3} xl={4} className="g-4">
        {ofertas.map((oferta) => (
          <Col key={oferta.oferta_id}>
            <OfertaCard oferta={oferta} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default OfertasGrid;
