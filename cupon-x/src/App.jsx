import { Routes, Route, useLocation } from 'react-router-dom'; 
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CouponGrid from './components/CouponGrid';
import StoreGrid from './components/StoreGrid';
import Footer from './components/Footer';
import Login from './components/Login';
import Registration from './components/Registration'; 
import ForgotPassword from './components/ForgotPassword'; 
import VerifyAccount from './components/VerifyAccount';
import CuponCliente from './pages/CuponCliente';
import MisCupones from './pages/MisCupones';
import CouponsPage from "./pages/CouponsPage";
import StoresPage from "./pages/StoresPage";
import RequireAuth from './components/RequireAuth';
import RequireRole from './components/RequireRole';

function App() {
  const location = useLocation(); 

  const isAuthPage = 
    location.pathname === '/login' || 
    location.pathname === '/register' || 
    location.pathname === '/forgot-password' ||
    location.pathname === '/verify';

  return (
    <div className="App app-layout">
      {/* <ConexionTest /> */}

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

          <Route path="/coupons" element={<CouponsPage />} />
          <Route path="/stores" element={<StoresPage />} />
        </Routes>
      </main>

      {!isAuthPage && <Footer />}
    </div>
  );
}

export default App;