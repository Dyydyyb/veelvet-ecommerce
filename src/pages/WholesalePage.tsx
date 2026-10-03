import React, { useState } from 'react';
import { SectionTitle } from '../components/common/SectionTitle';
import { Button } from '../components/common/Button';
import { CheckCircle2, TrendingUp, Package, Sparkles, Send, ShieldCheck } from 'lucide-react';

export function WholesalePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    city: '',
    businessType: 'local',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio.';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Ingresá un email válido.';
    if (!formData.whatsapp.trim() || formData.whatsapp.length < 8)
      newErrors.whatsapp = 'Ingresá un número de WhatsApp válido con código de área.';
    if (!formData.city.trim()) newErrors.city = 'La ciudad y provincia son obligatorias.';
    if (!formData.message.trim()) newErrors.message = 'Por favor contanos brevemente sobre tu proyecto.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto min-h-screen">
      <SectionTitle
        overline="Canal B2B & Distribuidores"
        title="Venta Mayorista Veelvet"
        subtitle="Impulsá tu local o showroom con indumentaria urbana unisex de alta rotación. Márgenes comerciales atractivos, frisa prémium y atención personalizada."
        align="center"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
        {/* Left: Wholesale Benefits */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-beige-100 p-8 rounded-3xl border border-beige-300">
            <h3 className="font-montserrat font-black text-xl text-navy uppercase mb-4">
              Beneficios para Mayoristas
            </h3>
            
            <div className="space-y-4 text-xs sm:text-sm text-navy/80 font-light">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-beige-200 flex items-center justify-center text-navy flex-shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-navy font-bold uppercase font-montserrat">
                    Margen Rentable
                  </strong>
                  Precios escalonados con descuentos significativos sobre el precio minorista para maximizar tu ganancia.
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-beige-200 flex items-center justify-center text-navy flex-shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-navy font-bold uppercase font-montserrat">
                    Mínimo Accesible & Curva Libre
                  </strong>
                  Podés combinar modelos, colores y talles (S a XL) según la demanda de tus clientes sin imposición de curvas rígidas.
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-beige-200 flex items-center justify-center text-navy flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-navy font-bold uppercase font-montserrat">
                    Material Gráfico Incluido
                  </strong>
                  Te brindamos fotos en alta definición, videos y lookbooks oficiales para que impulses tus ventas en redes sociales.
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-beige-200 flex items-center justify-center text-navy flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-navy font-bold uppercase font-montserrat">
                    Envíos y Despacho Rápido
                  </strong>
                  Despachamos tu pedido por el transporte o expreso de tu preferencia con embalaje de seguridad reforzado.
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-beige-300 text-center">
            <p className="text-xs text-navy/70">
              ¿Preferís coordinar directo por WhatsApp?
            </p>
            <a
              href="https://wa.me/5491136291392?text=Hola%20Veelvet!%20Quiero%20informaci%C3%B3n%20sobre%20compras%20mayoristas."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 font-montserrat font-bold text-xs uppercase text-navy hover:text-navy-500 underline"
            >
              Chatear con un asesor comercial (11 3629-1392) →
            </a>
          </div>
        </div>

        {/* Right: Registration Form with Visual Validation */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-beige-300 shadow-sm">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-beige-200 text-navy rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="font-montserrat font-black text-2xl text-navy uppercase">
                ¡Solicitud Recibida!
              </h3>
              <p className="text-sm text-navy/75 font-light max-w-md mx-auto leading-relaxed">
                Gracias, <strong>{formData.name}</strong>. Nuestro equipo de ventas mayoristas revisará tu solicitud y se pondrá en contacto por WhatsApp ({formData.whatsapp}) con el catálogo de precios mayoristas vigente.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 text-xs font-bold uppercase tracking-wider text-navy underline"
              >
                Enviar otra consulta
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <h3 className="font-montserrat font-black text-xl text-navy uppercase mb-2">
                Solicitá el Catálogo Mayorista
              </h3>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                  Nombre y Apellido *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Tu nombre completo"
                  className={`w-full text-xs bg-beige-50 border rounded-lg px-4 py-3 text-navy focus:outline-none ${
                    errors.name ? 'border-red-500 bg-red-50/20' : 'border-beige-300 focus:border-navy'
                  }`}
                />
                {errors.name && <p className="text-[11px] text-red-600 mt-1">{errors.name}</p>}
              </div>

              {/* Email & WhatsApp Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ejemplo@correo.com"
                    className={`w-full text-xs bg-beige-50 border rounded-lg px-4 py-3 text-navy focus:outline-none ${
                      errors.email ? 'border-red-500 bg-red-50/20' : 'border-beige-300 focus:border-navy'
                    }`}
                  />
                  {errors.email && <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                    WhatsApp (con código de área) *
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="11 1234 5678"
                    className={`w-full text-xs bg-beige-50 border rounded-lg px-4 py-3 text-navy focus:outline-none ${
                      errors.whatsapp ? 'border-red-500 bg-red-50/20' : 'border-beige-300 focus:border-navy'
                    }`}
                  />
                  {errors.whatsapp && <p className="text-[11px] text-red-600 mt-1">{errors.whatsapp}</p>}
                </div>
              </div>

              {/* City and Business Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                    Ciudad y Provincia *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Ej: Rosario, Santa Fe"
                    className={`w-full text-xs bg-beige-50 border rounded-lg px-4 py-3 text-navy focus:outline-none ${
                      errors.city ? 'border-red-500 bg-red-50/20' : 'border-beige-300 focus:border-navy'
                    }`}
                  />
                  {errors.city && <p className="text-[11px] text-red-600 mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                    Tipo de Emprendimiento
                  </label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:border-navy cursor-pointer font-medium"
                  >
                    <option value="local">Local Comercial a la Calle</option>
                    <option value="showroom">Showroom Privado</option>
                    <option value="online">Tienda Online / E-commerce</option>
                    <option value="revendedor">Revendedor Independiente</option>
                    <option value="nuevo">Nuevo Proyecto en Desarrollo</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                  Mensaje o Consulta *
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Contanos qué productos te interesan, volumen estimado o cualquier duda..."
                  className={`w-full text-xs bg-beige-50 border rounded-lg px-4 py-3 text-navy focus:outline-none ${
                    errors.message ? 'border-red-500 bg-red-50/20' : 'border-beige-300 focus:border-navy'
                  }`}
                />
                {errors.message && <p className="text-[11px] text-red-600 mt-1">{errors.message}</p>}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-4 bg-navy hover:bg-navy-500 text-white font-montserrat font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Enviar solicitud mayorista</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
