import React from 'react';
import { SectionTitle } from '../components/common/SectionTitle';
import { CARE_INSTRUCTIONS } from '../data/careInstructions';
import { ThermometerSnowflake, Sparkles, Flame, Wind, ShieldCheck, Heart } from 'lucide-react';

export function CarePage() {
  const iconMap: Record<string, React.ReactNode> = {
    ThermometerSnowflake: <ThermometerSnowflake className="w-8 h-8 text-navy" />,
    Sparkles: <Sparkles className="w-8 h-8 text-navy" />,
    Flame: <Flame className="w-8 h-8 text-navy" />,
    Wind: <Wind className="w-8 h-8 text-navy" />,
    ShieldCheck: <ShieldCheck className="w-8 h-8 text-navy" />,
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto min-h-screen">
      <SectionTitle
        overline="Guía de Conservación"
        title="Cuidados de la Prenda"
        subtitle="Mantené tu prenda como el primer día. Nuestras prendas están confeccionadas con frisa de algodón peinado pesado; siguiendo estas recomendaciones vas a preservar su textura, caída y color por años."
        align="center"
      />

      {/* Main 5 Instructions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {CARE_INSTRUCTIONS.map((care, idx) => (
          <div
            key={care.id}
            className={`p-6 sm:p-8 rounded-2xl border border-beige-300 shadow-xs flex flex-col justify-between transition-all duration-300 hover:shadow-md ${
              idx === 4 ? 'md:col-span-2 lg:col-span-1 bg-beige-200' : 'bg-[#FAF7F0]'
            }`}
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-beige-100 flex items-center justify-center mb-6 border border-beige-300/80">
                {iconMap[care.icon]}
              </div>

              <span className="text-[10px] font-bold font-montserrat tracking-widest text-navy/60 uppercase">
                Paso 0{idx + 1}
              </span>
              <h3 className="font-montserrat font-black text-xl text-navy uppercase tracking-tight mt-1 mb-3">
                {care.title}
              </h3>
              <p className="text-sm text-navy/80 font-light leading-relaxed mb-4">
                {care.description}
              </p>
            </div>

            <div className="pt-4 border-t border-beige-300/60 bg-beige-50/50 -mx-2 -mb-2 p-3 rounded-xl">
              <p className="text-xs text-navy/70 italic">
                💡 {care.tip}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Extra Pro Tips Banner */}
      <div className="bg-beige-100 rounded-3xl p-8 sm:p-10 border border-beige-300 shadow-sm flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="w-14 h-14 rounded-full bg-navy text-white flex items-center justify-center flex-shrink-0">
          <Heart className="w-6 h-6" />
        </div>
        <div className="text-center sm:text-left">
          <h4 className="font-montserrat font-black text-lg text-navy uppercase">
            Compromiso de Calidad Veelvet
          </h4>
          <p className="text-xs sm:text-sm text-navy/75 font-light mt-1 max-w-2xl leading-relaxed">
            Nuestros tejidos pasan por un proceso de prelavado y fijación térmica para minimizar el encogimiento. Cuidar tu ropa es también una forma de consumo consciente.
          </p>
        </div>
      </div>
    </div>
  );
}
