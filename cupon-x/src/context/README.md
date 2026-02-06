# 🌐 Directorio `/src/context`

## 📋 Descripción
Esta carpeta contiene los **Context Providers** de React para manejar estado global compartido entre componentes sin necesidad de prop drilling. Se usa la Context API de React para compartir datos como autenticación, tema, idioma, etc.

## 🎯 ¿Qué va aquí?

### ✅ Contextos que DEBEN ir aquí:
- **AuthContext** - Estado de autenticación del usuario
- **ThemeContext** - Tema (dark/light mode)
- **LanguageContext** - Idioma/localización
- **CartContext** - Carrito de compras
- **NotificationContext** - Notificaciones/toasts
- **AppContext** - Estado global de la aplicación

### ❌ NO va aquí:
- ❌ Componentes regulares → `/components`
- ❌ Llamadas a API → `/services`
- ❌ Custom hooks sin Context → `/hooks`

## 📂 Estructura Recomendada

```
context/
├── AuthContext.jsx         # Contexto de autenticación
├── ThemeContext.jsx        # Contexto de tema
├── LanguageContext.jsx     # Contexto de idioma
├── CartContext.jsx         # Contexto de carrito
├── NotificationContext.jsx # Contexto de notificaciones
└── index.js                # Re-exportación centralizada
```

## 📝 Ejemplos de Context

### 1. Context de Autenticación - `AuthContext.jsx`

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react'
import authService from '@/services/auth/authService'

// Crear Context
const AuthContext = createContext(null)

/**
 * Hook para usar el contexto de autenticación
 * @returns {Object} Contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

/**
 * Provider de Autenticación
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Verificar si hay sesión al cargar
  useEffect(() => {
    const initAuth = () => {
      const currentUser = authService.getCurrentUser()
      setUser(currentUser)
      setLoading(false)
    }

    initAuth()
  }, [])

  /**
   * Iniciar sesión
   */
  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      const { user } = await authService.login(email, password)
      setUser(user)
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Registrar nuevo usuario
   */
  const register = async (userData) => {
    try {
      setLoading(true)
      setError(null)
      const { user } = await authService.register(userData)
      setUser(user)
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cerrar sesión
   */
  const logout = () => {
    authService.logout()
    setUser(null)
  }

  /**
   * Actualizar usuario
   */
  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
```

**Configuración en App:**
```javascript
// App.jsx
import { AuthProvider } from '@/context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <YourAppContent />
    </AuthProvider>
  )
}
```

**Uso en componentes:**
```javascript
import { useAuth } from '@/context/AuthContext'

const Profile = () => {
  const { user, logout, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return (
    <div>
      <h1>Bienvenido, {user.name}</h1>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  )
}
```

### 2. Context de Tema - `ThemeContext.jsx`

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider')
  }
  return context
}

/**
 * Provider de Tema
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Obtener tema guardado o usar sistema
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) return savedTheme
    
    // Detectar preferencia del sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light'
  })

  // Aplicar tema al documento
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const setLightTheme = () => setTheme('light')
  const setDarkTheme = () => setTheme('dark')

  const value = {
    theme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    toggleTheme,
    setLightTheme,
    setDarkTheme
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
```

**CSS para temas:**
```css
/* index.css */
:root[data-theme='light'] {
  --bg-color: #ffffff;
  --text-color: #000000;
}

:root[data-theme='dark'] {
  --bg-color: #1a1a1a;
  --text-color: #ffffff;
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
}
```

**Uso:**
```javascript
import { useTheme } from '@/context/ThemeContext'

const ThemeToggle = () => {
  const { theme, toggleTheme, isDark } = useTheme()

  return (
    <button onClick={toggleTheme}>
      {isDark ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
    </button>
  )
}
```

### 3. Context de Carrito - `CartContext.jsx`

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('cart')
    return saved ? JSON.parse(saved) : []
  })

  // Guardar en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  /**
   * Agregar item al carrito
   */
  const addItem = (item) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        // Incrementar cantidad
        return prev.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      // Agregar nuevo item
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  /**
   * Remover item del carrito
   */
  const removeItem = (itemId) => {
    setItems(prev => prev.filter(i => i.id !== itemId))
  }

  /**
   * Actualizar cantidad
   */
  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }
    
    setItems(prev =>
      prev.map(i =>
        i.id === itemId ? { ...i, quantity } : i
      )
    )
  }

  /**
   * Vaciar carrito
   */
  const clearCart = () => {
    setItems([])
  }

  /**
   * Calcular total
   */
  const getTotal = () => {
    return items.reduce((total, item) => {
      return total + (item.price * item.quantity)
    }, 0)
  }

  /**
   * Contar items
   */
  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0)
  }

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
    itemCount: getItemCount(),
    total: getTotal()
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
```

**Uso:**
```javascript
import { useCart } from '@/context/CartContext'

