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
import ForgotPassword from './components/ForgotPassword'; 
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
      <ConexionTest />

      <Navbar isAuthPage={isAuthPage} />

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
          <Route path="/cupones-clientes" element={<CuponCliente />} />
          <Route path="/coupons" element={<CouponsPage />} />
        </Routes>
      </main>

      {!isAuthPage && <Footer />}
    </div>
  );
}

export default App;