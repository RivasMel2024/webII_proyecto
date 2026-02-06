# 🔌 Directorio `/src/services`

## 📋 Descripción
Esta carpeta contiene todos los servicios de comunicación con APIs externas, bases de datos, y lógica de acceso a datos. Es la **capa de integración** entre tu frontend y el backend/base de datos.

## 🎯 ¿Qué va aquí?

### ✅ Archivos que DEBEN ir aquí:
- **Servicios de API REST** - Llamadas HTTP (GET, POST, PUT, DELETE) a backend Node.js/Express + MySQL
- **Configuración de clientes** - Axios, Fetch configurados
- **Autenticación** - Login, logout, refresh tokens
- **WebSockets** - Conexiones en tiempo real
- **GraphQL clients** - Apollo Client, etc.

> **⚠️ IMPORTANTE**: Este directorio es solo para el **FRONTEND** (React).  
> El código del **BACKEND** (Node.js + Express + MySQL) va en un proyecto separado.

### ❌ NO va aquí:
- ❌ Componentes React → `/components`
- ❌ Custom hooks → `/hooks`
- ❌ Utilidades generales → `/utils`
- ❌ Constantes → `/constants`

## 📂 Estructura Recomendada

```
services/
├── api/                    # Servicios de API REST
│   ├── axiosConfig.js      # Configuración de Axios
│   ├── apiClient.js        # Cliente HTTP base
│   └── interceptors.js     # Interceptores (auth, errors)
│
├── coupons/                # Servicios de cupones
│   ├── couponService.js    # CRUD de cupones
│   └── couponApi.js        # Endpoints específicos
│
├── auth/                   # Servicios de autenticación
│   ├── authService.js      # Login, logout, register
│   └── tokenService.js     # Manejo de tokens
│
├── users/                  # Servicios de usuarios
│   └── userService.js      # Perfil, actualización
│
├── database/               # (Si usas Firebase/Supabase - BaaS)
│   ├── firebaseConfig.js   # Configuración Firebase
│   └── firestoreService.js # Operaciones Firestore
│
└── index.js                # Re-exportación centralizada
```

## 🗄️ Arquitectura con MySQL

### Frontend (React) ↔️ Backend (Node.js/Express) ↔️ Base de Datos (MySQL)

```
┌─────────────────────┐         ┌──────────────────────┐         ┌──────────────┐
│   FRONTEND          │  HTTP   │   BACKEND            │  SQL    │   MySQL      │
│   (React)           │ ◄─────► │   (Node.js/Express)  │ ◄─────► │   Database   │
│                     │         │                      │         │              │
│  /src/services/     │         │  /routes             │         │  cupones     │
│  - couponService.js │         │  - coupons.js        │         │  usuarios    │
│  - authService.js   │         │  - auth.js           │         │  categorias  │
│                     │         │                      │         │              │
│  Axios/Fetch        │         │  MySQL2 / Sequelize  │         │              │
└─────────────────────┘         └──────────────────────┘         └──────────────┘
```

**IMPORTANTE**: 
- ❌ **NO** conectar directamente React a MySQL (imposible en el navegador)
- ✅ **SÍ** crear un backend separado con Node.js + Express + MySQL
- ✅ **SÍ** usar `/src/services` para llamar a la API del backend desde React

---

## 🔧 Configuración Base

### 1. Cliente HTTP con Axios

**`services/api/axiosConfig.js`**
```javascript
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejo de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirigir a login si no está autenticado
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
```

### 2. Servicio de Ejemplo - Cupones

