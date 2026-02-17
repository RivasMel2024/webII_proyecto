import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import Hero from '../components/Hero';
import OfertasGrid from '../components/OfertasGrid';
import { getOfertasVigentes, getRubros } from '../services/api';

/**
 * Página OfertasPage - Vista principal de ofertas vigentes con filtros
 * 
 * Esta página muestra todas las ofertas vigentes aprobadas con:
 * - Filtrado por rubro (categoría)
 * - Búsqueda por palabra clave (título de oferta o nombre de empresa)
 * - Grid responsivo de tarjetas de ofertas
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

  return (
    <div className="ofertas-page">
      {/* Hero con filtros integrados */}
      <Hero 
        rubros={rubros}
        filtrosActuales={filtros}
        onFiltroChange={handleFiltroChange}
        mostrarImagen={true}
      />

      {/* Grid de Ofertas */}
      <Container className="py-4">
        <OfertasGrid
          ofertas={ofertas}
          loading={loading}
          error={error}
          filtroActivo={getFiltroActivo()}
        />

        {/* Información adicional */}
        {!loading && !error && ofertas.length > 0 && (
          <div className="text-center mt-5 text-muted">
            <small>
              Las ofertas mostradas son válidas dentro del período indicado.
              <br />
              Los cupones se generan al momento de la compra y son personales e intransferibles.
            </small>
          </div>
        )}
      </Container>
    </div>
  );
};

export default OfertasPage;
