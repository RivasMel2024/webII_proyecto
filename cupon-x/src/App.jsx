import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ConexionTest from './components/ConexionTest';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CouponGrid from './components/CouponGrid';
import StoreGrid from './components/StoreGrid';
import Footer from './components/Footer';
import Login from './components/Login';
import CuponCliente from './pages/CuponCliente';
import CouponsPage from "./pages/CouponsPage";
import OfertasPage from "./pages/OfertasPage";
import { getRubros } from './services/api';

function App() {
  const [rubros, setRubros] = useState([]);

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
      {}
      <ConexionTest />

      <Navbar />

      {/* esto es lo importante*/}
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

          {/* Página de Login */}
          <Route path="/login" element={<Login />} />

          {/* Página cupones-clientes */}
          <Route path="/cupones-clientes" element={<CuponCliente />} />
          
          {/* Página de todos los cupones */}
          <Route path="/coupons" element={<CouponsPage />} />
          
          {/* Página de ofertas vigentes con filtros */}
          <Route path="/ofertas" element={<OfertasPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;