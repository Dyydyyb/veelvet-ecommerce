import React, { useState } from 'react';
import { SectionTitle } from '../components/common/SectionTitle';
import { SHIPPING_METHODS, ShippingMethod } from '../data/shippingMethods';
import { Truck, MapPin, PackageCheck, Search, ShieldCheck, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ShippingPage() {
  const [postalCode, setPostalCode] = useState('');
  const [calculated, setCalculated] = useState(false);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (postalCode.trim().length >= 4) {
      setCalculated(true);
    }
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto min-h-screen">
      <SectionTitle
        overline="Logística Nacional"
        title="Envíos por Correo Argentino"
        subtitle="Entregamos tus pedidos de forma rápida y segura en cualquier punto de la República Argentina a través de Correo Argentino. El costo es a calcular según código postal y peso de tu paquete."
        align="center"
      />

      {/* Correo Argentino Banner */}
      <div className="bg-beige-200 border border-beige-300 p-5 rounded-2xl mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-navy">
        <div className="flex items-center space-x-3">
          <Truck className="w-6 h-6 text-navy flex-shrink-0" />
          <div>
            <p className="font-montserrat font-bold text-sm uppercase">
              Envíos por Correo Argentino a todo el país
            </p>
            <p className="text-xs text-navy/70 mt-0.5">
              Despachamos tu compra a sucursal o directamente a tu domicilio. El costo final se calcula según el destino y código postal.
            </p>
          </div>
        </div>
        <span className="font-mono text-xs font-bold bg-[#f3eee3] px-3 py-1.5 rounded-full border border-beige-300 whitespace-nowrap">
          A CALCULAR
        </span>
      </div>

      {/* Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {SHIPPING_METHODS.map((method: ShippingMethod) => (
          <div
            key={method.id}
            className="bg-[#FAF7F0] p-6 sm:p-7 rounded-2xl border border-beige-300 shadow-xs flex flex-col justify-between hover:border-beige-400 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-navy text-white flex items-center justify-center font-black text-sm">
                    {method.carrier === 'correo_argentino' ? 'CA' : 'VVT'}
                  </div>
                  <div>
                    <h3 className="font-montserrat font-black text-base text-navy uppercase">
                      {method.name}
                    </h3>
                    <p className="text-xs text-navy/60 font-medium">
                      Tiempo estimado: {method.deliveryTime}
                    </p>
                  </div>
                </div>

                {method.badge && (
                  <span className="text-[10px] font-bold font-montserrat tracking-wider uppercase px-2 py-0.5 bg-beige-200 text-navy rounded border border-beige-300">
                    {method.badge}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-navy/75 font-light leading-relaxed mb-4">
                {method.tagline}
              </p>
            </div>

            <div className="pt-4 border-t border-beige-200 flex items-center justify-between">
              <span className="text-xs text-navy/60 uppercase font-semibold">Costo:</span>
              <span className="font-montserrat font-black text-base text-navy">
                {method.priceLabel || (method.price === 0 ? 'GRATIS' : `$${method.price}`)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Showroom Alert Card */}
      <div className="bg-beige-50 border border-beige-300 p-6 rounded-2xl mb-16 flex flex-col sm:flex-row items-center justify-between gap-4 text-navy">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-montserrat font-bold text-sm uppercase text-navy">
              ¿Preferís retirar en Showroom Quilmes Oeste?
            </h4>
            <p className="text-xs text-navy/70 mt-0.5 leading-relaxed">
              Atendemos de <strong>Lunes a Sábado de 9:00 a 17:00 hs</strong> con cita previa. Máximo 2 personas por turno por seguridad.
            </p>
          </div>
        </div>
        <Link
          to="/showroom"
          className="whitespace-nowrap px-4 py-2.5 bg-navy hover:bg-navy-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
        >
          Reservar Cita
        </Link>
      </div>

      {/* Postal Code Simulator */}
      <div className="bg-beige-100 p-8 rounded-3xl border border-beige-300 shadow-xs max-w-xl mx-auto text-center">
        <h3 className="font-montserrat font-black text-xl text-navy uppercase mb-2">
          Consultá el Envío a Tu Localidad
        </h3>
        <p className="text-xs text-navy/70 font-light mb-6">
          Ingresá tu código postal para verificar la cobertura de Correo Argentino.
        </p>

        <form onSubmit={handleCalculate} className="flex space-x-2 max-w-sm mx-auto">
          <input
            type="text"
            required
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="Ej: 1878 (Quilmes)"
            className="flex-1 text-xs bg-[#FAF7F0] border border-beige-300 rounded-lg px-4 py-3 text-navy font-mono placeholder:font-sans focus:outline-none focus:border-navy"
          />
          <button
            type="submit"
            className="bg-navy hover:bg-navy-500 text-white font-montserrat font-bold text-xs uppercase px-5 py-3 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Consultar</span>
          </button>
        </form>

        {calculated && (
          <div className="mt-6 pt-6 border-t border-beige-300 text-left space-y-2.5 text-xs text-navy">
            <p className="font-bold text-center text-navy-500 mb-3">
              Información de entrega para el CP {postalCode}:
            </p>
            <div className="flex justify-between items-center p-3 bg-[#FAF7F0] rounded-lg border border-beige-200">
              <div>
                <span className="font-bold block">Correo Argentino (A Domicilio / Sucursal)</span>
                <span className="text-[11px] text-navy/60">Plazo estimado: 3 a 6 días hábiles</span>
              </div>
              <strong className="text-xs bg-beige-200 px-2 py-1 rounded">Costo a calcular</strong>
            </div>
            <p className="text-[11px] text-navy/60 text-center italic mt-2">
              Al finalizar tu pedido en la web, coordinaremos la cotización exacta del envío por WhatsApp según las medidas del paquete y tu ubicación.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
