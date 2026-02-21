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
 * 
 * Esta página muestra todos los cupones vigentes aprobados con:
 * - Filtrado por rubro (categoría)
 * - Búsqueda por palabra clave (título de oferta o nombre de empresa)
 * - Grid responsivo de tarjetas de cupones
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

  // Cargar rubros al montar el componente
  useEffect(() => {
    cargarRubros();
  }, []);

  // Cargar ofertas cuando cambian los filtros
  useEffect(() => {
    cargarOfertas();
  }, [filtros]);

  /**
   * Carga los rubros (categorías) desde la API
   */
  const cargarRubros = async () => {
    try {
      setLoadingRubros(true);
      const response = await getRubros();
      
      if (response.success) {
        setRubros(response.data);
      } else {
        console.error('Error al cargar rubros:', response.message);
      }
    } catch (error) {
      console.error('Error al cargar rubros:', error);
    } finally {
      setLoadingRubros(false);
    }
  };

  /**
   * Carga las ofertas vigentes aplicando los filtros actuales
   */
  const cargarOfertas = async () => {
    try {
      setLoading(true);
      setError(null);

      // Preparar parámetros de filtrado
      const params = {};
      if (filtros.rubro_id) {
        params.rubro_id = filtros.rubro_id;
      }
      if (filtros.search && filtros.search.trim() !== '') {
        params.search = filtros.search.trim();
      }

      // Llamar a la API
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

  /**
   * Maneja los cambios en los filtros
   * @param {Object} nuevosFiltros - { rubro_id, search }
   */
  const handleFiltroChange = (nuevosFiltros) => {
    setFiltros(nuevosFiltros);
  };

  /**
   * Obtiene el nombre del filtro activo para mostrarlo
   */
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
   *formato CouponCard
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
        expiry: fechaIgual
      };
    });
  }, [ofertas]);

  return (
    <div className="ofertas-page">
      {/* Hero con filtros integrados */}
      <Hero 
        rubros={rubros}
        filtrosActuales={filtros}
        onFiltroChange={handleFiltroChange}
        mostrarImagen={true}
      />

      {/* Grid de Cupones */}
      <Container className="py-4">
        {/* Estado de carga */}
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Cargando cupones vigentes...</p>
          </div>
        )}

        {/* Estado de error */}
        {!loading && error && (
          <Alert variant="danger" className="text-center">
            <Alert.Heading>Error al cargar cupones</Alert.Heading>
            <p>{error}</p>
          </Alert>
        )}

        {/* Sin resultados */}
        {!loading && !error && cuponesAdaptados.length === 0 && (
          <div className="text-center py-5">
            <h4 className="text-muted">No se encontraron cupones</h4>
            <p className="text-muted">
              {getFiltroActivo() 
                ? `No hay cupones disponibles para: ${getFiltroActivo()}` 
                : 'No hay cupones vigentes en este momento'}
            </p>
            <p className="text-muted small">
              Intenta cambiar los filtros o buscar con otras palabras clave
            </p>
          </div>
        )}

        {/* Grid de cupones */}
        {!loading && !error && cuponesAdaptados.length > 0 && (
          <>
            {/* Contador de resultados */}
            <div className="mb-3">
              <p className="text-muted">
                {cuponesAdaptados.length} {cuponesAdaptados.length === 1 ? 'cupón encontrado' : 'cupones encontrados'}
                {getFiltroActivo() && ` en ${getFiltroActivo()}`}
              </p>
            </div>

            {/* Grid responsivo - mismo layout que Top Coupons */}
            <Row xs={1} sm={2} md={3} lg={3} className="g-4">
              {cuponesAdaptados.map((cupon) => (
                <Col key={cupon.id}>
                  <CouponCard data={cupon} />
                </Col>
              ))}
            </Row>

            {/* Información adicional */}
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
