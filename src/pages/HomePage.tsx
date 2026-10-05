import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Sparkles, ShieldCheck, Ruler, Truck, Calendar } from 'lucide-react';
import { InstagramIcon } from '../components/common/Icons';
import { Button } from '../components/common/Button';
import { Marquee } from '../components/common/Marquee';
import { SectionTitle } from '../components/common/SectionTitle';
import { ProductCard } from '../components/product/ProductCard';
import { Hero3DBackground } from '../components/3d/Hero3DBackground';
import { Product, CategoryItem } from '../data/products';
import { CatalogService } from '../services/catalogService';
import { useUIStore } from '../store/uiStore';

export function HomePage() {
  const { openSizeGuide } = useUIStore();
  const [featuredProducts, setFeaturedProducts] = React.useState<Product[]>([]);
  const [featuredCategories, setFeaturedCategories] = React.useState<CategoryItem[]>([]);
  const [loadingProducts, setLoadingProducts] = React.useState(true);
  const [loadingCategories, setLoadingCategories] = React.useState(true);

  React.useEffect(() => {
    CatalogService.getFeaturedProducts()
      .then(setFeaturedProducts)
      .finally(() => setLoadingProducts(false));

    CatalogService.getFeaturedCategories()
      .then(setFeaturedCategories)
      .finally(() => setLoadingCategories(false));
  }, []);

  // Word-by-word reveal animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  };

  const wordVariants = {
    hidden: { y: '100%', opacity: 0 },
    visible: {
      y: '0%',
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <div className="relative overflow-hidden pt-20">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 bg-white overflow-hidden text-center">
        {/* 3D Background Logo rotating continuously */}
        <Hero3DBackground speed={0.9} />

        {/* Centered Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center justify-center">
          
          {/* Tagline Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-white/85 backdrop-blur-md border border-beige-300 px-4 py-1.5 rounded-full mb-8 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-navy" />
            <span className="text-[11px] font-bold font-montserrat tracking-widest text-navy uppercase">
              Colección Esencial Urbana
            </span>
          </motion.div>

          {/* Main Heading with Word Mask Reveal - Centered */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-6 flex flex-col items-center"
          >
            <div className="overflow-hidden">
              <motion.h1
                variants={wordVariants}
                className="font-montserrat font-black text-3xl sm:text-6xl md:text-8xl lg:text-9xl uppercase tracking-tighter text-navy leading-[0.92] drop-shadow-xs"
              >
                SIMPLEMENTE
              </motion.h1>
            </div>
            <div className="overflow-hidden">
              <motion.h1
                variants={wordVariants}
                className="font-montserrat font-black text-3xl sm:text-6xl md:text-8xl lg:text-9xl uppercase tracking-tighter text-navy-500 leading-[0.92] drop-shadow-xs"
              >
                VEELVET<span className="text-navy">.</span>
              </motion.h1>
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7 }}
            className="text-base sm:text-lg md:text-xl text-navy/80 font-light max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Indumentaria urbana premium unisex fabricada en Argentina. Siluetas relajadas, frisa pesada de 380g y un calce holgado impecable de la S a la XL.
          </motion.p>

          {/* Centered Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-5 w-full sm:w-auto"
          >
            <Link to="/tienda" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="primary"
                isMagnetic
                icon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto shadow-lg"
              >
                Ver colección
              </Button>
            </Link>

            <Link to="/showroom" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="secondary"
                icon={<MapPin className="w-4 h-4" />}
                iconPosition="left"
                className="w-full sm:w-auto bg-white/90 backdrop-blur-md"
              >
                Reservar showroom
              </Button>
            </Link>
          </motion.div>

          {/* Quick Benefits Ticker Centered */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-14 pt-8 border-t border-beige-300/80 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-navy/70 uppercase font-semibold tracking-wider"
          >
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-navy" />
              <span>Envíos a todo el país</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-navy" />
              <span>Moldería Unisex S a XL</span>
            </div>
            <button
              onClick={() => openSizeGuide('buzo')}
              className="flex items-center space-x-2 hover:text-navy underline cursor-pointer"
            >
              <Ruler className="w-4 h-4 text-navy" />
              <span>Ver tabla de medidas</span>
            </button>
          </motion.div>

        </div>
      </section>

      {/* 2. INFINITE MARQUEE */}
      <Marquee text="ENVÍO A TODO EL PAÍS • MAYORISTA Y MINORISTA • SHOWROOM EN QUILMES OESTE • UNISEX" />

      {/* 3. FEATURED CATEGORIES */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-beige-50">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            overline="Siluetas de Autor"
            title="Categorías Destacadas"
            subtitle="Piezas estructuradas con frisa de alto gramaje para armar tu uniforme urbano diario."
          />

          {/* Loading Skeletons or Categories List */}
          {loadingCategories ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl bg-beige-200 animate-pulse min-h-[380px] p-8 flex flex-col justify-end">
                  <div className="h-4 w-24 bg-beige-300 rounded mb-2" />
                  <div className="h-8 w-44 bg-beige-300 rounded mb-2" />
                  <div className="h-4 w-56 bg-beige-300 rounded" />
                </div>
              ))}
            </div>
          ) : featuredCategories.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-beige-300 p-8 max-w-md mx-auto">
              <p className="text-sm text-navy/70 font-light mb-4">
                Explorá todas las prendas en nuestra colección completa.
              </p>
              <Link
                to="/tienda"
                className="inline-flex items-center space-x-2 bg-navy hover:bg-navy-500 text-white text-xs font-montserrat font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-sm transition-colors"
              >
                <span>Ver Colección Completa</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {featuredCategories.map((cat) => (
                <Link
                  key={cat.id}
                  to={cat.href}
                  className="group relative rounded-2xl overflow-hidden bg-beige-200 border border-beige-300/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-end min-h-[380px] sm:min-h-[440px] p-8"
                >
                  {/* Background Image */}
                  {cat.image && (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/images/hero-look.jpg';
                      }}
                    />
                  )}
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent" />

                  {/* Content */}
                  <div className="relative z-10 text-white">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-beige-300 mb-2 block">
                      Cápsula Veelvet
                    </span>
                    <h3 className="font-montserrat font-black text-2xl sm:text-3xl uppercase tracking-tight text-white mb-2 group-hover:translate-x-1 transition-transform">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-beige-200 font-light max-w-xs mb-4 line-clamp-2">
                      {cat.description}
                    </p>
                    <span className="inline-flex items-center space-x-2 text-xs font-bold tracking-wider uppercase text-white bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/30 group-hover:bg-white group-hover:text-navy transition-all">
                      <span>Ver modelos</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS GRID */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-[11px] font-bold font-montserrat tracking-widest text-navy/70 uppercase mb-2 px-3 py-1 bg-beige-200 rounded-full inline-block">
                Los Más Elegidos
              </span>
              <h2 className="text-2xl sm:text-4xl font-black font-montserrat uppercase tracking-tight text-navy">
                Productos Destacados
              </h2>
            </div>
            <Link
              to="/tienda"
              className="mt-4 sm:mt-0 inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-navy hover:text-navy-500 transition-colors"
            >
              <span>Ver colección completa</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Loading or Products */}
          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl border border-beige-300 p-4 space-y-4 animate-pulse">
                  <div className="h-64 bg-beige-200 rounded-xl" />
                  <div className="h-4 bg-beige-200 rounded w-3/4" />
                  <div className="h-3 bg-beige-200 rounded w-1/2" />
                  <div className="h-4 bg-beige-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-16 bg-beige-50 rounded-3xl border border-beige-300 p-8 max-w-xl mx-auto">
              <Sparkles className="w-8 h-8 text-navy/40 mx-auto mb-3" />
              <h3 className="font-montserrat font-bold text-lg text-navy uppercase mb-1">
                Próximos Lanzamientos
              </h3>
              <p className="text-xs text-navy/70 font-light mb-6">
                Estamos preparando nuevos drops y reposiciones exclusivas. Conocé todas las prendas disponibles en nuestra tienda.
              </p>
              <Link
                to="/tienda"
                className="inline-flex items-center space-x-2 bg-navy hover:bg-navy-500 text-white text-xs font-montserrat font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md"
              >
                <span>Explorar Tienda Online</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. POR QUÉ VEELVET */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-beige-100 border-y border-beige-300">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            overline="ADN de Marca"
            title="Por Qué Elegir Veelvet"
            subtitle="Diseñamos prendas urbanas con estándares de confección pesada, durabilidad y moldería inclusiva."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-beige-300 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-beige-200 flex items-center justify-center text-navy mb-5">
                  <ShieldCheck className="w-6 h-6 stroke-[1.75]" />
                </div>
                <h3 className="font-montserrat font-black text-lg text-navy uppercase tracking-tight mb-2">
                  Calce Unisex Perfecto
                </h3>
                <p className="text-xs sm:text-sm text-navy/75 font-light leading-relaxed">
                  Moldería estudiada para lucir holgada, estructurada y proporcionada tanto en hombres como en mujeres.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-beige-200 text-[11px] font-bold uppercase tracking-wider text-navy/60">
                100% Versátil
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-beige-300 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-beige-200 flex items-center justify-center text-navy mb-5">
                  <Ruler className="w-6 h-6 stroke-[1.75]" />
                </div>
                <h3 className="font-montserrat font-black text-lg text-navy uppercase tracking-tight mb-2">
                  Talles S a XL Reales
                </h3>
                <p className="text-xs sm:text-sm text-navy/75 font-light leading-relaxed">
                  Medidas claras y generosas. Cada prenda cuenta con su tabla de centímetros exacta para que elijas con total seguridad.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-beige-200 text-[11px] font-bold uppercase tracking-wider text-navy/60">
                Guía interactiva
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-beige-300 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-beige-200 flex items-center justify-center text-navy mb-5">
                  <Truck className="w-6 h-6 stroke-[1.75]" />
                </div>
                <h3 className="font-montserrat font-black text-lg text-navy uppercase tracking-tight mb-2">
                  Envíos a Todo el País
                </h3>
                <p className="text-xs sm:text-sm text-navy/75 font-light leading-relaxed">
                  Llegamos a cada rincón argentino vía Andreani y Correo Argentino. En Quilmes y GBA sur con cadetería express.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-beige-200 text-[11px] font-bold uppercase tracking-wider text-navy/60">
                Seguimiento online
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-beige-300 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-beige-200 flex items-center justify-center text-navy mb-5">
                  <Sparkles className="w-6 h-6 stroke-[1.75]" />
                </div>
                <h3 className="font-montserrat font-black text-lg text-navy uppercase tracking-tight mb-2">
                  Mayorista & Minorista
                </h3>
                <p className="text-xs sm:text-sm text-navy/75 font-light leading-relaxed">
                  Venta minorista directa y precios mayoristas preferenciales para locales, showrooms y revendedores de todo el país.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-beige-200 text-[11px] font-bold uppercase tracking-wider text-navy/60">
                Catálogo comercial
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SHOWROOM QUILMES OESTE SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto bg-beige-200 rounded-3xl p-8 sm:p-12 lg:p-16 border border-beige-300 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center space-x-2 bg-white px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-navy border border-beige-300">
                <MapPin className="w-3.5 h-3.5 text-navy" />
                <span>Quilmes Oeste, Buenos Aires</span>
              </span>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-montserrat uppercase tracking-tight text-navy leading-[1.05]">
                Showroom Quilmes Oeste:<br />Viví la Experiencia Veelvet
              </h2>

              <p className="text-base sm:text-lg text-navy/80 font-light leading-relaxed max-w-xl">
                Vení a ver y probarte nuestros productos. Al reservar tu turno te enviamos la dirección exacta y te asesoramos personalmente para que encuentres tu calce y tono ideal.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Link to="/showroom">
                  <Button
                    size="lg"
                    variant="primary"
                    icon={<Calendar className="w-4 h-4" />}
                    iconPosition="left"
                  >
                    Reservar turno
                  </Button>
                </Link>

                <a
                  href="https://wa.me/5491136291392?text=Hola%20Veelvet!%20Quiero%20reservar%20un%20turno%20para%20visitar%20el%20showroom%20en%20Quilmes%20Oeste."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center text-xs font-bold uppercase tracking-wider bg-white text-navy hover:bg-beige-50 px-6 py-4 rounded-md border border-beige-300 transition-colors"
                >
                  Consultar por WhatsApp (11 3629-1392)
                </a>
              </div>
            </div>

            {/* Visual representation */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-beige-300">
                <img
                  src="/assets/images/showroom-quilmes.png"
                  alt="Showroom Veelvet Quilmes Oeste"
                  className="w-full h-full object-cover filter contrast-[1.03]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. INSTAGRAM SECTION (@veelvet.shop) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-beige-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[11px] font-bold font-montserrat tracking-widest text-navy/70 uppercase mb-2 px-3 py-1 bg-beige-200 rounded-full inline-block">
              Comunidad
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-montserrat uppercase tracking-tight text-navy">
              Seguinos en Instagram
            </h2>
            <a
              href="https://instagram.com/veelvet.shop"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center space-x-1.5 text-base font-bold text-navy-500 hover:text-navy transition-colors font-montserrat"
            >
              <InstagramIcon className="w-4 h-4" />
              <span>@veelvet.shop</span>
            </a>
          </div>

          {/* Lookbook Feed Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { img: '/assets/images/instagram-1.png', tag: '#SimplementeVeelvet' },
              { img: '/assets/images/instagram-2.png', tag: '#VeelvetEarth' },
              { img: '/assets/images/instagram-3.png', tag: '#VeelvetHeavyBuzo' },
              { img: '/assets/images/instagram-4.png', tag: '#ShowroomQuilmesOeste' },
            ].map((post, idx) => (
              <a
                key={idx}
                href="https://instagram.com/veelvet.shop"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square rounded-xl overflow-hidden bg-beige-200 border border-beige-300 block shadow-xs"
              >
                <img
                  src={post.img}
                  alt={`Veelvet Instagram post ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-navy/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center text-white">
                  <InstagramIcon className="w-6 h-6 mb-2" />
                  <span className="text-xs font-bold tracking-wider font-montserrat uppercase">
                    {post.tag}
                  </span>
                  <span className="text-[10px] text-beige-200 mt-1">Ver en Instagram</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
