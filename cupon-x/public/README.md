# 🌐 Directorio `/public`

## 📋 Descripción
Esta carpeta contiene archivos estáticos que se sirven directamente sin procesamiento por parte de Vite. Los archivos aquí son accesibles desde la raíz del dominio en producción.

## 🎯 ¿Qué va en `/public`?

### ✅ Archivos que DEBEN ir aquí:
- **Favicon** - `favicon.ico`, `favicon.svg`
- **Manifest** - `manifest.json` (PWA)
- **Robots.txt** - `robots.txt`
- **Sitemap** - `sitemap.xml`
- **Archivos meta** - `browserconfig.xml`
- **Imágenes de meta tags** - `og-image.png` (Open Graph)
- **Archivos de verificación** - `google-verification.html`

### ❌ Archivos que NO deben ir aquí:
- ❌ Imágenes usadas en componentes → Van en `/src/assets/images`
- ❌ Iconos SVG de UI → Van en `/src/assets/icons`
- ❌ Fuentes personalizadas → Van en `/src/assets/fonts`
- ❌ Código JavaScript → Va en `/src`

## 📂 Estructura Recomendada

```
public/
├── favicon.ico           # Favicon principal (32x32)
├── favicon.svg           # Favicon vectorial
├── vite.svg              # Logo de Vite (template por defecto)
├── manifest.json         # Manifest para PWA
├── robots.txt            # Instrucciones para bots
├── sitemap.xml           # Mapa del sitio
└── meta/                 # Imágenes para meta tags
    ├── og-image.png      # Open Graph image
    └── twitter-card.png  # Twitter card image
```

## 🔍 Diferencia entre `/public` y `/src/assets`

### `/public` - Sin procesamiento
```html
<!-- ✅ Acceso directo desde HTML -->
<link rel="icon" href="/favicon.ico" />
<meta property="og:image" content="/meta/og-image.png" />

<!-- La URL es DIRECTA, sin import -->
```

**Características**:
- ⚡ No pasa por el bundler (Vite)
- 🔗 URL absoluta desde la raíz `/`
- 📦 No se optimiza ni se renombra
- 🌐 Perfecto para SEO y meta tags

### `/src/assets` - Con procesamiento
```jsx
// ✅ Import en componentes
import logo from '@/assets/images/logo.png'

<img src={logo} alt="Logo" />
```

**Características**:
- ⚡ SÍ pasa por Vite (bundler)
- 🔗 Import como módulo
- 📦 Se optimiza y renombra con hash
- ⭐ **Preferir para la mayoría de assets**

## 📝 Casos de Uso

### 1. Favicon
```html
<!-- index.html -->
<head>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="alternate icon" href="/favicon.ico" />
</head>
```

### 2. PWA Manifest
```json
// public/manifest.json
{
  "name": "Cupón X",
  "short_name": "CupónX",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "display": "standalone"
}
```

### 3. Robots.txt
```txt
# public/robots.txt
User-agent: *
Allow: /

Sitemap: https://cuponx.com/sitemap.xml
```

### 4. Meta Tags (Open Graph)
```html
<!-- index.html -->
<head>
  <meta property="og:image" content="/meta/og-image.png" />
  <meta property="og:title" content="Cupón X - Descuentos increíbles" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="/meta/twitter-card.png" />
</head>
```

## ✅ Buenas Prácticas

### 1. Nomenclatura
```
✅ CORRECTO
favicon.ico
favicon.svg
robots.txt
manifest.json
og-image.png

❌ INCORRECTO
Favicon.ICO
my-favicon.svg
Robots.TXT
```

### 2. Tamaños de Iconos PWA
```
icon-192.png   → 192x192px
icon-512.png   → 512x512px
apple-touch-icon.png → 180x180px
```

### 3. Optimización
- Comprimir imágenes antes de colocarlas en `/public`
- Usar SVG para favicon cuando sea posible
- Meta images: ~1200x630px (Open Graph)

### 4. Acceso en Código
```jsx
// ❌ INCORRECTO - No usar import para /public
import favicon from '../public/favicon.ico'

// ✅ CORRECTO - URL absoluta
<link rel="icon" href="/favicon.ico" />

// ✅ CORRECTO - En JSX con URL pública
<img src="/vite.svg" alt="Vite" />
```

## 🚫 Errores Comunes

### 1. Colocar assets de componentes aquí
```jsx
// ❌ INCORRECTO
<img src="/product-image.jpg" alt="Producto" />

// ✅ CORRECTO - Usar /src/assets
import productImg from '@/assets/images/products/product.jpg'
<img src={productImg} alt="Producto" />
```

**Razón**: Assets en `/public` no se optimizan ni obtienen cache busting.

### 2. Usar paths relativos
```html
<!-- ❌ INCORRECTO -->
<link rel="icon" href="./favicon.ico" />

<!-- ✅ CORRECTO - Siempre ruta absoluta -->
<link rel="icon" href="/favicon.ico" />
```

### 3. Olvidar optimizar imágenes
```
❌ og-image.png → 5MB
✅ og-image.png → 200KB (optimizada)
```

## 📋 Checklist para Archivos en `/public`

Antes de agregar un archivo a `/public`:

- [ ] ¿Realmente necesita estar en `/public`? (¿Es favicon, manifest, robots, etc.?)
- [ ] ¿O debería ir en `/src/assets`? (¿Se usa en componentes?)
- [ ] ¿El archivo está optimizado/comprimido?
- [ ] ¿El nombre sigue las convenciones (lowercase, guiones)?
- [ ] ¿La ruta se referencia con `/` al inicio?

## 🎯 Cuándo usar `/public`

**Usa `/public` cuando:**
- ✅ El archivo debe tener una URL predecible y fija
- ✅ Se referencia desde `index.html` (favicon, manifest)
- ✅ Es necesario para SEO (robots.txt, sitemap.xml)
- ✅ Es usado por servicios externos (verificación de dominio)
- ✅ Debe mantenerse sin cambios de nombre

**Usa `/src/assets` cuando:**
- ⭐ Se importa en componentes React
- ⭐ Quieres optimización automática
- ⭐ Necesitas cache busting con hashes
- ⭐ Es la mayoría de tus imágenes, iconos, fuentes

## 🔄 Migración de Template

Si estás usando el template de Vite, puedes:

```bash
# Mantener estos archivos del template:
/public/vite.svg ✅ (puedes reemplazar con tu logo)

# Agregar tus propios archivos:
/public/favicon.ico
/public/manifest.json
/public/robots.txt
```

## 🎓 Recursos

- [Vite - Public Directory](https://vitejs.dev/guide/assets.html#the-public-directory)
- [PWA Manifest Generator](https://www.simicart.com/manifest-generator.html/)
- [Favicon Generator](https://realfavicongenerator.net/)
- [Open Graph Debugger](https://www.opengraph.xyz/)

---
**Última actualización**: Febrero 2026  
**Responsable**: Equipo cupon-x
