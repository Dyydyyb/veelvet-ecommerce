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
- **Navegación**: [React Router DOM v7](https://reactrouter.com/)
- **Estado Global**: [Zustand](https://github.com/pmndrs/zustand) con persistencia en `localStorage`
- **Íconos**: [Lucide React](https://lucide.dev/) + SVG de alta fidelidad

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

2. **Micro-interacciones y Animaciones**:
   - Hero con reveal de texto palabra por palabra con máscara inferior.
   - Marquee infinito: *"ENVÍO A TODO EL PAÍS • MAYORISTA Y MINORISTA • SHOWROOM EN QUILMES • UNISEX"*.
   - Cursor personalizado en desktop con aura interactiva.
   - Tarjetas de producto con cambio de imagen al hacer hover, selector rápido de talle deslizante e incorporación al carrito con animación.
   - Carrito lateral (drawer) con medidor de envío gratis ($100.000 ARS) y soporte de cupones (`SIMPLEMENTE`, `VEELVET10`, `SHOWROOM`).

3. **Páginas y Vistas Completas**:
   - `/`: **Home** (Hero, Marquee, Categorías, Destacados, Por qué Veelvet, Showroom Quilmes, Instagram, Newsletter).
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

## 🚀 Cómo Ejecutar el Proyecto

### 1. Requisitos
- Node.js (v18 o superior)
- npm o pnpm

### 2. Instalación y Ejecución
```bash
# Entrar a la carpeta del proyecto
cd veelvet-ecommerce

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo en localhost:5173
npm run dev

# Compilar para producción (typecheck + build)
npm run build

# Previsualizar el build de producción
npm run preview
```

---

## 🎨 Cómo Personalizar y Reemplazar Contenido

### 1. Reemplazar el Modelo 3D (`logo.glb`)
- Colocá tu nuevo archivo GLB en:  
  `public/assets/logo.glb`
- El componente `src/components/3d/VeelvetModel.tsx` y `Intro3DLoader.tsx` lo cargarán automáticamente. Al utilizar `Center`, el modelo se recentrará sin importar el pivote o el tamaño original en Blender.

### 2. Modificar o Agregar Productos
- Los datos se encuentran centralizados en:  
  `src/data/products.ts`
- Podés modificar precios, fotos, descripciones, composición, colores o añadir nuevos productos respetando la interfaz `Product`.

### 3. Reemplazar Imágenes y Fotografías
- Las fotos de campaña y productos se encuentran en:  
  `public/assets/images/`
  - `hero-look.jpg` (Editorial portada)
  - `buzo-negro.jpg` (Buzo con cierre)
  - `pantalon-beige.jpg` (Pantalón ancho)
- El logo bidimensional está en:  
  `public/assets/logo.png`

### 4. Ajustar Tablas de Medidas
- Los valores de las medidas para buzos y pantalones están en:  
  `src/data/sizeGuide.ts`

---

## 🇦🇷 Diseñado para Veelvet
*Simplemente Veelvet.*
Quilmes, Buenos Aires, Argentina.
