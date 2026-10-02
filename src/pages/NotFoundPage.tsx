import React from 'react';
import { Link } from 'react-router-dom';
import { Hero3DBadge } from '../components/3d/Hero3DBadge';
import { ArrowLeft, Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto min-h-[80vh] flex flex-col items-center justify-center text-center">
      {/* 3D Rotating Logo */}
      <div className="mb-6">
        <Hero3DBadge size="lg" interactive={true} />
      </div>

      <span className="text-xs font-mono font-bold uppercase tracking-widest text-navy/50 bg-beige-200 px-3 py-1 rounded-full border border-beige-300">
        Error 404
      </span>

      <h1 className="font-montserrat font-black text-3xl sm:text-4xl uppercase tracking-tight text-navy mt-4 mb-2">
        Prenda Fuera de Catálogo
      </h1>

      <p className="text-sm text-navy/70 font-light max-w-md mx-auto leading-relaxed mb-8">
        Parece que esta página o producto no está en el perchero. Puede haber cambiado de enlace o agotado su stock temporalmente.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          to="/"
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-navy text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-lg hover:bg-navy-500 transition-colors shadow-sm"
        >
          <Home className="w-4 h-4" />
          <span>Volver al inicio</span>
        </Link>
        <Link
          to="/tienda"
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-beige-200 text-navy text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-lg hover:bg-beige-300 transition-colors border border-beige-300"
        >
          <span>Ver colección completa</span>
        </Link>
      </div>
    </div>
  );
}
