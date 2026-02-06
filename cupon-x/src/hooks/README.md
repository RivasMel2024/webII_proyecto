# 🪝 Directorio `/src/hooks`

## 📋 Descripción
Esta carpeta contiene todos los **Custom Hooks** de React. Los hooks personalizados encapsulan lógica reutilizable que usa hooks de React (useState, useEffect, etc.) y pueden ser compartidos entre componentes.

## 🎯 ¿Qué es un Custom Hook?

Un Custom Hook es una función JavaScript que:
- ✅ Su nombre **DEBE** empezar con `use` (convención obligatoria)
- ✅ Puede llamar a otros hooks de React
- ✅ Encapsula lógica reutilizable
- ✅ Retorna valores o funciones que los componentes pueden usar

## 📂 Estructura Recomendada

```
hooks/
├── useCoupons.js           # Hook para manejo de cupones
├── useAuth.js              # Hook para autenticación
├── useForm.js              # Hook para formularios
├── useFetch.js             # Hook genérico para fetch
├── useLocalStorage.js      # Hook para localStorage
├── useDebounce.js          # Hook para debouncing
└── index.js                # Re-exportación centralizada
```

## 📝 Ejemplos de Custom Hooks

### 1. Hook para Fetch de Datos - `useCoupons.js`

```javascript
import { useState, useEffect } from 'react'
import couponService from '@/services/coupons/couponService'

/**
 * Hook para manejar la obtención y estado de cupones
 * @returns {Object} { coupons, loading, error, refetch }
 */
const useCoupons = () => {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await couponService.getAll()
      setCoupons(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  return {
    coupons,
    loading,
    error,
    refetch: fetchCoupons
  }
}

export default useCoupons
```

**Uso en componente:**
```jsx
import useCoupons from '@/hooks/useCoupons'

const CouponList = () => {
  const { coupons, loading, error, refetch } = useCoupons()

  if (loading) return <p>Cargando...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      <button onClick={refetch}>Actualizar</button>
      {coupons.map(coupon => (
        <div key={coupon.id}>{coupon.title}</div>
      ))}
    </div>
  )
}
```

### 2. Hook para Autenticación - `useAuth.js`

```javascript
import { useState, useEffect, createContext, useContext } from 'react'
import authService from '@/services/auth/authService'

const AuthContext = createContext(null)

/**
 * Hook para manejar autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

/**
 * Provider de autenticación
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay usuario autenticado al cargar
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const { user } = await authService.login(email, password)
    setUser(user)
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
```

**Uso:**
```jsx
// En App.jsx
import { AuthProvider } from '@/hooks/useAuth'

function App() {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  )
}

// En cualquier componente
import { useAuth } from '@/hooks/useAuth'

const Profile = () => {
  const { user, logout } = useAuth()

  return (
    <div>
      <p>Hola, {user.name}</p>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  )
}
```

### 3. Hook para Formularios - `useForm.js`

```javascript
import { useState } from 'react'

/**
 * Hook para manejar estado de formularios
 * @param {Object} initialValues - Valores iniciales del formulario
 * @param {Function} validate - Función de validación
 * @returns {Object} Valores, handlers y utilidades del formulario
 */
const useForm = (initialValues = {}, validate = null) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues(prev => ({
      ...prev,
      [name]: value
    }))

    // Validar al cambiar si hay función de validación
    if (validate) {
      const newErrors = validate({ ...values, [name]: value })
      setErrors(newErrors)
    }
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched(prev => ({
      ...prev,
      [name]: true
    }))
  }

  const handleSubmit = (onSubmit) => (e) => {
    e.preventDefault()
    
    // Marcar todos como touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {})
    setTouched(allTouched)

    // Validar
    if (validate) {
      const validationErrors = validate(values)
      setErrors(validationErrors)
      
      if (Object.keys(validationErrors).length > 0) {
        return // No enviar si hay errores
      }
    }

    onSubmit(values)
  }

  const resetForm = () => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
    setErrors
  }
}

export default useForm
```

**Uso:**
```jsx
import useForm from '@/hooks/useForm'

const LoginForm = () => {
  const validate = (values) => {
    const errors = {}
    if (!values.email) errors.email = 'Email requerido'
    if (!values.password) errors.password = 'Contraseña requerida'
    return errors
  }

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = 
    useForm({ email: '', password: '' }, validate)

  const onSubmit = async (formValues) => {
    console.log('Enviando:', formValues)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        name="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {touched.email && errors.email && <span>{errors.email}</span>}

      <input
        name="password"
        type="password"
        value={values.password}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {touched.password && errors.password && <span>{errors.password}</span>}

      <button type="submit">Login</button>
    </form>
  )
}
```

