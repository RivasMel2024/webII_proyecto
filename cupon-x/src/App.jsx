import { Routes, Route, useLocation } from 'react-router-dom'; 
import ConexionTest from './components/ConexionTest';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CouponGrid from './components/CouponGrid';
import StoreGrid from './components/StoreGrid';
import Footer from './components/Footer';
import Login from './components/Login';
import Registration from './components/Registration'; 

function App() {
  const location = useLocation(); 

  // rutas que no deben mostrar el Footer ni el Sign In
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="App">
      <ConexionTest /> 
      
      {/* El Navbar ahora puede saber internamente si ocultar el botón */}
      <Navbar />
      
      <Routes>
        {/* Página Principal */}
        <Route path="/" element={
          <>
            <Hero />
            <CouponGrid />
            <StoreGrid />
          </>
        } />

        {/* Páginas de Autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
      </Routes>
      
      {/* El Footer solo se muestra si NO es una página de auth */}
      {!isAuthPage && <Footer />}
    </div>
  );
}

export default App;