import React, { useState } from 'react';
import { SectionTitle } from '../components/common/SectionTitle';
import { MapPin, Clock, Calendar, MessageCircle, CheckCircle2, ShieldCheck, CreditCard } from 'lucide-react';

export function ShowroomPage() {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    date: '',
    timeSlot: '16:00 - 16:45',
    guests: '1 persona',
    notes: '',
  });

  const [isReserved, setIsReserved] = useState(false);
  const [error, setError] = useState('');

  const timeSlots = [
    '14:00 - 14:45',
    '15:00 - 15:45',
    '16:00 - 16:45',
    '17:00 - 17:45',
    '18:00 - 18:45',
    '19:00 - 19:30',
  ];

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.whatsapp.trim() || !formData.date) {
      setError('Por favor completá tu nombre, WhatsApp y seleccioná una fecha.');
      return;
    }
    setError('');
    setIsReserved(true);
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto min-h-screen">
      <SectionTitle
        overline="Experiencia Exclusiva"
        title="Showroom en Quilmes Oeste"
        subtitle="Vení a ver y probarte nuestros productos. Al reservar tu turno te enviamos la dirección exacta por WhatsApp para brindarte una atención 100% personalizada."
        align="center"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
        
        {/* Left: Showroom Info & Schedule */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-beige-100 p-8 rounded-3xl border border-beige-300 space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-beige-300">
              <div className="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-montserrat font-black text-base text-navy uppercase">
                  Ubicación: Quilmes Oeste
                </h3>
                <p className="text-xs text-navy/70">
                  Buenos Aires, Argentina
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-navy/80">
              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 text-navy flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-navy font-bold uppercase font-montserrat">
                    Horarios de Atención
                  </strong>
                  Lunes a Viernes de 14:00 a 19:30 hs.<br />
                  Sábados de 11:00 a 18:00 hs.
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CreditCard className="w-4 h-4 text-navy flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-navy font-bold uppercase font-montserrat">
                    Medios de Pago en Showroom
                  </strong>
                  Efectivo (10% OFF adicional), Transferencia inmediata, Tarjetas de débito y crédito en 3 cuotas sin interés.
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <ShieldCheck className="w-4 h-4 text-navy flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-navy font-bold uppercase font-montserrat">
                    Prueba y Asesoramiento
                  </strong>
                  Disponemos de probador espacioso y stock completo en todos los talles (S a XL) para que te pruebes sin apuros.
                </div>
              </div>
            </div>
          </div>

          {/* Direct WhatsApp Callout */}
          <div className="p-6 bg-white rounded-2xl border border-beige-300 text-center">
            <p className="text-xs text-navy/75 font-light">
              ¿Querés venir hoy mismo o tenés dudas con el horario?
            </p>
            <a
              href="https://wa.me/5491136291392?text=Hola%20Veelvet!%20Quisiera%20saber%20si%20tienen%20disponibilidad%20hoy%20en%20el%20showroom%20de%20Quilmes%20Oeste."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 mt-3 bg-beige-200 hover:bg-beige-300 text-navy px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition-colors border border-beige-300"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Consultar disponibilidad por WhatsApp (11 3629-1392)</span>
            </a>
          </div>
        </div>

        {/* Right: Booking Form */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-beige-300 shadow-sm">
          {isReserved ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-beige-200 text-navy rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="font-montserrat font-black text-2xl text-navy uppercase">
                ¡Turno Reservado con Éxito!
              </h3>
              <p className="text-sm text-navy/80 font-light max-w-md mx-auto leading-relaxed">
                Te esperamos, <strong>{formData.name}</strong>, el día <strong>{formData.date}</strong> en el turno de las <strong>{formData.timeSlot}</strong>.
              </p>
              <div className="bg-beige-100 p-4 rounded-xl border border-beige-300 text-xs text-navy text-left max-w-sm mx-auto">
                <p className="font-bold uppercase font-montserrat mb-1">Próximo paso:</p>
                <p>Te hemos enviado la dirección exacta y ubicación de Google Maps al WhatsApp ({formData.whatsapp}).</p>
              </div>
              <button
                onClick={() => setIsReserved(false)}
                className="mt-4 text-xs font-bold uppercase tracking-wider text-navy underline"
              >
                Modificar turno
              </button>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-5">
              <h3 className="font-montserrat font-black text-xl text-navy uppercase mb-1">
                Reservá Tu Cita
              </h3>
              <p className="text-xs text-navy/70 font-light mb-4">
                Elegí el día y el horario que mejor te quede para visitarnos.
              </p>

              {error && (
                <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              {/* Name & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                    Tu Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Sofía o Lucas"
                    className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:border-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                    WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="Ej: 11 5555 4444"
                    className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:border-navy"
                  />
                </div>
              </div>

              {/* Date & Acompañantes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                    Fecha de Visita *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:border-navy font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                    Acompañantes
                  </label>
                  <select
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                    className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:border-navy"
                  >
                    <option value="1 persona">Vengo solo/a</option>
                    <option value="2 personas">Con 1 acompañante</option>
                    <option value="3 o más">Grupo de 3 o más</option>
                  </select>
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-2">
                  Horario de Turno
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setFormData({ ...formData, timeSlot: slot })}
                      className={`py-2.5 px-3 text-xs font-bold uppercase rounded-lg border transition-all text-center ${
                        formData.timeSlot === slot
                          ? 'bg-navy text-white border-navy shadow-xs'
                          : 'bg-beige-50 text-navy border-beige-300 hover:bg-beige-200'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                  Notas o Prendas de Interés (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ej: Quiero probarme el Buzo Boxy Negro y Pantalón Ancho en talle L"
                  className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:border-navy"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-4 bg-navy hover:bg-navy-500 text-white font-montserrat font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Confirmar reserva de turno</span>
              </button>

              <p className="text-[11px] text-center text-navy/60 font-light">
                Cancelación gratuita. Si no podés asistir, avisanos por WhatsApp con anticipación.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
