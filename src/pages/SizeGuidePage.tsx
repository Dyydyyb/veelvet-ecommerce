import React, { useState } from 'react';
import { SectionTitle } from '../components/common/SectionTitle';
import { BUZO_MEASUREMENTS, PANTALON_MEASUREMENTS, MEASURING_TIPS } from '../data/sizeGuide';

export function SizeGuidePage() {
  const [activeTab, setActiveTab] = useState<'buzo' | 'pantalon'>('buzo');

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto min-h-screen">
      <SectionTitle
        overline="Moldería & Calce"
        title="Tabla de Medidas"
        subtitle="Diseñamos cada prenda con moldería unisex y proporciones generosas. Consultá las medidas exactas tomadas en plano para elegir tu talle ideal."
        align="center"
      />

      {/* Selector Tabs */}
      <div className="flex justify-center border-b border-beige-300 mb-8">
        <button
          onClick={() => setActiveTab('buzo')}
          className={`pb-4 px-6 font-montserrat font-bold text-sm sm:text-base tracking-wider uppercase border-b-2 transition-all ${
            activeTab === 'buzo'
              ? 'border-navy text-navy font-black'
              : 'border-transparent text-navy/50 hover:text-navy'
          }`}
        >
          Buzo con Cierre (S a XL)
        </button>
        <button
          onClick={() => setActiveTab('pantalon')}
          className={`pb-4 px-6 font-montserrat font-bold text-sm sm:text-base tracking-wider uppercase border-b-2 transition-all ${
            activeTab === 'pantalon'
              ? 'border-navy text-navy font-black'
              : 'border-transparent text-navy/50 hover:text-navy'
          }`}
        >
          Pantalón Ancho (S a XL)
        </button>
      </div>

      {/* Schematic Illustration */}
      <div className="bg-beige-100 rounded-2xl p-6 sm:p-10 border border-beige-300 mb-10 flex flex-col items-center">
        <div className="w-full max-w-md flex items-center justify-center">
          {activeTab === 'buzo' ? (
            <svg viewBox="0 0 320 240" className="w-full h-52 text-navy">
              <path
                d="M100 45 L130 50 Q160 55 190 50 L220 45 L290 90 L265 125 L230 100 L230 220 L90 220 L90 100 L55 125 L30 90 Z"
                fill="#f3eee3"
                stroke="#1F2A44"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <line x1="160" y1="52" x2="160" y2="220" stroke="#1F2A44" strokeWidth="2" strokeDasharray="3 3" />
              <path d="M125 50 Q160 20 195 50" fill="none" stroke="#1F2A44" strokeWidth="2" />
              <line x1="90" y1="130" x2="230" y2="130" stroke="#1F2A44" strokeWidth="1.5" />
              <rect x="145" y="120" width="30" height="18" fill="#1F2A44" rx="3" />
              <text x="160" y="133" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle">A</text>
              <line x1="80" y1="50" x2="80" y2="220" stroke="#1F2A44" strokeWidth="1.5" />
              <rect x="66" y="125" width="28" height="18" fill="#1F2A44" rx="3" />
              <text x="80" y="138" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle">B</text>
              <line x1="220" y1="45" x2="290" y2="90" stroke="#1F2A44" strokeWidth="1.5" />
              <rect x="250" y="55" width="20" height="18" fill="#1F2A44" rx="3" />
              <text x="260" y="68" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle">C</text>
              <line x1="130" y1="42" x2="220" y2="38" stroke="#1F2A44" strokeWidth="1.5" />
              <rect x="168" y="28" width="24" height="18" fill="#1F2A44" rx="3" />
              <text x="180" y="41" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle">D</text>
            </svg>
          ) : (
            <svg viewBox="0 0 320 240" className="w-full h-52 text-navy">
              <path
                d="M100 25 L220 25 L230 220 L175 220 L160 115 L145 220 L90 220 Z"
                fill="#f3eee3"
                stroke="#1F2A44"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <rect x="100" y="25" width="120" height="20" fill="#E2DAC9" stroke="#1F2A44" strokeWidth="1.5" />
              <line x1="95" y1="18" x2="225" y2="18" stroke="#1F2A44" strokeWidth="1.5" />
              <rect x="148" y="8" width="24" height="18" fill="#1F2A44" rx="3" />
              <text x="160" y="21" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle">A</text>
              <line x1="90" y1="230" x2="145" y2="230" stroke="#1F2A44" strokeWidth="1.5" />
              <rect x="105" y="222" width="24" height="16" fill="#1F2A44" rx="3" />
              <text x="117" y="234" fill="#FFF" fontSize="10" fontWeight="bold" textAnchor="middle">B</text>
              <line x1="75" y1="25" x2="75" y2="220" stroke="#1F2A44" strokeWidth="1.5" />
              <rect x="63" y="112" width="24" height="18" fill="#1F2A44" rx="3" />
              <text x="75" y="125" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle">C</text>
              <line x1="160" y1="25" x2="160" y2="115" stroke="#1F2A44" strokeWidth="1.5" />
              <rect x="164" y="65" width="24" height="18" fill="#1F2A44" rx="3" />
              <text x="176" y="78" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle">D</text>
            </svg>
          )}
        </div>
        <p className="text-xs text-navy/70 tracking-wider uppercase font-semibold mt-4">
          Esquema de referencia para medidas en plano
        </p>
      </div>

      {/* Exact Measurement Table */}
      <div className="bg-[#FAF7F0] rounded-2xl border border-beige-300 shadow-sm overflow-hidden mb-12">
        {activeTab === 'buzo' ? (
          <table className="w-full text-center border-collapse text-sm sm:text-base">
            <thead>
              <tr className="bg-beige-200 border-b border-beige-300 text-navy font-montserrat uppercase font-black tracking-wider">
                <th className="py-4 px-6 text-left">Talle</th>
                <th className="py-4 px-6">Ancho (A)</th>
                <th className="py-4 px-6">Largo (B)</th>
                <th className="py-4 px-6">Manga (C)</th>
                <th className="py-4 px-6">Hombro (D)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200 font-montserrat">
              {BUZO_MEASUREMENTS.map((row) => (
                <tr key={row.talle} className="hover:bg-beige-50 transition-colors">
                  <td className="py-4 px-6 font-black text-navy text-left">{row.talle}</td>
                  <td className="py-4 px-6 text-navy/80 font-medium">{row.anchoA}</td>
                  <td className="py-4 px-6 text-navy/80 font-medium">{row.largoB}</td>
                  <td className="py-4 px-6 text-navy/80 font-medium">{row.mangaC}</td>
                  <td className="py-4 px-6 text-navy/80 font-medium">{row.hombroD}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-center border-collapse text-sm sm:text-base">
            <thead>
              <tr className="bg-beige-200 border-b border-beige-300 text-navy font-montserrat uppercase font-black tracking-wider">
                <th className="py-4 px-6 text-left">Talle</th>
                <th className="py-4 px-6">Cintura (A)</th>
                <th className="py-4 px-6">Bota manga (B)</th>
                <th className="py-4 px-6">Largo (C)</th>
                <th className="py-4 px-6">Tiro (D)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200 font-montserrat">
              {PANTALON_MEASUREMENTS.map((row) => (
                <tr key={row.talle} className="hover:bg-beige-50 transition-colors">
                  <td className="py-4 px-6 font-black text-navy text-left">{row.talle}</td>
                  <td className="py-4 px-6 text-navy/80 font-medium">{row.cinturaA}</td>
                  <td className="py-4 px-6 text-navy/80 font-medium">{row.botaMangaB}</td>
                  <td className="py-4 px-6 text-navy/80 font-medium">{row.largoC}</td>
                  <td className="py-4 px-6 text-navy/80 font-medium">{row.tiroD}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Measurement Advice */}
      <div className="bg-beige-50 p-6 sm:p-8 rounded-2xl border border-beige-300">
        <h3 className="font-montserrat font-black text-lg text-navy uppercase mb-4">
          Cómo Tomar tus Medidas Correctamente
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-navy/80 font-light">
          {MEASURING_TIPS.map((tip, idx) => (
            <div key={idx} className="bg-[#FAF7F0] p-4 rounded-xl border border-beige-200">
              <strong className="block text-navy font-bold uppercase mb-1 font-montserrat">
                {tip.title}
              </strong>
              <p>{tip.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
