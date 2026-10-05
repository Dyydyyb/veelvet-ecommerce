import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, ArrowRight, MapPin, ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../store/cartStore';
import { InstagramIcon } from './Icons';
import { MEGA_MENU_DATA, MegaMenuConfig } from '../../data/megaMenuData';
import { CatalogService } from '../../services/catalogService';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collectionDropdownOpen, setCollectionDropdownOpen] = useState(false);
  const [mobileCollectionOpen, setMobileCollectionOpen] = useState(true);
  const [menuConfig, setMenuConfig] = useState<MegaMenuConfig>(MEGA_MENU_DATA);

  // Load dynamic mega menu from Supabase
  useEffect(() => {
    CatalogService.getMegaMenuConfig().then((data) => {
      if (data && data.columns && data.columns.length > 0) {
        setMenuConfig(data);
      }
    });
  }, [collectionDropdownOpen]);

  const location = useLocation();
  const dropdownContainerRef = useRef<HTMLDivElement>(null);
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

  // Click outside listener for collection mega dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(e.target as Node)) {
        setCollectionDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCollectionDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Primary nav links
  const secondaryNavLinks = [
    { label: 'Showroom', href: '/showroom' },
    { label: 'Mayoristas', href: '/mayoristas' },
    { label: 'Guía de Talles', href: '/guia-de-talles' },
  ];

  const isCollectionActive = location.pathname.startsWith('/tienda') || location.pathname.startsWith('/producto');

  return (
    <>
      <header
        ref={dropdownContainerRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || collectionDropdownOpen
            ? 'bg-white/98 backdrop-blur-md shadow-md border-b border-beige-300/80 py-2 sm:py-3'
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

          {/* Brand Logo - Visibly Large & Crisp */}
          <Link to="/" className="flex items-center group py-0.5" aria-label="Veelvet Inicio">
            <img
              src="/assets/logo-transparent.png"
              alt="Veelvet. Simplemente Veelvet."
              className="h-12 sm:h-14 md:h-16 lg:h-20 w-auto min-w-[130px] sm:min-w-[170px] md:min-w-[200px] max-w-[240px] sm:max-w-[300px] object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-xs font-montserrat tracking-wider uppercase font-semibold text-navy/85">
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

            {/* Dynamic Colección Button (Triggers the Mega Menu) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCollectionDropdownOpen((prev) => !prev)}
                className={`flex items-center space-x-1.5 py-2 uppercase tracking-wider transition-colors hover:text-navy-500 focus:outline-none cursor-pointer ${
                  isCollectionActive || collectionDropdownOpen ? 'text-navy font-bold' : ''
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
                {(isCollectionActive || collectionDropdownOpen) && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-navy"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            </div>

            {/* Other Nav Links */}
            {secondaryNavLinks.map((link) => {
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
              <span>Quilmes Oeste</span>
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

        {/* FULL-WIDTH MEGA MENU (Matching the user's reference image) */}
        <AnimatePresence>
          {collectionDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-full bg-white border-t border-b border-beige-300/80 shadow-xl overflow-hidden mt-2 sm:mt-3"
            >
              <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-9">
                {menuConfig.columns.length === 0 ? (
                  <div className="py-8 text-center max-w-md mx-auto">
                    <p className="text-xs text-navy/60 font-light mb-4">
                      Explorá toda nuestra colección de prendas unisex y siluetas urbanas.
                    </p>
                    <Link
                      to="/tienda"
                      onClick={() => setCollectionDropdownOpen(false)}
                      className="inline-flex items-center space-x-2 bg-navy text-white text-xs font-montserrat font-bold uppercase tracking-wider px-6 py-2.5 rounded-lg shadow-sm hover:bg-navy-500 transition-colors"
                    >
                      <span>Ver toda la colección</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-14">
                    {menuConfig.columns.map((column) => (
                      <div key={column.id} className="flex flex-col">
                        {column.title ? (
                          <div className="mb-4">
                            <h3 className="text-xl md:text-2xl font-black font-montserrat tracking-tight text-navy">
                              {column.title}
                            </h3>
                            {column.hasUnderline && (
                              <div className="w-full h-[1px] bg-navy/20 mt-2" />
                            )}
                          </div>
                        ) : (
                          // Height placeholder to align items with neighboring columns that have titles
                          <div className="hidden md:block h-[37px] mb-4" />
                        )}

                        <ul className="space-y-3">
                          {column.items.map((item, idx) => (
                            <li key={idx}>
                              <Link
                                to={item.href}
                                onClick={() => setCollectionDropdownOpen(false)}
                                className={`group/item inline-flex items-center space-x-2 text-sm transition-all duration-150 ${
                                  item.highlight
                                    ? 'font-bold text-navy hover:text-navy-500'
                                    : 'font-medium text-navy/80 hover:text-navy hover:translate-x-1'
                                }`}
                              >
                                <span className="font-montserrat">{item.name}</span>
                                {item.badge && (
                                  <span
                                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                      item.badgeColor || 'bg-beige-200 text-navy'
                                    }`}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bottom Highlight Bar */}
                <div className="mt-8 pt-5 border-t border-beige-200 flex flex-col sm:flex-row items-center justify-between text-xs text-navy/70 gap-3">
                  <div className="flex items-center space-x-2 font-medium">
                    <Sparkles className="w-4 h-4 text-navy-500" />
                    <span>Moldería unisex en frisa prémium pesada 380g</span>
                  </div>
                  <div className="flex items-center space-x-6">
                    <Link
                      to="/guia-de-talles"
                      onClick={() => setCollectionDropdownOpen(false)}
                      className="hover:text-navy underline uppercase tracking-wider font-semibold text-[11px]"
                    >
                      Guía de Talles (S a XL)
                    </Link>
                    <Link
                      to="/tienda"
                      onClick={() => setCollectionDropdownOpen(false)}
                      className="font-bold text-navy hover:text-navy-500 uppercase tracking-wider text-[11px] underline flex items-center space-x-1"
                    >
                      <span>Ver toda la colección</span>
                      <ArrowRight className="w-3.5 h-3.5 inline ml-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Dimmed backdrop for Mega Menu */}
      <AnimatePresence>
        {collectionDropdownOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setCollectionDropdownOpen(false)}
            className="fixed inset-0 bg-black/35 backdrop-blur-xs z-40"
          />
        )}
      </AnimatePresence>

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
              className="fixed top-0 left-0 bottom-0 w-[88%] max-w-sm bg-white z-50 lg:hidden shadow-2xl flex flex-col justify-between p-6 overflow-y-auto"
            >
              <div>
                {/* Header inside drawer - Large Logo */}
                <div className="flex items-center justify-between pb-6 border-b border-beige-300">
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
                    <img
                      src="/assets/logo-transparent.png"
                      alt="Veelvet."
                      className="h-12 sm:h-14 w-auto min-w-[130px] object-contain"
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

                  {/* Expandable Mobile Colección with Full Subcategories */}
                  <div className="border-b border-beige-100 py-1">
                    <button
                      type="button"
                      onClick={() => setMobileCollectionOpen((prev) => !prev)}
                      className="w-full text-base font-montserrat font-bold tracking-tight uppercase text-navy hover:text-navy-500 py-2.5 flex items-center justify-between focus:outline-none"
                    >
                      <span className="flex items-center space-x-2">
                        <span>Colección</span>
                        <span className="text-[10px] bg-navy text-white px-2 py-0.5 rounded-full font-bold">
                          Catálogo
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
                          className="overflow-hidden pl-3 pr-2 py-2 space-y-4 bg-beige-50/70 rounded-xl my-2"
                        >
                          {menuConfig.columns.length === 0 ? (
                            <div className="py-2 pl-1">
                              <Link
                                to="/tienda"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-xs font-bold underline uppercase text-navy"
                              >
                                Ver catálogo completo
                              </Link>
                            </div>
                          ) : (
                            menuConfig.columns.map((col) => (
                              <div key={col.id} className="space-y-1.5">
                                {col.title ? (
                                  <p className="text-[11px] font-black uppercase tracking-wider text-navy border-b border-beige-200 pb-1">
                                    {col.title}
                                  </p>
                                ) : (
                                  <p className="text-[11px] font-black uppercase tracking-wider text-navy/60 border-b border-beige-200 pb-1">
                                    Destacados & Drops
                                  </p>
                                )}
                                <div className="space-y-1 pl-1">
                                  {col.items.map((item, idx) => (
                                    <Link
                                      key={idx}
                                      to={item.href}
                                      onClick={() => setMobileMenuOpen(false)}
                                      className="flex items-center justify-between py-1 text-xs font-semibold uppercase text-navy/85 hover:text-navy"
                                    >
                                      <span>{item.name}</span>
                                      {item.badge && (
                                        <span
                                          className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                                            item.badgeColor || 'bg-beige-200 text-navy'
                                          }`}
                                        >
                                          {item.badge}
                                        </span>
                                      )}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ))
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Link
                    to="/showroom"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-montserrat font-bold tracking-tight uppercase text-navy hover:text-navy-500 py-2.5 border-b border-beige-100 flex items-center justify-between"
                  >
                    <span>Showroom Quilmes Oeste</span>
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
                  <Link to="/guia-de-talles" onClick={() => setMobileMenuOpen(false)} className="hover:text-navy py-1">Tabla de talles (S-XL)</Link>
                  <Link to="/cuidados" onClick={() => setMobileMenuOpen(false)} className="hover:text-navy py-1">Cuidados de la prenda</Link>
                  <Link to="/envios" onClick={() => setMobileMenuOpen(false)} className="hover:text-navy py-1">Envíos a todo el país</Link>
                  <Link to="/preguntas-frecuentes" onClick={() => setMobileMenuOpen(false)} className="hover:text-navy py-1">Preguntas Frecuentes</Link>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="pt-6 border-t border-beige-300">
                <div className="bg-beige-100 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase text-navy">Showroom Quilmes Oeste</p>
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
