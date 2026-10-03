import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      if (username.trim() === 'VeelvetAdmin' && password === 'Veelvet.shop') {
        // Save to session storage (session-only, zero localStorage)
        try {
          sessionStorage.setItem('veelvet_admin_auth', 'true');
        } catch (_) {}
        onLoginSuccess();
      } else {
        setError('Usuario o contraseña incorrectos. Verificá tus credenciales de acceso.');
      }
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-radial from-[#F5F2EB] to-[#EBE6DC] flex flex-col justify-center items-center px-4 sm:px-6 py-12">
      {/* Decorative Brand Top Banner */}
      <div className="w-full max-w-md text-center mb-8">
        <Link to="/" className="inline-block transition-transform duration-300 hover:scale-105">
          <img
            src="/assets/logo-transparent.png"
            alt="Veelvet."
            className="h-16 sm:h-20 w-auto mx-auto object-contain drop-shadow-sm"
          />
        </Link>
        <div className="mt-3 flex items-center justify-center space-x-2 text-[11px] font-bold tracking-widest uppercase text-navy/70">
          <ShieldCheck className="w-3.5 h-3.5 text-navy" />
          <span>Acceso Privado Backoffice</span>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl border border-beige-300 shadow-xl p-8 sm:p-10 space-y-6">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 bg-navy/5 text-navy rounded-2xl flex items-center justify-center mx-auto mb-3 border border-navy/10">
            <Lock className="w-5 h-5 stroke-[2]" />
          </div>
          <h2 className="font-montserrat font-black text-2xl uppercase tracking-tight text-navy">
            Iniciar Sesión
          </h2>
          <p className="text-xs text-navy/60 font-light">
            Ingresá tus credenciales para administrar el catálogo y configuración.
          </p>
        </div>

        {error && (
          <div className="flex items-start space-x-2.5 p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Usuario */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
              Usuario
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-navy/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresá tu usuario"
                className="w-full text-xs bg-beige-50/70 border border-beige-300 rounded-xl pl-10 pr-3.5 py-3 text-navy placeholder:text-navy/35 focus:outline-none focus:border-navy focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-navy/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresá tu contraseña"
                className="w-full text-xs bg-beige-50/70 border border-beige-300 rounded-xl pl-10 pr-11 py-3 text-navy placeholder:text-navy/35 focus:outline-none focus:border-navy focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/40 hover:text-navy p-1 transition-colors cursor-pointer"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Botón de acceso */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-navy hover:bg-navy-500 text-white rounded-xl font-montserrat font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            <span>{isSubmitting ? 'Verificando...' : 'Ingresar al Panel'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-beige-200 text-center">
          <Link
            to="/"
            className="text-xs text-navy/60 hover:text-navy transition-colors font-medium hover:underline inline-flex items-center space-x-1"
          >
            <span>← Volver a la tienda pública</span>
          </Link>
        </div>
      </div>

      <div className="mt-8 text-center text-[11px] text-navy/40 font-mono">
        Veelvet Official Store • Backoffice Seguro
      </div>
    </div>
  );
}
