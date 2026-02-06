# 📐 Directorio `/src/constants`

## 📋 Descripción
Esta carpeta contiene todas las **constantes** y **valores de configuración** de la aplicación. Son valores que no cambian durante la ejecución y se usan en múltiples partes del código.

## 🎯 ¿Qué va aquí?

### ✅ Valores que DEBEN ir aquí:
- **URLs de API** - Endpoints, base URLs
- **Configuraciones** - Límites, timeouts
- **Mensajes** - Textos estáticos, errores
- **Opciones** - Listas de selección, enums
- **Rutas** - Paths de navegación
- **Códigos** - Status codes, categorías

### ❌ NO va aquí:
- ❌ Funciones → `/utils`
- ❌ Componentes → `/components`
- ❌ Variables de entorno sensibles → `.env`

## 📂 Estructura Recomendada

```
constants/
├── api.js              # URLs y endpoints de API
├── config.js           # Configuraciones generales
├── messages.js         # Mensajes y textos
├── routes.js           # Rutas de la aplicación
├── options.js          # Opciones de formularios
├── statusCodes.js      # Códigos de estado HTTP
└── index.js            # Re-exportación centralizada
```

## 📝 Ejemplos de Constantes

### 1. URLs de API - `api.js`

```javascript
/**
 * URLs base para servicios
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

/**
 * Endpoints de API
 */
export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh'
  },

  // Cupones
  COUPONS: {
    BASE: '/coupons',
    BY_ID: (id) => `/coupons/${id}`,
    REDEEM: (id) => `/coupons/${id}/redeem`,
    ACTIVE: '/coupons/active',
    SEARCH: '/coupons/search'
  },

  // Usuarios
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    BY_ID: (id) => `/users/${id}`
  },

  // Categorías
  CATEGORIES: {
    BASE: '/categories',
    BY_ID: (id) => `/categories/${id}`
  }
}

/**
 * Headers comunes
 */
export const API_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  ACCEPT: 'Accept'
}
```

**Uso:**
```javascript
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api'

// En servicio
const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.COUPONS.BASE}`)

// Con ID
const couponUrl = API_ENDPOINTS.COUPONS.BY_ID('123')
```

### 2. Configuraciones - `config.js`

```javascript
/**
 * Configuraciones generales de la aplicación
 */
export const APP_CONFIG = {
  NAME: 'Cupón X',
  VERSION: '1.0.0',
  DESCRIPTION: 'Plataforma de cupones de descuento',
  DEFAULT_LOCALE: 'es-ES',
  DEFAULT_CURRENCY: 'USD'
}

/**
 * Límites y paginación
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100
}

/**
 * Timeouts y delays
 */
export const TIMEOUTS = {
  API_TIMEOUT: 10000, // 10 segundos
  DEBOUNCE_DELAY: 500, // 500ms
  TOAST_DURATION: 3000, // 3 segundos
  SESSION_TIMEOUT: 1800000 // 30 minutos
}

/**
 * Límites de archivos
 */
export const FILE_LIMITS = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_FILE_SIZE: 10 * 1024 * 1024 // 10MB
}

/**
 * Regex patterns
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9]{10}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
  URL: /^https?:\/\/.+/
}

/**
 * LocalStorage keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  CART: 'cart'
}
```

### 3. Mensajes - `messages.js`

```javascript
/**
 * Mensajes de éxito
 */
export const SUCCESS_MESSAGES = {
  LOGIN: 'Inicio de sesión exitoso',
  LOGOUT: 'Sesión cerrada correctamente',
  COUPON_REDEEMED: 'Cupón canjeado exitosamente',
  PROFILE_UPDATED: 'Perfil actualizado',
  CREATED: 'Creado correctamente',
  UPDATED: 'Actualizado correctamente',
  DELETED: 'Eliminado correctamente'
}

