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
      <ConexionTest />
      <Navbar/>
      <Hero/>
      <CouponGrid/>
      <StoreGrid/>
      <Footer/>
    </div>
  );
}

export default App;
