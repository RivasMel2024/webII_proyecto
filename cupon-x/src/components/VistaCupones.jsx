import { useEffect, useState } from "react";
import { getClientes } from "../services/api";
import CuponesCliente from "./CuponesCliente";

export default function VistaCupones() {
  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState("");
  

  useEffect(() => {
    const load = async () => {
      const res = await getClientes();
      if (res.success) {
        setClientes(res.data);
      }
    };
    load();
  }, []);

  return (
    <div className="container my-4">
      <h3>Seleccionar cliente</h3>

      <select
        className="form-select mb-3"
        value={clienteId}
        onChange={(e) => setClienteId(e.target.value)}
      >
        <option value="">Seleccione un cliente</option>
        {clientes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </select>

      {clienteId && <CuponesCliente clienteId={clienteId} />}
    </div>
  );
}
