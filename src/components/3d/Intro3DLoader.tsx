import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, useProgress, Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { VeelvetModel } from './VeelvetModel';

interface IntroLoaderProps {
  onFinish?: () => void;
}

export function Intro3DLoader({ onFinish }: IntroLoaderProps) {
  const { progress } = useProgress();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isCurtainOpen, setIsCurtainOpen] = useState(false);
  const [hasWebGLError, setHasWebGLError] = useState(false);
  const [displayPercent, setDisplayPercent] = useState(0);

  // Garantizar que en celulares y en primer inicio el logo 3D se aprecie con suficiente tiempo (1.2s)
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Progreso suave y rápido
  useEffect(() => {
    const target = Math.max(progress, minTimeElapsed ? 100 : Math.min(95, Math.floor(displayPercent + 8)));
    const interval = setInterval(() => {
      setDisplayPercent((prev) => {
        if (prev < target) return Math.min(target, prev + 4);
        return prev;
      });
    }, 15);
    return () => clearInterval(interval);
  }, [progress, minTimeElapsed, displayPercent]);

  // Al completar tiempo y carga -> burst y apertura de cortinas
  useEffect(() => {
    if (minTimeElapsed && (progress >= 100 || displayPercent >= 100)) {
      setIsFinishing(true);
      const burstTimer = setTimeout(() => {
        setIsCurtainOpen(true);
        if (onFinish) onFinish();
      }, 300);

      return () => clearTimeout(burstTimer);
    }
  }, [minTimeElapsed, progress, displayPercent, onFinish]);

  // Permitir saltar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCurtainOpen(true);
        if (onFinish) onFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {!isCurtainOpen && (
        <div className="fixed inset-0 z-[9999] pointer-events-auto flex items-center justify-center overflow-hidden">
          {/* Left Curtain */}
          <motion.div
            initial={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.6, ease: [0.77, 0, 0.175, 1] }}
            className="absolute top-0 left-0 w-1/2 h-full bg-[#f3eee3] border-r border-[#E2DAC9]/60 shadow-2xl z-10"
          />

          {/* Right Curtain */}
          <motion.div
            initial={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.6, ease: [0.77, 0, 0.175, 1] }}
            className="absolute top-0 right-0 w-1/2 h-full bg-[#f3eee3] border-l border-[#E2DAC9]/60 shadow-2xl z-10"
          />

          {/* Center Stage & 3D Model */}
          <motion.div
            exit={{ opacity: 0, scale: 1.15, transition: { duration: 0.5 } }}
            className="relative z-20 flex flex-col items-center justify-center w-full h-full max-w-xl px-6"
          >
            {/* 3D Canvas or Fallback */}
            <div className="w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 relative flex items-center justify-center">
              {!hasWebGLError ? (
                <ErrorBoundary onCatch={() => setHasWebGLError(true)}>
                  <Canvas
                    camera={{ position: [0, 0, 4.5], fov: 42 }}
                    shadows
                    dpr={[1, 2]}
                    gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                    className="w-full h-full"
                  >
                    <ambientLight intensity={0.9} />
                    <directionalLight position={[4, 7, 5]} intensity={1.8} castShadow />
                    <directionalLight position={[-4, -2, -3]} intensity={0.8} />
                    <pointLight position={[0, 3, 2]} intensity={0.6} />

                    <Suspense
                      fallback={
                        <Html center>
                          <div className="flex flex-col items-center justify-center pointer-events-none select-none">
                            <img
                              src="/assets/logo.png"
                              alt="Cargando Veelvet..."
                              className="w-48 h-auto object-contain animate-[spin_3s_linear_infinite] drop-shadow-xl"
                            />
                          </div>
                        </Html>
                      }
                    >
                      <VeelvetModel speed={1.8} isFinishing={isFinishing} scale={1.2} />
                      <ContactShadows
                        position={[0, -1.35, 0]}
                        opacity={0.45}
                        scale={5}
                        blur={2.2}
                        far={3}
                        color="#1F2A44"
                      />
                    </Suspense>
                  </Canvas>
                </ErrorBoundary>
              ) : (
                /* Fallback SVG 3D-effect spinner */
                <div className="flex flex-col items-center justify-center">
                  <img
                    src="/assets/logo.png"
                    alt="Veelvet Logo"
                    className="w-48 h-auto object-contain animate-[spin_3s_linear_infinite]"
                  />
                </div>
              )}
            </div>

            {/* Progress UI */}
            <div className="w-64 max-w-full flex flex-col items-center space-y-3 mt-4">
              {/* Thin blue progress bar */}
              <div className="w-full h-[2px] bg-[#E2DAC9] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-navy transition-all duration-150 ease-out"
                  style={{ width: `${Math.min(100, displayPercent)}%` }}
                />
              </div>

              {/* Text & Percentage */}
              <div className="w-full flex items-center justify-between text-xs tracking-wider uppercase font-montserrat text-navy font-semibold">
                <span className="opacity-90">Simplemente Veelvet.</span>
                <span className="font-mono text-[11px] opacity-75">{Math.min(100, displayPercent)}%</span>
              </div>
            </div>

            {/* Subtle skip button */}
            <button
              onClick={() => {
                setIsCurtainOpen(true);
                if (onFinish) onFinish();
              }}
              className="mt-6 text-[10px] tracking-widest uppercase text-navy/40 hover:text-navy transition-colors duration-200 py-1 px-3 border border-navy/10 rounded-full"
              aria-label="Saltar introducción"
            >
              Saltar intro (ESC)
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onCatch: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onCatch: () => void }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.warn('3D Canvas encountered an issue, falling back to SVG:', error);
    this.props.onCatch();
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