**`services/coupons/couponService.js`**
```javascript
import apiClient from '../api/axiosConfig'

/**
 * Servicio para operaciones CRUD de cupones
 */
const couponService = {
  /**
   * Obtener todos los cupones
   * @returns {Promise<Array>} Lista de cupones
   */
  async getAll() {
    try {
      const response = await apiClient.get('/coupons')
      return response.data
    } catch (error) {
      console.error('Error al obtener cupones:', error)
      throw error
    }
  },

  /**
   * Obtener cupón por ID
   * @param {string} id - ID del cupón
   * @returns {Promise<Object>} Datos del cupón
   */
  async getById(id) {
    try {
      const response = await apiClient.get(`/coupons/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error al obtener cupón ${id}:`, error)
      throw error
    }
  },

  /**
   * Crear nuevo cupón
   * @param {Object} couponData - Datos del cupón
   * @returns {Promise<Object>} Cupón creado
   */
  async create(couponData) {
    try {
      const response = await apiClient.post('/coupons', couponData)
      return response.data
    } catch (error) {
      console.error('Error al crear cupón:', error)
      throw error
    }
  },

  /**
   * Actualizar cupón existente
   * @param {string} id - ID del cupón
   * @param {Object} couponData - Datos actualizados
   * @returns {Promise<Object>} Cupón actualizado
   */
  async update(id, couponData) {
    try {
      const response = await apiClient.put(`/coupons/${id}`, couponData)
      return response.data
    } catch (error) {
      console.error(`Error al actualizar cupón ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar cupón
   * @param {string} id - ID del cupón
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      await apiClient.delete(`/coupons/${id}`)
    } catch (error) {
      console.error(`Error al eliminar cupón ${id}:`, error)
      throw error
    }
  },

  /**
   * Canjear cupón
   * @param {string} id - ID del cupón
   * @returns {Promise<Object>} Resultado del canje
   */
  async redeem(id) {
    try {
      const response = await apiClient.post(`/coupons/${id}/redeem`)
      return response.data
    } catch (error) {
      console.error(`Error al canjear cupón ${id}:`, error)
      throw error
    }
  }
}

export default couponService
```

### 3. Servicio de Autenticación

**`services/auth/authService.js`**
```javascript
import apiClient from '../api/axiosConfig'

const authService = {
  /**
   * Iniciar sesión
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña
   * @returns {Promise<Object>} Datos del usuario y token
   */
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', { email, password })
      const { token, user } = response.data
      
      // Guardar token en localStorage
      localStorage.setItem('authToken', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      return { token, user }
    } catch (error) {
      console.error('Error al iniciar sesión:', error)
      throw error
    }
  },

  /**
   * Registrar nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Usuario creado
   */
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData)
      return response.data
    } catch (error) {
      console.error('Error al registrar usuario:', error)
      throw error
    }
  },

  /**
   * Cerrar sesión
   */
  logout() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    window.location.href = '/login'
  },

  /**
   * Obtener usuario actual
   * @returns {Object|null} Usuario autenticado
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  /**
   * Verificar si hay usuario autenticado
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!localStorage.getItem('authToken')
  }
}

export default authService
```

## 🔥 Ejemplo con Firebase/Firestore

### Configuración Firebase

**`services/firebase/firebaseConfig.js`**
```javascript
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Servicios de Firebase
export const db = getFirestore(app)
export const auth = getAuth(app)

export default app
```

**`.env`** (en la raíz del proyecto)
```env
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### Servicio Firestore

**`services/firebase/firestoreService.js`**
```javascript
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy 
} from 'firebase/firestore'
import { db } from './firebaseConfig'

const COUPONS_COLLECTION = 'coupons'

const firestoreService = {
  /**
   * Obtener todos los cupones
   */
  async getAllCoupons() {
    try {
      const q = query(
        collection(db, COUPONS_COLLECTION),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error al obtener cupones:', error)
      throw error
    }
  },

  /**
   * Obtener cupón por ID
   */
  async getCouponById(id) {
    try {
      const docRef = doc(db, COUPONS_COLLECTION, id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      } else {
        throw new Error('Cupón no encontrado')
      }
    } catch (error) {
      console.error('Error al obtener cupón:', error)
      throw error
    }
  },

  /**
   * Crear cupón
   */
  async createCoupon(couponData) {
    try {
      const docRef = await addDoc(collection(db, COUPONS_COLLECTION), {
        ...couponData,
        createdAt: new Date().toISOString()
      })
      
      return { id: docRef.id, ...couponData }
    } catch (error) {
      console.error('Error al crear cupón:', error)
      throw error
    }
  },

  /**
   * Actualizar cupón
   */
  async updateCoupon(id, couponData) {
    try {
      const docRef = doc(db, COUPONS_COLLECTION, id)
      await updateDoc(docRef, {
        ...couponData,
        updatedAt: new Date().toISOString()
      })
      
      return { id, ...couponData }
    } catch (error) {
      console.error('Error al actualizar cupón:', error)
      throw error
    }
  },

  /**
   * Eliminar cupón
   */
  async deleteCoupon(id) {
    try {
      await deleteDoc(doc(db, COUPONS_COLLECTION, id))
    } catch (error) {
      console.error('Error al eliminar cupón:', error)
      throw error
    }
  },

  /**
   * Buscar cupones activos
   */
  async getActiveCoupons() {
    try {
      const q = query(
        collection(db, COUPONS_COLLECTION),
        where('isActive', '==', true),
        orderBy('expiryDate', 'asc')
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error al obtener cupones activos:', error)
      throw error
    }
  }
}

export default firestoreService
```

## 📦 Uso en Componentes

### Con async/await
```jsx
import React, { useEffect, useState } from 'react'
import couponService from '@/services/coupons/couponService'

const CouponList = () => {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true)
        const data = await couponService.getAll()
        setCoupons(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCoupons()
  }, [])

  if (loading) return <p>Cargando...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      {coupons.map(coupon => (
        <div key={coupon.id}>{coupon.title}</div>
      ))}
    </div>
  )
}
```

### Con Custom Hook (Recomendado)
```jsx
// Mejor práctica: usar custom hook
import useCoupons from '@/hooks/useCoupons'

