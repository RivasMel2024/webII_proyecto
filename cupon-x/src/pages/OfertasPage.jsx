import React, { useState, useEffect, useMemo } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import Hero from '../components/Hero';
import CouponCard from '../components/CouponCard';
import { getOfertasVigentes, getRubros } from '../services/api';
import '../styles/coupongrid.css';

/**
 * Página OfertasPage - Vista principal de cupones vigentes con filtros
 */
const OfertasPage = () => {
  const [searchParams] = useSearchParams();
  
  // Estados
  const [ofertas, setOfertas] = useState([]);
  const [rubros, setRubros] = useState([]);
  const [filtros, setFiltros] = useState({ 
    rubro_id: searchParams.get('rubro_id') ? Number(searchParams.get('rubro_id')) : null, 
    search: searchParams.get('search') || '' 
  });
  const [loading, setLoading] = useState(true);
  const [loadingRubros, setLoadingRubros] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarRubros();
  }, []);

  useEffect(() => {
    cargarOfertas();
  }, [filtros]);

  const cargarRubros = async () => {
    try {
      setLoadingRubros(true);
      const response = await getRubros();
      if (response.success) {
        setRubros(response.data);
      }
    } catch (error) {
      console.error('Error al cargar rubros:', error);
    } finally {
      setLoadingRubros(false);
    }
  };

  const cargarOfertas = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (filtros.rubro_id) params.rubro_id = filtros.rubro_id;
      if (filtros.search && filtros.search.trim() !== '') {
        params.search = filtros.search.trim();
      }

      const response = await getOfertasVigentes(params);
      
      if (response.success) {
        setOfertas(response.data);
      } else {
        setError(response.message || 'Error al cargar ofertas');
        setOfertas([]);
      }
    } catch (error) {
      console.error('Error al cargar ofertas:', error);
      setError('Error de conexión. Por favor, intenta nuevamente.');
      setOfertas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (nuevosFiltros) => {
    setFiltros(nuevosFiltros);
  };

  const getFiltroActivo = () => {
    if (!filtros.rubro_id && !filtros.search) return '';
    let texto = '';
    if (filtros.rubro_id) {
      const rubro = rubros.find(r => r.id === filtros.rubro_id);
      texto = rubro ? rubro.nombre : '';
    }
    if (filtros.search) {
      texto += texto ? ` (búsqueda: "${filtros.search}")` : `"${filtros.search}"`;
    }
    return texto;
  };

  /**
   * formato CouponCard - AQUÍ AGREGAMOS LA IMAGEN
   */
  const cuponesAdaptados = useMemo(() => {
    return (ofertas || []).map((oferta) => {
      let fechaIgual = '—';
      if (oferta.fecha_limite_uso) {
        const date = new Date(oferta.fecha_limite_uso);
        if (!isNaN(date.getTime())) {
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          const year = date.getFullYear().toString().slice(-2);
          fechaIgual = `${month}/${day}/${year}`;
        }
      }

      return {
        id: oferta.oferta_id,
        brand: oferta.titulo,
        category: oferta.rubro_nombre,
        price: `$${Number(oferta.precio_oferta ?? 0).toFixed(2)}`,
        description: oferta.descripcion || 'Sin descripción',
        code: 'Oferta disponible',
        expiry: fechaIgual,

        imagen_url: oferta.imagen_url 
      };
    });
  }, [ofertas]);

  console.log("OFERTA COMPLETA:", ofertas);

  return (
    <div className="ofertas-page">
      <Hero 
        rubros={rubros}
        filtrosActuales={filtros}
        onFiltroChange={handleFiltroChange}
        mostrarImagen={true}
      />

      <Container className="py-4">
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Cargando cupones vigentes...</p>
          </div>
        )}

        {!loading && error && (
          <Alert variant="danger" className="text-center">
            <Alert.Heading>Error al cargar cupones</Alert.Heading>
            <p>{error}</p>
          </Alert>
        )}

        {!loading && !error && cuponesAdaptados.length === 0 && (
          <div className="text-center py-5">
            <h4 className="text-muted">No se encontraron cupones</h4>
            <p className="text-muted">
              {getFiltroActivo() 
                ? `No hay cupones disponibles para: ${getFiltroActivo()}` 
                : 'No hay cupones vigentes en este momento'}
            </p>
          </div>
        )}

        {!loading && !error && cuponesAdaptados.length > 0 && (
          <>
            <div className="mb-3">
              <p className="text-muted">
                {cuponesAdaptados.length} {cuponesAdaptados.length === 1 ? 'cupón encontrado' : 'cupones encontrados'}
                {getFiltroActivo() && ` en ${getFiltroActivo()}`}
              </p>
            </div>

            <Row xs={1} sm={2} md={3} lg={3} className="g-4">
              {cuponesAdaptados.map((cupon) => (
                <Col key={cupon.id}>
                  <CouponCard data={cupon} />
                </Col>
              ))}
            </Row>

            <div className="text-center mt-5 text-muted">
              <small>
                Los cupones mostrados son válidos dentro del período indicado.
                <br />
                Son personales e intransferibles.
              </small>
            </div>
          </>
        )}
      </Container>
    </div>
  );
};

export default OfertasPage;
