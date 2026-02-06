# 🎨 Directorio `/src/assets`

## 📋 Descripción
Esta carpeta contiene todos los recursos estáticos de la aplicación **cupon-x**, como imágenes, iconos, fuentes, y otros archivos multimedia que se utilizan en el proyecto.

## 📂 Estructura Recomendada

```
assets/
├── images/              # Imágenes generales
│   ├── logos/          # Logos de la aplicación
│   ├── banners/        # Banners promocionales
│   ├── products/       # Imágenes de productos
│   └── backgrounds/    # Fondos e imágenes decorativas
│
├── icons/              # Iconos SVG y PNG
│   ├── social/         # Iconos de redes sociales
│   └── ui/             # Iconos de interfaz
│
├── fonts/              # Fuentes personalizadas
│   └── custom-font.woff2
│
├── videos/             # Videos (si aplica)
│
└── documents/          # PDFs, documentos descargables
    └── terms.pdf
```

## 📝 Convenciones de Nomenclatura

### Archivos de Imagen
```
// ✅ CORRECTO - Descriptivo, kebab-case
logo-cuponx.svg
banner-home-principal.jpg
icono-carrito-compras.svg
fondo-login.png

// ❌ INCORRECTO
Logo1.svg
image.jpg
icon_cart.svg
bg.png
```

### Formato de Nombres
- **Usar kebab-case**: `producto-destacado.jpg`
- **Ser descriptivo**: El nombre debe indicar qué es
- **Incluir el contexto**: `banner-home-verano-2026.jpg`
- **Evitar números genéricos**: No usar `image1.jpg`, `img2.png`

## 🖼️ Tipos de Archivos por Categoría

### 1️⃣ `/images` - Imágenes Generales

**Qué va aquí**: 
- Fotografías de productos
- Banners promocionales
- Imágenes decorativas
- Fondos

**Formatos recomendados**:
- ✅ `.jpg` / `.jpeg` - Para fotografías
- ✅ `.png` - Para imágenes con transparencia
- ✅ `.webp` - Formato moderno, mejor compresión (preferido)
- ⚠️ `.gif` - Solo para animaciones simples


**Buenas prácticas**:
```javascript
// ✅ CORRECTO - Import nombrado y descriptivo
import heroImage from '@/assets/images/banners/hero-home.jpg'
import productImage from '@/assets/images/products/pizza-promo.webp'

// ❌ INCORRECTO
import img from '@/assets/image1.jpg'
```

### 2️⃣ `/icons` - Iconos

**Qué va aquí**: 
- Iconos SVG (preferido)
- Iconos PNG pequeños
- Sprites de iconos


```
Logos:
- Logo principal: 200x200px (SVG preferido)
- Favicon: 32x32px, 64x64px (PNG/ICO)

Banners:
- Desktop: 1920x600px máximo
- Mobile: 750x500px máximo

Imágenes de productos:
- Thumbnail: 300x300px
- Mediana: 600x600px
- Grande: 1200x1200px

Iconos:
- UI Icons: 24x24px, 32x32px (SVG)
- Social Icons: 48x48px (SVG)
```

### Compresión de Imágenes

**Herramientas recomendadas**:
- [TinyPNG](https://tinypng.com/) - Compresión PNG/JPG
- [Squoosh](https://squoosh.app/) - Conversión a WebP
- [ImageOptim](https://imageoptim.com/) - Optimización batch

**Reglas**:
- ✅ Imágenes < 200KB siempre que sea posible
- ✅ Usar WebP cuando sea posible (fallback a JPG/PNG)
- ✅ Imágenes responsive con `srcset`

## ✅ Buenas Prácticas

### 1. Organización
```
✅ CORRECTO
assets/
  images/
    logos/
      logo-cuponx.svg
      logo-cuponx-white.svg
    products/
      pizza-margarita.webp
      hamburguesa-clasica.webp

❌ INCORRECTO
assets/
  logo.svg
  logo2.svg
  img1.jpg
  image.png
```

## 🎓 Recursos

- [Squoosh - Image Optimizer](https://squoosh.app/)
- [TinyPNG - PNG/JPG Compressor](https://tinypng.com/)
- [SVGOMG - SVG Optimizer](https://jakearchibald.github.io/svgomg/)
- [Can I Use - WebP Support](https://caniuse.com/webp)

---
