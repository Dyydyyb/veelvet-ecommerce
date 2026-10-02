import React from 'react';

interface SectionTitleProps {
  overline?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  highlightWord?: string;
}

export function SectionTitle({
  overline,
  title,
  subtitle,
  align = 'center',
  className = '',
  highlightWord,
}: SectionTitleProps) {
  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }[align];

  return (
    <div className={`flex flex-col ${alignmentClasses} mb-12 sm:mb-16 ${className}`}>
      {overline && (
        <span className="text-[11px] font-bold font-montserrat tracking-widest text-navy/70 uppercase mb-2 px-3 py-1 bg-beige-200/80 rounded-full inline-block">
          {overline}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black font-montserrat uppercase tracking-tight text-navy leading-[1.08]">
        {title}
        {highlightWord && <span className="text-navy-500"> {highlightWord}</span>}
      </h2>
      {subtitle && (
        <p className="mt-3.5 text-sm sm:text-base text-navy/70 font-light max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
