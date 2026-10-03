import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Layers, Tag, Settings, ExternalLink, RefreshCw, Sparkles, ShieldCheck, LogOut } from 'lucide-react';
import { ProductsManager } from '../../components/admin/ProductsManager';
import { CategoriesManager } from '../../components/admin/CategoriesManager';
import { OfferTypesManager } from '../../components/admin/OfferTypesManager';
import { R2ConfigGuide } from '../../components/admin/R2ConfigGuide';
import { AdminLogin } from '../../components/admin/AdminLogin';
import { SupabaseService } from '../../services/supabaseService';
import { Producto, Subcategoria, Categoria, TipoOferta } from '../../lib/supabase';

export function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('veelvet_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState<'productos' | 'categorias' | 'ofertas' | 'config'>('productos');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tiposOferta, setTiposOferta] = useState<TipoOferta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('veelvet_admin_auth');
    } catch (_) {}
    setIsAuthenticated(false);
  };

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const [cats, subs, ofertas, prods] = await Promise.all([
        SupabaseService.getCategorias(),
        SupabaseService.getSubcategorias(),
        SupabaseService.getTiposOferta(),
        SupabaseService.getProductos(),
      ]);

      setCategorias(cats);
      setSubcategorias(subs);
      setTiposOferta(ofertas);
      setProductos(prods);
    } catch (err) {
      console.error('Error cargando datos de Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-navy flex flex-col font-sans">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-beige-300 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand & Studio Title */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center group">
              <img
                src="/assets/logo-transparent.png"
                alt="Veelvet."
                className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </Link>
            <div className="h-6 w-[1px] bg-beige-300 hidden sm:block" />
            <div className="hidden sm:block">
              <span className="text-[11px] font-mono tracking-widest uppercase bg-navy text-white px-2 py-0.5 rounded font-bold">
                Backoffice
              </span>
              <span className="ml-2 text-xs font-montserrat font-bold text-navy uppercase">
                Panel de Control
              </span>
            </div>
          </div>

          {/* Quick Actions & Status */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Supabase Conectado</span>
            </div>

            <button
              onClick={loadAllData}
              disabled={isLoading}
              className="p-2 text-navy/70 hover:text-navy hover:bg-beige-100 rounded-lg transition-colors cursor-pointer"
              title="Recargar datos"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider bg-beige-200 hover:bg-beige-300 text-navy px-3.5 py-2 rounded-lg border border-beige-300 transition-colors"
            >
              <span>Ver Tienda</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {/* Admin User Badge */}
            <div className="hidden lg:flex items-center space-x-1.5 text-xs text-navy/80 bg-beige-100 px-3 py-2 rounded-lg border border-beige-300">
              <span className="w-2 h-2 rounded-full bg-navy animate-pulse" />
              <span className="font-mono text-[11px] font-bold">VeelvetAdmin</span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg border border-red-200 transition-colors cursor-pointer"
              title="Cerrar sesión de administrador"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-2 overflow-x-auto border-t border-beige-200/60 pt-1 pb-1">
          <button
            onClick={() => setActiveTab('productos')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-montserrat font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === 'productos'
                ? 'bg-navy text-white shadow-xs'
                : 'text-navy/70 hover:text-navy hover:bg-beige-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Productos</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                activeTab === 'productos' ? 'bg-white/20 text-white' : 'bg-beige-200 text-navy'
              }`}
            >
              {productos.length} ({productos.filter((p) => p.destacado).length} ★)
            </span>
          </button>

          <button
            onClick={() => setActiveTab('categorias')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-montserrat font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === 'categorias'
                ? 'bg-navy text-white shadow-xs'
                : 'text-navy/70 hover:text-navy hover:bg-beige-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categorías & Subcategorías</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                activeTab === 'categorias' ? 'bg-white/20 text-white' : 'bg-beige-200 text-navy'
              }`}
            >
              {categorias.length} ({categorias.filter((c) => c.destacada).length} ★)
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ofertas')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-montserrat font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === 'ofertas'
                ? 'bg-navy text-white shadow-xs'
                : 'text-navy/70 hover:text-navy hover:bg-beige-100'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Tipos de Oferta & Badges</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'ofertas' ? 'bg-white/20 text-white' : 'bg-beige-200 text-navy'
              }`}
            >
              {tiposOferta.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-montserrat font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === 'config'
                ? 'bg-navy text-white shadow-xs'
                : 'text-navy/70 hover:text-navy hover:bg-beige-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Supabase & Cloudflare R2</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && (
          <div className="flex items-center justify-center py-12 space-x-3 text-xs font-semibold text-navy/60">
            <RefreshCw className="w-4 h-4 animate-spin text-navy" />
            <span>Sincronizando con Supabase...</span>
          </div>
        )}

        {!isLoading && (
          <>
            {activeTab === 'productos' && (
              <ProductsManager
                productos={productos}
                subcategorias={subcategorias}
                tiposOferta={tiposOferta}
                onRefresh={loadAllData}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'categorias' && (
              <CategoriesManager
                categorias={categorias}
                subcategorias={subcategorias}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'ofertas' && (
              <OfferTypesManager
                tiposOferta={tiposOferta}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'config' && (
              <R2ConfigGuide onRefresh={loadAllData} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
