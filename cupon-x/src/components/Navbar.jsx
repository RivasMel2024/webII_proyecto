import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Button, Container } from "react-bootstrap";
import { FaUser } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import "../styles/variables.css";

const NavBar = () => {
  const location = useLocation();

  return (
    <Navbar expand="lg" className="navbar-custom" sticky="top">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          CuponX
        </Navbar.Brand>

        {/* Botón Sign In */}
        <Nav className="align-items-center ms-auto">
          <Button as={Link} to="/login" className="btn-signin d-flex align-items-center">
            <FaUser className="me-2" />
            <span className="d-none d-lg-inline">Sign In</span>
          </Button>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default NavBar;

