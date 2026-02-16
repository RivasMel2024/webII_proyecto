import { Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <div className="App app-layout">
      {/* Esto lo dejás si querés ver el backend arriba */}
      <ConexionTest />

      <Navbar />

      {/* 👇 ESTE es el truco */}
      <main className="main-content">
        <Routes>
          {/* Página Principal */}
          <Route
            path="/"
            element={
              <>
                <Hero />
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
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;