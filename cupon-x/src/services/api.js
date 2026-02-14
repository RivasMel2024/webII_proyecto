const API_BASE_URL = 'http://localhost:3000/api';

export const testConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/test-connection`);
    if (!response.ok) {
      throw new Error('Error en la conexión');
    }
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }

};

export const getCuponesByCliente = async (clienteId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/cupones/clientes/${clienteId}/cupones`
    );

    if (!response.ok) {
      throw new Error("Error al obtener cupones del cliente");
    }

    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};


export const getClientes = async () => {
  const res = await fetch(`${API_BASE_URL}/clientes`);
  if (!res.ok) throw new Error("Error al obtener clientes");
  return await res.json(); // { success, data }
};

export async function deleteCupon(id) {
  const res = await fetch(`${API_BASE_URL}/cupones/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Error al eliminar cupón");
  }

  return await res.json();
}
