const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const AUTH_STORAGE_KEY = 'cuponx.auth';
const AUTH_NOTICE_KEY = 'cuponx.auth.notice';

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
  // Disparar evento personalizado para notificar cambio de autenticación
  window.dispatchEvent(new Event('authChange'));
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  // Disparar evento personalizado para notificar cambio de autenticación
  window.dispatchEvent(new Event('authChange'));
};

export const consumeAuthNotice = () => {
  try {
    const value = sessionStorage.getItem(AUTH_NOTICE_KEY);
    if (!value) return '';
    sessionStorage.removeItem(AUTH_NOTICE_KEY);
    return value;
  } catch {
    return '';
  }
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

const getFriendlyHttpMessage = (status, backendMessage, fallbackMessage) => {
  if (status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente.';
  if (status === 403) return 'No autorizado para esta acción.';
  if (status === 409) return backendMessage || 'Transición inválida para el estado actual.';
  return backendMessage || fallbackMessage;
};

const handleUnauthorized = (message) => {
  clearAuthSession();
  try {
    sessionStorage.setItem(AUTH_NOTICE_KEY, message || 'Tu sesión expiró. Inicia sesión nuevamente.');
  } catch {
    // Ignorar errores de storage para no bloquear redireccion
  }

  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
};

const resolveApiResponse = async (res, fallbackMessage) => {
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = getFriendlyHttpMessage(res.status, data?.message, fallbackMessage);
    if (res.status === 401) {
      handleUnauthorized(message);
    }
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return data;
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
}

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

export const createOferta = async (payload) => {
  const res = await authFetch(`${API_BASE_URL}/ofertas`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return resolveApiResponse(res, "Error al crear oferta");
};

export const getMisOfertas = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.estado) queryParams.set("estado", params.estado);

  const url = `${API_BASE_URL}/ofertas/mis-ofertas${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const res = await authFetch(url);
  return resolveApiResponse(res, "Error al obtener mis ofertas");
};

export const getMisMetricas = async () => {
  const res = await authFetch(`${API_BASE_URL}/ofertas/mis-metricas`);
  return resolveApiResponse(res, "Error al obtener métricas");
};

export const aprobarOferta = async (ofertaId) => {
  const res = await authFetch(`${API_BASE_URL}/ofertas/${ofertaId}/aprobar`, {
    method: "PATCH",
  });
  return resolveApiResponse(res, "Error al aprobar oferta");
};

export const rechazarOferta = async (ofertaId, justificacion) => {
  const res = await authFetch(`${API_BASE_URL}/ofertas/${ofertaId}/rechazar`, {
    method: "PATCH",
    body: JSON.stringify({ justificacion }),
  });
  return resolveApiResponse(res, "Error al rechazar oferta");
};

export const reenviarOferta = async (ofertaId) => {
  const res = await authFetch(`${API_BASE_URL}/ofertas/${ofertaId}/reenviar`, {
    method: "PATCH",
  });
  return resolveApiResponse(res, "Error al reenviar oferta");
};

export const descartarOferta = async (ofertaId) => {
  const res = await authFetch(`${API_BASE_URL}/ofertas/${ofertaId}/descartar`, {
    method: "PATCH",
  });
  return resolveApiResponse(res, "Error al descartar oferta");
};

// ============================================================
// FUNCIONES PARA FILTRADO DE OFERTAS POR RUBRO
// ============================================================

/**
 * Obtiene ofertas vigentes con filtros opcionales
 * @param {Object} params - Parámetros de filtrado
 * @param {number} params.rubro_id - ID del rubro para filtrar (opcional)
 * @param {string} params.search - Palabra clave para buscar (opcional)
 * @returns {Promise<{success: boolean, data: Array, message?: string}>}
 */
export const getOfertasVigentes = async (params = {}) => {
  try {
    // Construir query string con los parámetros
    const queryParams = new URLSearchParams();
    
    if (params.rubro_id) {
      queryParams.append('rubro_id', params.rubro_id);
    }
    
    if (params.search && params.search.trim() !== '') {
      queryParams.append('search', params.search.trim());
    }
    
    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/ofertas/vigentes${queryString ? `?${queryString}` : ''}`;
    
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error("Error al obtener ofertas vigentes");
    }
    
    return await res.json(); // { success, data, message }
  } catch (error) {
    console.error("getOfertasVigentes error:", error);
    return { success: false, message: error.message, data: [] };
  }
};

/**
 * Obtiene todos los rubros (categorías) activos
 * Para mostrar en el dropdown de filtros y botones de categoría
 * @returns {Promise<{success: boolean, data: Array, message?: string}>}
 * 
 * Estructura de respuesta:
 * data: [{ id: 1, nombre: "Restaurantes", activo: 1 }, ...]
 */
export const getRubros = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/rubros`);
    
    if (!res.ok) {
      throw new Error("Error al obtener rubros");
    }
    
    return await res.json(); // { success, data, message }
  } catch (error) {
    console.error("getRubros error:", error);
    return { success: false, message: error.message, data: [] };
  }
};

// ============================================================
// FUNCIONES PARA EMPRESAS/TIENDAS
// ============================================================

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

// Canjear cupón (empleado)
export const canjearCupon = async ({ codigo, dui }) => {
  const res = await authFetch(`${API_BASE_URL}/cupones/canjear`, {
    method: 'POST',
    body: JSON.stringify({ codigoCupon: codigo, duiPresentado: dui }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Error al canjear cupón');
  return data;

// ============================================================
// FUNCIONES PARA EMPLEADOS (ADMIN_EMPRESA / ADMIN_CUPONERA)
// ============================================================

export const getEmpleados = async () => {
  const res = await authFetch(`${API_BASE_URL}/empleados`);
  return resolveApiResponse(res, "Error al obtener empleados");
};

export const getEmpleadoById = async (id) => {
  const res = await authFetch(`${API_BASE_URL}/empleados/${id}`);
  return resolveApiResponse(res, "Error al obtener empleado");
};

export const createEmpleado = async (payload) => {
  const res = await authFetch(`${API_BASE_URL}/empleados`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return resolveApiResponse(res, "Error al crear empleado");
};

export const updateEmpleado = async (id, payload) => {
  const res = await authFetch(`${API_BASE_URL}/empleados/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return resolveApiResponse(res, "Error al actualizar empleado");
};

export const deleteEmpleado = async (id) => {
  const res = await authFetch(`${API_BASE_URL}/empleados/${id}`, {
    method: "DELETE",
  });
  return resolveApiResponse(res, "Error al desactivar empleado");
};

// Comprar cupón(es)
export const comprarCupon = async ({ ofertaId, cantidad = 1, tarjeta }) => {
  const res = await authFetch(`${API_BASE_URL}/cupones/comprar`, {
    method: 'POST',
    body: JSON.stringify({ ofertaId, cantidad, tarjeta }),
  });
  return resolveApiResponse(res, 'Error al comprar cupón');
};