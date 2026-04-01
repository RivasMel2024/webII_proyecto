import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Button, Container, Badge, Dropdown, NavDropdown } from "react-bootstrap";
import { FaUser, FaShoppingCart, FaHistory, FaUserCircle, FaChartLine, FaBuilding, FaTicketAlt } from "react-icons/fa";
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
    window.addEventListener('storage', checkAuth);
    window.addEventListener('authChange', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authChange', checkAuth);
    };
  }, [location]);

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  const isAdmin = user?.role === 'ADMIN_CUPONERA';
  const isAuthPage = ['/login', '/register', '/forgot-password', '/verify'].includes(location.pathname);
  const cartCount = getCartCount();

  return (
    <Navbar expand="lg" className="navbar-custom" sticky="top">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          CuponX
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="align-items-center ms-auto">
            {authenticated && user ? (
              <div className="d-flex align-items-center">
                {!isAdmin && (
                  <>
                    <Link to="/history" className="nav-icon-link me-3" title="Mis compras">
                      <FaHistory size={20} />
                    </Link>
                    <Link to="/cart" className="nav-icon-link me-3 position-relative" title="Carrito">
                      <FaShoppingCart size={22} />
                      {cartCount > 0 && <Badge pill className="cart-badge">{cartCount}</Badge>}
                    </Link>
                  </>
                )}

                <Dropdown align="end">
                  <Dropdown.Toggle id="dropdown-user" className="btn-user-menu d-flex align-items-center">
                    <FaUserCircle className="me-2" size={20} />
                    <span className="d-none d-lg-inline">{user.nombres || user.email}</span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="dropdown-menu-custom shadow border-0">
                    <Dropdown.Item as={Link} to="/profile">Mi Perfil</Dropdown.Item>
                    
                    {/* SECCIÓN CLIENTE */}
                    {user.role === 'CLIENTE' && (
                      <Dropdown.Item as={Link} to="/mis-cupones">Mis Cupones</Dropdown.Item>
                    )}

                    {/* SECCIÓN ADMINISTRADOR CENTRALIZADA */}
                    {isAdmin && (
                      <>
                        <Dropdown.Item as={Link} to="/admin">
                          Dashboard
                        </Dropdown.Item>
                      </>
                    )}

                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} className="text-danger">
                      Cerrar Sesión
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            ) : (
              !isAuthPage && (
                <Button as={Link} to="/login" className="btn-signin d-flex align-items-center">
                  <FaUser className="me-2" />
                  <span>Ingresar</span>
                </Button>
              )
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;

