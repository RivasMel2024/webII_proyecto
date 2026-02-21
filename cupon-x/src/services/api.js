const API_BASE_URL = 'http://localhost:3000/api';

const AUTH_STORAGE_KEY = 'cuponx.auth';

export const getAuthSession = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setAuthSession = ({ token, user }) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user }));
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

// Funciones de utilidad para autenticación
export const getAuthUser = () => {
  const session = getAuthSession();
  return session?.user || null;
};

export const isAuthenticated = () => {
  const session = getAuthSession();
  return !!(session?.token && session?.user);
};

export const hasRole = (role) => {
  const user = getAuthUser();
  return user?.role === role;
};

export const logout = () => {
  clearAuthSession();
};

const authFetch = async (url, options = {}) => {
  const session = getAuthSession();
  const token = session?.token;
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.body && !(options.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
  };

  return fetch(url, { ...options, headers });
};

export const testConnection = async () => {
  try {
    const response = await authFetch(`${API_BASE_URL}/test-connection`);
    if (!response.ok) {
      throw new Error('Error en la conexión');
    }
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }

};

// Auth
export const login = async ({ email, password }) => {
  const res = await authFetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Error al iniciar sesión');
  return data;
};

export const registerCliente = async (payload) => {
  const res = await authFetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Error al registrar');
  return data;
};

export const forgotPassword = async ({ email }) => {
  const res = await authFetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Error al solicitar recuperación');
  return data;
};

export const resetPassword = async ({ token, newPassword }) => {
  const res = await authFetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Error al restablecer');
  return data;
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  const res = await authFetch(`${API_BASE_URL}/auth/change-password`, {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Error al cambiar contraseña');
  return data;
};

export const verifyAccount = async ({ token }) => {
  const url = new URL(`${API_BASE_URL}/auth/verify`);
  url.searchParams.set('token', token);
  const res = await authFetch(url.toString());
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Error al verificar');
  return data;
};

export const getCuponesByCliente = async (clienteId) => {
  try {
    const response = await authFetch(
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
  const res = await authFetch(`${API_BASE_URL}/clientes`);
  if (!res.ok) throw new Error("Error al obtener clientes");
  return await res.json(); // { success, data }
};

export async function deleteCupon(id) {
  const res = await authFetch(`${API_BASE_URL}/cupones/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Error al eliminar cupón");
  }

  return await res.json();
};


export const getTopOffers = async (limit = 6) => {
  try {
    const res = await authFetch(`${API_BASE_URL}/ofertas/top?limit=${limit}`);
    if (!res.ok) throw new Error("Error al obtener ofertas");
    return await res.json(); // { success, data }
  } catch (error) {
    console.error("getTopOffers error:", error);
    return { success: false, message: error.message, data: [] };
  }
};

export const getAllOffers = async () => {
  try {
    const res = await authFetch(`${API_BASE_URL}/ofertas`);
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