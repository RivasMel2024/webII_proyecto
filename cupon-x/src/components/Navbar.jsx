import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import { Navbar, Nav, Button, Container } from "react-bootstrap";
import "../styles/variables.css";
import { FaUser } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

const NavBar = () => { // Ya no necesita recibir props
  const location = useLocation(); // Detecta la ruta actual

  return (
    <Navbar expand="lg" className="navbar-custom" sticky="top">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
            CuponX
        </Navbar.Brand>

        {/* Nombre del sitio */}
        <Navbar.Brand className="fw-bold">Cupón X</Navbar.Brand>
    
        {/* Botón Sign In */}
        <Nav className="align-items-center ms-auto">
          {/* Si el path es distinto a /login, muestra el botón */}
          {location.pathname !== "/login" && location.pathname !== "/register" && (
            <Button 
              as={Link} 
              to="/login" 
              className="btn-signin d-flex align-items-center"
            >
              <FaUser className="me-2" />
              <span className="d-none d-lg-inline">Sign In</span>
            </Button>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
};

export default NavBar;