/**
 * Validar que un campo no esté vacío
 */
export const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === '') {
    throw new Error(`${fieldName} es requerido`);
  }
};

/**
 * Validar email
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Email inválido');
  }
};

/**
 * Validar número
 */
export const validateNumber = (value, fieldName) => {
  if (isNaN(value)) {
    throw new Error(`${fieldName} debe ser un número`);
  }
};
