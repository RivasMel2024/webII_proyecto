# 🎫 Cupón X

## 📋 Descripción
**Cupón X** es una aplicación web desarrollada con React + Vite para la gestión y visualización de cupones de descuento.

## 🚀 Tecnologías

- **Frontend**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Linting**: ESLint 9.39.1
- **Lenguaje**: JavaScript (ESM)

## 📂 Estructura del Proyecto

```
cupon-x/
├── public/              # Archivos estáticos públicos
├── src/                 # Código fuente de la aplicación
│   ├── components/      # Componentes React reutilizables
│   ├── assets/          # Imágenes, iconos, fuentes
│   ├── services/        # Servicios de API (conexión al backend)
│   ├── hooks/           # Custom hooks de React
│   ├── utils/           # Funciones utilitarias
│   ├── constants/       # Constantes y configuración
│   ├── context/         # Context API para estado global
│   ├── styles/          # Estilos CSS globales y variables
│   ├── App.jsx          # Componente principal
│   ├── main.jsx         # Punto de entrada
│   └── index.css        # Estilos globales (o importar desde /styles)
├── .eslintrc.config.js  # Configuración de ESLint
├── vite.config.js       # Configuración de Vite
├── package.json         # Dependencias del proyecto
└── README.md            # Este archivo
```

## ⚙️ Instalación

### Prerrequisitos
- Node.js >= 18.0.0
- npm o yarn

### Pasos

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd cupon-x
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

4. **Abrir en el navegador**
```
http://localhost:5173
```

## 📜 Scripts Disponibles

```bash
# Modo desarrollo con hot reload
npm run dev

# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview

# Ejecutar linter
npm run lint
```

## 🏗️ Convenciones de Código

### Nomenclatura General
- **Archivos**: camelCase o PascalCase según el tipo
- **Componentes React**: PascalCase (`CouponCard.jsx`)
- **Utilidades**: camelCase (`formatDate.js`)
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Carpetas**: lowercase o kebab-case (`components/`, `feature-name/`)

### Estructura de Importaciones
```javascript
// 1. Dependencias externas
import React, { useState } from 'react'

// 2. Componentes propios
import Header from './components/Header'

// 3. Utilidades/Helpers
import { formatDate } from './utils/dateUtils'

// 4. Estilos
import './App.css'
```

## 📦 Estructura Recomendada (A Implementar)

```
src/
├── components/          # Componentes React
│   ├── common/         # Componentes reutilizables (Button, Input)
│   ├── layout/         # Componentes de estructura (Header, Footer)
│   ├── features/       # Componentes específicos (CouponCard, UserProfile)
│   └── ui/             # Componentes UI puros (Modal, Spinner)
│
├── services/           # Servicios de API (Frontend → Backend)
│   ├── api/           # Configuración Axios
│   ├── coupons/       # Servicios de cupones
│   └── auth/          # Autenticación
│
├── hooks/              # Custom hooks
├── utils/              # Utilidades y helpers
├── constants/          # Constantes y configuración
├── context/            # Context API
├── styles/             # Estilos CSS globales
│   ├── variables.css  # Variables CSS
│   ├── global.css     # Reset y estilos base
│   └── utilities.css  # Clases helper
│
└── pages/              # Páginas/Vistas (si se usa routing)
```

## 🗄️ Backend Separado (Node.js + Express + MySQL)

El proyecto usa **MySQL** como base de datos. El backend debe estar en un proyecto separado:

```
cupon-x-backend/         # ← Proyecto backend separado
├── src/
│   ├── config/
│   │   └── database.js  # Conexión MySQL
│   ├── controllers/     # Lógica de negocio
│   ├── routes/          # Rutas de API
│   └── models/          # Modelos de datos
├── .env                 # Variables de entorno
└── server.js            # Servidor Express
```

**Ver guía completa de backend**: [src/services/README.md](src/services/README.md#-guía-backend-con-nodejs--express--mysql)