const CouponList = () => {
  const { coupons, loading, error } = useCoupons()

  if (loading) return <p>Cargando...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      {coupons.map(coupon => (
        <div key={coupon.id}>{coupon.title}</div>
      ))}
    </div>
  )
}
```

## ✅ Buenas Prácticas

### 1. Manejo de Errores
```javascript
// ✅ CORRECTO - Manejo completo de errores
async getAll() {
  try {
    const response = await apiClient.get('/coupons')
    return response.data
  } catch (error) {
    // Logging para debugging
    console.error('Error al obtener cupones:', error)
    
    // Mensaje amigable al usuario
    if (error.response?.status === 404) {
      throw new Error('No se encontraron cupones')
    } else if (error.response?.status === 500) {
      throw new Error('Error en el servidor')
    } else {
      throw new Error('Error de conexión')
    }
  }
}

// ❌ INCORRECTO - Sin manejo de errores
async getAll() {
  const response = await apiClient.get('/coupons')
  return response.data
}
```

### 2. Variables de Entorno
```javascript
// ✅ CORRECTO - Usar variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// ❌ INCORRECTO - URL hardcodeada
const API_BASE_URL = 'http://localhost:3000/api'
```

### 3. Documentación JSDoc
```javascript
/**
 * Obtener cupón por ID
 * @param {string} id - ID del cupón
 * @returns {Promise<Object>} Datos del cupón
 * @throws {Error} Si el cupón no existe
 */
async getById(id) {
  // ...
}
```

### 4. Separación de Responsabilidades
```javascript
// ✅ CORRECTO - Un servicio por entidad
// couponService.js - Solo operaciones de cupones
// userService.js - Solo operaciones de usuarios
// authService.js - Solo autenticación

// ❌ INCORRECTO - Todo en un archivo
// apiService.js con TODO mezclado
```

### 5. Re-exportación Centralizada

**`services/index.js`**
```javascript
export { default as couponService } from './coupons/couponService'
export { default as authService } from './auth/authService'
export { default as userService } from './users/userService'

// Uso:
// import { couponService, authService } from '@/services'
```

## 🚫 Qué NO hacer

1. ❌ **No poner lógica de UI aquí** - Solo comunicación con APIs
2. ❌ **No usar servicios directamente en JSX** - Usar custom hooks
3. ❌ **No hardcodear URLs** - Usar variables de entorno
4. ❌ **No exponer credenciales** - Usar .env y .gitignore
5. ❌ **No ignorar errores** - Siempre usar try/catch
6. ❌ **No mezclar diferentes APIs** - Un servicio por fuente de datos

## 📋 Instalación de Dependencias

### Frontend (React)
```bash
# Para API REST - Cliente HTTP
npm install axios
```

### Backend (Node.js/Express + MySQL)
```bash
# Crear carpeta separada para backend
mkdir cupon-x-backend
cd cupon-x-backend
npm init -y

