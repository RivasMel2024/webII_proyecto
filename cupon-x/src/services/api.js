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
