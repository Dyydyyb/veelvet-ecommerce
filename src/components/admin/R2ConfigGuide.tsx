import React, { useState } from 'react';
import { Database, Cloud, ShieldAlert, Copy, Check, Sparkles } from 'lucide-react';
import { SupabaseService } from '../../services/supabaseService';

interface R2ConfigGuideProps {
  onRefresh: () => Promise<void>;
}

export function R2ConfigGuide({ onRefresh }: R2ConfigGuideProps) {
  const [copied, setCopied] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{ success: boolean; message: string } | null>(null);

  const rlsSql = `-- 1. Habilitar permisos de lectura y escritura (desactivar RLS):
ALTER TABLE IF EXISTS categorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subcategorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tipos_oferta DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS productos DISABLE ROW LEVEL SECURITY;

-- 2. Asegurar columnas de destacado en categorías y productos:
ALTER TABLE IF EXISTS categorias ADD COLUMN IF NOT EXISTS destacada boolean DEFAULT false;
ALTER TABLE IF EXISTS productos ADD COLUMN IF NOT EXISTS destacado boolean DEFAULT false;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(rlsSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSeed = async () => {
    if (!window.confirm('¿Deseás cargar los datos iniciales de Veelvet (Categorías Top/Bottom/Accesorios, subcategorías y prendas base) en Supabase?')) {
      return;
    }
    try {
      setIsSeeding(true);
      setSeedResult(null);
      const res = await SupabaseService.seedInitialData();
      setSeedResult(res);
      await onRefresh();
    } catch (err: any) {
      setSeedResult({ success: false, message: err.message || 'Error al sembrar datos.' });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* 1. Quick Data Seed Box */}
      <div className="bg-gradient-to-r from-navy to-navy-500 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-beige-200 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sembrador Automático</span>
          </span>
          <h3 className="font-montserrat font-black text-xl uppercase tracking-tight">
            Poblar base de datos inicial de Veelvet
          </h3>
          <p className="text-xs text-beige-200/80 font-light mt-1 max-w-lg leading-relaxed">
            Inserta las categorías oficiales (Top, Bottom, Accesorios), todas las subcategorías (Camperas, Remeras, Cargos, Hoodies, etc.), tipos de oferta y los productos insignia con un solo clic.
          </p>
          {seedResult && (
            <p className={`text-xs mt-3 font-semibold ${seedResult.success ? 'text-green-300' : 'text-amber-300'}`}>
              {seedResult.message}
            </p>
          )}
        </div>

        <button
          onClick={handleSeed}
          disabled={isSeeding}
          className="flex-shrink-0 bg-white hover:bg-beige-100 text-navy font-montserrat font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
        >
          {isSeeding ? 'Sembrando datos...' : 'Cargar Datos Iniciales'}
        </button>
      </div>

      {/* 2. Supabase Connection Status & RLS Helper */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-beige-300 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-montserrat font-black text-base uppercase text-navy">
                Conexión con Supabase
              </h3>
              <p className="text-xs text-navy/60 font-light font-mono">
                Proyecto: ikuwvjvhtbouafjayrvj.supabase.co
              </p>
            </div>
          </div>
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Activo</span>
          </span>
        </div>

        {/* RLS Policy instructions */}
        <div className="mt-4 p-4 bg-beige-50 rounded-xl border border-beige-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase text-navy">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Habilitar permisos de lectura y escritura (RLS)</span>
            </div>
            <button
              onClick={handleCopySql}
              className="inline-flex items-center space-x-1 text-xs text-navy hover:text-navy-500 font-semibold bg-white border border-beige-300 px-2.5 py-1 rounded-md transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar SQL'}</span>
            </button>
          </div>
          <p className="text-xs text-navy/70 font-light leading-relaxed">
            Si al crear o editar productos recibís el error de Supabase <em>"violates row-level security policy"</em>, ejecutá este comando de una sola vez en el <strong>SQL Editor</strong> de tu panel de Supabase:
          </p>
          <pre className="text-[11px] font-mono bg-navy text-beige-100 p-3 rounded-lg overflow-x-auto">
            {rlsSql}
          </pre>
        </div>
      </div>

      {/* 3. Cloudflare R2 Guide */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-beige-300 shadow-xs space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-montserrat font-black text-base uppercase text-navy">
              Alojamiento de Fotos en Cloudflare R2
            </h3>
            <p className="text-xs text-navy/60 font-light">
              Cómo subir y conectar las imágenes públicas en este panel de administración.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs text-navy">
          <div className="p-4 bg-beige-50/80 rounded-xl border border-beige-200 space-y-1.5">
            <strong className="block font-montserrat uppercase font-bold text-navy">1. Subir al Bucket</strong>
            <p className="text-navy/70 font-light">
              Subí tus fotos (.jpg o .webp) a tu Bucket de Cloudflare R2 (ej: <code>veelvet-media</code>).
            </p>
          </div>
          <div className="p-4 bg-beige-50/80 rounded-xl border border-beige-200 space-y-1.5">
            <strong className="block font-montserrat uppercase font-bold text-navy">2. Obtener URL Pública</strong>
            <p className="text-navy/70 font-light">
              Copiá el enlace público del archivo (ej: <code>https://pub-xxxx.r2.dev/foto.jpg</code> o tu dominio personalizado).
            </p>
          </div>
          <div className="p-4 bg-beige-50/80 rounded-xl border border-beige-200 space-y-1.5">
            <strong className="block font-montserrat uppercase font-bold text-navy">3. Pegar en el Producto</strong>
            <p className="text-navy/70 font-light">
              Pegá la URL en el formulario de la prenda en la pestaña "Productos". Se guardará en formato JSON y se mostrará al instante.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
