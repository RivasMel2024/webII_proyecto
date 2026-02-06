# 🎨 Directorio `/src/styles`

## 📋 Descripción
Esta carpeta contiene todos los **estilos CSS globales**, **variables**, **mixins** y **utilidades CSS** compartidas en toda la aplicación. Es el lugar centralizado para estilos que se usan en múltiples componentes.

## 🎯 ¿Qué va aquí?

### ✅ Archivos que DEBEN ir aquí:
- **Variables CSS** - Colores, fuentes, espaciados
- **Estilos globales** - Reset, tipografía base
- **Utilidades CSS** - Clases helper reutilizables
- **Temas** - Dark mode, light mode
- **Animaciones** - Keyframes globales
- **Mixins** (si usas SASS/SCSS)

### ❌ NO va aquí:
- ❌ Estilos de componentes específicos → Junto al componente (`.module.css`)
- ❌ Imágenes o assets → `/src/assets`

## 📂 Estructura Recomendada

```
styles/
├── variables.css           # Variables CSS (colores, fuentes, etc.)
├── global.css              # Estilos globales y reset
├── utilities.css           # Clases utilitarias
├── animations.css          # Animaciones y keyframes
├── themes/                 # Temas (dark/light)
│   ├── dark.css
│   └── light.css
└── index.css               # Importa todos los estilos
```

## 📝 Archivos de Estilos

### 1. Variables CSS - `styles/variables.css`

```css
/**
 * Variables de diseño globales
 * Usar propiedades CSS Custom Properties (--variable-name)
 */

:root {
  /* === COLORES === */
  
  /* Colores Primarios */
  --color-primary: #3b82f6;          /* Azul principal */
  --color-primary-light: #60a5fa;    /* Azul claro */
  --color-primary-dark: #2563eb;     /* Azul oscuro */
  
  /* Colores Secundarios */
  --color-secondary: #8b5cf6;        /* Púrpura */
  --color-secondary-light: #a78bfa;
  --color-secondary-dark: #7c3aed;
  
  /* Colores de Estado */
  --color-success: #10b981;          /* Verde - éxito */
  --color-warning: #f59e0b;          /* Amarillo - advertencia */
  --color-error: #ef4444;            /* Rojo - error */
  --color-info: #06b6d4;             /* Cyan - información */
  
  /* Colores Neutros */
  --color-white: #ffffff;
  --color-black: #000000;
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
  
  /* Colores de Fondo */
  --bg-primary: var(--color-white);
  --bg-secondary: var(--color-gray-50);
  --bg-tertiary: var(--color-gray-100);
  
  /* Colores de Texto */
  --text-primary: var(--color-gray-900);
  --text-secondary: var(--color-gray-600);
  --text-tertiary: var(--color-gray-400);
  --text-inverse: var(--color-white);
  
  /* === TIPOGRAFÍA === */
  
  /* Familias de Fuentes */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-secondary: 'Roboto', sans-serif;
  --font-mono: 'Fira Code', 'Courier New', monospace;
  
  /* Tamaños de Fuente */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
  --font-size-5xl: 3rem;      /* 48px */
  
  /* Pesos de Fuente */
  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-extrabold: 800;
  
  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
  
  /* === ESPACIADO === */
  
  --spacing-xs: 0.25rem;      /* 4px */
  --spacing-sm: 0.5rem;       /* 8px */
  --spacing-md: 1rem;         /* 16px */
  --spacing-lg: 1.5rem;       /* 24px */
  --spacing-xl: 2rem;         /* 32px */
  --spacing-2xl: 3rem;        /* 48px */
  --spacing-3xl: 4rem;        /* 64px */
  
  /* === BORDES === */
  
  /* Border Radius */
  --radius-none: 0;
  --radius-sm: 0.25rem;       /* 4px */
  --radius-md: 0.375rem;      /* 6px */
  --radius-lg: 0.5rem;        /* 8px */
  --radius-xl: 0.75rem;       /* 12px */
  --radius-2xl: 1rem;         /* 16px */
  --radius-full: 9999px;      /* Círculo */
  
  /* Border Width */
  --border-width-thin: 1px;
  --border-width-medium: 2px;
  --border-width-thick: 4px;
  
  /* === SOMBRAS === */
  
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  
  /* === TRANSICIONES === */
  
  --transition-fast: 150ms ease-in-out;
  --transition-base: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;
  
  /* === Z-INDEX === */
  
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
  
  /* === BREAKPOINTS (para referencia en JS) === */
  
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

### 2. Estilos Globales - `styles/global.css`

```css
/**
 * Estilos globales y reset
 */

/* === CSS RESET === */

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

body {
  font-family: var(--font-primary);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  color: var(--text-primary);
  background-color: var(--bg-primary);
  overflow-x: hidden;
}

