import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

export function Toast() {
  const { toastMessage, toastType, hideToast } = useUIStore();

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="fixed bottom-6 right-6 z-[10000] flex items-center space-x-3 bg-navy text-white px-4 py-3.5 rounded-xl shadow-2xl border border-beige-300/30 max-w-sm"
        >
          {toastType === 'success' && <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />}
          {toastType === 'error' && <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
          {toastType === 'info' && <Info className="w-5 h-5 text-beige-300 flex-shrink-0" />}

          <span className="text-xs font-montserrat font-medium leading-tight flex-1">
            {toastMessage}
          </span>

          <button
            onClick={hideToast}
            className="text-white/60 hover:text-white p-1 transition-colors"
            aria-label="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
