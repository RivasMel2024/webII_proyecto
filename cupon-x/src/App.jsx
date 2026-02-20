import { Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ConexionTest from './components/ConexionTest';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CouponGrid from './components/CouponGrid';
import StoreGrid from './components/StoreGrid';
import Footer from './components/Footer';
import Login from './components/Login';
import Registration from './components/Registration'; 
import ForgotPassword from './components/ForgotPassword'; 
import CuponCliente from './pages/CuponCliente';
import CouponsPage from "./pages/CouponsPage";
import StoresPage from "./pages/StoresPage";
import OfertasPage from "./pages/OfertasPage";
import { getRubros } from './services/api';

function App() {
  const location = useLocation();
  const [rubros, setRubros] = useState([]);

  // Detectar páginas de autenticación
  const isAuthPage = 
    location.pathname === '/login' || 
    location.pathname === '/register' || 
    location.pathname === '/forgot-password';

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
    <div className="App app-layout">
      <ConexionTest />

      <Navbar isAuthPage={isAuthPage} />

      <main className="main-content">
        <Routes>
          {/* Página Principal */}
          <Route
            path="/"
            element={
              <>
                <Hero rubros={rubros} redirectToOfertas={true} /> 
                <CouponGrid />
                <StoreGrid />
              </>
            }
          />

          {/* Páginas de Autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Páginas de Cupones */}
          <Route path="/cupones-clientes" element={<CuponCliente />} />
          <Route path="/coupons" element={<CouponsPage />} />
          <Route path="/ofertas" element={<OfertasPage />} />
          
          {/* Página de Tiendas */}
          <Route path="/stores" element={<StoresPage />} />
        </Routes>
      </main>

      {!isAuthPage && <Footer />}
    </div>
  );
}

export default App;