/* === TIPOGRAFÍA === */

h1, h2, h3, h4, h5, h6 {
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

h1 {
  font-size: var(--font-size-4xl);
}

h2 {
  font-size: var(--font-size-3xl);
}

h3 {
  font-size: var(--font-size-2xl);
}

h4 {
  font-size: var(--font-size-xl);
}

h5 {
  font-size: var(--font-size-lg);
}

h6 {
  font-size: var(--font-size-base);
}

p {
  margin-bottom: var(--spacing-md);
  color: var(--text-secondary);
}

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

/* === LISTAS === */

ul, ol {
  list-style-position: inside;
  margin-bottom: var(--spacing-md);
}

/* === IMÁGENES === */

img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* === BOTONES === */

button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: none;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* === INPUTS === */

input, textarea, select {
  font-family: inherit;
  font-size: inherit;
}

/* === SCROLLBAR PERSONALIZADA === */

::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: var(--color-gray-100);
}

::-webkit-scrollbar-thumb {
  background: var(--color-gray-400);
  border-radius: var(--radius-lg);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-gray-500);
}
```

### 3. Utilidades CSS - `styles/utilities.css`

```css
/**
 * Clases utilitarias reutilizables
 */

/* === DISPLAY === */

.hidden {
  display: none !important;
}

.block {
  display: block;
}

.inline-block {
  display: inline-block;
}

.flex {
  display: flex;
}

.inline-flex {
  display: inline-flex;
}

.grid {
  display: grid;
}

/* === FLEXBOX === */

.flex-row {
  flex-direction: row;
}

.flex-col {
  flex-direction: column;
}

.flex-wrap {
  flex-wrap: wrap;
}

.items-center {
  align-items: center;
}

.items-start {
  align-items: flex-start;
}

.items-end {
  align-items: flex-end;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-around {
  justify-content: space-around;
}

.justify-start {
  justify-content: flex-start;
}

.justify-end {
  justify-content: flex-end;
}

.gap-sm {
  gap: var(--spacing-sm);
}

.gap-md {
  gap: var(--spacing-md);
}

.gap-lg {
  gap: var(--spacing-lg);
}

/* === ESPACIADO === */

/* Margin */
.m-0 { margin: 0; }
.m-auto { margin: auto; }
.mt-sm { margin-top: var(--spacing-sm); }
.mt-md { margin-top: var(--spacing-md); }
.mt-lg { margin-top: var(--spacing-lg); }
.mb-sm { margin-bottom: var(--spacing-sm); }
.mb-md { margin-bottom: var(--spacing-md); }
.mb-lg { margin-bottom: var(--spacing-lg); }

/* Padding */
.p-0 { padding: 0; }
.p-sm { padding: var(--spacing-sm); }
.p-md { padding: var(--spacing-md); }
.p-lg { padding: var(--spacing-lg); }
.px-md { padding-left: var(--spacing-md); padding-right: var(--spacing-md); }
.py-md { padding-top: var(--spacing-md); padding-bottom: var(--spacing-md); }

/* === TEXTO === */

.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

.text-uppercase {
  text-transform: uppercase;
}

.text-lowercase {
  text-transform: lowercase;
}

.text-capitalize {
  text-transform: capitalize;
}

.font-bold {
  font-weight: var(--font-weight-bold);
}

.font-semibold {
  font-weight: var(--font-weight-semibold);
}

.font-medium {
  font-weight: var(--font-weight-medium);
}

.text-sm {
  font-size: var(--font-size-sm);
}

.text-lg {
  font-size: var(--font-size-lg);
}

.text-xl {
  font-size: var(--font-size-xl);
}

/* === COLORES === */

.text-primary {
  color: var(--color-primary);
}

.text-success {
  color: var(--color-success);
}

.text-error {
  color: var(--color-error);
}

.text-warning {
  color: var(--color-warning);
}

.bg-primary {
  background-color: var(--color-primary);
}

.bg-secondary {
  background-color: var(--bg-secondary);
}

/* === BORDES === */

.rounded {
  border-radius: var(--radius-md);
}

.rounded-lg {
  border-radius: var(--radius-lg);
}

.rounded-full {
  border-radius: var(--radius-full);
}

/* === SOMBRAS === */

.shadow-sm {
  box-shadow: var(--shadow-sm);
}

.shadow-md {
  box-shadow: var(--shadow-md);
}

.shadow-lg {
  box-shadow: var(--shadow-lg);
}

/* === ANCHOS === */

.w-full {
  width: 100%;
}

.w-auto {
  width: auto;
}

.h-full {
  height: 100%;
}

.h-screen {
  height: 100vh;
}

/* === CONTENEDOR === */

.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

/* === RESPONSIVE === */

@media (min-width: 640px) {
  .sm\:hidden {
    display: none;
  }
  
  .sm\:block {
    display: block;
  }
}

@media (min-width: 768px) {
  .md\:flex {
    display: flex;
  }
}

@media (min-width: 1024px) {
  .lg\:grid {
    display: grid;
  }
}
```

### 4. Animaciones - `styles/animations.css`

```css
/**
 * Animaciones y keyframes globales
 */

/* === FADE === */

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.fade-in {
  animation: fadeIn var(--transition-base);
}

.fade-out {
  animation: fadeOut var(--transition-base);
}

/* === SLIDE === */

@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideInDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.slide-in-up {
  animation: slideInUp var(--transition-base);
}

.slide-in-down {
  animation: slideInDown var(--transition-base);
}

/* === SPINNER === */

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  animation: spin 1s linear infinite;
}

