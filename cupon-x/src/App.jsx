import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css'; 

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
import CuponCliente from './pages/CuponCliente';
import CouponsPage from "./pages/CouponsPage";
import StoresPage from "./pages/StoresPage";
import CartPage from "./pages/CartPage"; 

function App() {
  const location = useLocation();

  // CONTROL DE ESTADO: true para ver iconos de carrito e historial
  const [isLoggedIn, setIsLoggedIn] = useState(true);  

  // Datos de prueba para el carrito (aquí controlamos la cantidad real)
  const cartItems = [
    { id: 1, brand: "Pizza Hut", price: 15.99 },
    { id: 2, brand: "Adidas", price: 5.00 },
  ];

  const isAuthPage = 
    location.pathname === '/login' || 
    location.pathname === '/register' || 
    location.pathname === '/forgot-password' ||
    location.pathname === '/cart'; 

  return (
    <div className="app-layout">
      <ConexionTest />

      <Navbar 
        isLoggedIn={isLoggedIn} 
        isAuthPage={isAuthPage} 
        cartCount={cartItems.length} 
      />

      <main className="main-content">
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <CouponGrid />
              <StoreGrid />
            </>
          } />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Le pasamos los items a la página del carrito para que coincidan */}
          <Route path="/cart" element={<CartPage items={cartItems} />} /> 
          
          <Route path="/history" element={<div className="container mt-5"><h1>Historial de Cupones</h1></div>} />
          <Route path="/profile" element={<div className="container mt-5"><h1>Perfil de Usuario</h1></div>} />

          <Route path="/cupones-clientes" element={<CuponCliente />} />
          <Route path="/coupons" element={<CouponsPage />} />
          <Route path="/stores" element={<StoresPage />} />
        </Routes>
      </main>

      {/* Ahora el footer se oculta también en /cart */}
      {!isAuthPage && <Footer />}
    </div>
  );
}

export default App;