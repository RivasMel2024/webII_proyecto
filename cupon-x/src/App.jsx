import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
// import HistorialPage from "./pages/HistorialPage"; 
import OfertasPage from "./pages/OfertasPage";
import CanjePage from './pages/CanjePage';
import EmpresaDashboardPage from './pages/EmpresaDashboardPage';
import EmpresaEmpleadosPage from './pages/EmpresaEmpleadosPage';
import EmpresaMetricasPage from './pages/EmpresaMetricasPage';
import OfertaDetailPage from "./pages/OfertaDetailPage";
import StoreDetailPage from "./pages/StoreDetailPage";
import AdminDashboard from './pages/AdminDashboard';

// Importar función de autenticación
import { isAuthenticated, getAuthUser, getRubros } from './services/api';

function App() {
  const location = useLocation();

  // CONTROL DE ESTADO
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const [userRole, setUserRole] = useState(getAuthUser()?.role || null);
  const [rubros, setRubros] = useState([]);

  // Detectar páginas de autenticación
  const isAuthPage = 
    location.pathname === '/login' || 
    location.pathname === '/register' || 
    location.pathname === '/forgot-password' ||
    location.pathname === '/cart' ||
    location.pathname === '/verify' ||
    location.pathname === '/history'; 

  // Escuchar cambios en la autenticación
  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(isAuthenticated());
      setUserRole(getAuthUser()?.role || null);
    };

    checkAuth();

    window.addEventListener('storage', checkAuth);
    window.addEventListener('authChange', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authChange', checkAuth);
    };
  }, [location.pathname]);

  // Cargar rubros al inicio
  useEffect(() => {
    const cargarRubros = async () => {
      try {
        const response = await getRubros();
        if (response.success) {
          setRubros(response.data);
        }
      } catch (error) {
        console.error('Error al cargar rubros:', error);
      }
    };
    cargarRubros();
  }, []);

  return (
    <CartProvider>
      <div className="app-layout">

        {/* Navbar */}
        <Navbar />

        <main className="main-content">
          <Routes>

            {/* 🔥 HOME con redirección para admin */}
            <Route 
              path="/" 
              element={
                isLoggedIn && userRole === 'ADMIN_CUPONERA' ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <>
                    <Hero rubros={rubros} redirectToOfertas={true} />
                    <CouponGrid />
                    <StoreGrid />
                  </>
                )
              } 
            />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify" element={<VerifyAccount />} />

            {/* Cliente */}
            <Route 
              path="/mis-cupones" 
              element={
                <RequireAuth>
                  <MisCupones />
                </RequireAuth>
              } 
            />

            {/* Admin */}
            <Route 
              path="/cupones-clientes" 
              element={
                <RequireRole allowedRoles={['ADMIN_CUPONERA']}>
                  <CuponCliente />
                </RequireRole>
              } 
            />

            <Route
              path="/canjear-cupon"
              element={
                <RequireRole allowedRoles={['ADMIN_CUPONERA', 'EMPLEADO']}>
                  <CanjePage />
                </RequireRole>
              }
            />

            <Route
              path="/empresa/dashboard"
              element={
                <RequireRole allowedRoles={['ADMIN_EMPRESA']}>
                  <EmpresaDashboardPage />
                </RequireRole>
              }
            />

            <Route
              path="/empresa/empleados"
              element={
                <RequireRole allowedRoles={['ADMIN_EMPRESA']}>
                  <EmpresaEmpleadosPage />
                </RequireRole>
              }
            />

            <Route
              path="/empresa/metricas"
              element={
                <RequireRole allowedRoles={['ADMIN_EMPRESA']}>
                  <EmpresaMetricasPage />
                </RequireRole>
              }
            />

            {/* Rutas de Funcionalidad Post-Login */}
            <Route 
              path="/admin" 
              element={
                <RequireRole allowedRoles={['ADMIN_CUPONERA']}>
                  <AdminDashboard />
                </RequireRole>
              } 
            />

            {/* Funcionalidad */}
            <Route path="/cart" element={<CartPage />} /> 
            {/* <Route path="/history" element={<HistorialPage />} /> */}

            <Route 
              path="/profile" 
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              } 
            />

            {/* Vistas */}
            <Route path="/coupons" element={<CouponsPage />} />
            <Route path="/ofertas" element={<OfertasPage />} />
            <Route path="/stores" element={<StoresPage />} />

            <Route path="/ofertas/:id" element={<OfertaDetailPage />} />
            <Route path="/stores/:id" element={<StoreDetailPage />} />

          </Routes>
        </main>

        {/* Footer */}
        {!isAuthPage && <Footer />}
      </div>
    </CartProvider>
  );
}

export default App;