/**
 * Mensajes de error
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
  UNAUTHORIZED: 'No estás autorizado. Inicia sesión.',
  FORBIDDEN: 'No tienes permisos para esta acción.',
  NOT_FOUND: 'No se encontró el recurso solicitado.',
  SERVER_ERROR: 'Error del servidor. Intenta más tarde.',
  VALIDATION_ERROR: 'Por favor corrige los errores del formulario.',
  
  // Errores específicos
  INVALID_EMAIL: 'Email inválido',
  INVALID_PASSWORD: 'Contraseña debe tener al menos 8 caracteres',
  PASSWORDS_DONT_MATCH: 'Las contraseñas no coinciden',
  REQUIRED_FIELD: 'Este campo es requerido',
  COUPON_EXPIRED: 'Este cupón ha expirado',
  COUPON_ALREADY_USED: 'Ya has usado este cupón'
}

/**
 * Mensajes de confirmación
 */
export const CONFIRMATION_MESSAGES = {
  DELETE_COUPON: '¿Estás seguro de eliminar este cupón?',
  LOGOUT: '¿Deseas cerrar sesión?',
  CANCEL_CHANGES: '¿Descartar los cambios?'
}

/**
 * Placeholder texts
 */
export const PLACEHOLDERS = {
  SEARCH: 'Buscar cupones...',
  EMAIL: 'tu-email@ejemplo.com',
  PASSWORD: 'Ingresa tu contraseña',
  PHONE: '(123) 456-7890',
  COUPON_CODE: 'Código del cupón'
}

/**
 * Labels de formulario
 */
export const FORM_LABELS = {
  EMAIL: 'Correo electrónico',
  PASSWORD: 'Contraseña',
  CONFIRM_PASSWORD: 'Confirmar contraseña',
  NAME: 'Nombre',
  PHONE: 'Teléfono',
  ADDRESS: 'Dirección',
  DISCOUNT: 'Descuento',
  EXPIRY_DATE: 'Fecha de vencimiento'
}
```

### 4. Rutas - `routes.js`

```javascript
/**
 * Rutas públicas
 */
export const PUBLIC_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  ABOUT: '/about',
  CONTACT: '/contact'
}

/**
 * Rutas privadas (requieren autenticación)
 */
export const PRIVATE_ROUTES = {
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  MY_COUPONS: '/my-coupons',
  FAVORITES: '/favorites'
}

/**
 * Rutas de cupones
 */
export const COUPON_ROUTES = {
  LIST: '/coupons',
  DETAIL: (id) => `/coupons/${id}`,
  CREATE: '/coupons/create',
  EDIT: (id) => `/coupons/${id}/edit`,
  CATEGORY: (category) => `/coupons/category/${category}`
}

/**
 * Rutas de admin
 */
export const ADMIN_ROUTES = {
  DASHBOARD: '/admin',
  USERS: '/admin/users',
  COUPONS: '/admin/coupons',
  ANALYTICS: '/admin/analytics'
}

/**
 * Todas las rutas
 */
export const ROUTES = {
  ...PUBLIC_ROUTES,
  ...PRIVATE_ROUTES,
  ...COUPON_ROUTES,
  ...ADMIN_ROUTES
}
```

**Uso con React Router:**
```javascript
import { ROUTES } from '@/constants/routes'
import { Navigate } from 'react-router-dom'

// En configuración de rutas
<Route path={ROUTES.HOME} element={<Home />} />
<Route path={ROUTES.LOGIN} element={<Login />} />

// En componentes
<Link to={ROUTES.PROFILE}>Mi Perfil</Link>
<Navigate to={ROUTES.LOGIN} />
```

### 5. Opciones de Formularios - `options.js`

```javascript
/**
 * Categorías de cupones
 */
export const COUPON_CATEGORIES = [
  { value: 'food', label: 'Comida' },
  { value: 'tech', label: 'Tecnología' },
  { value: 'fashion', label: 'Moda' },
  { value: 'travel', label: 'Viajes' },
  { value: 'entertainment', label: 'Entretenimiento' },
  { value: 'health', label: 'Salud' },
  { value: 'education', label: 'Educación' },
  { value: 'other', label: 'Otro' }
]

/**
 * Estados de cupones
 */
export const COUPON_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  REDEEMED: 'redeemed',
  INACTIVE: 'inactive'
}

