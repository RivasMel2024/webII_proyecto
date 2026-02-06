# 🛠️ Directorio `/src/utils`

## 📋 Descripción
Esta carpeta contiene **funciones utilitarias** y **helpers** reutilizables que no dependen de React ni tienen lógica de componentes. Son funciones puras de JavaScript que pueden usarse en cualquier parte de la aplicación.

## 🎯 ¿Qué va aquí?

### ✅ Funciones que DEBEN ir aquí:
- **Formateo de datos** - Fechas, moneda, números
- **Validaciones** - Email, teléfono, formularios
- **Manipulación de strings** - Capitalizar, slugify
- **Manipulación de arrays/objetos** - Ordenar, filtrar
- **Cálculos** - Descuentos, totales
- **Helpers generales** - Generar IDs, parsear datos

### ❌ NO va aquí:
- ❌ Componentes React → `/components`
- ❌ Custom Hooks → `/hooks`
- ❌ Llamadas a API → `/services`
- ❌ Constantes → `/constants`

## 📂 Estructura Recomendada

```
utils/
├── formatters/             # Funciones de formateo
│   ├── dateFormatter.js    # Formateo de fechas
│   ├── currencyFormatter.js # Formateo de moneda
│   └── numberFormatter.js  # Formateo de números
│
├── validators/             # Funciones de validación
│   ├── formValidators.js   # Validación de formularios
│   └── inputValidators.js  # Validación de inputs
│
├── parsers/                # Funciones de parsing
│   └── dataParser.js       # Parsear datos
│
├── calculations/           # Cálculos y lógica de negocio
│   └── discountCalculator.js
│
├── helpers/                # Helpers generales
│   ├── stringHelpers.js    # Utilidades de strings
│   ├── arrayHelpers.js     # Utilidades de arrays
│   └── objectHelpers.js    # Utilidades de objetos
│
└── index.js                # Re-exportación centralizada
```

## 📝 Ejemplos de Utilidades

### 1. Formateo de Fechas - `formatters/dateFormatter.js`

```javascript
/**
 * Formatea una fecha a formato legible
 * @param {Date|string} date - Fecha a formatear
 * @param {string} locale - Locale (default: 'es-ES')
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, locale = 'es-ES') => {
  const dateObj = date instanceof Date ? date : new Date(date)
  
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Formatea fecha y hora
 */
export const formatDateTime = (date, locale = 'es-ES') => {
  const dateObj = date instanceof Date ? date : new Date(date)
  
  return dateObj.toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Retorna fecha relativa (hace 2 días, hace 1 hora, etc)
 */
export const getRelativeTime = (date) => {
  const dateObj = date instanceof Date ? date : new Date(date)
  const now = new Date()
  const diffMs = now - dateObj
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHours = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
  if (diffHours > 0) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
  if (diffMin > 0) return `Hace ${diffMin} minuto${diffMin > 1 ? 's' : ''}`
  return 'Justo ahora'
}

/**
 * Verifica si una fecha ha expirado
 */
export const isExpired = (date) => {
  const dateObj = date instanceof Date ? date : new Date(date)
  return dateObj < new Date()
}
```

**Uso:**
```javascript
import { formatDate, getRelativeTime, isExpired } from '@/utils/formatters/dateFormatter'

const coupon = {
  expiryDate: '2026-12-31'
}

console.log(formatDate(coupon.expiryDate)) // "31 de diciembre de 2026"
console.log(getRelativeTime(new Date())) // "Justo ahora"
console.log(isExpired(coupon.expiryDate)) // false
```

### 2. Formateo de Moneda - `formatters/currencyFormatter.js`

```javascript
/**
 * Formatea número como moneda
 * @param {number} amount - Cantidad
 * @param {string} currency - Código de moneda (USD, EUR, etc)
 * @param {string} locale - Locale
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'es-ES') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount)
}

/**
 * Formatea porcentaje de descuento
 */
export const formatDiscount = (discount) => {
  return `${discount}%`
}

/**
 * Calcula precio con descuento
 */
export const calculateDiscountedPrice = (price, discount) => {
  const discountAmount = (price * discount) / 100
  return price - discountAmount
}
```

**Uso:**
```javascript
import { formatCurrency, calculateDiscountedPrice } from '@/utils/formatters/currencyFormatter'

const price = 100
const discount = 20

console.log(formatCurrency(price)) // "$100.00"
console.log(calculateDiscountedPrice(price, discount)) // 80
```

### 3. Validadores - `validators/formValidators.js`

```javascript
/**
 * Valida email
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida teléfono (formato simple)
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/
  return phoneRegex.test(phone.replace(/\D/g, ''))
}

/**
 * Valida contraseña segura
 * Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
 */
export const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
  return passwordRegex.test(password)
}

/**
 * Valida que un campo no esté vacío
 */
export const isRequired = (value) => {
  return value !== null && value !== undefined && value.trim() !== ''
}

/**
 * Valida longitud mínima
 */
export const minLength = (value, min) => {
  return value.length >= min
}

/**
 * Valida longitud máxima
 */
export const maxLength = (value, max) => {
  return value.length <= max
}

/**
 * Validador de formulario completo
 */
export const validateLoginForm = (values) => {
  const errors = {}

  if (!isRequired(values.email)) {
    errors.email = 'Email es requerido'
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Email inválido'
  }

  if (!isRequired(values.password)) {
    errors.password = 'Contraseña es requerida'
  } else if (!minLength(values.password, 6)) {
    errors.password = 'Contraseña debe tener al menos 6 caracteres'
  }

  return errors
}
```

### 4. Helpers de Strings - `helpers/stringHelpers.js`

