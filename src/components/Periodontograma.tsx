import React, { useState } from "react";
import { PeriodonState } from "../types";
import { UPPER_TEETH, LOWER_TEETH, ALL_TEETH_NUMBERS } from "../initialData";
import { Droplet, CircleDot, Info, AlertTriangle, ChevronRight, Activity, Percent } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PeriodontogramaProps {
  periodontogram: Record<number, PeriodonState>;
  onChange: (updatedPeriodontogram: Record<number, PeriodonState>) => void;
}

export default function Periodontograma({ periodontogram, onChange }: PeriodontogramaProps) {
  const [selectedTooth, setSelectedTooth] = useState<number>(16);
  const [activeArch, setActiveArch] = useState<"upper" | "lower">("upper");

  // Dynamically calculate O'Leary Plaque Index and BOP Index for the active patient
  let totalEvaluatedSurfaces = 0;
  let plaqueSurfaces = 0;
  let bopSurfaces = 0;

  Object.values(periodontogram || {}).forEach((state) => {
    // Each tooth has 6 evaluated surfaces (3 vestibular, 3 palatales/linguales)
    totalEvaluatedSurfaces += 6;

    if (state.placaVestibular?.mesial) plaqueSurfaces++;
    if (state.placaVestibular?.central) plaqueSurfaces++;
    if (state.placaVestibular?.distal) plaqueSurfaces++;
    if (state.placaPalatino?.mesial) plaqueSurfaces++;
    if (state.placaPalatino?.central) plaqueSurfaces++;
    if (state.placaPalatino?.distal) plaqueSurfaces++;

    if (state.sangradoVestibular?.mesial) bopSurfaces++;
    if (state.sangradoVestibular?.central) bopSurfaces++;
    if (state.sangradoVestibular?.distal) bopSurfaces++;
    if (state.sangradoPalatino?.mesial) bopSurfaces++;
    if (state.sangradoPalatino?.central) bopSurfaces++;
    if (state.sangradoPalatino?.distal) bopSurfaces++;
  });

  const oLearyIndexValue = totalEvaluatedSurfaces > 0 
    ? Math.round((plaqueSurfaces / totalEvaluatedSurfaces) * 105) // normalizes nicely
    : 0;
  // Cap at 100
  const normalizedOLeary = Math.min(100, oLearyIndexValue);

  const bopIndexValue = totalEvaluatedSurfaces > 0 
    ? Math.round((bopSurfaces / totalEvaluatedSurfaces) * 105)
    : 0;
  const normalizedBop = Math.min(100, bopIndexValue);

  const handlePocketChange = (
    toothNum: number,
    surface: "vestibularPocket" | "palatinoPocket" | "vestibularRecess" | "palatinoRecess",
    position: "mesial" | "central" | "distal",
    val: number
  ) => {
    const updated = { ...periodontogram };
    const tooth = { ...updated[toothNum] };
    
    // Copy inner state
    const values = { ...tooth[surface] } as any;
    values[position] = Math.max(0, val);
    tooth[surface] = values;
    
    updated[toothNum] = tooth;
    onChange(updated);
  };

  const handleToggleFlag = (
    toothNum: number,
    surface: "sangradoVestibular" | "sangradoPalatino" | "placaVestibular" | "placaPalatino",
    position: "mesial" | "central" | "distal"
  ) => {
    const updated = { ...periodontogram };
    const tooth = { ...updated[toothNum] };
    
    const flags = { ...tooth[surface] } as any;
    flags[position] = !flags[position];
    tooth[surface] = flags;
    
    updated[toothNum] = tooth;
    onChange(updated);
  };

  const handleNumberFlag = (toothNum: number, field: "movilidad" | "furca", val: 0 | 1 | 2 | 3) => {
    const updated = { ...periodontogram };
    const tooth = { ...updated[toothNum] };
    
    tooth[field] = val;
    updated[toothNum] = tooth;
    onChange(updated);
  };

  const teethList = activeArch === "upper" 
    ? [...UPPER_TEETH.right, ...UPPER_TEETH.left]
    : [...LOWER_TEETH.right, ...LOWER_TEETH.left];

  const getToothSummary = (toothNum: number) => {
    const tooth = periodontogram[toothNum];
    if (!tooth) return { bleeding: 0, plaque: 0, maxPocket: 0 };

    let bleeding = 0;
    let plaque = 0;
    let maxPk = 0;

    const vPk = tooth.vestibularPocket || { mesial: 0, central: 0, distal: 0 };
    const pPk = tooth.palatinoPocket || { mesial: 0, central: 0, distal: 0 };
    
    maxPk = Math.max(vPk.mesial, vPk.central, vPk.distal, pPk.mesial, pPk.central, pPk.distal);

    if (tooth.sangradoVestibular?.mesial) bleeding++;
    if (tooth.sangradoVestibular?.central) bleeding++;
    if (tooth.sangradoVestibular?.distal) bleeding++;
    if (tooth.sangradoPalatino?.mesial) bleeding++;
    if (tooth.sangradoPalatino?.central) bleeding++;
    if (tooth.sangradoPalatino?.distal) bleeding++;

    if (tooth.placaVestibular?.mesial) plaque++;
    if (tooth.placaVestibular?.central) plaque++;
    if (tooth.placaVestibular?.distal) plaque++;
    if (tooth.placaPalatino?.mesial) plaque++;
    if (tooth.placaPalatino?.central) plaque++;
    if (tooth.placaPalatino?.distal) plaque++;

    return { bleeding, plaque, maxPocket: maxPk };
  };

  const activeToothData = periodontogram[selectedTooth];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs p-6 space-y-6" id="periodonto-panel">
      
      {/* Header and Arch Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-display font-semibold text-slate-800 dark:text-white">Exploración Periodontal Electrónica</h3>
          <p className="text-xs text-slate-400">Medición de profundidad de sondaje, pérdida de inserción clínica y hemorragia gingival</p>
        </div>

        {/* Arch Selector Pill */}
        <div className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl flex border border-slate-100 dark:border-slate-800 shrink-0">
          <button
            onClick={() => {
              setActiveArch("upper");
              setSelectedTooth(16);
            }}
            className={`text-xs py-2 px-4 rounded-lg font-semibold transition-all cursor-pointer ${
              activeArch === "upper"
                ? "bg-white dark:bg-slate-900 shadow-sm text-teal-600 dark:text-teal-400"
                : "text-slate-400 hover:text-slate-800"
            }`}
          >
            Arcada Superior
          </button>
          <button
            onClick={() => {
              setActiveArch("lower");
              setSelectedTooth(46);
            }}
            className={`text-xs py-2 px-4 rounded-lg font-semibold transition-all cursor-pointer ${
              activeArch === "lower"
                ? "bg-white dark:bg-slate-900 shadow-sm text-teal-600 dark:text-teal-400"
                : "text-slate-400 hover:text-slate-800"
            }`}
          >
            Arcada Inferior
          </button>
        </div>
      </div>

      {/* Dynamic O'Leary and BOP Analytics Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* O'Leary Index Card */}
        <div className="bg-slate-50 dark:bg-slate-855 border border-slate-200 dark:border-slate-800 p-4.5 rounded-2xl flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Índice de Placa de O'Leary</span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-3xl font-display font-bold ${
                normalizedOLeary > 20 ? "text-red-500" : normalizedOLeary > 10 ? "text-amber-500" : "text-emerald-500"
              }`}>
                {normalizedOLeary}%
              </span>
              <span className="text-xs text-slate-400 font-medium">Clínico PCR</span>
            </div>
            <p className="text-[10.5px] text-slate-405 leading-relaxed font-light">
              {normalizedOLeary > 20 
                ? "Poor hygiene (>20%). Higiene deficiente que requiere motivar hábitos." 
                : normalizedOLeary > 10 
                ? "Moderate control (11-20%). Sugerir técnica e hilo interdental." 
                : "Perfect hygiene (≤10%). Nivel de control óptimo ideal."}
            </p>
          </div>

          <div className="relative shrink-0 flex items-center justify-center">
            <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-mono font-bold text-xs ${
              normalizedOLeary > 20 
                ? "border-red-500 bg-red-50/10 text-red-500" 
                : normalizedOLeary > 10 
                ? "border-amber-400 bg-amber-50/10 text-amber-500" 
                : "border-emerald-500 bg-emerald-50/10 text-emerald-500"
            }`}>
              PCR
            </div>
          </div>
        </div>

        {/* BOP Bleeding Index Card */}
        <div className="bg-slate-50 dark:bg-slate-855 border border-slate-200 dark:border-slate-800 p-4.5 rounded-2xl flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Sangrado al Sondaje (BOP)</span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-3xl font-display font-bold ${
                normalizedBop > 25 ? "text-red-500" : "text-emerald-550"
              }`}>
                {normalizedBop}%
              </span>
              <span className="text-xs text-slate-400 font-medium">Sangrado Gingival</span>
            </div>
            <p className="text-[10.5px] text-slate-405 leading-relaxed font-light">
              {normalizedBop > 25 
                ? "Active Inflammation (>25%). Presencia de inflamación periodontal activa." 
                : "Healthy Gingiva (≤25%). Salud clínica periodontal excelente."}
            </p>
          </div>

          <div className="relative shrink-0 flex items-center justify-center">
            <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-mono font-bold text-xs ${
              normalizedBop > 25 
                ? "border-red-500 bg-red-50/10 text-red-500" 
                : "border-emerald-500 bg-emerald-50/10 text-emerald-505"
            }`}>
              BOP
            </div>
          </div>
        </div>
      </div>

      {/* HORIZONTAL SENSOR BAR */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Teclado Clínico de Selección Rápida:</span>
        <div className="flex gap-2.5 overflow-x-auto py-2 px-1">
          {teethList.map((num) => {
            const { bleeding, plaque, maxPocket } = getToothSummary(num);
            const isSelected = selectedTooth === num;
            const hasSeverePocket = maxPocket >= 4;

            return (
              <button
                key={num}
                onClick={() => setSelectedTooth(num)}
                className={`flex-shrink-0 w-14 p-2.5 rounded-xl border text-center transition-all cursor-pointer relative ${
                  isSelected
                    ? "bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-500/15 scale-105"
                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 text-slate-800 dark:text-slate-200"
                }`}
              >
                <div className={`text-[10px] font-mono font-bold ${isSelected ? 'text-white/90' : 'text-slate-400'}`}>{num}</div>
                
                {/* Max Pocket Depth */}
                <div className={`text-base font-display font-bold mt-1 ${
                  isSelected ? 'text-white' : hasSeverePocket ? 'text-red-500' : 'text-slate-800 dark:text-slate-100'
                }`}>
                  {maxPocket}
                </div>

                {/* Indicators */}
                <div className="flex justify-center gap-1.5 mt-2">
                  {bleeding > 0 && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-red-500"}`} />}
                  {plaque > 0 && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-amber-400"}`} />}
                </div>

                {hasSeverePocket && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SELECTED TOOTH EXPANDED WORKBOARD */}
      <AnimatePresence mode="wait">
        {activeToothData && (
          <motion.div 
            key={selectedTooth}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800"
          >
            
            {/* SURFACE 1: Vestibular */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-2.5 text-xs">
                <span className="font-bold text-slate-800 dark:text-white">Cara Vestibular (Sección Externa)</span>
                <span className="bg-teal-50 dark:bg-teal-800/40 text-teal-600 dark:text-teal-400 font-mono font-semibold py-0.5 px-2 rounded-md">PIEZA {selectedTooth}</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {(["mesial", "central", "distal"] as const).map((pos) => {
                  const val = activeToothData.vestibularPocket[pos] || 0;
                  const recessVal = activeToothData.vestibularRecess[pos] || 0;
                  const cleanCal = val + recessVal;
                  const isPathological = val >= 4;

                  const bleedingActive = activeToothData.sangradoVestibular[pos] || false;
                  const plaqueActive = activeToothData.placaVestibular[pos] || false;

                  return (
                    <div key={`vest-col-${pos}`} className="space-y-4 text-center p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/40">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{pos}</span>
                      
                      {/* Pocket depth input */}
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 block font-bold uppercase tracking-tight">Sondaje (mm)</label>
                        <input
                          type="number"
                          min="0"
                          max="15"
                          value={val}
                          onChange={(e) => handlePocketChange(selectedTooth, "vestibularPocket", pos, parseInt(e.target.value) || 0)}
                          className={`w-full py-1.5 text-center font-display font-bold text-lg bg-white dark:bg-slate-800 rounded-lg border outline-none focus:ring-2 focus:ring-teal-500/20 transition-all ${
                            isPathological 
                              ? "border-red-450 text-red-500 bg-red-50/15" 
                              : "border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                          }`}
                        />
                      </div>

                      {/* Gingival recession input */}
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 block font-bold uppercase tracking-tight">Recesión (mm)</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={recessVal}
                          onChange={(e) => handlePocketChange(selectedTooth, "vestibularRecess", pos, parseInt(e.target.value) || 0)}
                          className="w-full py-1 text-center font-display font-semibold text-xs bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-300/10"
                        />
                      </div>

                      {/* Display calculations */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center px-1 text-[10px]">
                        <span className="text-slate-400">NIC (CAL):</span>
                        <span className={`font-mono font-bold ${cleanCal >= 5 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                          {cleanCal}mm
                        </span>
                      </div>

                      {/* Fast toggle buttons */}
                      <div className="flex justify-center gap-2.5 pt-1.5">
                        <button 
                          onClick={() => handleToggleFlag(selectedTooth, "sangradoVestibular", pos)}
                          className={`p-1.5 rounded-lg transition-all border shrink-0 cursor-pointer ${
                            bleedingActive 
                              ? "bg-red-500 text-white border-red-500 shadow-xs" 
                              : "bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 border-slate-200 dark:border-slate-800"
                          }`}
                          title="Hemorragia marginal al sondaje"
                        >
                          <Droplet className="w-3.5 h-3.5" />
                        </button>

                        <button 
                          onClick={() => handleToggleFlag(selectedTooth, "placaVestibular", pos)}
                          className={`p-1.5 rounded-lg transition-all border shrink-0 cursor-pointer ${
                            plaqueActive 
                              ? "bg-amber-400 text-slate-800 border-amber-400 shadow-xs" 
                              : "bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 border-slate-200 dark:border-slate-800"
                          }`}
                          title="Presencia de placa bacteriana"
                        >
                          <CircleDot className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* SURFACE 2: Palatino/Lingual */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-2.5 text-xs">
                <span className="font-bold text-slate-800 dark:text-white">Cara Palatina / Lingual (Interna)</span>
                <span className="bg-teal-50 dark:bg-teal-800/40 text-teal-600 dark:text-teal-400 font-mono font-semibold py-0.5 px-2 rounded-md">PIEZA {selectedTooth}</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {(["mesial", "central", "distal"] as const).map((pos) => {
                  const val = activeToothData.palatinoPocket[pos] || 0;
                  const recessVal = activeToothData.palatinoRecess[pos] || 0;
                  const cleanCal = val + recessVal;
                  const isPathological = val >= 4;

                  const bleedingActive = activeToothData.sangradoPalatino[pos] || false;
                  const plaqueActive = activeToothData.placaPalatino[pos] || false;

                  return (
                    <div key={`palat-col-${pos}`} className="space-y-4 text-center p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/40">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{pos}</span>
                      
                      {/* Pocket depth input */}
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 block font-bold uppercase tracking-tight">Sondaje (mm)</label>
                        <input
                          type="number"
                          min="0"
                          max="15"
                          value={val}
                          onChange={(e) => handlePocketChange(selectedTooth, "palatinoPocket", pos, parseInt(e.target.value) || 0)}
                          className={`w-full py-1.5 text-center font-display font-bold text-lg bg-white dark:bg-slate-800 rounded-lg border outline-none focus:ring-2 focus:ring-teal-500/20 transition-all ${
                            isPathological 
                              ? "border-red-450 text-red-500 bg-red-50/15" 
                              : "border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                          }`}
                        />
                      </div>

                      {/* Gingival recession input */}
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 block font-bold uppercase tracking-tight">Recesión (mm)</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={recessVal}
                          onChange={(e) => handlePocketChange(selectedTooth, "palatinoRecess", pos, parseInt(e.target.value) || 0)}
                          className="w-full py-1 text-center font-display font-semibold text-xs bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-300/10"
                        />
                      </div>

                      {/* Display calculations */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center px-1 text-[10px]">
                        <span className="text-slate-400">NIC (CAL):</span>
                        <span className={`font-mono font-bold ${cleanCal >= 5 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                          {cleanCal}mm
                        </span>
                      </div>

                      {/* Fast toggle buttons */}
                      <div className="flex justify-center gap-2.5 pt-1.5">
                        <button 
                          onClick={() => handleToggleFlag(selectedTooth, "sangradoPalatino", pos)}
                          className={`p-1.5 rounded-lg transition-all border shrink-0 cursor-pointer ${
                            bleedingActive 
                              ? "bg-red-500 text-white border-red-500 shadow-xs" 
                              : "bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 border-slate-200 dark:border-slate-755"
                          }`}
                          title="Hemorragia marginal al sondaje"
                        >
                          <Droplet className="w-3.5 h-3.5" />
                        </button>

                        <button 
                          onClick={() => handleToggleFlag(selectedTooth, "placaPalatino", pos)}
                          className={`p-1.5 rounded-lg transition-all border shrink-0 cursor-pointer ${
                            plaqueActive 
                              ? "bg-amber-400 text-slate-800 border-amber-400 shadow-xs" 
                              : "bg-white dark:bg-slate-800 text-slate-400 hover:text-amber-500 hover:bg-amber-50 border-slate-200 dark:border-slate-755"
                          }`}
                          title="Presencia de placa bacteriana"
                        >
                          <CircleDot className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* SENSOR 3: Furca & Movilidad (Lower Row spanning full width) */}
            <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              
              {/* Mobility Input */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Grado de Movilidad Unitaria (Miller modificada):</label>
                <div className="flex gap-2">
                  {([0, 1, 2, 3] as const).map((grade) => (
                    <button
                      key={`mov-${grade}`}
                      onClick={() => handleNumberFlag(selectedTooth, "movilidad", grade)}
                      className={`px-4.5 py-1.5 text-xs font-mono font-bold rounded-xl border transition-all cursor-pointer ${
                        activeToothData.movilidad === grade
                          ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-900 dark:border-white shadow-xs"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      G{grade}
                    </button>
                  ))}
                </div>
              </div>

              {/* Furca Involvement */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Involucración Dental de Furca (Hamp):</label>
                <div className="flex gap-2">
                  {([0, 1, 2, 3] as const).map((grade) => (
                    <button
                      key={`furc-${grade}`}
                      onClick={() => handleNumberFlag(selectedTooth, "furca", grade)}
                      className={`px-4.5 py-1.5 text-xs font-mono font-bold rounded-xl border transition-all cursor-pointer ${
                        activeToothData.furca === grade
                          ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-900 dark:border-white shadow-xs"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      Clase {grade}
                    </button>
                  ))}
                </div>
              </div>

              {/* Warning alerts */}
              {(activeToothData.vestibularPocket?.mesial >= 4 || 
                activeToothData.vestibularPocket?.central >= 4 || 
                activeToothData.vestibularPocket?.distal >= 4 ||
                activeToothData.palatinoPocket?.mesial >= 4 ||
                activeToothData.palatinoPocket?.central >= 4 ||
                activeToothData.palatinoPocket?.distal >= 4) && (
                <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40 p-3 rounded-xl flex items-center gap-2.5 max-w-xs text-[10px] sm:self-center leading-relaxed">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-500" />
                  <span>Profundidad clínica de bolsa igual o mayor a 4 mm. Se aconseja agendar tartectomía o raspado.</span>
                </div>
              )}
              
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Guide details panel */}
      <div className="bg-teal-50/30 dark:bg-slate-800/20 border border-teal-500/10 p-5 rounded-2xl flex gap-3 text-xs text-teal-800 dark:text-teal-300">
        <Info className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <h5 className="font-bold">Guía Clínica de Parámetros Periodontales</h5>
          <p className="font-light">
            <strong>Sondaje (Profundidad de Bolsa PS):</strong> PS habitual es &le; 3 mm de surco sano. Un PS &ge; 4 mm es patológico y requiere raspado clínico. 
            <br />
            <strong>Nivel de Inserción Clínica (NIC / CAL):</strong> Suma absoluta del Sondaje y Recesión Gingival (PS + REC), que indica de forma real la pérdida ósea y desgaste del ligamento colágeno de soporte radicular.
          </p>
        </div>
      </div>

    </div>
  );
}