/**
 * Roles de usuario
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
  GUEST: 'guest'
}

/**
 * Opciones de ordenamiento
 */
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'oldest', label: 'Más antiguos' },
  { value: 'discount_high', label: 'Mayor descuento' },
  { value: 'discount_low', label: 'Menor descuento' },
  { value: 'expiry_soon', label: 'Próximos a vencer' }
]

/**
 * Opciones de filtros
 */
export const FILTER_OPTIONS = {
  DISCOUNT_RANGES: [
    { value: '0-20', label: '0% - 20%' },
    { value: '20-50', label: '20% - 50%' },
    { value: '50-100', label: '50% - 100%' }
  ],
  
  TIME_RANGES: [
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' },
    { value: 'all', label: 'Todo el tiempo' }
  ]
}
```

### 6. Códigos de Estado - `statusCodes.js`

```javascript
/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
}

/**
 * Estados de solicitud
 */
export const REQUEST_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
}
```

## ✅ Buenas Prácticas

### 1. Nomenclatura en MAYÚSCULAS
```javascript
// ✅ CORRECTO - Todo en mayúsculas
export const API_BASE_URL = '...'
export const MAX_RETRIES = 3

// ❌ INCORRECTO
export const apiBaseUrl = '...'
export const maxRetries = 3
```

### 2. Agrupar por Objeto
```javascript
// ✅ CORRECTO - Agrupado
export const TIMEOUTS = {
  API: 10000,
  DEBOUNCE: 500
}

// ❌ EVITAR - Muchas constantes sueltas
export const API_TIMEOUT = 10000
export const DEBOUNCE_TIMEOUT = 500
```

### 3. Documentar con JSDoc
```javascript
/**
 * Timeout para llamadas API en milisegundos
 * @constant {number}
 */
export const API_TIMEOUT = 10000
```

### 4. Valores de Configuración desde .env
```javascript
// ✅ CORRECTO - Usar variables de entorno
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// ⚠️ EVITAR - Hardcodear en producción
export const API_BASE_URL = 'http://localhost:3000'
```

### 5. Re-exportación Centralizada

**`constants/index.js`**
```javascript
export * from './api'
export * from './config'
export * from './messages'
export * from './routes'
export * from './options'
export * from './statusCodes'

// Uso:
// import { API_ENDPOINTS, SUCCESS_MESSAGES, ROUTES } from '@/constants'
```

## 🚫 Qué NO hacer

1. ❌ **No poner lógica o funciones**
```javascript
// ❌ INCORRECTO
export const calculateDiscount = (price, discount) => { ... }

// ✅ CORRECTO - Esto va en /utils
```

2. ❌ **No poner credenciales sensibles**
```javascript
// ❌ PELIGRO - Nunca hacer esto
export const API_KEY = 'mi-clave-secreta-123'
export const DB_PASSWORD = 'password123'

// ✅ CORRECTO - Usar variables de entorno
export const API_KEY = import.meta.env.VITE_API_KEY
```

3. ❌ **No duplicar constantes**
```javascript
// ❌ INCORRECTO - Duplicado en varios archivos
// archivo1.js
const API_URL = 'http://...'
// archivo2.js
const API_URL = 'http://...'

// ✅ CORRECTO - Una sola vez en /constants
```

## 📋 Ejemplo Completo de Uso

```javascript
// En un componente
import { 
  API_ENDPOINTS, 
  SUCCESS_MESSAGES, 
  ROUTES,
  COUPON_CATEGORIES 
} from '@/constants'

const CouponForm = () => {
  const handleSubmit = async (data) => {
    const response = await fetch(API_ENDPOINTS.COUPONS.BASE, {
      method: 'POST',
      body: JSON.stringify(data)
    })
    
    if (response.ok) {
      toast.success(SUCCESS_MESSAGES.CREATED)
      navigate(ROUTES.MY_COUPONS)
    }
  }

  return (
    <select name="category">
      {COUPON_CATEGORIES.map(cat => (
        <option key={cat.value} value={cat.value}>
          {cat.label}
        </option>
      ))}
    </select>
  )
}
```

## 🎓 Recursos

- [JavaScript Constants Best Practices](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const)
- [Environment Variables in Vite](https://vitejs.dev/guide/env-and-mode.html)

---
**Última actualización**: Febrero 2026  
**Responsable**: Equipo cupon-x