```javascript
/**
 * Capitaliza primera letra
 */
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Convierte a Title Case
 */
export const toTitleCase = (str) => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ')
}

/**
 * Convierte a slug (URL friendly)
 */
export const slugify = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Trunca texto con ellipsis
 */
export const truncate = (str, maxLength = 50) => {
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength) + '...'
}

/**
 * Remueve acentos
 */
export const removeAccents = (str) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}
```

**Uso:**
```javascript
import { capitalize, slugify, truncate } from '@/utils/helpers/stringHelpers'

console.log(capitalize('hola mundo')) // "Hola mundo"
console.log(slugify('Cupón de Descuento 50%')) // "cupon-de-descuento-50"
console.log(truncate('Este es un texto muy largo', 10)) // "Este es un..."
```

### 5. Helpers de Arrays - `helpers/arrayHelpers.js`

```javascript
/**
 * Ordena array de objetos por propiedad
 */
export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    if (order === 'asc') {
      return a[key] > b[key] ? 1 : -1
    } else {
      return a[key] < b[key] ? 1 : -1
    }
  })
}

/**
 * Agrupa array de objetos por propiedad
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key]
    if (!result[group]) {
      result[group] = []
    }
    result[group].push(item)
    return result
  }, {})
}

/**
 * Remueve duplicados de array
 */
export const unique = (array) => {
  return [...new Set(array)]
}

/**
 * Remueve duplicados de array de objetos por propiedad
 */
export const uniqueBy = (array, key) => {
  return array.filter((item, index, self) =>
    index === self.findIndex((t) => t[key] === item[key])
  )
}

/**
 * Divide array en chunks
 */
export const chunk = (array, size) => {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}
```

**Uso:**
```javascript
import { sortBy, groupBy, chunk } from '@/utils/helpers/arrayHelpers'

const coupons = [
  { id: 1, category: 'food', discount: 20 },
  { id: 2, category: 'tech', discount: 50 },
  { id: 3, category: 'food', discount: 10 }
]

// Ordenar por descuento descendente
const sorted = sortBy(coupons, 'discount', 'desc')

// Agrupar por categoría
const grouped = groupBy(coupons, 'category')
// { food: [...], tech: [...] }

// Dividir en páginas de 2
const pages = chunk(coupons, 2)
// [[item1, item2], [item3]]
```

### 6. Calculadora de Descuentos - `calculations/discountCalculator.js`

```javascript
/**
 * Calcula precio final con descuento
 */
export const calculateFinalPrice = (price, discount) => {
  const discountAmount = (price * discount) / 100
  return price - discountAmount
}

/**
 * Calcula monto del descuento
 */
export const calculateDiscountAmount = (price, discount) => {
  return (price * discount) / 100
}

/**
 * Calcula porcentaje de descuento entre dos precios
 */
export const calculateDiscountPercentage = (originalPrice, finalPrice) => {
  return Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
}

/**
 * Valida que el cupón sea aplicable
 */
export const isCouponValid = (coupon) => {
  const now = new Date()
  const expiryDate = new Date(coupon.expiryDate)
  
  return (
    coupon.isActive &&
    !coupon.isRedeemed &&
    expiryDate > now &&
    (coupon.usageLimit ? coupon.usageCount < coupon.usageLimit : true)
  )
}
```

## ✅ Buenas Prácticas

### 1. Funciones Puras
```javascript
// ✅ CORRECTO - Función pura (sin side effects)
export const calculateDiscount = (price, discount) => {
  return price - (price * discount / 100)
}

// ❌ INCORRECTO - Modifica variables externas
let total = 0
export const addToTotal = (amount) => {
  total += amount // Side effect
}
```

### 2. Documentación JSDoc
```javascript
/**
 * Formatea número como moneda
 * @param {number} amount - Cantidad a formatear
 * @param {string} currency - Código de moneda (default: 'USD')
 * @returns {string} Cantidad formateada
 * @example
 * formatCurrency(100.50, 'USD') // "$100.50"
 */
export const formatCurrency = (amount, currency = 'USD') => {
  // ...
}
```

### 3. Valores por Defecto
```javascript
// ✅ CORRECTO - Parámetros con valores por defecto
export const formatDate = (date, locale = 'es-ES') => {
  // ...
}
```

### 4. Manejo de Errores
```javascript
// ✅ CORRECTO - Validar inputs
export const divide = (a, b) => {
  if (b === 0) {
    throw new Error('No se puede dividir por cero')
  }
  return a / b
}
```

### 5. Re-exportación Centralizada

**`utils/index.js`**
```javascript
// Formatters
export * from './formatters/dateFormatter'
export * from './formatters/currencyFormatter'

// Validators
export * from './validators/formValidators'

// Helpers
export * from './helpers/stringHelpers'
export * from './helpers/arrayHelpers'

// Uso:
// import { formatDate, isValidEmail, capitalize } from '@/utils'
```

## 🚫 Qué NO hacer

1. ❌ **No crear funciones que dependen de React**
```javascript
// ❌ INCORRECTO
export const MyComponent = () => <div>Hola</div>

// ✅ CORRECTO - Esto va en /components
```

2. ❌ **No poner lógica de estado**
```javascript
// ❌ INCORRECTO
export const useCounter = () => {
  const [count, setCount] = useState(0)
  // ...
}

// ✅ CORRECTO - Esto va en /hooks
```

3. ❌ **No hacer llamadas a APIs**
```javascript
// ❌ INCORRECTO
export const fetchCoupons = async () => {
  return await axios.get('/api/coupons')
}

// ✅ CORRECTO - Esto va en /services
```

## 🎓 Recursos

- [JavaScript Array Methods](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [Intl (Internationalization)](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Intl)

---
**Última actualización**: Febrero 2026  
**Responsable**: Equipo cupon-x
