# 📦 Directorio `/src/components`

## 📋 Descripción
Esta carpeta contiene todos los componentes React reutilizables de la aplicación **cupon-x**. Los componentes están organizados por funcionalidad y siguiendo principios de diseño modular.

## 🗂️ Estructura Recomendada

```
components/
├── common/              # Componentes comunes reutilizables
│   ├── Button/
│   │   ├── Button.jsx
│   │   ├── Button.module.css
│   │   └── Button.test.jsx
│   ├── Input/
│   └── Card/
│
├── layout/              # Componentes de estructura/layout
│   ├── Header/
│   ├── Footer/
│   ├── Navbar/
│   └── Sidebar/
│
├── features/            # Componentes específicos por funcionalidad
│   ├── Coupons/
│   │   ├── CouponCard/
│   │   ├── CouponList/
│   │   └── CouponDetail/
│   ├── Auth/
│   │   ├── LoginForm/
│   │   └── RegisterForm/
│   └── User/
│       └── UserProfile/
│
└── ui/                  # Componentes de interfaz de usuario puros
    ├── Modal/
    ├── Spinner/
    └── Toast/
```

## 📝 Convenciones de Componentes

### Estructura de un Componente
Cada componente debe tener su propia carpeta con:
```
ComponentName/
├── ComponentName.jsx        # Código del componente
├── ComponentName.module.css # Estilos (CSS Modules)
├── ComponentName.test.jsx   # Tests (opcional pero recomendado)
└── index.js                 # Re-exportación para imports limpios
```

## 🎨 Categorías de Componentes

### 1️⃣ `/common` - Componentes Comunes
**Qué va aquí**: Componentes básicos reutilizables en toda la app
- Botones (Button)
- Inputs (Input, Textarea, Select)
- Cards genéricos
- Badges, Tags
- Links personalizados

**Características**:
- ✅ Altamente reutilizables
- ✅ Sin lógica de negocio
- ✅ Aceptan props para personalización
- ✅ Sin llamadas a API

### 2️⃣ `/layout` - Componentes de Estructura
**Qué va aquí**: Componentes que definen la estructura de la página
- Header / Navbar
- Footer
- Sidebar
- Container / Wrapper
- Layout principal

**Características**:
- ✅ Definen la estructura visual
- ✅ Pueden contener estado de UI (menú abierto/cerrado)
- ⚠️ Mínima lógica de negocio

### 3️⃣ `/features` - Componentes por Funcionalidad
**Qué va aquí**: Componentes específicos de características del negocio
- Cupones (CouponCard, CouponList)
- Autenticación (LoginForm, RegisterForm)
- Perfil de usuario
- Carrito de compras

**Características**:
- ✅ Lógica de negocio específica
- ✅ Pueden hacer llamadas a API
- ✅ Conectados a estado global si es necesario
- ✅ Compuestos de componentes `/common`

### 4️⃣ `/ui` - Componentes de Interfaz Puros
**Qué va aquí**: Componentes de UI sin estado
- Modales
- Spinners / Loaders
- Toasts / Notifications
- Tooltips
- Progress bars

**Características**:
- ✅ Puramente visuales
- ✅ Controlados por props
- ✅ Sin estado interno complejo

## ✅ Buenas Prácticas

### 1. Nomenclatura
```jsx
// ✅ CORRECTO
CouponCard.jsx
UserProfile.jsx
LoginForm.jsx

// ❌ INCORRECTO
couponcard.jsx
user-profile.jsx
login_form.jsx
```

### 2. Un Solo Componente por Archivo
```jsx
// ✅ CORRECTO - Un archivo, un componente principal
// Button.jsx
const Button = () => { ... }
export default Button

// ❌ INCORRECTO - Múltiples componentes exportados
// Components.jsx
export const Button = () => { ... }
export const Input = () => { ... }
export const Card = () => { ... }
```