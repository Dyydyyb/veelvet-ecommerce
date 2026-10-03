import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { WHATSAPP_BASE_URL, WHATSAPP_DISPLAY } from '../../config/constants';

export function FloatingWhatsApp() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center group">
      {/* Tooltip Pill */}
      <div
        className={`mr-3 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-beige-300 shadow-lg text-xs font-montserrat font-semibold text-navy transition-all duration-300 pointer-events-none hidden sm:block ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        }`}
      >
        <span>¿Dudas con tu talle o compra? {WHATSAPP_DISPLAY}</span>
      </div>

      {/* Floating Button */}
      <a
        href={`${WHATSAPP_BASE_URL}?text=Hola%20Veelvet!%20Tengo%20una%20consulta%20sobre%20la%20tienda.`}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40 cursor-pointer"
        aria-label="Contactar a Veelvet por WhatsApp"
      >
        {/* Pulse ring animation */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-ping pointer-events-none" />

        <MessageCircle className="w-7 h-7 fill-white stroke-none relative z-10" />
      </a>
    </div>
  );
}