# Dependencias del backend
npm install express mysql2 cors dotenv bcrypt jsonwebtoken
npm install nodemon --save-dev
```

---

## 🗄️ GUÍA: Backend con Node.js + Express + MySQL

### Estructura del Proyecto Backend

```
cupon-x-backend/              # ← Proyecto separado del frontend
├── src/
│   ├── config/
│   │   └── database.js       # Configuración MySQL
│   ├── controllers/
│   │   ├── couponController.js
│   │   └── authController.js
│   ├── routes/
│   │   ├── coupons.js
│   │   └── auth.js
│   ├── models/
│   │   ├── Coupon.js
│   │   └── User.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   └── app.js
├── .env                      # Variables de entorno
├── .gitignore
├── package.json
└── server.js                 # Punto de entrada
```

### 1. Configuración de MySQL - `config/database.js`

```javascript
// cupon-x-backend/src/config/database.js
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

// Crear pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cuponx_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// Probar conexión
pool.getConnection()
  .then(connection => {
    console.log('✅ Conectado a MySQL')
    connection.release()
  })
  .catch(err => {
    console.error('❌ Error conectando a MySQL:', err)
  })

export default pool
```

### 2. Variables de Entorno - `.env` (Backend)

```env
# Backend - cupon-x-backend/.env

# Servidor
PORT=3000
NODE_ENV=development

# Base de datos MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=cuponx_db
DB_PORT=3306

# JWT para autenticación
JWT_SECRET=tu_secreto_super_seguro_cambiame
JWT_EXPIRES_IN=7d

# CORS - Permitir frontend
CORS_ORIGIN=http://localhost:5173
```

### 3. Script SQL para Crear la Base de Datos

```sql
-- Crear base de datos
CREATE DATABASE IF NOT EXISTS cuponx_db;
USE cuponx_db;

-- Tabla de usuarios
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de categorías
CREATE TABLE categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de cupones
CREATE TABLE cupones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  descuento DECIMAL(5,2) NOT NULL,
  categoria_id INT,
  fecha_expiracion DATE NOT NULL,
  estado ENUM('activo', 'expirado', 'inactivo') DEFAULT 'activo',
  limite_uso INT DEFAULT NULL,
  veces_usado INT DEFAULT 0,
  usuario_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla de cupones canjeados
