import { Routes, Route, useLocation } from 'react-router-dom'; 
import ConexionTest from './components/ConexionTest';
import CuponesCliente from './components/CuponesCliente';
import VistaCupones from "./components/VistaCupones";

import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CouponGrid from './components/CouponGrid';
import StoreGrid from './components/StoreGrid';
import Footer from './components/Footer';
import Login from './components/Login';
import Registration from './components/Registration'; 
import ForgotPassword from './components/ForgotPassword'; 
import ResetPassword from './components/ResetPassword';
import VerifyAccount from './components/VerifyAccount';
import CuponCliente from './pages/CuponCliente';
import CouponsPage from "./pages/CouponsPage";

function App() {
  const location = useLocation(); 

  // Agregamos '/forgot-password' a la lista negra del Footer y Navbar
  const isAuthPage = 
    location.pathname === '/login' || 
    location.pathname === '/register' || 
    location.pathname === '/forgot-password';

  return (
    <div className="App app-layout">
      {/* <h1>CuponX - Prueba de Conexión</h1>

      <ConexionTest />
      <VistaCupones /> */}
      
      {/* Pasamos la variable para que el Navbar oculte el botón Sign In */}
      <Navbar isAuthPage={isAuthPage} />
      <main className='main-content'>

      <Routes>
        {/* Página Principal */}
        <Route path="/" element={
          <>
            <Hero />
            <CouponGrid />
            <StoreGrid />
          </>
        } />

        {/* Página de Login */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify" element={<VerifyAccount />} />
        {/* Página cupones-clientes */}
        <Route path="/cupones-clientes" element={<CuponCliente />} />
        {/* Página de todos los cupones */}
        <Route path="/coupons" element={<CouponsPage />} />
      </Routes>
      </main>
      
      {/* El Footer NO se mostrará si isAuthPage es true */}
      {!isAuthPage && <Footer />}
    </div>
  );
}

export default App;