### 4. Hook para LocalStorage - `useLocalStorage.js`

```javascript
import { useState, useEffect } from 'react'

/**
 * Hook para sincronizar estado con localStorage
 * @param {string} key - Clave en localStorage
 * @param {*} initialValue - Valor inicial
 */
const useLocalStorage = (key, initialValue) => {
  // Estado para almacenar el valor
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error al leer localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Función para actualizar el valor
  const setValue = (value) => {
    try {
      // Permitir que value sea función como useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error al guardar en localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}

export default useLocalStorage
```

**Uso:**
```jsx
import useLocalStorage from '@/hooks/useLocalStorage'

const Settings = () => {
  const [theme, setTheme] = useLocalStorage('theme', 'light')

  return (
    <div>
      <p>Tema actual: {theme}</p>
      <button onClick={() => setTheme('dark')}>Modo Oscuro</button>
      <button onClick={() => setTheme('light')}>Modo Claro</button>
    </div>
  )
}
```

### 5. Hook para Debounce - `useDebounce.js`

```javascript
import { useState, useEffect } from 'react'

/**
 * Hook para debouncing de valores
 * @param {*} value - Valor a hacer debounce
 * @param {number} delay - Delay en milisegundos
 */
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebounce
```

**Uso (búsqueda con debounce):**
```jsx
import { useState, useEffect } from 'react'
import useDebounce from '@/hooks/useDebounce'

const SearchCoupons = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  useEffect(() => {
    if (debouncedSearchTerm) {
      // Hacer búsqueda solo después del delay
      console.log('Buscando:', debouncedSearchTerm)
    }
  }, [debouncedSearchTerm])

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Buscar cupones..."
    />
  )
}
```

### 6. Hook Genérico de Fetch - `useFetch.js`

```javascript
import { useState, useEffect } from 'react'

/**
 * Hook genérico para fetch de datos
 * @param {string} url - URL a fetchear
 * @param {Object} options - Opciones de fetch
 */
const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(url, options)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [url]) // Re-fetch si cambia la URL

  return { data, loading, error }
}

export default useFetch
```

## ✅ Buenas Prácticas

### 1. Nomenclatura
```javascript
// ✅ CORRECTO - Siempre empezar con "use"
useCoupons
useAuth
useForm

// ❌ INCORRECTO
getCoupons  // No es un hook
couponsHook // Incorrecto
fetchData   // No sigue convención
```

### 2. Un Hook, Una Responsabilidad
```javascript
// ✅ CORRECTO
useCoupons()  // Solo maneja cupones
useAuth()     // Solo autenticación

// ❌ INCORRECTO
useEverything() // Hace demasiadas cosas
```

### 3. Documentación
```javascript
/**
 * Hook para manejar cupones
 * @returns {Object} { coupons, loading, error, refetch }
 * @example
 * const { coupons, loading } = useCoupons()
 */
```

### 4. Re-exportación Centralizada

**`hooks/index.js`**
```javascript
export { default as useCoupons } from './useCoupons'
export { default as useAuth } from './useAuth'
export { default as useForm } from './useForm'
export { default as useLocalStorage } from './useLocalStorage'
export { default as useDebounce } from './useDebounce'

// Uso:
// import { useCoupons, useAuth } from '@/hooks'
```

## 🚫 Qué NO hacer

1. ❌ **No llamar hooks condicionalmente**
```javascript
// ❌ INCORRECTO
if (condition) {
  const data = useCoupons() // Error de React
}

// ✅ CORRECTO
const data = useCoupons()
if (condition) {
  // usar data
}
```

2. ❌ **No llamar hooks en loops**
```javascript
// ❌ INCORRECTO
array.map(item => useCoupon(item.id))

// ✅ CORRECTO - Llamar hook una vez, procesar data
const { coupons } = useCoupons()
```

3. ❌ **No poner lógica de UI en hooks**
```javascript
// ❌ INCORRECTO
const useCoupons = () => {
  return <div>Cupones</div> // Hooks no retornan JSX
}

// ✅ CORRECTO
const useCoupons = () => {
  return { coupons, loading } // Retornar datos
}
```

## 🎓 Recursos

- [React Hooks Documentation](https://react.dev/reference/react)
- [Custom Hooks Guide](https://react.dev/learn/reusing-logic-with-custom-hooks)

---
**Última actualización**: Febrero 2026  
**Responsable**: Equipo cupon-x
