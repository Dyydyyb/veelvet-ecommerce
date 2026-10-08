import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { BUZO_MEASUREMENTS, PANTALON_MEASUREMENTS, MEASURING_TIPS } from '../../data/sizeGuide';
import { useUIStore } from '../../store/uiStore';

interface SizeGuideModalProps {
  initialTab?: 'buzo' | 'pantalon';
}

export function SizeGuideModal({ initialTab = 'buzo' }: SizeGuideModalProps) {
  const { isSizeGuideOpen, closeSizeGuide, sizeGuideDefaultTab } = useUIStore();
  const [activeTab, setActiveTab] = useState<'buzo' | 'pantalon'>(sizeGuideDefaultTab || initialTab);

  React.useEffect(() => {
    if (sizeGuideDefaultTab) {
      setActiveTab(sizeGuideDefaultTab);
    }
  }, [sizeGuideDefaultTab]);

  return (
    <Modal
      isOpen={isSizeGuideOpen}
      onClose={closeSizeGuide}
      title="Guía de Medidas & Talles"
      subtitle="Moldería unisex con calce boxy y relajado. Todas las medidas corresponden a la prenda en plano."
      maxWidth="2xl"
    >
      {/* Category Tabs */}
      <div className="flex border-b border-beige-300 mb-6">
        <button
          onClick={() => setActiveTab('buzo')}
          className={`pb-3 px-4 font-montserrat font-bold text-xs sm:text-sm tracking-wider uppercase border-b-2 transition-all ${
            activeTab === 'buzo'
              ? 'border-navy text-navy font-black'
              : 'border-transparent text-navy/50 hover:text-navy'
          }`}
        >
          Buzo con Cierre
        </button>
        <button
          onClick={() => setActiveTab('pantalon')}
          className={`pb-3 px-4 font-montserrat font-bold text-xs sm:text-sm tracking-wider uppercase border-b-2 transition-all ${
            activeTab === 'pantalon'
              ? 'border-navy text-navy font-black'
              : 'border-transparent text-navy/50 hover:text-navy'
          }`}
        >
          Pantalón Ancho / Wide Leg
        </button>
      </div>

      {/* Schematic Diagram & Table */}
      <div className="space-y-6">
        {/* Schematic Vector Drawing */}
        <div className="bg-beige-100/70 p-4 sm:p-6 rounded-xl border border-beige-300/80 flex flex-col items-center">
          <div className="w-full max-w-sm flex items-center justify-center">
            {activeTab === 'buzo' ? (
              /* Buzo SVG Schematic */
              <svg viewBox="0 0 320 240" className="w-full h-44 text-navy">
                {/* Silhouette */}
                <path
                  d="M100 45 L130 50 Q160 55 190 50 L220 45 L290 90 L265 125 L230 100 L230 220 L90 220 L90 100 L55 125 L30 90 Z"
                  fill="#f3eee3"
                  stroke="#1F2A44"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                {/* Zipper */}
                <line x1="160" y1="52" x2="160" y2="220" stroke="#1F2A44" strokeWidth="2" strokeDasharray="3 3" />
                {/* Hood outline */}
                <path d="M125 50 Q160 20 195 50" fill="none" stroke="#1F2A44" strokeWidth="2" />
                {/* Pockets */}
                <path d="M115 170 L145 170 L145 210 L115 210 Z" fill="#E2DAC9" stroke="#1F2A44" strokeWidth="1.5" />
                <path d="M175 170 L205 170 L205 210 L175 210 Z" fill="#E2DAC9" stroke="#1F2A44" strokeWidth="1.5" />

                {/* Dimension Arrows */}
                {/* A: Ancho */}
                <line x1="90" y1="130" x2="230" y2="130" stroke="#1F2A44" strokeWidth="1.5" markerEnd="url(#arrow)" />
                <rect x="145" y="120" width="30" height="18" fill="#1F2A44" rx="3" />
                <text x="160" y="133" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle">A</text>

                {/* B: Largo */}
                <line x1="80" y1="50" x2="80" y2="220" stroke="#1F2A44" strokeWidth="1.5" />
                <rect x="66" y="125" width="28" height="18" fill="#1F2A44" rx="3" />
                <text x="80" y="138" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle">B</text>

                {/* C: Manga */}
                <line x1="220" y1="45" x2="290" y2="90" stroke="#1F2A44" strokeWidth="1.5" />
                <rect x="250" y="55" width="20" height="18" fill="#1F2A44" rx="3" />
                <text x="260" y="68" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle">C</text>

                {/* D: Hombro */}
                <line x1="130" y1="42" x2="220" y2="38" stroke="#1F2A44" strokeWidth="1.5" />
                <rect x="168" y="28" width="24" height="18" fill="#1F2A44" rx="3" />
                <text x="180" y="41" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle">D</text>
              </svg>
            ) : (
              /* Pantalón SVG Schematic */
              <svg viewBox="0 0 320 240" className="w-full h-44 text-navy">
                {/* Silhouette */}
                <path
                  d="M100 25 L220 25 L230 220 L175 220 L160 115 L145 220 L90 220 Z"
                  fill="#f3eee3"
                  stroke="#1F2A44"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                {/* Waistband */}
                <rect x="100" y="25" width="120" height="20" fill="#E2DAC9" stroke="#1F2A44" strokeWidth="1.5" />
                {/* Drawstrings */}
                <path d="M155 45 Q153 75 145 85" stroke="#1F2A44" strokeWidth="2" fill="none" />
                <path d="M165 45 Q167 75 175 85" stroke="#1F2A44" strokeWidth="2" fill="none" />

                {/* Dimension Arrows */}
                {/* A: Cintura */}
                <line x1="95" y1="18" x2="225" y2="18" stroke="#1F2A44" strokeWidth="1.5" />
                <rect x="148" y="8" width="24" height="18" fill="#1F2A44" rx="3" />
                <text x="160" y="21" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle">A</text>

                {/* B: Bota manga */}
                <line x1="90" y1="230" x2="145" y2="230" stroke="#1F2A44" strokeWidth="1.5" />
                <rect x="105" y="222" width="24" height="16" fill="#1F2A44" rx="3" />
                <text x="117" y="234" fill="#FFF" fontSize="10" fontWeight="bold" textAnchor="middle">B</text>

                {/* C: Largo */}
                <line x1="75" y1="25" x2="75" y2="220" stroke="#1F2A44" strokeWidth="1.5" />
                <rect x="63" y="112" width="24" height="18" fill="#1F2A44" rx="3" />
                <text x="75" y="125" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle">C</text>

                {/* D: Tiro */}
                <line x1="160" y1="25" x2="160" y2="115" stroke="#1F2A44" strokeWidth="1.5" />
                <rect x="164" y="65" width="24" height="18" fill="#1F2A44" rx="3" />
                <text x="176" y="78" fill="#FFF" fontSize="11" fontWeight="bold" textAnchor="middle">D</text>
              </svg>
            )}
          </div>
          <p className="text-[11px] text-navy/70 tracking-wider uppercase font-semibold mt-2">
            Referencias: {activeTab === 'buzo' ? 'A = Ancho • B = Largo • C = Manga • D = Hombro' : 'A = Cintura • B = Bota manga • C = Largo • D = Tiro'}
          </p>
        </div>

        {/* Exact Table */}
        <div className="overflow-x-auto">
          {activeTab === 'buzo' ? (
            <table className="w-full text-center border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-beige-200 border-b border-beige-300 text-navy font-montserrat uppercase font-black tracking-wider">
                  <th className="py-3 px-4 text-left">Talle</th>
                  <th className="py-3 px-4">Ancho (A)</th>
                  <th className="py-3 px-4">Largo (B)</th>
                  <th className="py-3 px-4">Manga (C)</th>
                  <th className="py-3 px-4">Hombro (D)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-200 font-montserrat">
                {BUZO_MEASUREMENTS.map((row) => (
                  <tr key={row.talle} className="hover:bg-beige-50 transition-colors">
                    <td className="py-3.5 px-4 font-black text-navy text-left">{row.talle}</td>
                    <td className="py-3.5 px-4 text-navy/80 font-medium">{row.anchoA}</td>
                    <td className="py-3.5 px-4 text-navy/80 font-medium">{row.largoB}</td>
                    <td className="py-3.5 px-4 text-navy/80 font-medium">{row.mangaC}</td>
                    <td className="py-3.5 px-4 text-navy/80 font-medium">{row.hombroD}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-center border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-beige-200 border-b border-beige-300 text-navy font-montserrat uppercase font-black tracking-wider">
                  <th className="py-3 px-4 text-left">Talle</th>
                  <th className="py-3 px-4">Cintura (A)</th>
                  <th className="py-3 px-4">Bota manga (B)</th>
                  <th className="py-3 px-4">Largo (C)</th>
                  <th className="py-3 px-4">Tiro (D)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-200 font-montserrat">
                {PANTALON_MEASUREMENTS.map((row) => (
                  <tr key={row.talle} className="hover:bg-beige-50 transition-colors">
                    <td className="py-3.5 px-4 font-black text-navy text-left">{row.talle}</td>
                    <td className="py-3.5 px-4 text-navy/80 font-medium">{row.cinturaA}</td>
                    <td className="py-3.5 px-4 text-navy/80 font-medium">{row.botaMangaB}</td>
                    <td className="py-3.5 px-4 text-navy/80 font-medium">{row.largoC}</td>
                    <td className="py-3.5 px-4 text-navy/80 font-medium">{row.tiroD}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Measuring Tips Box */}
        <div className="bg-beige-50 p-4 rounded-xl border border-beige-300/80">
          <p className="text-xs font-bold font-montserrat uppercase tracking-wider text-navy mb-2">
            Consejo de calce:
          </p>
          <ul className="space-y-1.5 text-xs text-navy/80 font-light">
            {MEASURING_TIPS.map((tip, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-navy font-bold">•</span>
                <span><strong>{tip.title}:</strong> {tip.description}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
}