const ProductCard = ({ product }) => {
  const { addItem } = useCart()

  return (
    <div>
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={() => addItem(product)}>
        Agregar al Carrito
      </button>
    </div>
  )
}

const CartSummary = () => {
  const { items, total, itemCount, removeItem } = useCart()

  return (
    <div>
      <h2>Carrito ({itemCount} items)</h2>
      {items.map(item => (
        <div key={item.id}>
          <span>{item.name} x {item.quantity}</span>
          <button onClick={() => removeItem(item.id)}>Eliminar</button>
        </div>
      ))}
      <p>Total: ${total.toFixed(2)}</p>
    </div>
  )
}
```

### 4. Context de Notificaciones - `NotificationContext.jsx`

```javascript
import React, { createContext, useContext, useState } from 'react'

const NotificationContext = createContext(null)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification debe usarse dentro de NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  /**
   * Mostrar notificación
   */
  const showNotification = (message, type = 'info', duration = 3000) => {
    const id = Date.now()
    const notification = { id, message, type }

    setNotifications(prev => [...prev, notification])

    // Auto-remover después del duration
    if (duration) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }

  /**
   * Remover notificación
   */
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Shortcuts para diferentes tipos
  const success = (message, duration) => 
    showNotification(message, 'success', duration)
  
  const error = (message, duration) => 
    showNotification(message, 'error', duration)
  
  const warning = (message, duration) => 
    showNotification(message, 'warning', duration)
  
  const info = (message, duration) => 
    showNotification(message, 'info', duration)

  const value = {
    notifications,
    showNotification,
    removeNotification,
    success,
    error,
    warning,
    info
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Renderizar notificaciones */}
      <div className="notification-container">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`notification ${notification.type}`}
          >
            {notification.message}
            <button onClick={() => removeNotification(notification.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}
```

**Uso:**
```javascript
import { useNotification } from '@/context/NotificationContext'

const LoginForm = () => {
  const { success, error } = useNotification()

  const handleSubmit = async (data) => {
    try {
      await login(data)
      success('¡Inicio de sesión exitoso!')
    } catch (err) {
      error('Error al iniciar sesión')
    }
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

## ✅ Buenas Prácticas

### 1. Siempre Verificar Context
```javascript
// ✅ CORRECTO
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

// ❌ INCORRECTO - Sin verificación
export const useAuth = () => useContext(AuthContext)
```

### 2. Separar Hook y Provider
```javascript
// ✅ CORRECTO
export const useAuth = () => { ... }
export const AuthProvider = ({ children }) => { ... }

// Uso:
// import { useAuth } from '@/context/AuthContext'
```

### 3. Combinar Múltiples Providers
```javascript
// contexts/index.js
export const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

// App.jsx
import { AppProviders } from '@/context'

function App() {
  return (
    <AppProviders>
      <YourApp />
    </AppProviders>
  )
}
```

## 🚫 Qué NO hacer

1. ❌ **No abusar de Context** - Solo para estado global
2. ❌ **No poner todo en un solo Context** - Dividir por responsabilidad
3. ❌ **No usar Context para estado local** - Usar useState en componente

## 🎓 Recursos

- [React Context API](https://react.dev/learn/passing-data-deeply-with-context)
- [Context Best Practices](https://kentcdodds.com/blog/how-to-use-react-context-effectively)

---
**Última actualización**: Febrero 2026  
**Responsable**: Equipo cupon-x
