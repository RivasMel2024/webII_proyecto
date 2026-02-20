import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Button, Container, Badge } from "react-bootstrap";
import { FaUser, FaShoppingCart, FaHistory } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import "../styles/variables.css";

const NavBar = ({ isLoggedIn, isAuthPage }) => {
  const location = useLocation();

  return (
    <Navbar expand="lg" className="navbar-custom" sticky="top">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          CuponX
        </Navbar.Brand>

        <Nav className="align-items-center ms-auto">
          {/* CASO: USUARIO LOGUEADO */}
          {isLoggedIn ? (
            <div className="d-flex align-items-center">
              <Link to="/history" className="nav-icon-link me-3" title="Mis compras">
                <FaHistory size={20} />
              </Link>

              <Link to="/cart" className="nav-icon-link me-3 position-relative" title="Carrito">
                <FaShoppingCart size={22} />
                <Badge pill className="cart-badge">3</Badge>
              </Link>

              <Button as={Link} to="/profile" className="btn-signin d-flex align-items-center">
                <FaUser className="me-2" />
                <span className="d-none d-lg-inline">Mi Perfil</span>
              </Button>
            </div>
          ) : (
            /* CASO: USUARIO NO LOGUEADO (Y no estamos en login/register) */
            !isAuthPage && (
              <Button 
                as={Link} 
                to="/login" 
                className="btn-signin d-flex align-items-center"
              >
                <FaUser className="me-2" />
                <span className="d-none d-lg-inline">Sign In</span>
              </Button>
            )
          )}
        </Nav>
      </Container>
    </Navbar>
  );
};

export default NavBar;