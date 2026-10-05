import React from 'react';

interface MarqueeProps {
  text?: string;
  speed?: 'normal' | 'slow';
  reverse?: boolean;
  className?: string;
}

export function Marquee({
  text = 'ENVÍO A TODO EL PAÍS • MAYORISTA Y MINORISTA • SHOWROOM EN QUILMES OESTE • UNISEX',
  reverse = false,
  className = '',
}: MarqueeProps) {
  const repeatedText = `${text} • `.repeat(8);

  return (
    <div
      className={`w-full overflow-hidden bg-beige-200 border-y border-beige-300 py-3 select-none flex items-center ${className}`}
      aria-label="Información destacada de Veelvet"
    >
      <div className={`flex whitespace-nowrap will-change-transform ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}>
        <span className="text-xs sm:text-sm font-montserrat font-bold tracking-widest text-navy uppercase flex items-center pr-6">
          {repeatedText}
        </span>
        <span className="text-xs sm:text-sm font-montserrat font-bold tracking-widest text-navy uppercase flex items-center pr-6" aria-hidden="true">
          {repeatedText}
        </span>
      </div>
    </div>
  );
}
