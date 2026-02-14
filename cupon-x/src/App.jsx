import ConexionTest from './components/ConexionTest';
import CuponesCliente from './components/CuponesCliente';
import VistaCupones from "./components/VistaCupones";


import './App.css';

function App() {
  return (
    <div className="App">
      <h1>CuponX - Prueba de Conexión</h1>

      <ConexionTest />
      <VistaCupones />
    </div>
  );
}

export default App;
