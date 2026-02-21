import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Button, Container, Badge, Dropdown } from "react-bootstrap";
import { FaUser, FaShoppingCart, FaHistory, FaUserCircle } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAuthUser, isAuthenticated, logout } from "../services/api";
import { useCart } from "../context/CartContext";
import "../styles/variables.css";

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const [user, setUser] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = isAuthenticated();
      setAuthenticated(isAuth);
      if (isAuth) {
        setUser(getAuthUser());
      } else {
        setUser(null);
      }
    };

    checkAuth();
    // Verificar autenticación cada vez que cambie la ruta
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [location]);

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  // Verificar si el usuario es admin
  const isAdmin = user?.role === 'ADMIN_CUPONERA';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password' || location.pathname === '/verify';
  const cartCount = getCartCount();

  return (
    <Navbar expand="lg" className="navbar-custom" sticky="top">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          CuponX
        </Navbar.Brand>

        <Nav className="align-items-center ms-auto">
          {/* CASO: USUARIO LOGUEADO */}
          {authenticated && user ? (
            <div className="d-flex align-items-center">
              {/* Solo mostrar iconos de carrito e historial si NO es admin */}
              {!isAdmin && (
                <>
                  <Link to="/history" className="nav-icon-link me-3" title="Mis compras">
                    <FaHistory size={20} />
                  </Link>

                  <Link to="/cart" className="nav-icon-link me-3 position-relative" title="Carrito">
                    <FaShoppingCart size={22} />
                    {cartCount > 0 && (
                      <Badge pill className="cart-badge">{cartCount}</Badge>
                    )}
                  </Link>
                </>
              )}

              <Dropdown align="end">
                <Dropdown.Toggle 
                  id="dropdown-user"
                  className="btn-user-menu d-flex align-items-center"
                >
                  <FaUserCircle className="me-2" size={20} />
                  <span className="d-none d-lg-inline">{user.nombres || user.email}</span>
                </Dropdown.Toggle>

                <Dropdown.Menu className="dropdown-menu-custom">
                  <Dropdown.Item as={Link} to="/profile" className="dropdown-item-custom">
                    Mi Perfil
                  </Dropdown.Item>
                  {user.role === 'CLIENTE' && (
                    <Dropdown.Item as={Link} to="/mis-cupones" className="dropdown-item-custom">
                      Mis Cupones
                    </Dropdown.Item>
                  )}
                  {user.role === 'ADMIN_CUPONERA' && (
                    <Dropdown.Item as={Link} to="/cupones-clientes" className="dropdown-item-custom">
                      Cupones Clientes
                    </Dropdown.Item>
                  )}
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="dropdown-item-custom">
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