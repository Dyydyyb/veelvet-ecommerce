import React, { useState } from 'react';
import { SectionTitle } from '../components/common/SectionTitle';
import { MapPin, Clock, Calendar, MessageCircle, CheckCircle2, ShieldCheck, CreditCard, Users, AlertTriangle } from 'lucide-react';
import { WHATSAPP_DISPLAY, getWhatsAppLink } from '../config/constants';

export function ShowroomPage() {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    date: '',
    timeSlot: '10:00 - 11:00',
    guests: '1 persona',
    notes: '',
  });

  const [isReserved, setIsReserved] = useState(false);
  const [error, setError] = useState('');

  const timeSlots = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 13:00',
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00',
  ];

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.whatsapp.trim() || !formData.date) {
      setError('Por favor completá tu nombre, WhatsApp y seleccioná una fecha.');
      return;
    }

    // Validar que no sea domingo (0 = Domingo)
    const selectedDate = new Date(`${formData.date}T00:00:00`);
    if (selectedDate.getDay() === 0) {
      setError('El showroom atiende de Lunes a Sábado de 9:00 a 17:00 hs. Los domingos permanece cerrado. Por favor elegí una fecha entre lunes y sábado.');
      return;
    }

    setError('');
    setIsReserved(true);

    const bookingMessage =
      `*RESERVA DE CITA SHOWROOM VEELVET* 📍\n\n` +
      `👤 *Nombre:* ${formData.name}\n` +
      `📱 *WhatsApp:* ${formData.whatsapp}\n` +
      `📅 *Fecha:* ${formData.date}\n` +
      `⏰ *Horario:* ${formData.timeSlot} hs\n` +
      `👥 *Asistentes:* ${formData.guests} (máx. 2 personas)\n` +
      (formData.notes ? `📝 *Interés/Notas:* ${formData.notes}\n` : '') +
      `\n¡Hola Veelvet! 👋 Solicito la confirmación de mi turno para visitar el showroom en Quilmes Oeste. ¡Muchas gracias!`;

    const waUrl = getWhatsAppLink(bookingMessage);
    try {
      window.open(waUrl, '_blank');
    } catch {
      // ignore
    }
  };

  const bookingWhatsAppLink = getWhatsAppLink(
    `*RESERVA DE CITA SHOWROOM VEELVET* 📍\n\n` +
    `👤 *Nombre:* ${formData.name}\n` +
    `📱 *WhatsApp:* ${formData.whatsapp}\n` +
    `📅 *Fecha:* ${formData.date}\n` +
    `⏰ *Horario:* ${formData.timeSlot} hs\n` +
    `👥 *Asistentes:* ${formData.guests} (máx. 2 personas)\n` +
    (formData.notes ? `📝 *Notas:* ${formData.notes}\n` : '') +
    `\n¡Hola Veelvet! 👋 Solicito la confirmación de mi turno para visitar el showroom en Quilmes Oeste. ¡Muchas gracias!`
  );

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto min-h-screen">
      <SectionTitle
        overline="Experiencia Exclusiva"
        title="Showroom en Quilmes Oeste"
        subtitle="Vení a ver y probarte nuestras prendas. Atendemos de Lunes a Sábado de 9:00 a 17:00 hs con cita previa y un máximo de 2 personas por seguridad."
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
                  Buenos Aires, Argentina (dirección exacta tras agendar)
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-navy/80">
              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 text-navy flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-navy font-bold uppercase font-montserrat">
                    Días y Horarios de Atención
                  </strong>
                  Lunes a Sábado de 9:00 a 17:00 hs.<br />
                  <span className="text-[11px] text-navy/60 font-medium">Domingos y feriados cerrado.</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Users className="w-4 h-4 text-navy flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-navy font-bold uppercase font-montserrat">
                    Capacidad y Seguridad
                  </strong>
                  Máximo <strong>2 personas</strong> por cita por normas de seguridad y para brindarte una atención personalizada sin esperas.
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CreditCard className="w-4 h-4 text-navy flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-navy font-bold uppercase font-montserrat">
                    Medios de Pago
                  </strong>
                  Mercado Pago (tarjetas y dinero en cuenta), transferencia bancaria o efectivo.
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <ShieldCheck className="w-4 h-4 text-navy flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-navy font-bold uppercase font-montserrat">
                    Prueba y Asesoramiento
                  </strong>
                  Contamos con probador privado y catálogo completo en todos los talles (S a XL) para que encuentres tu calce ideal.
                </div>
              </div>
            </div>
          </div>

          {/* Direct WhatsApp Callout */}
          <div className="p-6 bg-[#FAF7F0] rounded-2xl border border-beige-300 text-center">
            <p className="text-xs text-navy/75 font-light">
              ¿Querés consultar disponibilidad inmediata para hoy?
            </p>
            <a
              href="https://wa.me/5491136291392?text=Hola%20Veelvet!%20Quisiera%20consultar%20disponibilidad%20para%20visitar%20el%20showroom%20en%20Quilmes%20Oeste%20(Lun%20a%20S%C3%A1b%20de%209%20a%2017hs)."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 mt-3 bg-beige-200 hover:bg-beige-300 text-navy px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition-colors border border-beige-300 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Consultar por WhatsApp ({WHATSAPP_DISPLAY})</span>
            </a>
          </div>
        </div>

        {/* Right: Booking Form */}
        <div className="lg:col-span-7 bg-[#FAF7F0] p-8 sm:p-10 rounded-3xl border border-beige-300 shadow-sm">
          {isReserved ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-beige-200 text-navy rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="font-montserrat font-black text-2xl text-navy uppercase">
                ¡Solicitud de Turno Enviada!
              </h3>
              <p className="text-sm text-navy/80 font-light max-w-md mx-auto leading-relaxed">
                Te esperamos, <strong>{formData.name}</strong>, el día <strong>{formData.date}</strong> en el turno de las <strong>{formData.timeSlot} hs</strong> ({formData.guests}, máx. 2 personas).
              </p>
              <div className="bg-beige-100 p-4 rounded-xl border border-beige-300 text-xs text-navy text-left max-w-sm mx-auto space-y-1">
                <p className="font-bold uppercase font-montserrat">Próximo paso:</p>
                <p>Te enviamos la dirección exacta y ubicación por WhatsApp a tu número ({formData.whatsapp}).</p>
              </div>

              <div className="pt-2">
                <a
                  href={bookingWhatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-5 py-3 rounded-xl text-xs font-bold uppercase transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Reenviar datos por WhatsApp</span>
                </a>
              </div>

              <div>
                <button
                  onClick={() => setIsReserved(false)}
                  className="mt-3 text-xs font-bold uppercase tracking-wider text-navy underline cursor-pointer"
                >
                  Modificar datos de la cita
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-5">
              <h3 className="font-montserrat font-black text-xl text-navy uppercase mb-1">
                Reservá Tu Cita en Showroom
              </h3>
              <p className="text-xs text-navy/70 font-light mb-4">
                Lunes a Sábado de 9:00 a 17:00 hs • Máximo 2 personas por turno.
              </p>

              {/* Security Alert Banner */}
              <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-700" />
                <span>
                  <strong>Aviso de Seguridad:</strong> Se permite el ingreso de un <strong>máximo de 2 personas</strong> por cita.
                </span>
              </div>

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

              {/* Date & Guests */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                    Fecha (Lun a Sáb) *
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
                    Asistentes (Máx. 2 personas) *
                  </label>
                  <select
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                    className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:border-navy font-semibold"
                  >
                    <option value="1 persona">1 persona (individual)</option>
                    <option value="2 personas">2 personas (máximo permitido por seguridad)</option>
                  </select>
                </div>
              </div>

              {/* Time Slots (09:00 to 17:00) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-2">
                  Horario de Turno (9:00 a 17:00 hs)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setFormData({ ...formData, timeSlot: slot })}
                      className={`py-2.5 px-2 text-xs font-bold uppercase rounded-lg border transition-all text-center cursor-pointer ${
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
                  Notas o Prendas que te gustaría probarte (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ej: Quiero probarme Buzos y Remeras en talle L"
                  className="w-full text-xs bg-beige-50 border border-beige-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:border-navy"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-4 bg-navy hover:bg-navy-500 text-white font-montserrat font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Confirmar cita en showroom</span>
              </button>

              <p className="text-[11px] text-center text-navy/60 font-light">
                Atención personalizada de 9:00 a 17:00 hs. Si no podés asistir, avisanos por WhatsApp para reprogramar.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
