# Veelvet. — Tienda Online Oficial (Frontend E-Commerce)

> **"Simplemente Veelvet."**  
> Marca argentina de indumentaria urbana unisex. Buzos con cierre pesados, pantalones anchos y conjuntos esenciales.  
> Instagram oficial: [@veelvet.shop](https://instagram.com/veelvet.shop) • Showroom en **Quilmes, Buenos Aires**.

---

## ⚡ Stack Tecnológico

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: [Tailwind CSS v3](https://tailwindcss.com/) con paleta personalizada (blanco `#FFFFFF`, beige protagonista `#F0EDE3`, variantes `#E8E2D0` / `#D9CFB4`, y azul navy `#1B2A4A` / `#2F4A8A`)
- **3D**: [Three.js](https://threejs.org/) + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/) + [@react-three/drei](https://github.com/pmndrs/drei)
- **Animaciones**: [Framer Motion](https://www.framer.com/motion/) + GSAP
- **Estado Global**: [Zustand](https://github.com/pmndrs/zustand) puro en memoria (cero localStorage, 100% Supabase)
- **Base de Datos & Backend**: [Supabase](https://supabase.com) puro (Catálogo, Categorías, Tipos de Oferta y Productos)

---

## 🌟 Características Destacadas

1. **Pantalla de Carga / Intro 3D Cinemática**:
   - Modelo 3D de la estrella de Veelvet girando continuamente sobre su eje Y.
   - Centrado y escalado automático (`Center` y `Bounds`) para adaptarse a cualquier proporción.
   - Iluminación de estudio (`Environment studio`) y sombra de contacto suave (`ContactShadows`).
   - Barra de carga en azul navy con porcentaje real (`useProgress`) y duración mínima garantizada de 2.5 segundos.
   - Giro rápido final, escalado hacia arriba y **apertura de pantalla en cortina dividida en dos mitades beige**.
   - Fallback automático en SVG/CSS si WebGL no está disponible.
   - Elemento 3D interactivo en el Hero del Home y en la página 404.

2. **Hero 3D Centrado de Máximo Impacto**:
   - Logo 3D girando de fondo con posición elevada para enmarcar el titular *"SIMPLEMENTE VEELVET."*.
   - Toda la información y CTAs perfectamente centrados en pantalla.
   - Mínima interferencia visual, eliminando cajas fotográficas en el hero para darle protagonismo al 3D.

3. **Colección Dinámica con Menú Desplegable (Listo para CRM / Backend)**:
   - Al hacer click o hover sobre **"Colección"** en el Header (y en el acordeón del menú mobile), se despliegan automáticamente todas las categorías gestionables.
   - Diseñado modularmente para que un futuro backend / CRM pueda inyectar nuevas categorías (ej: *Musculosas, Remeras, Nuevo Drop, Descuentos Final de Temporada, Accesorios*) sin tocar el maquetado.
   - Cada categoría admite insignias personalizadas (*"BEST SELLER"*, *"DROP ACTIVO"*, *"SALE 20% OFF"*, *"PRÓXIMAMENTE"*).

4. **100% Optimizado para Teléfonos Móviles**:
   - Cero desbordes horizontales (`overflow-x-hidden`, anchos fluidos y tipografía adaptable).
   - Menú lateral deslizante con acordeón de categorías integrado.
   - Tablas de medidas desplazables con indicador táctil.
   - Checkout con distribución optimizada para pantalla vertical.

5. **Páginas y Vistas Completas**:
   - `/`: **Home** (Hero 3D centrado, Marquee, Categorías, Destacados, Por qué Veelvet, Showroom Quilmes, Instagram, Newsletter).
   - `/tienda`: **Colección** con filtros dinámicos (categoría, talle S-XL, color, ordenamiento).
   - `/producto/:id`: **Ficha de Producto** con galería con zoom, selectores de talle y color, disparador de tabla de talles y acordeones informativos.
   - `/guia-de-talles`: **Tabla de Medidas** (página y modal) con ilustraciones vectoriales esquemáticas (A, B, C, D) y tablas exactas de Buzo con Cierre y Pantalón.
   - `/cuidados`: **Cuidados de la Prenda** (*"Mantené tu prenda como el primer día"*) con las 5 reglas de oro.
   - `/envios`: **Logística** (Andreani, Correo Argentino, Envío por Veelvet y retiro en Showroom con simulador de CP).
   - `/preguntas-frecuentes`: **FAQ** en acordeón animado.
   - `/mayoristas`: **B2B** con beneficios comerciales y formulario validado visualmente.
   - `/showroom`: **Reserva de Turno** en Quilmes con selector de fecha y horario.
   - `/checkout`: **Checkout UI** con selector de transporte, formas de pago (transferencia 10% OFF, cuotas), resumen y confirmación con confeti.
   - `*`: **Error 404** con estrella 3D giratoria.

---

## 🚀 Cómo Ejecutar Localmente

```bash
# Entrar a la carpeta del proyecto
cd veelvet-ecommerce

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo en localhost:5173
npm run dev

# Compilar para producción (typecheck + build)
npm run build
```

---

## ☁️ Deploy en Vercel (Configurado y Listo)

El repositorio ya cuenta con el archivo de configuración `vercel.json` con las reglas de rewrite necesarias para SPAs con React Router:

### Opción 1: Subiendo a GitHub y conectando Vercel (Recomendada)
1. Creá un nuevo repositorio en GitHub (ej: `veelvet-shop`).
2. Vinculá y subí esta carpeta:
   ```bash
   git remote add origin https://github.com/TU-USUARIO/veelvet-shop.git
   git push -u origin main
   ```
3. En [Vercel](https://vercel.com/), hacé clic en **"Add New Project"**, importá el repositorio de GitHub y hacé clic en **Deploy**. ¡Vercel detectará Vite automáticamente!

### Opción 2: Usando Vercel CLI
```bash
# Si tenés Vercel CLI instalado
npx vercel

# Para desplegar a producción directamente
npx vercel --prod
```

---

## ⚙️ Gestión de Categorías para Backend / CRM

Las categorías que se despliegan en el menú del Header y en la tienda se encuentran tipadas en:
`src/data/products.ts`

```typescript
export interface CategoryItem {
  id: string;          // Identificador único (ej: 'musculosas')
  name: string;        // Nombre visual completo (ej: 'Musculosas & Tops')
  shortName: string;   // Nombre corto
  description: string; // Bajada explicativa
  href: string;        // Ruta o filtro (ej: '/tienda?cat=musculosas')
  badge?: string;      // Insignia opcional (ej: 'NUEVO DROP')
  badgeColor?: string; // Color Tailwind
}
```

Al conectar una API REST o GraphQL en el futuro, simplemente reemplazá la constante `CATEGORIES` con el fetch a tu endpoint del CRM o CMS.

---

## 🇦🇷 Diseñado para Veelvet
*Simplemente Veelvet.*
Quilmes, Buenos Aires, Argentina.
