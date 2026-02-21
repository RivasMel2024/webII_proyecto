import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css'; 

// Context
import { CartProvider } from './context/CartContext';

// Componentes de Interfaz
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ConexionTest from './components/ConexionTest';

// Componentes de Contenido
import Hero from './components/Hero';
import CouponGrid from './components/CouponGrid';
import StoreGrid from './components/StoreGrid';

// Páginas
import Login from './components/Login';
import Registration from './components/Registration'; 
import ForgotPassword from './components/ForgotPassword'; 
import VerifyAccount from './components/VerifyAccount';
import Profile from './components/Profile';
import CuponCliente from './pages/CuponCliente';
import MisCupones from './pages/MisCupones';
import CouponsPage from "./pages/CouponsPage";
import StoresPage from "./pages/StoresPage";
import RequireAuth from './components/RequireAuth';
import RequireRole from './components/RequireRole';
import CartPage from "./pages/CartPage"; 
import HistorialPage from "./pages/HistorialPage"; 

// Importar función de autenticación
import { isAuthenticated, getAuthUser } from './services/api';

function App() {
  const location = useLocation();

  // CONTROL DE ESTADO: Verificar si el usuario está autenticado
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const [userRole, setUserRole] = useState(getAuthUser()?.role || null);

  // Escuchar cambios en la autenticación
  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(isAuthenticated());
      setUserRole(getAuthUser()?.role || null);
    };

    // Verificar autenticación cuando cambie la ruta
    checkAuth();

    // Escuchar eventos de storage para sincronizar entre pestañas
    window.addEventListener('storage', checkAuth);
    
    // Escuchar evento personalizado para cambios de autenticación
    window.addEventListener('authChange', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authChange', checkAuth);
    };
  }, [location.pathname]);

  const isAuthPage = 
    location.pathname === '/login' || 
    location.pathname === '/register' || 
    location.pathname === '/forgot-password' ||
    location.pathname === '/cart' ||
    location.pathname === '/verify' ||
    location.pathname === '/history'; 

  return (
    <CartProvider>
      <div className="app-layout">
        {/* <ConexionTest /> */}

        {/* Navbar con detección automática de autenticación */}
        <Navbar />

        <main className="main-content">
          <Routes>
            {/* Vista Principal */}
            <Route path="/" element={
              <>
                <Hero />
                <CouponGrid />
                <StoreGrid />
              </>
            } />

            {/* Rutas de Autenticación */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify" element={<VerifyAccount />} />
            
            {/* Ruta para clientes: Ver sus propios cupones */}
            <Route 
              path="/mis-cupones" 
              element={
                <RequireAuth>
                  <MisCupones />
                </RequireAuth>
              } 
            />

            {/* Ruta para admins: Ver todos los cupones con dropdown */}
            <Route 
              path="/cupones-clientes" 
              element={
                <RequireRole allowedRoles={['ADMIN_CUPONERA']}>
                  <CuponCliente />
                </RequireRole>
              } 
            />

            
            {/* Rutas de Funcionalidad Post-Login */}
            <Route path="/cart" element={<CartPage />} /> 
            <Route path="/history" element={<HistorialPage />} />
            <Route path="/profile" element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            } />

            {/* Otras Vistas */}
            <Route path="/coupons" element={<CouponsPage />} />
            <Route path="/stores" element={<StoresPage />} />
          </Routes>
        </main>

        {/* El footer se oculta en login, registro, carrito e historial */}
        {!isAuthPage && <Footer />}
      </div>
    </CartProvider>
  );
}

export default App;