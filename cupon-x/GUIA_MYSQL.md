# 🗄️ Guía Rápida: MySQL + Backend - Cupón X

## 🏗️ Arquitectura del Proyecto

```
┌─────────────────────┐         ┌──────────────────────┐         ┌──────────────┐
│   FRONTEND          │  HTTP   │   BACKEND            │  SQL    │   MySQL      │
│   cupon-x/          │ ◄─────► │   cupon-x-backend/   │ ◄─────► │   Database   │
│   (React + Vite)    │         │   (Node.js/Express)  │         │              │
│                     │         │                      │         │  cuponx_db   │
│  /src/services/     │         │  /src/routes         │         │  - cupones   │
│  - couponService.js │         │  - coupons.js        │         │  - usuarios  │
│                     │         │                      │         │  - categorias│
└─────────────────────┘         └──────────────────────┘         └──────────────┘
   Puerto: 5173                    Puerto: 3000                    Puerto: 3306
```

## 📂 Estructura de Proyectos

```
webII_proyecto/
├── cupon-x/              ← FRONTEND (React)
│   ├── src/
│   │   ├── services/     ← Llamadas al backend
│   │   └── ...
│   └── package.json
│
└── cupon-x-backend/      ← BACKEND (Node.js + Express)
    ├── src/
    │   ├── config/
    │   │   └── database.js   ← Conexión MySQL
    │   ├── controllers/
    │   ├── routes/
    │   └── models/
    ├── .env              ← Variables de entorno
    ├── server.js
    └── package.json
```

## 🚀 Setup Rápido

### 1. Crear Base de Datos MySQL

```sql
-- Ejecutar en MySQL Workbench o línea de comandos
CREATE DATABASE cuponx_db;
USE cuponx_db;

-- Crear tabla de cupones
CREATE TABLE cupones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  descuento DECIMAL(5,2) NOT NULL,
  fecha_expiracion DATE NOT NULL,
  estado ENUM('activo', 'expirado') DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos de prueba
INSERT INTO cupones (titulo, codigo, descuento, fecha_expiracion) VALUES
('50% OFF Pizza', 'PIZZA50', 50.00, '2026-12-31'),
('20% Tecnología', 'TECH20', 20.00, '2026-06-30');
```

### 2. Crear Proyecto Backend

```bash
# En webII_proyecto/
mkdir cupon-x-backend
cd cupon-x-backend

# Inicializar proyecto
npm init -y

# Instalar dependencias
npm install express mysql2 cors dotenv
npm install nodemon --save-dev
```

### 3. Configurar Backend

**`.env`** (cupon-x-backend/.env):
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=cuponx_db
DB_PORT=3306
CORS_ORIGIN=http://localhost:5173
```

**`server.js`**:
```javascript
import express from 'express'
import cors from 'cors'
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Configurar MySQL
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
})

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN }))
app.use(express.json())

// Ruta de prueba
app.get('/api/coupons', async (req, res) => {
  try {
    const [cupones] = await db.query('SELECT * FROM cupones WHERE estado = "activo"')
    res.json({ success: true, data: cupones })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Backend en http://localhost:${PORT}`)
})
```

**`package.json`** (agregar):
```json
{
  "type": "module",
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js"
  }
}
```

### 4. Ejecutar Backend

```bash
# En cupon-x-backend/
npm run dev

# Debe mostrar:
# 🚀 Backend en http://localhost:3000
```

### 5. Configurar Frontend para Conectar

**`cupon-x/.env`**:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

**`cupon-x/src/services/api/axiosConfig.js`**:
```javascript
import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default apiClient
```

**`cupon-x/src/services/coupons/couponService.js`**:
```javascript
import apiClient from '../api/axiosConfig'

const couponService = {
  async getAll() {
    const response = await apiClient.get('/coupons')
    return response.data
  }
}

export default couponService
```

### 6. Usar en Componente React

```jsx
// cupon-x/src/components/CouponList.jsx
import { useState, useEffect } from 'react'
import couponService from '@/services/coupons/couponService'

const CouponList = () => {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const data = await couponService.getAll()
        setCoupons(data.data)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCoupons()
  }, [])

  if (loading) return <p>Cargando...</p>

  return (
    <div>
      {coupons.map(coupon => (
        <div key={coupon.id}>
          <h3>{coupon.titulo}</h3>
          <p>Código: {coupon.codigo}</p>
          <p>Descuento: {coupon.descuento}%</p>
        </div>
      ))}
    </div>
  )
}

export default CouponList
```

## ✅ Flujo Completo

1. **Usuario** hace clic en el frontend (React)
2. **Frontend** llama a `couponService.getAll()`
3. **Axios** hace request HTTP a `http://localhost:3000/api/coupons`
4. **Backend Express** recibe el request
5. **Backend** consulta MySQL: `SELECT * FROM cupones`
6. **MySQL** devuelve los datos
7. **Backend** envía respuesta JSON al frontend
8. **Frontend** muestra los cupones en pantalla

## 🔐 Seguridad

### ❌ NUNCA hacer esto:
```javascript
// ❌ Conectar React directamente a MySQL - IMPOSIBLE
import mysql from 'mysql2'  // No funciona en el navegador
```

### ✅ Siempre hacer esto:
```
React → Axios → Backend API → MySQL
```

## 📚 Recursos Completos

- **[Guía completa de Backend](src/services/README.md#-guía-backend-con-nodejs--express--mysql)**
- **[Script SQL completo](src/services/README.md#3-script-sql-para-crear-la-base-de-datos)**
- **[Controladores y Rutas](src/services/README.md#4-controlador-de-cupones---controllerscouponcontrollerjs)**

## 🐛 Solución de Problemas

### Error: "ECONNREFUSED localhost:3000"
- ✅ Verifica que el backend esté corriendo (`npm run dev`)

### Error: "Access denied for user 'root'@'localhost'"
- ✅ Verifica las credenciales en `.env`
- ✅ Asegúrate que MySQL esté corriendo

### Error: "CORS policy"
- ✅ Verifica que `CORS_ORIGIN` en el backend sea correcto
- ✅ Debe ser `http://localhost:5173` (puerto de Vite)

---
**Última actualización**: Febrero 2026
