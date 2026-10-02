# Arquitectura de Backend & CRM para Veelvet

Este documento detalla la estructura de datos, contratos de API y endpoints para conectar un Backend / CRM / Headless CMS (Strapi, Supabase, Shopify Headless, MedusaJS, NestJS o FastAPI) con el frontend de **Veelvet**.

El frontend ya cuenta con el cliente unificado en [`src/services/catalogService.ts`](../src/services/catalogService.ts), que se activa simplemente configurando la variable de entorno `VITE_API_URL`.

---

## 1. Endpoints REST Recomendados

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/v1/products` | Lista de productos con filtros (`cat`, `sub`, `sort`, `size`, `color`) |
| `GET` | `/api/v1/products/:slug` | Detalle completo de una prenda por slug |
| `GET` | `/api/v1/categories/mega-menu` | Estructura dinámica de las 4 columnas del Mega Menú ("Colección") |
| `GET` | `/api/v1/categories` | Lista de categorías principales con imágenes y badges |
| `POST` | `/api/v1/newsletter` | Registro de suscriptores al Club Veelvet |
| `POST` | `/api/v1/showroom/bookings` | Reserva de turnos en el showroom de Quilmes |
| `POST` | `/api/v1/wholesale/inquiries` | Formulario de pedidos y consultas mayoristas |

---

## 2. Modelos de Datos (Schemas)

### A. Producto (`Product`)
```typescript
interface Product {
  id: string;                    // ID único (ej: "prod-01")
  slug: string;                  // URL amigable (ej: "buzo-cierre-heavy-oversize")
  name: string;                  // Título principal (ej: "Buzo con Cierre Boxy Heavy")
  subtitle: string;              // Subtítulo descriptivo (ej: "Frisa de algodón prémium 380g • Unisex")
  category: 'buzos' | 'pantalones' | 'conjuntos' | string;
  subcategory?: string;          // Ej: "hoodies", "cargos", "zip-up", "campera", "remeras"
  price: number;                 // Precio en ARS (ej: 68000)
  compareAtPrice?: number;       // Precio anterior tachado para ofertas/sale (ej: 79000)
  description: string;           // Descripción comercial y técnica
  composition: string;           // Composición textil (ej: "100% Algodón peinado 380g...")
  fit: string;                   // Guía de calce (ej: "Boxy / Oversized unisex...")
  images: {
    primary: string;             // Foto principal del producto (CDN URL)
    secondary: string;           // Foto secundaria / detalle
    lookbook?: string;           // Foto editorial / puesta
  };
  colors: {
    name: string;                // Ej: "Negro Washed"
    hex: string;                 // Ej: "#161616"
    class: string;               // Ej: "bg-[#161616]"
  }[];
  sizes: ('S' | 'M' | 'L' | 'XL')[];
  inStock: boolean;              // Disponibilidad
  stockByVariant?: {             // Control de inventario fino
    size: 'S' | 'M' | 'L' | 'XL';
    color: string;
    stock: number;
  }[];
  tag?: 'NUEVO' | 'BEST SELLER' | 'EDICIÓN LIMITADA' | 'ESENCIAL';
  rating: number;                // 1.0 a 5.0
  reviewsCount: number;
  featured: boolean;             // Si aparece en el carrusel de destacados de la Home
  measureType: 'buzo' | 'pantalon' | 'conjunto';
}
```

---

### B. Mega Menú de Colección (`MegaMenuConfig`)
El dueño del e-commerce puede gestionar desde el CRM las 4 columnas del Mega Menú:

```typescript
interface MegaMenuConfig {
  columns: {
    id: string;                  // "destacados", "top", "bottom", "accesorios"
    title?: string;              // "Top", "Bottom", "Accesorios" (opcional para columna 1)
    hasUnderline?: boolean;      // true para mostrar línea divisoria elegante
    items: {
      name: string;              // "Campera", "Cargos", "Remeras", etc.
      href: string;              // "/tienda?cat=top&sub=campera"
      badge?: string;            // "HOT", "DROP", "-60%", "BEST SELLER"
      badgeColor?: string;       // Clases CSS de color de la pastilla
      highlight?: boolean;       // Si se resalta en negrita
    }[];
  }[];
}
```

---

## 3. Conexión Rápida desde el Frontend

1. En el archivo `.env` del frontend:
   ```env
   VITE_API_URL=https://api.veelvet.shop/api/v1
   ```
2. El servicio `catalogService.ts` detectará automáticamente la URL y consumirá los datos reales del servidor en vivo, manteniendo el fallback local automático en caso de pérdida de conexión.
