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
};


export const getTopOffers = async (limit = 6) => {
  try {
    const res = await fetch(`${API_BASE_URL}/ofertas/top?limit=${limit}`);
    if (!res.ok) throw new Error("Error al obtener ofertas");
    return await res.json(); // { success, data }
  } catch (error) {
    console.error("getTopOffers error:", error);
    return { success: false, message: error.message, data: [] };
  }
};

export const getAllOffers = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/ofertas`);
    if (!res.ok) throw new Error("Error al obtener ofertas");
    return await res.json(); // { success, data }
  } catch (error) {
    console.error("getAllOffers error:", error);
    return { success: false, message: error.message, data: [] };
  }
};

export const getTopEmpresas = async (limit = 6) => {
  const res = await fetch(`${API_BASE_URL}/empresas/top?limit=${limit}`);
  if (!res.ok) throw new Error("Error al obtener top empresas");
  return await res.json(); // { success, data }
};

export const getAllEmpresas = async () => {
  const res = await fetch(`${API_BASE_URL}/empresas`);
  if (!res.ok) throw new Error("Error al obtener empresas");
  return await res.json();
};

export const getEmpresaById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/empresas/${id}`);
  if (!res.ok) throw new Error("Error al obtener empresa");
  return await res.json();
};

export const getOfertasByEmpresa = async (id) => {
  const res = await fetch(`${API_BASE_URL}/empresas/${id}/ofertas`);
  if (!res.ok) throw new Error("Error al obtener ofertas de la empresa");
  return await res.json();
};