import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, ArrowRight, MapPin, ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../store/cartStore';
import { InstagramIcon } from './Icons';
import { CATEGORIES } from '../../data/products';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collectionDropdownOpen, setCollectionDropdownOpen] = useState(false);
  const [mobileCollectionOpen, setMobileCollectionOpen] = useState(false);

  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { openCart, getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setCollectionDropdownOpen(false);
  }, [location.pathname, location.search]);

  // Click outside listener for collection dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCollectionDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Primary nav links
  const mainNavLinks = [
    { label: 'Inicio', href: '/' },
    { label: 'Showroom', href: '/showroom' },
    { label: 'Mayoristas', href: '/mayoristas' },
    { label: 'Guía de Talles', href: '/guia-de-talles' },
  ];

  const isCollectionActive = location.pathname.startsWith('/tienda') || location.pathname.startsWith('/producto');

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-beige-300/80 py-2 sm:py-2.5'
            : 'bg-transparent py-4 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 -ml-2 text-navy hover:text-navy-500 transition-colors focus:outline-none"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="w-6 h-6 stroke-[1.75]" />
          </button>

          {/* Brand Logo - Visibly Larger */}
          <Link to="/" className="flex items-center group py-0.5" aria-label="Veelvet Inicio">
            <img
              src="/assets/logo-transparent.png"
              alt="Veelvet. Simplemente Veelvet."
              className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-xs font-montserrat tracking-wider uppercase font-semibold text-navy/85">
            {/* Inicio */}
            <Link
              to="/"
              className={`relative py-2 transition-colors hover:text-navy-500 ${
                location.pathname === '/' ? 'text-navy font-bold' : ''
              }`}
            >
              Inicio
              {location.pathname === '/' && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-navy"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </Link>

            {/* Dynamic Colección Dropdown */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setCollectionDropdownOpen(true)}
              onMouseLeave={() => setCollectionDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setCollectionDropdownOpen((prev) => !prev)}
                className={`flex items-center space-x-1.5 py-2 uppercase tracking-wider transition-colors hover:text-navy-500 focus:outline-none cursor-pointer ${
                  isCollectionActive ? 'text-navy font-bold' : ''
                }`}
                aria-expanded={collectionDropdownOpen}
                aria-haspopup="true"
              >
                <span>Colección</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    collectionDropdownOpen ? 'rotate-180 text-navy' : 'text-navy/60'
                  }`}
                />
                {isCollectionActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-navy"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </button>

              {/* Unfolded Dropdown Menu (connected to CRM/categories data) */}
              <AnimatePresence>
                {collectionDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute top-full left-0 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-beige-300 p-3 z-50 text-left mt-1"
                  >
                    <div className="px-3 py-2 border-b border-beige-200 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-navy/50">
                        Categorías & Drops
                      </span>
                      <Link
                        to="/tienda"
                        className="text-[10px] font-bold uppercase text-navy hover:text-navy-500 underline"
                      >
                        Ver todo
                      </Link>
                    </div>

                    <div className="py-2 space-y-1">
                      {CATEGORIES.map((category) => (
                        <Link
                          key={category.id}
                          to={category.href}
                          className="group/item flex items-center justify-between p-2.5 rounded-xl hover:bg-beige-100 transition-colors"
                        >
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-montserrat font-bold text-xs uppercase text-navy group-hover/item:text-navy-500 transition-colors">
                                {category.name}
                              </span>
                              {category.badge && (
                                <span
                                  className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                    category.badgeColor || 'bg-beige-200 text-navy'
                                  }`}
                                >
                                  {category.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-navy/60 font-light mt-0.5 line-clamp-1">
                              {category.description}
                            </p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-navy/30 group-hover/item:text-navy group-hover/item:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
                        </Link>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-beige-200 px-3 py-2 bg-beige-50/60 rounded-xl flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-[11px] text-navy font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-navy-500" />
                        <span>Moldería Unisex S a XL</span>
                      </div>
                      <Link
                        to="/guia-de-talles"
                        className="text-[10px] text-navy/70 hover:text-navy underline uppercase"
                      >
                        Tabla
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Other Nav Links */}
            {mainNavLinks.slice(1).map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`relative py-2 transition-colors hover:text-navy-500 ${
                    isActive ? 'text-navy font-bold' : ''
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-navy"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Showroom shortcut button */}
            <Link
              to="/showroom"
              className="hidden sm:inline-flex items-center space-x-1.5 text-[11px] font-semibold tracking-wider uppercase bg-beige-200 text-navy hover:bg-beige-300 px-3.5 py-1.5 rounded-full transition-all duration-200 border border-beige-300/80 shadow-xs"
            >
              <MapPin className="w-3.5 h-3.5 stroke-[2]" />
              <span>Quilmes</span>
            </Link>

            {/* Instagram link */}
            <a
              href="https://instagram.com/veelvet.shop"
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy/70 hover:text-navy transition-colors hidden sm:block p-1"
              aria-label="Instagram @veelvet.shop"
            >
              <InstagramIcon className="w-5 h-5" />
            </a>

            {/* Shopping Bag Button with Badge */}
            <button
              onClick={openCart}
              className="relative p-2 text-navy hover:text-navy-500 transition-colors group cursor-pointer"
              aria-label={`Ver carrito (${totalItems} productos)`}
            >
              <ShoppingBag className="w-6 h-6 stroke-[1.75] transition-transform duration-200 group-hover:scale-105" />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute top-1 right-0.5 bg-navy text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-navy/40 backdrop-blur-xs z-50 lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white z-50 lg:hidden shadow-2xl flex flex-col justify-between p-6 overflow-y-auto"
            >
              <div>
                {/* Header inside drawer - Large Logo */}
                <div className="flex items-center justify-between pb-6 border-b border-beige-300">
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
                    <img
                      src="/assets/logo-transparent.png"
                      alt="Veelvet."
                      className="h-10 sm:h-12 w-auto object-contain"
                    />
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-navy hover:text-navy-500 transition-colors"
                    aria-label="Cerrar menú"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Mobile Navigation List */}
                <nav className="mt-6 flex flex-col space-y-2">
                  <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-montserrat font-bold tracking-tight uppercase text-navy hover:text-navy-500 py-2.5 border-b border-beige-100 flex items-center justify-between"
                  >
                    <span>Inicio</span>
                    <ArrowRight className="w-4 h-4 text-navy/30" />
                  </Link>

                  {/* Expandable Mobile Colección Accordion */}
                  <div className="border-b border-beige-100 py-1">
                    <button
                      type="button"
                      onClick={() => setMobileCollectionOpen((prev) => !prev)}
                      className="w-full text-base font-montserrat font-bold tracking-tight uppercase text-navy hover:text-navy-500 py-2.5 flex items-center justify-between focus:outline-none"
                    >
                      <span className="flex items-center space-x-2">
                        <span>Colección</span>
                        <span className="text-[10px] bg-beige-200 px-2 py-0.5 rounded-full font-semibold">
                          {CATEGORIES.length}
                        </span>
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          mobileCollectionOpen ? 'rotate-180 text-navy' : 'text-navy/40'
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {mobileCollectionOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden pl-3 pr-1 py-1 space-y-2 bg-beige-50/70 rounded-xl my-1"
                        >
                          {CATEGORIES.map((cat) => (
                            <Link
                              key={cat.id}
                              to={cat.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center justify-between py-2 text-xs font-montserrat font-bold uppercase text-navy hover:text-navy-500"
                            >
                              <span>{cat.name}</span>
                              {cat.badge && (
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${cat.badgeColor || 'bg-beige-200 text-navy'}`}>
                                  {cat.badge}
                                </span>
                              )}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Link
                    to="/showroom"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-montserrat font-bold tracking-tight uppercase text-navy hover:text-navy-500 py-2.5 border-b border-beige-100 flex items-center justify-between"
                  >
                    <span>Showroom Quilmes</span>
                    <ArrowRight className="w-4 h-4 text-navy/30" />
                  </Link>

                  <Link
                    to="/mayoristas"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-montserrat font-bold tracking-tight uppercase text-navy hover:text-navy-500 py-2.5 border-b border-beige-100 flex items-center justify-between"
                  >
                    <span>Venta Mayorista</span>
                    <ArrowRight className="w-4 h-4 text-navy/30" />
                  </Link>
                </nav>

                {/* Secondary Links */}
                <div className="mt-6 pt-4 border-t border-beige-200 flex flex-col space-y-2.5 text-xs tracking-wider uppercase font-semibold text-navy/70">
                  <Link to="/guia-de-talles" onClick={() => setMobileMenuOpen(false)} className="hover:text-navy py-1">Tabla de talles</Link>
                  <Link to="/cuidados" onClick={() => setMobileMenuOpen(false)} className="hover:text-navy py-1">Cuidados de la prenda</Link>
                  <Link to="/envios" onClick={() => setMobileMenuOpen(false)} className="hover:text-navy py-1">Envíos a todo el país</Link>
                  <Link to="/preguntas-frecuentes" onClick={() => setMobileMenuOpen(false)} className="hover:text-navy py-1">Preguntas Frecuentes</Link>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="pt-6 border-t border-beige-300">
                <div className="bg-beige-100 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase text-navy">Showroom Quilmes</p>
                    <p className="text-[11px] text-navy/70 mt-0.5">Atención personalizada con turno</p>
                  </div>
                  <Link
                    to="/showroom"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs font-bold bg-navy text-white px-3 py-1.5 rounded-lg hover:bg-navy-500 transition-colors uppercase"
                  >
                    Reservar
                  </Link>
                </div>
                <p className="text-[11px] text-center text-navy/50 tracking-wider uppercase mt-4">
                  Simplemente Veelvet.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
