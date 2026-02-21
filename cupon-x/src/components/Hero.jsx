import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';
import '../styles/hero.css';

/**
 * Componente Hero - Banner principal con búsqueda y filtros
 * @param {Array} rubros - Lista de rubros/categorías disponibles
 * @param {Object} filtrosActuales - Filtros aplicados actualmente { rubro_id, search }
 * @param {Function} onFiltroChange - Callback para cambiar filtros
 * @param {Boolean} mostrarImagen - Mostrar imagen decorativa (default: true)
 * @param {Boolean} redirectToOfertas - Si true, redirige a /ofertas 
 */
const Hero = ({ rubros = [], filtrosActuales = {}, onFiltroChange, mostrarImagen = true, redirectToOfertas = false }) => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(filtrosActuales.search || '');
  const [rubroSeleccionado, setRubroSeleccionado] = useState(filtrosActuales.rubro_id || null);

  // Rubros destacados 
  const rubrosDestacados = ['Restaurantes', 'Turismo', 'Entretenimiento', 'Educación', 'Otros'];

  /**
   * Sincronizar estado local si los filtros externos cambian
   */
  useEffect(() => {
    setSearchInput(filtrosActuales.search || '');
    setRubroSeleccionado(filtrosActuales.rubro_id || null);
  }, [filtrosActuales]);

  /**
   * Manejar búsqueda - debounce implementado en el componente padre
   */
  const handleBuscar = () => {
    if (redirectToOfertas) {
      // Construir URL con parámetros
      const params = new URLSearchParams();
      if (rubroSeleccionado) params.append('rubro_id', rubroSeleccionado);
      if (searchInput.trim()) params.append('search', searchInput.trim());
      navigate(`/ofertas?${params.toString()}`);
    } else if (onFiltroChange) {
      onFiltroChange({rubro_id: rubroSeleccionado, search: searchInput});
    }
  };

  /**
   * Manejar Enter en el input de búsqueda
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleBuscar();
    }
  };

  /**
   * Manejar clic en pill de categoría
   */
  const handleCategoriaClick = (nombreRubro) => {
    const rubro = rubros.find(r => r.nombre === nombreRubro);
    const nuevoRubroId = rubro ? rubro.id : null;
    
    // Toggle: si ya está seleccionado, deseleccionar
    const rubroFinal = nuevoRubroId === rubroSeleccionado ? null : nuevoRubroId;
    
    setRubroSeleccionado(rubroFinal);
    
    if (redirectToOfertas) {
      // Redirigir a /ofertas con el filtro
      const params = new URLSearchParams();
      if (rubroFinal) params.append('rubro_id', rubroFinal);
      if (searchInput.trim()) params.append('search', searchInput.trim());
      navigate(`/ofertas?${params.toString()}`);
    } else if (onFiltroChange) {
      onFiltroChange({rubro_id: rubroFinal, search: searchInput});
    }
  };

  /**
   * Manejar selección de rubro desde dropdown
   */
  const handleRubroDropdown = (rubroId) => {
    setRubroSeleccionado(rubroId);
    
    if (redirectToOfertas) {
      // Redirigir a /ofertas con el filtro
      const params = new URLSearchParams();
      if (rubroId) params.append('rubro_id', rubroId);
      if (searchInput.trim()) params.append('search', searchInput.trim());
      navigate(`/ofertas?${params.toString()}`);
    } else if (onFiltroChange) {
      onFiltroChange({
        rubro_id: rubroId,
        search: searchInput
      });
    }
  };

  /**
   * Obtener el nombre del rubro seleccionado
   */
  const getNombreRubroSeleccionado = () => {
    if (!rubroSeleccionado) return 'Categoría';
    const rubro = rubros.find(r => r.id === rubroSeleccionado);
    return rubro ? rubro.nombre : 'Categoría';
  };

  return (
    <section className="hero-section">
      <Container>
        <Row className="align-items-center">
          <Col lg={mostrarImagen ? 7 : 12} className="hero-content">
            <h1 className="hero-title">
              Descubre los mejores <br />
              <span className="highlight">Cupones</span>
            </h1>
            <p className="hero-description">
              Ofertas para que puedas comprar las cosas que quieras de forma económica.
            </p>

            <div className="hero-tags">
              {rubrosDestacados.map((nombreRubro, i) => {
                const rubro = rubros.find(r => r.nombre === nombreRubro);
                const isActive = rubro && rubro.id === rubroSeleccionado;
                return (
                  <span 
                    key={i} 
                    className={`tag-pill ${isActive ? 'active' : ''}`}
                    onClick={() => handleCategoriaClick(nombreRubro)}
                    style={{ cursor: 'pointer' }}
                  >
                    {nombreRubro}
                  </span>
                );
              })}
            </div>
          </Col>
          
          {mostrarImagen && (
            <Col lg={5} className="d-none d-lg-block">
              <div className="hero-image-wrapper">
                <img 
                  src="/images/shopping.jpg" 
                  alt="Hero Cupones" 
                  className="hero-main-img" 
                />
                <div className="image-blob-bg"></div>
              </div>
            </Col>
          )}
        </Row>
      </Container>
    </section>
  );
};

export default Hero;