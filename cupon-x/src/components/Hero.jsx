import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Dropdown } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/hero.css";

const Hero = ({
  rubros = [],
  filtrosActuales = { rubro_id: null, search: "" },
  onFiltroChange,
  mostrarImagen = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectToOfertas = location.pathname !== "/ofertas";

  const [rubroSeleccionado, setRubroSeleccionado] = useState(
    filtrosActuales?.rubro_id ?? null
  );
  const [searchInput, setSearchInput] = useState(
    filtrosActuales?.search ?? ""
  );

  useEffect(() => {
    setRubroSeleccionado(filtrosActuales?.rubro_id ?? null);
    setSearchInput(filtrosActuales?.search ?? "");
  }, [filtrosActuales?.rubro_id, filtrosActuales?.search]);

  const aplicarFiltros = (nuevoRubro, nuevoSearch) => {
    const rubro_id = nuevoRubro ?? null;
    const search = nuevoSearch ?? "";

    if (redirectToOfertas) {
      const params = new URLSearchParams();
      if (rubro_id) params.append("rubro_id", String(rubro_id));
      if (search.trim()) params.append("search", search.trim());
      navigate(`/ofertas?${params.toString()}`);
      return;
    }

    onFiltroChange?.({ rubro_id, search });
  };

  const handleRubroDropdown = (eventKey) => {
    const rubroId = eventKey ? Number(eventKey) : null;
    setRubroSeleccionado(rubroId);
    aplicarFiltros(rubroId, searchInput);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);

    if (!redirectToOfertas) {
      onFiltroChange?.({ rubro_id: rubroSeleccionado, search: val });
    }
  };

  const handleBuscar = () => {
    aplicarFiltros(rubroSeleccionado, searchInput);
  };

  const nombreRubro = rubroSeleccionado
    ? rubros.find((r) => r.id === rubroSeleccionado)?.nombre || "Categoría"
    : "Categoría";

  return (
    <section className="hero-section">
      <Container>
        <Row className="align-items-center">

          {/* IZQUIERDA */}
          <Col lg={6}>
            <h1 className="hero-title">
              Descubre los mejores <span className="highlight">Cupones</span>
            </h1>

            <p className="hero-description">
              Ofertas para que puedas comprar las cosas que quieras de forma económica.
            </p>

            {/* <div className="search-container">
              <div className="search-box">

                <Dropdown onSelect={handleRubroDropdown}>
                  <Dropdown.Toggle
                    className="category-select"
                    variant="light"
                  >
                    {nombreRubro}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item eventKey="">
                      Todas las categorías
                    </Dropdown.Item>
                    {rubros.map((r) => (
                      <Dropdown.Item key={r.id} eventKey={String(r.id)}>
                        {r.nombre}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>

                <div className="divider" />

                <input
                  className="search-input"
                  type="text"
                  placeholder="Nombre del cupón o tienda..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleBuscar();
                  }}
                />

                <Button className="btn-hero-search" onClick={handleBuscar}>
                  Buscar
                </Button>

              </div>
            </div> */}

            <div className="hero-tags">
              {rubros.slice(0, 5).map((r) => (
                <div
                  key={r.id}
                  className={`tag-pill ${
                    rubroSeleccionado === r.id ? "active" : ""
                  }`}
                  onClick={() => aplicarFiltros(r.id, searchInput)}
                >
                  {r.nombre}
                </div>
              ))}
            </div>

          </Col>

          {/* DERECHA - FOTO */}
          {mostrarImagen && (
            <Col lg={6} className="text-center">
              <div className="hero-image-wrapper">
                <div className="image-blob-bg"></div>
                <img
                  src="/images/shopping.jpg"
                  alt="Shopping"
                  className="hero-main-img"
                />
              </div>
            </Col>
          )}

        </Row>
      </Container>
    </section>
  );
};

export default Hero;