import React, { useState, useEffect, useCallback } from 'react';
import { PeriodonState } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  X, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw,
  Sparkles,
  Check
} from 'lucide-react';

interface FastProbingBarProps {
  isActive: boolean;
  onClose: () => void;
  periodontogram: Record<number, PeriodonState>;
  onUpdatePeriodontogram: (updated: Record<number, PeriodonState>) => void;
}

// All FDI adult teeth in standard probing sequence
const PROBING_SEQUENCE = [
  // Upper Right (18 to 11)
  18, 17, 16, 15, 14, 13, 12, 11,
  // Upper Left (21 to 28)
  21, 22, 23, 24, 25, 26, 27, 28,
  // Lower Left (38 to 31)
  38, 37, 36, 35, 34, 33, 32, 31,
  // Lower Right (41 to 48)
  41, 42, 43, 44, 45, 46, 47, 48
];

type ArchAspect = 'vestibular' | 'palatino';
type SitePos = 'mesial' | 'central' | 'distal';

export default function FastProbingBar({
  isActive,
  onClose,
  periodontogram,
  onUpdatePeriodontogram
}: FastProbingBarProps) {
  const [toothIdx, setToothIdx] = useState<number>(0);
  const [aspect, setAspect] = useState<ArchAspect>('vestibular');
  const [site, setSite] = useState<SitePos>('mesial');
  const [audioFeedback, setAudioFeedback] = useState<boolean>(true);

  const currentToothNumber = PROBING_SEQUENCE[toothIdx] || 18;

  // Sound generator using Web Audio API
  const playBeep = useCallback((freq = 600, duration = 0.08) => {
    if (!audioFeedback) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio not supported or blocked
    }
  }, [audioFeedback]);

  // Advance site position
  const advancePosition = useCallback(() => {
    if (site === 'mesial') {
      setSite('central');
    } else if (site === 'central') {
      setSite('distal');
    } else {
      // Move to next aspect or next tooth
      setSite('mesial');
      if (aspect === 'vestibular') {
        setAspect('palatino');
      } else {
        setAspect('vestibular');
        setToothIdx(prev => (prev < PROBING_SEQUENCE.length - 1 ? prev + 1 : 0));
      }
    }
  }, [site, aspect]);

  // Apply a pocket depth value to current position
  const applyValue = useCallback((val: number) => {
    const toothNum = PROBING_SEQUENCE[toothIdx];
    if (!toothNum) return;

    const currentToothState = periodontogram[toothNum] || {
      toothNumber: toothNum,
      vestibularPocket: { mesial: 2, central: 2, distal: 2 },
      palatinoPocket: { mesial: 2, central: 2, distal: 2 },
      vestibularRecess: { mesial: 0, central: 0, distal: 0 },
      palatinoRecess: { mesial: 0, central: 0, distal: 0 },
      sangradoVestibular: { mesial: false, central: false, distal: false },
      sangradoPalatino: { mesial: false, central: false, distal: false },
      supuracionVestibular: { mesial: false, central: false, distal: false },
      supuracionPalatino: { mesial: false, central: false, distal: false },
      placaVestibular: { mesial: false, central: false, distal: false },
      placaPalatino: { mesial: false, central: false, distal: false },
      movilidad: 0,
      furca: 0
    };

    const updatedTooth = { ...currentToothState };
    if (aspect === 'vestibular') {
      updatedTooth.vestibularPocket = {
        ...updatedTooth.vestibularPocket,
        [site]: val
      };
    } else {
      updatedTooth.palatinoPocket = {
        ...updatedTooth.palatinoPocket,
        [site]: val
      };
    }

    onUpdatePeriodontogram({
      ...periodontogram,
      [toothNum]: updatedTooth
    });

    // Pitch higher if deep pocket (>=4mm) to signal pathology
    playBeep(val >= 4 ? 850 : 550, 0.08);
    advancePosition();
  }, [toothIdx, aspect, site, periodontogram, onUpdatePeriodontogram, playBeep, advancePosition]);

  // Physical Keyboard listener
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user pressed 0-9
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        applyValue(parseInt(e.key, 10));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        advancePosition();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        // Go back
        if (site === 'distal') setSite('central');
        else if (site === 'central') setSite('mesial');
        else {
          setSite('distal');
          if (aspect === 'palatino') setAspect('vestibular');
          else {
            setAspect('palatino');
            setToothIdx(prev => Math.max(0, prev - 1));
          }
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, applyValue, advancePosition, site, aspect, onClose]);

  if (!isActive) return null;

  // Get current value
  const currentTooth = periodontogram[currentToothNumber];
  const currentValue = currentTooth
    ? (aspect === 'vestibular' ? currentTooth.vestibularPocket?.[site] : currentTooth.palatinoPocket?.[site]) ?? 2
    : 2;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl bg-slate-900/95 border border-teal-500/40 text-white rounded-3xl p-4 shadow-2xl backdrop-blur-md no-print"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/20 text-amber-400 rounded-xl">
              <Zap className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-teal-400">Modo Sondaje Teclado Rápido</span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">(Escribe 0-9 en tu teclado)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAudioFeedback(!audioFeedback)}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                audioFeedback ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-800 text-slate-500'
              }`}
              title="Sonido de confirmación"
            >
              {audioFeedback ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Target Visualizer */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 mb-3 text-center">
          <div>
            <div className="text-[10px] uppercase text-slate-400 font-semibold">Pieza Dental</div>
            <div className="text-2xl font-black text-teal-400 font-mono">FDI {currentToothNumber}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-slate-400 font-semibold">Cara / Posición</div>
            <div className="text-sm font-bold text-amber-300 capitalize mt-1">
              {aspect} — <span className="underline">{site}</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-slate-400 font-semibold">Profundidad Actual</div>
            <div className={`text-2xl font-black font-mono ${currentValue >= 4 ? 'text-red-400' : 'text-emerald-400'}`}>
              {currentValue} mm
            </div>
          </div>
        </div>

        {/* Quick Number Pad Inputs */}
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(num => (
            <button
              key={num}
              onClick={() => applyValue(num)}
              className={`flex-1 min-w-[38px] py-2.5 rounded-xl font-mono text-base font-bold shadow-xs transition-all active:scale-95 ${
                num >= 4
                  ? 'bg-red-950/80 hover:bg-red-800 border border-red-700/60 text-red-200'
                  : 'bg-teal-950/80 hover:bg-teal-800 border border-teal-700/60 text-teal-200'
              }`}
            >
              {num}
            </button>
          ))}
          
          <button
            onClick={advancePosition}
            className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 text-slate-300"
          >
            Saltar <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
