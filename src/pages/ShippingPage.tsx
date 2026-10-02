import React, { useState } from 'react';
import { SectionTitle } from '../components/common/SectionTitle';
import { SHIPPING_METHODS } from '../data/shippingMethods';
import { Truck, MapPin, PackageCheck, Search, ShieldCheck } from 'lucide-react';

export function ShippingPage() {
  const [postalCode, setPostalCode] = useState('');
  const [calculated, setCalculated] = useState(false);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (postalCode.trim().length >= 4) {
      setCalculated(true);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'GRATIS';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto min-h-screen">
      <SectionTitle
        overline="Logística Nacional"
        title="Envíos a Todo el País"
        subtitle="Entregamos tus pedidos de forma rápida y segura en cualquier punto de la República Argentina a través de nuestros operadores logísticos certificados."
        align="center"
      />

      {/* Free Shipping Alert Banner */}
      <div className="bg-beige-200 border border-beige-300 p-5 rounded-2xl mb-12 flex items-center justify-between text-navy">
        <div className="flex items-center space-x-3">
          <Truck className="w-6 h-6 text-navy flex-shrink-0" />
          <div>
            <p className="font-montserrat font-bold text-sm uppercase">
              ¡Envío Gratis en compras superiores a $100.000!
            </p>
            <p className="text-xs text-navy/70 mt-0.5">
              Válido para todo el territorio nacional tanto a sucursal como a domicilio.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-block font-mono text-xs font-bold bg-white px-3 py-1.5 rounded-full border border-beige-300">
          AUTOMÁTICO
        </span>
      </div>

      {/* Carriers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {SHIPPING_METHODS.map((method) => (
          <div
            key={method.id}
            className="bg-white p-6 sm:p-7 rounded-2xl border border-beige-300 shadow-xs flex flex-col justify-between hover:border-beige-400 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-beige-100 flex items-center justify-center text-navy font-black text-sm">
                    {method.carrier === 'andreani' && 'AND'}
                    {method.carrier === 'correo_argentino' && 'CA'}
                    {method.carrier === 'veelvet_express' && 'VVT'}
                    {method.carrier === 'showroom' && 'QMS'}
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
              <span className="text-xs text-navy/60 uppercase font-semibold">Costo regular:</span>
              <span className="font-montserrat font-black text-base text-navy">
                {formatPrice(method.price)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Postal Code Simulator */}
      <div className="bg-beige-100 p-8 rounded-3xl border border-beige-300 shadow-xs max-w-xl mx-auto text-center">
        <h3 className="font-montserrat font-black text-xl text-navy uppercase mb-2">
          Calculá el Costo a Tu Localidad
        </h3>
        <p className="text-xs text-navy/70 font-light mb-6">
          Ingresá tu código postal para ver las opciones disponibles y plazos estimados.
        </p>

        <form onSubmit={handleCalculate} className="flex space-x-2 max-w-sm mx-auto">
          <input
            type="text"
            required
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="Ej: 1878 (Quilmes)"
            className="flex-1 text-xs bg-white border border-beige-300 rounded-lg px-4 py-3 text-navy font-mono placeholder:font-sans focus:outline-none focus:border-navy"
          />
          <button
            type="submit"
            className="bg-navy hover:bg-navy-500 text-white font-montserrat font-bold text-xs uppercase px-5 py-3 rounded-lg transition-colors flex items-center space-x-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Calcular</span>
          </button>
        </form>

        {calculated && (
          <div className="mt-6 pt-6 border-t border-beige-300 text-left space-y-2.5 text-xs text-navy">
            <p className="font-bold text-center text-navy-500 mb-3">
              Opciones calculadas para el CP {postalCode}:
            </p>
            <div className="flex justify-between p-2 bg-white rounded-lg border border-beige-200">
              <span>Andreani a domicilio (3 a 5 días)</span>
              <strong>$5.900</strong>
            </div>
            <div className="flex justify-between p-2 bg-white rounded-lg border border-beige-200">
              <span>Andreani a sucursal (2 a 4 días)</span>
              <strong>$4.400</strong>
            </div>
            {postalCode.startsWith('18') || postalCode.startsWith('14') ? (
              <div className="flex justify-between p-2 bg-beige-200 rounded-lg border border-beige-300 font-bold">
                <span>Envío directo por Veelvet (24 - 48 hs)</span>
                <strong>$3.500</strong>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
