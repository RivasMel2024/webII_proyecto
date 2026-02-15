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

function App() {
  return (
    <div className="App">
      <ConexionTest />
      <Navbar/>
      <Hero/>
      <CouponGrid/>
      <StoreGrid/>
      <Footer/>

      <h1>CuponX - Prueba de Conexión</h1>
      <VistaCupones />
    </div>
  );
}

export default App;
