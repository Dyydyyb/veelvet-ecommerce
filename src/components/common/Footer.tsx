import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, MapPin, Truck, ShieldCheck, CreditCard, MessageCircle } from 'lucide-react';
import { InstagramIcon } from './Icons';
import { WHATSAPP_BASE_URL, WHATSAPP_DISPLAY } from '../../config/constants';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <footer className="bg-beige-100 border-t border-beige-300 text-navy pt-16 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-beige-300/80">
          {/* Brand Info (2 columns on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block group py-1" aria-label="Veelvet Inicio">
              <img
                src="/assets/logo-header-footer.png"
                alt="Veelvet. Simplemente Veelvet."
                className="h-14 sm:h-16 md:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <p className="text-sm font-semibold tracking-wider uppercase text-navy/90">
              Simplemente Veelvet.
            </p>
            <p className="text-sm text-navy/70 max-w-sm font-light leading-relaxed">
              Marca argentina de indumentaria urbana unisex. Buzos con cierre de frisa pesada, pantalones anchos y conjuntos esenciales diseñados con calce holgado y materiales prémium.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs tracking-wider uppercase font-semibold text-navy/80">
              <a
                href="https://instagram.com/veelvet.shop"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-beige-200 hover:bg-beige-300 px-3.5 py-2 rounded-full border border-beige-300/80 transition-colors"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>@veelvet.shop</span>
              </a>
              <a
                href={`${WHATSAPP_BASE_URL}?text=Hola%20Veelvet!%20Tengo%20una%20consulta.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-beige-200 hover:bg-beige-300 px-3.5 py-2 rounded-full border border-beige-300/80 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>{WHATSAPP_DISPLAY}</span>
              </a>
              <Link
                to="/showroom"
                className="inline-flex items-center space-x-2 bg-beige-200 hover:bg-beige-300 px-3.5 py-2 rounded-full border border-beige-300/80 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span>Showroom Quilmes Oeste</span>
              </Link>
            </div>
          </div>

          {/* Shop Column */}
          <div className="space-y-3">
            <p className="font-montserrat font-bold text-xs uppercase tracking-wider text-navy">
              Colección
            </p>
            <ul className="space-y-2 text-sm text-navy/75 font-light">
              <li><Link to="/tienda" className="hover:text-navy transition-colors">Todos los productos</Link></li>
              <li><Link to="/tienda?cat=buzos" className="hover:text-navy transition-colors">Buzos con cierre & Hoodies</Link></li>
              <li><Link to="/tienda?cat=pantalones" className="hover:text-navy transition-colors">Pantalones anchos & Cargos</Link></li>
              <li><Link to="/tienda?cat=conjuntos" className="hover:text-navy transition-colors">Conjuntos completos</Link></li>
              <li><Link to="/tienda?cat=top" className="hover:text-navy transition-colors">Top & Remeras Boxy</Link></li>
              <li><Link to="/mayoristas" className="hover:text-navy transition-colors font-medium">Venta mayorista</Link></li>
            </ul>
          </div>

          {/* Info Column */}
          <div className="space-y-3">
            <p className="font-montserrat font-bold text-xs uppercase tracking-wider text-navy">
              Ayuda & Info
            </p>
            <ul className="space-y-2 text-sm text-navy/75 font-light">
              <li><Link to="/guia-de-talles" className="hover:text-navy transition-colors">Tabla de medidas (S-XL)</Link></li>
              <li><Link to="/cuidados" className="hover:text-navy transition-colors">Cuidados de la prenda</Link></li>
              <li><Link to="/envios" className="hover:text-navy transition-colors">Envíos a todo el país</Link></li>
              <li><Link to="/preguntas-frecuentes" className="hover:text-navy transition-colors">Preguntas frecuentes</Link></li>
              <li><Link to="/showroom" className="hover:text-navy transition-colors">Reservar turno showroom</Link></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-3">
            <p className="font-montserrat font-bold text-xs uppercase tracking-wider text-navy">
              Club Veelvet
            </p>
            <p className="text-xs text-navy/70 font-light leading-relaxed">
              Recibí lanzamientos de cápsulas exclusivas, reposiciones y 10% OFF en tu primera compra con el cupón <strong className="text-navy font-mono">SIMPLEMENTE</strong>.
            </p>
            {subscribed ? (
              <div className="bg-beige-200/90 border border-beige-400 p-3 rounded-xl flex items-center space-x-2 text-xs font-semibold text-navy">
                <CheckCircle2 className="w-4 h-4 text-navy flex-shrink-0" />
                <span>¡Te sumaste al Club Veelvet! Revisá tu casilla.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Tu email..."
                    className="w-full text-xs bg-white border border-beige-300 rounded-lg px-3.5 py-2.5 pr-10 text-navy placeholder:text-navy/40 focus:outline-none focus:border-navy"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-navy hover:text-navy-500 transition-colors"
                    aria-label="Suscribirse al newsletter"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-navy/50">Cero spam. Solo drops y novedades esenciales.</p>
              </form>
            )}
          </div>
        </div>

        {/* Badges Bar */}
        <div className="py-8 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-beige-300/60 text-navy/80">
          <div className="flex items-center space-x-3">
            <Truck className="w-5 h-5 stroke-[1.75]" />
            <div>
              <p className="text-xs font-bold uppercase">Envíos a todo el país</p>
              <p className="text-[11px] text-navy/60 font-light">Andreani & Correo Arg</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 stroke-[1.75]" />
            <div>
              <p className="text-xs font-bold uppercase">Showroom en Quilmes Oeste</p>
              <p className="text-[11px] text-navy/60 font-light">Vení a probarte con turno</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <CreditCard className="w-5 h-5 stroke-[1.75]" />
            <div>
              <p className="text-xs font-bold uppercase">Cuotas & Transferencia</p>
              <p className="text-[11px] text-navy/60 font-light">10% OFF pagando con transf.</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            <div>
              <p className="text-xs font-bold uppercase">Calce Unisex Perfecto</p>
              <p className="text-[11px] text-navy/60 font-light">Moldería testeada S a XL</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-navy/60 font-light space-y-3 sm:space-y-0">
          <p>© {new Date().getFullYear()} Veelvet. Todos los derechos reservados. Diseñado y fabricado en Argentina.</p>
          <div className="flex items-center space-x-6">
            <span>Hecho con frisa prémium</span>
            <span>•</span>
            <Link to="/guia-de-talles" className="hover:text-navy">Medidas</Link>
            <span>•</span>
            <Link to="/showroom" className="hover:text-navy">Quilmes Oeste, Bs. As.</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
