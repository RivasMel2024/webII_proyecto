import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Button, Container, Badge, Dropdown } from "react-bootstrap";
import { FaUser, FaShoppingCart, FaHistory } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../services/api";
import "../styles/variables.css";

const NavBar = ({ isLoggedIn, isAuthPage, userRole }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Verificar si el usuario es admin
  const isAdmin = userRole === 'ADMIN_CUPONERA';

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
              {/* Solo mostrar iconos de carrito e historial si NO es admin */}
              {!isAdmin && (
                <>
                  <Link to="/history" className="nav-icon-link me-3" title="Mis compras">
                    <FaHistory size={20} />
                  </Link>

                  <Link to="/cart" className="nav-icon-link me-3 position-relative" title="Carrito">
                    <FaShoppingCart size={22} />
                    <Badge pill className="cart-badge">3</Badge>
                  </Link>
                </>
              )}

              <Dropdown align="end">
                <Dropdown.Toggle 
                  as={Button} 
                  className="btn-signin d-flex align-items-center"
                  style={{ background: 'transparent', border: 'none' }}
                >
                  <FaUser className="me-2" />
                  <span className="d-none d-lg-inline">Mi Perfil</span>
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile">
                    Ver Perfil
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    Cerrar Sesión
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
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