CREATE TABLE cupones_canjeados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cupon_id INT NOT NULL,
  usuario_id INT NOT NULL,
  fecha_canje TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cupon_id) REFERENCES cupones(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Insertar categorías de ejemplo
INSERT INTO categorias (nombre, descripcion) VALUES
('Comida', 'Restaurantes y alimentos'),
('Tecnología', 'Electrónicos y gadgets'),
('Moda', 'Ropa y accesorios'),
('Viajes', 'Hoteles y turismo'),
('Entretenimiento', 'Cine, eventos, etc.');

-- Insertar cupones de ejemplo
INSERT INTO cupones (titulo, descripcion, codigo, descuento, categoria_id, fecha_expiracion) VALUES
('50% OFF en Pizza', 'Descuento en cualquier pizza grande', 'PIZZA50', 50.00, 1, '2026-12-31'),
('20% en Auriculares', 'Descuento en auriculares Bluetooth', 'AUDIO20', 20.00, 2, '2026-06-30');
```

### 4. Controlador de Cupones - `controllers/couponController.js`

```javascript
// cupon-x-backend/src/controllers/couponController.js
import db from '../config/database.js'

export const couponController = {
  /**
   * Obtener todos los cupones activos
   */
  async getAll(req, res) {
    try {
      const [cupones] = await db.query(`
        SELECT 
          c.*,
          cat.nombre as categoria_nombre
        FROM cupones c
        LEFT JOIN categorias cat ON c.categoria_id = cat.id
        WHERE c.estado = 'activo' AND c.fecha_expiracion > NOW()
        ORDER BY c.created_at DESC
      `)
      
      res.json({
        success: true,
        data: cupones
      })
    } catch (error) {
      console.error('Error al obtener cupones:', error)
      res.status(500).json({
        success: false,
        message: 'Error al obtener cupones'
      })
    }
  },

  /**
   * Obtener cupón por ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params
      
      const [cupones] = await db.query(`
        SELECT 
          c.*,
          cat.nombre as categoria_nombre
        FROM cupones c
        LEFT JOIN categorias cat ON c.categoria_id = cat.id
        WHERE c.id = ?
      `, [id])
      
      if (cupones.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cupón no encontrado'
        })
      }
      
      res.json({
        success: true,
        data: cupones[0]
      })
    } catch (error) {
      console.error('Error al obtener cupón:', error)
      res.status(500).json({
        success: false,
        message: 'Error al obtener cupón'
      })
    }
  },

  /**
   * Crear nuevo cupón
   */
  async create(req, res) {
    try {
      const { titulo, descripcion, codigo, descuento, categoria_id, fecha_expiracion } = req.body
      
      // Validar datos
      if (!titulo || !codigo || !descuento || !fecha_expiracion) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos'
        })
      }
      
      const [result] = await db.query(`
        INSERT INTO cupones (titulo, descripcion, codigo, descuento, categoria_id, fecha_expiracion)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [titulo, descripcion, codigo, descuento, categoria_id, fecha_expiracion])
      
      res.status(201).json({
        success: true,
        message: 'Cupón creado exitosamente',
        data: {
          id: result.insertId,
          titulo,
          codigo
        }
      })
    } catch (error) {
      console.error('Error al crear cupón:', error)
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          success: false,
          message: 'El código del cupón ya existe'
        })
      }
      
      res.status(500).json({
        success: false,
        message: 'Error al crear cupón'
      })
    }
  },

  /**
   * Canjear cupón
   */
  async redeem(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.id // Desde el middleware de autenticación
      
      // Verificar si el cupón existe y está activo
      const [cupones] = await db.query(`
        SELECT * FROM cupones 
        WHERE id = ? AND estado = 'activo' AND fecha_expiracion > NOW()
      `, [id])
      
      if (cupones.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cupón no disponible'
        })
      }
      
      const cupon = cupones[0]
      
      // Verificar límite de uso
      if (cupon.limite_uso && cupon.veces_usado >= cupon.limite_uso) {
        return res.status(400).json({
          success: false,
          message: 'Cupón agotado'
        })
      }
      
      // Verificar si el usuario ya lo canjeó
      const [canjeados] = await db.query(`
        SELECT * FROM cupones_canjeados 
        WHERE cupon_id = ? AND usuario_id = ?
      `, [id, userId])
      
      if (canjeados.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Ya has canjeado este cupón'
        })
      }
      
      // Registrar canje
      await db.query(`
        INSERT INTO cupones_canjeados (cupon_id, usuario_id)
        VALUES (?, ?)
      `, [id, userId])
      
      // Incrementar contador
      await db.query(`
        UPDATE cupones 
        SET veces_usado = veces_usado + 1
        WHERE id = ?
      `, [id])
      
      res.json({
        success: true,
        message: 'Cupón canjeado exitosamente',
        data: {
          codigo: cupon.codigo,
          descuento: cupon.descuento
        }
      })
    } catch (error) {
      console.error('Error al canjear cupón:', error)
      res.status(500).json({
        success: false,
        message: 'Error al canjear cupón'
      })
    }
  }
}
```

### 5. Rutas - `routes/coupons.js`

```javascript
// cupon-x-backend/src/routes/coupons.js
import express from 'express'
import { couponController } from '../controllers/couponController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

// Rutas públicas
router.get('/', couponController.getAll)
router.get('/:id', couponController.getById)

// Rutas protegidas (requieren autenticación)
router.post('/', authMiddleware, couponController.create)
router.post('/:id/redeem', authMiddleware, couponController.redeem)

export default router
```

### 6. Servidor Principal - `server.js`

```javascript
// cupon-x-backend/server.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import couponRoutes from './src/routes/coupons.js'
import authRoutes from './src/routes/auth.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rutas
app.get('/', (req, res) => {
  res.json({ message: 'API Cupón X funcionando' })
})

app.use('/api/coupons', couponRoutes)
app.use('/api/auth', authRoutes)

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
})
```

### 7. Package.json del Backend

```json
{
  "name": "cupon-x-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### 8. Ejecutar el Backend

```bash
# En la carpeta del backend
cd cupon-x-backend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# El backend estará en http://localhost:3000
```

---

## 🔐 Seguridad

### Configurar .env
```env
# API Backend
VITE_API_BASE_URL=https://api.cuponx.com

# Firebase
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id

# NO GUARDAR SECRETS SENSIBLES EN FRONTEND
# Solo claves públicas
```

### .gitignore
```gitignore
# Variables de entorno
.env
.env.local
.env.production
```

## 🎓 Recursos

- [Axios Documentation](https://axios-http.com/docs/intro)
- [Firebase Documentation](https://firebase.google.com/docs)
- [REST API Best Practices](https://restfulapi.net/)

---
**Última actualización**: Febrero 2026  
**Responsable**: Equipo cupon-x
