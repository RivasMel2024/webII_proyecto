import { Routes, Route } from 'react-router-dom';
import ConexionTest from './components/ConexionTest';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CouponGrid from './components/CouponGrid';
import StoreGrid from './components/StoreGrid';
import Footer from './components/Footer';
import Login from './components/Login';

function App() {
  return (
    <div className="App">
      {/* ConexionTest es útil para verificar que el backend responda */}
      <ConexionTest /> 
      
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

        {/* Página de Login */}
        <Route path="/login" element={<Login />} />
      </Routes>
      
      <Footer />
    </div>
  );
}

export default App;
