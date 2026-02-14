import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Button, Container } from "react-bootstrap";
import "../styles/variables.css";
import { FaUser } from "react-icons/fa";

const NavBar = () => {
  return (
    <Navbar expand="lg" className="navbar-custom" sticky="top">
      <Container fluid>
        {/* Nombre del sitio */}
        <Navbar.Brand className="fw-bold">Cupón X</Navbar.Brand>

        {/* Botón Sign In */}
        <Nav className="align-items-center ms-auto">
          <Button className="btn-signin d-flex align-items-center">
            <FaUser className="me-2" />
            <span className="d-none d-lg-inline">Sign In</span>
          </Button>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default NavBar;

