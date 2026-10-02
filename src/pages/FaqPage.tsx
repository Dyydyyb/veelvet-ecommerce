import React, { useState } from 'react';
import { SectionTitle } from '../components/common/SectionTitle';
import { Accordion } from '../components/common/Accordion';
import { FAQ_ITEMS } from '../data/faq';
import { MessageCircle, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function FaqPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const categories = [
    { id: 'todos', name: 'Todas' },
    { id: 'showroom', name: 'Showroom Quilmes' },
    { id: 'productos', name: 'Prendas & Talles' },
    { id: 'compras', name: 'Compras & Pagos' },
    { id: 'envios', name: 'Envíos' },
  ];

  const filteredItems = FAQ_ITEMS.filter((item) =>
    selectedCategory === 'todos' ? true : item.category === selectedCategory
  ).map((item) => ({
    id: item.id,
    title: item.question,
    content: item.answer,
  }));

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto min-h-screen">
      <SectionTitle
        overline="Centro de Ayuda"
        title="Preguntas Frecuentes"
        subtitle="Respuestas claras a las dudas más habituales sobre nuestras prendas unisex, showroom en Quilmes, envíos y formas de pago."
        align="center"
      />

      {/* Category Filter Pills */}
      <div className="flex items-center justify-center space-x-2 overflow-x-auto pb-4 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`text-xs font-montserrat font-bold uppercase tracking-wider px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-navy text-white shadow-xs'
                : 'bg-beige-100 text-navy hover:bg-beige-200 border border-beige-300'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="mb-16">
        <Accordion items={filteredItems} allowMultiple={false} defaultOpenId="faq-01" />
      </div>

      {/* Contact Prompt */}
      <div className="bg-beige-100 rounded-3xl p-8 sm:p-10 border border-beige-300 text-center max-w-xl mx-auto">
        <HelpCircle className="w-10 h-10 text-navy mx-auto mb-3" />
        <h3 className="font-montserrat font-black text-xl text-navy uppercase">
          ¿Tenés otra duda?
        </h3>
        <p className="text-xs sm:text-sm text-navy/70 font-light mt-1 mb-6">
          Escribinos directamente a nuestro equipo de atención y te responderemos en el día.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="https://wa.me/5491100000000?text=Hola%20Veelvet!%20Tengo%20una%20consulta"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-navy text-white px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-navy-500 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Hablar por WhatsApp</span>
          </a>
          <Link
            to="/showroom"
            className="w-full sm:w-auto inline-flex items-center justify-center text-xs font-bold uppercase tracking-wider bg-white text-navy px-6 py-3 rounded-lg border border-beige-300 hover:bg-beige-50 transition-colors"
          >
            Reservar Showroom
          </Link>
        </div>
      </div>
    </div>
  );
}