/* === PULSE === */

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* === BOUNCE === */

@keyframes bounce {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

.bounce {
  animation: bounce 1s infinite;
}
```

### 5. Temas - `styles/themes/dark.css`

```css
/**
 * Tema oscuro
 */

[data-theme='dark'] {
  /* Colores de Fondo */
  --bg-primary: var(--color-gray-900);
  --bg-secondary: var(--color-gray-800);
  --bg-tertiary: var(--color-gray-700);
  
  /* Colores de Texto */
  --text-primary: var(--color-gray-50);
  --text-secondary: var(--color-gray-300);
  --text-tertiary: var(--color-gray-500);
  --text-inverse: var(--color-gray-900);
  
  /* Ajustes de colores primarios para mejor contraste */
  --color-primary: #60a5fa;
  --color-primary-light: #93c5fd;
  --color-primary-dark: #3b82f6;
}
```

### 6. Archivo principal - `styles/index.css`

```css
/**
 * Punto de entrada para todos los estilos
 * Importar este archivo en main.jsx
 */

/* Importar variables primero */
@import './variables.css';

/* Luego estilos globales */
@import './global.css';

/* Utilidades */
@import './utilities.css';

/* Animaciones */
@import './animations.css';

/* Temas */
@import './themes/dark.css';
```

## 🔧 Configuración

### En `main.jsx`:
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Importar estilos globales
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

## ✅ Buenas Prácticas

### 1. Usar Variables CSS
```css
/* ✅ CORRECTO - Usar variables */
.button {
  background-color: var(--color-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
}

/* ❌ INCORRECTO - Valores hardcodeados */
.button {
  background-color: #3b82f6;
  padding: 16px;
  border-radius: 6px;
}
```

### 2. CSS Modules para Componentes
```css
/* ✅ CORRECTO - Estilos de componente en .module.css */
/* CouponCard.module.css */
.card {
  background: var(--bg-primary);
  padding: var(--spacing-lg);
}

/* ❌ EVITAR - Estilos de componente en /styles */
/* No poner estilos específicos de componentes aquí */
```

### 3. Nomenclatura Consistente
```css
/* ✅ CORRECTO - BEM o kebab-case */
.coupon-card { }
.coupon-card__title { }
.coupon-card--featured { }

/* ❌ EVITAR - camelCase en CSS */
.couponCard { }
```

### 4. Organización de Media Queries
```css
/* ✅ CORRECTO - Mobile first */
.container {
  padding: var(--spacing-sm);
}

@media (min-width: 768px) {
  .container {
    padding: var(--spacing-lg);
  }
}

/* ❌ EVITAR - Desktop first */
.container {
  padding: var(--spacing-lg);
}

@media (max-width: 767px) {
  .container {
    padding: var(--spacing-sm);
  }
}
```

## 🚫 Qué NO hacer

1. ❌ **No duplicar variables** - Definir una sola vez en `variables.css`
2. ❌ **No poner estilos de componentes aquí** - Usar CSS Modules
3. ❌ **No usar `!important`** sin necesidad - Indicador de mal diseño
4. ❌ **No hardcodear valores** - Usar variables CSS
5. ❌ **No mezclar unidades** - Ser consistente (rem, px, etc.)

## 📋 Migración desde index.css

Si ya tienes estilos en `src/index.css`, puedes:

1. Crear la carpeta `/src/styles`
2. Mover estilos a archivos apropiados:
   - Variables → `variables.css`
   - Reset/Global → `global.css`
   - Clases helper → `utilities.css`
3. Importar `styles/index.css` en lugar de `index.css`

## 🎓 Recursos

- [CSS Custom Properties](https://developer.mozilla.org/es/docs/Web/CSS/Using_CSS_custom_properties)
- [CSS Modules](https://github.com/css-modules/css-modules)
- [BEM Methodology](http://getbem.com/)

---
**Última actualización**: Febrero 2026  
**Responsable**: Equipo cupon-x
