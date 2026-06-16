import React, { useState, useEffect } from "react";
import { PeriodonState, ToothState, Patient } from "../types";
import { UPPER_TEETH, LOWER_TEETH, ALL_TEETH_NUMBERS } from "../initialData";
import { 
  Droplet, 
  CircleDot, 
  Info, 
  AlertTriangle, 
  ChevronRight, 
  ChevronLeft,
  Activity, 
  Percent,
  Keyboard,
  Sparkles,
  Zap,
  Award,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PeriodontogramaProps {
  periodontogram: Record<number, PeriodonState>;
  onChange: (updatedPeriodontogram: Record<number, PeriodonState>) => void;
  odontogram?: Record<number, ToothState>;
  patient?: Patient | null;
  onUpdatePatient?: (updatedPatient: Patient) => void;
}

export default function Periodontograma({ periodontogram, onChange, odontogram, patient, onUpdatePatient }: PeriodontogramaProps) {
  const [selectedTooth, setSelectedTooth] = useState<number>(16);
  const [activeArch, setActiveArch] = useState<"upper" | "lower">("upper");

  // Keyboard shortcut assistant
  const [keyboardMode, setKeyboardMode] = useState<boolean>(false);
  const [inputMetric, setInputMetric] = useState<"pocket" | "recess">("pocket");
  const [inputSurface, setInputSurface] = useState<"vestibular" | "palatino">("vestibular");
  const [inputPosition, setInputPosition] = useState<"mesial" | "central" | "distal">("mesial");

  // Prognosis and Lang & Tonetti Risk parameters (synced back to patient or internal state fallbacks)
  const [internalSmoking, setInternalSmoking] = useState<number>(0);
  const [internalDiabetes, setInternalDiabetes] = useState<"none" | "controlled" | "severe">("none");
  const [internalAge, setInternalAge] = useState<number>(45);

  const getEffectiveAge = () => {
    if (patient?.anamnesis?.edadSimulada) return patient.anamnesis.edadSimulada;
    if (patient?.birthdate) {
      const birth = new Date(patient.birthdate);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
      return isNaN(age) || age <= 0 ? 45 : age;
    }
    return internalAge;
  };

  const praSmoking = patient ? (patient.anamnesis?.tabaquismo ?? 0) : internalSmoking;
  const praDiabetes = patient 
    ? (patient.anamnesis?.diabetesStatus ?? (patient.anamnesis?.diabetes ? "controlled" : "none")) 
    : internalDiabetes;
  const praAge = getEffectiveAge();

  const handleSmokingChange = (val: number) => {
    if (patient && onUpdatePatient) {
      onUpdatePatient({
        ...patient,
        anamnesis: {
          ...patient.anamnesis,
          tabaquismo: val
        }
      });
    } else {
      setInternalSmoking(val);
    }
  };

  const handleDiabetesChange = (val: "none" | "controlled" | "severe") => {
    if (patient && onUpdatePatient) {
      onUpdatePatient({
        ...patient,
        anamnesis: {
          ...patient.anamnesis,
          diabetes: val !== "none",
          diabetesStatus: val
        }
      });
    } else {
      setInternalDiabetes(val);
    }
  };

  const handleAgeChange = (val: number) => {
    if (patient && onUpdatePatient) {
      onUpdatePatient({
        ...patient,
        anamnesis: {
          ...patient.anamnesis,
          edadSimulada: val
        }
      });
    } else {
      setInternalAge(val);
    }
  };

  const teethList = activeArch === "upper" 
    ? [...UPPER_TEETH.right, ...UPPER_TEETH.left]
    : [...LOWER_TEETH.right, ...LOWER_TEETH.left];

  const isUpper = UPPER_TEETH.right.includes(selectedTooth) || UPPER_TEETH.left.includes(selectedTooth);

  // Dynamically calculate clinical O'Leary Plaque Index and BOP Index for the active patient
  let totalEvaluatedSurfaces = 0;
  let plaqueSurfaces = 0;
  let bopSurfaces = 0;
  let pocketsGreaterEqual5 = 0;
  let maxCALInMouth = 0;

  const allTeeth = [...UPPER_TEETH.right, ...UPPER_TEETH.left, ...LOWER_TEETH.right, ...LOWER_TEETH.left];

  allTeeth.forEach((toothNumber) => {
    // Skip absent teeth from indices calculation
    const toothCondition = odontogram?.[toothNumber]?.condition;
    if (toothCondition === "ausente") return;

    // Each present tooth has 6 evaluated surfaces (3 vestibular, 3 palatales/linguales)
    totalEvaluatedSurfaces += 6;

    const state = periodontogram?.[toothNumber];
    if (state) {
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

      // Residual pockets counts
      const vPk = state.vestibularPocket || { mesial: 0, central: 0, distal: 0 };
      const pPk = state.palatinoPocket || { mesial: 0, central: 0, distal: 0 };
      if (vPk.mesial >= 5) pocketsGreaterEqual5++;
      if (vPk.central >= 5) pocketsGreaterEqual5++;
      if (vPk.distal >= 5) pocketsGreaterEqual5++;
      if (pPk.mesial >= 5) pocketsGreaterEqual5++;
      if (pPk.central >= 5) pocketsGreaterEqual5++;
      if (pPk.distal >= 5) pocketsGreaterEqual5++;

      // Max CAL Loss in mouth
      const vRc = state.vestibularRecess || { mesial: 0, central: 0, distal: 0 };
      const pRc = state.palatinoRecess || { mesial: 0, central: 0, distal: 0 };
      
      const calVMesial = (vPk.mesial || 0) + (vRc.mesial || 0);
      const calVCentral = (vPk.central || 0) + (vRc.central || 0);
      const calVDistal = (vPk.distal || 0) + (vRc.distal || 0);
      const calPMesial = (pPk.mesial || 0) + (pRc.mesial || 0);
      const calPCentral = (pPk.central || 0) + (pRc.central || 0);
      const calPDistal = (pPk.distal || 0) + (pRc.distal || 0);

      const toothMaxCAL = Math.max(calVMesial, calVCentral, calVDistal, calPMesial, calPCentral, calPDistal);
      if (toothMaxCAL > maxCALInMouth) {
        maxCALInMouth = toothMaxCAL;
      }
    }
  });

  const oLearyIndexValue = totalEvaluatedSurfaces > 0 
    ? Math.round((plaqueSurfaces / totalEvaluatedSurfaces) * 100) 
    : 0;
  const normalizedOLeary = Math.min(100, oLearyIndexValue);

  const bopIndexValue = totalEvaluatedSurfaces > 0 
    ? Math.round((bopSurfaces / totalEvaluatedSurfaces) * 100)
    : 0;
  const normalizedBop = Math.min(100, bopIndexValue);

  // Assess missing teeth count
  let missingTeethCount = 0;
  if (odontogram) {
    Object.values(odontogram).forEach((t) => {
      if (t.condition === "ausente") missingTeethCount++;
    });
  } else {
    // Falls back to checking if standard periodontogram pockets are entirely empty (0/0/0)
    Object.values(periodontogram || {}).forEach((state) => {
      const is0 = (state.vestibularPocket?.mesial === 0) && (state.vestibularPocket?.central === 0) && (state.vestibularPocket?.distal === 0);
      if (is0) missingTeethCount++;
    });
  }

  // Define Lang & Tonetti risk model metrics
  const praiseRatio = praAge > 0 ? maxCALInMouth / praAge : 0;
  
  // High risk pillars
  const isBopHigh = normalizedBop > 25;
  const isPocketsHigh = pocketsGreaterEqual5 > 4;
  const isMissingHigh = missingTeethCount > 8;
  const isBoneLossHigh = praiseRatio > 1.0;
  const isDiabetesHigh = praDiabetes === "severe";
  const isSmokingHigh = praSmoking >= 10;

  let highRiskPillarsCount = 0;
  if (isBopHigh) highRiskPillarsCount++;
  if (isPocketsHigh) highRiskPillarsCount++;
  if (isMissingHigh) highRiskPillarsCount++;
  if (isBoneLossHigh) highRiskPillarsCount++;
  if (isDiabetesHigh) highRiskPillarsCount++;
  if (isSmokingHigh) highRiskPillarsCount++;

  const overallRiskLevel = highRiskPillarsCount >= 3 
    ? "ALTO" 
    : highRiskPillarsCount === 2 
    ? "MODERADO" 
    : "BAJO";

  // Global keydown triggers when rapid entry keyboard mode is active
  useEffect(() => {
    if (!keyboardMode) return;

    const handleGlobalKeys = (e: KeyboardEvent) => {
      // Avoid overriding physical keyboard actions when writing standard text inputs
      if (
        document.activeElement?.tagName === "INPUT" && 
        !document.activeElement.classList.contains("perio-shortcut-raw")
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Navigation keys
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const idx = teethList.indexOf(selectedTooth);
        const prevIdx = idx > 0 ? idx - 1 : teethList.length - 1;
        setSelectedTooth(teethList[prevIdx]);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const idx = teethList.indexOf(selectedTooth);
        const nextIdx = (idx + 1) % teethList.length;
        setSelectedTooth(teethList[nextIdx]);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setInputMetric((p) => (p === "recess" ? "pocket" : "recess"));
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setInputMetric((p) => (p === "pocket" ? "recess" : "pocket"));
        return;
      }

      // Quick Numeric Keypad Entry (0 - 9)
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        const numVal = parseInt(e.key);
        const targetField = inputSurface === "vestibular"
          ? (inputMetric === "pocket" ? "vestibularPocket" : "vestibularRecess")
          : (inputMetric === "pocket" ? "palatinoPocket" : "palatinoRecess");

        handlePocketChange(selectedTooth, targetField, inputPosition, numVal);

        // Advance sequence: mesial -> central -> distal
        if (inputPosition === "mesial") {
          setInputPosition("central");
        } else if (inputPosition === "central") {
          setInputPosition("distal");
        } else {
          // distal completed, now toggle surface/metric or advance tooth
          if (inputSurface === "vestibular") {
            setInputSurface("palatino");
            setInputPosition("mesial");
          } else {
            // Both vestibular and palatine faces completed, move to next tooth clinical sequence
            const idx = teethList.indexOf(selectedTooth);
            const nextIdx = (idx + 1) % teethList.length;
            setSelectedTooth(teethList[nextIdx]);
            setInputSurface("vestibular");
            setInputPosition("mesial");
          }
        }
        return;
      }

      // Rapid hotkeys toggles
      if (key === "s" || key === "b") {
        e.preventDefault();
        const flagSurface = inputSurface === "vestibular" ? "sangradoVestibular" : "sangradoPalatino";
        handleToggleFlag(selectedTooth, flagSurface, inputPosition);
        return;
      }
      if (key === "p" || key === "l") {
        e.preventDefault();
        const flagSurface = inputSurface === "vestibular" ? "placaVestibular" : "placaPalatino";
        handleToggleFlag(selectedTooth, flagSurface, inputPosition);
        return;
      }
      if (key === "u" || key === "d") {
        e.preventDefault();
        const flagSurface = inputSurface === "vestibular" ? "supuracionVestibular" : "supuracionPalatino";
        handleToggleSupuracion(selectedTooth, flagSurface, inputPosition);
        return;
      }
    };

    window.addEventListener("keydown", handleGlobalKeys);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeys);
    };
  }, [keyboardMode, selectedTooth, inputMetric, inputSurface, inputPosition, periodontogram, teethList]);

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

  const handleToggleSupuracion = (
    toothNum: number,
    surface: "supuracionVestibular" | "supuracionPalatino",
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

  const getToothSummary = (toothNum: number) => {
    const tooth = periodontogram[toothNum];
    if (!tooth) return { bleeding: 0, plaque: 0, maxPocket: 0, hasSuppuration: false };

    let bleeding = 0;
    let plaque = 0;
    let maxPk = 0;
    let hasSupp = false;

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

    if (
      tooth.supuracionVestibular?.mesial || tooth.supuracionVestibular?.central || tooth.supuracionVestibular?.distal ||
      tooth.supuracionPalatino?.mesial || tooth.supuracionPalatino?.central || tooth.supuracionPalatino?.distal
    ) {
      hasSupp = true;
    }

    return { bleeding, plaque, maxPocket: maxPk, hasSuppuration: hasSupp };
  };

  const activeToothData = periodontogram[selectedTooth];
  const toothIsImplant = odontogram?.[selectedTooth]?.condition === "implante";
  const toothIsMissing = odontogram?.[selectedTooth]?.condition === "ausente";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm p-6 space-y-6" id="periodonto-panel">
      
      {/* Clinician Interface Brand Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-teal-500/5 via-cyan-500/5 to-transparent p-4 rounded-xl border border-teal-500/10 dark:border-teal-500/5">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-md font-mono uppercase mb-2 inline-block">
            Módulo Clínico PerioTools™
          </span>
          <h3 className="text-lg font-display font-bold text-slate-800 dark:text-white">Periodontograma de Precisión Académica</h3>
          <p className="text-xs text-slate-450 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
            <Activity className="w-3.5 h-3.5 text-teal-500" />
            Cumple con estándares de Lang & Tonetti para clasificación de riesgo periodontal.
          </p>
        </div>

        {/* Arch Selector Pill */}
        <div className="bg-slate-50 dark:bg-slate-800 p-1 rounded-xl flex border border-slate-100 dark:border-slate-700/80 shrink-0 select-none">
          <button
            onClick={() => {
              setActiveArch("upper");
              setSelectedTooth(16);
            }}
            className={`text-xs py-1.5 px-3.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeArch === "upper"
                ? "bg-white dark:bg-slate-900 shadow-xs text-teal-600 dark:text-teal-400"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            }`}
          >
            Arcada Superior
          </button>
          <button
            onClick={() => {
              setActiveArch("lower");
              setSelectedTooth(46);
            }}
            className={`text-xs py-1.5 px-3.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeArch === "lower"
                ? "bg-white dark:bg-slate-900 shadow-xs text-teal-600 dark:text-teal-400"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            }`}
          >
            Arcada Inferior
          </button>
        </div>
      </div>

      {/* Dynamic O'Leary and BOP Analytics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* O'Leary Index Card */}
        <div className="bg-slate-50/50 dark:bg-slate-855 border border-slate-100 dark:border-slate-800/80 p-4 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">PCR (Índice de Placa)</span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-display font-extrabold ${
                normalizedOLeary > 20 ? "text-rose-500" : normalizedOLeary > 10 ? "text-amber-500" : "text-emerald-500"
              }`}>
                {normalizedOLeary}%
              </span>
              <span className="text-[10px] text-slate-400 font-medium font-mono">de Placa</span>
            </div>
            <p className="text-[10px] text-slate-400 font-light leading-relaxed">
              {normalizedOLeary > 20 
                ? "Higiene deficiente (>20%). Alto riesgo de gingivitis." 
                : "Higiene clínica adecuada (≤20%)."}
            </p>
          </div>
          <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center font-mono font-bold text-[10px] ${
            normalizedOLeary > 20 
              ? "border-rose-500/50 bg-rose-500/5 text-rose-500" 
              : "border-emerald-500/50 bg-emerald-500/5 text-emerald-500"
          }`}>
            PCR
          </div>
        </div>

        {/* BOP Bleeding Index Card */}
        <div className="bg-slate-50/50 dark:bg-slate-855 border border-slate-100 dark:border-slate-800/80 p-4 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">BOP (Sangrado al Sondaje)</span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-display font-extrabold ${
                normalizedBop > 25 ? "text-rose-500" : "text-emerald-500"
              }`}>
                {normalizedBop}%
              </span>
              <span className="text-[10px] text-slate-400 font-medium font-mono">BOP</span>
            </div>
            <p className="text-[10px] text-slate-400 font-light leading-relaxed">
              {normalizedBop > 25 
                ? "Inflamación periodontal activa (>25%). Tratamiento urgente." 
                : "Salud gingival clínica estable."}
            </p>
          </div>
          <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center font-mono font-bold text-[10px] ${
            normalizedBop > 25 
              ? "border-rose-500/50 bg-rose-500/5 text-rose-500" 
              : "border-emerald-500/50 bg-emerald-500/5 text-emerald-500"
          }`}>
            BOP
          </div>
        </div>

        {/* Active Suppurating Teeth and general parameters */}
        <div className="bg-slate-50/50 dark:bg-slate-855 border border-slate-100 dark:border-slate-800/80 p-4 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
          <div className="space-y-1 w-full">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Estado de Infección</span>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Bolsas Profundas:</span>
              <span className={`text-base font-bold font-mono ${pocketsGreaterEqual5 > 0 ? "text-rose-500 font-bold" : "text-emerald-500"}`}>
                {pocketsGreaterEqual5} (&ge;5mm)
              </span>
            </div>
            <div className="flex items-baseline justify-between text-[10px] text-slate-400 mt-1">
              <span>Pérdidas dentales:</span>
              <span className="font-mono font-bold">{missingTeethCount} piezas</span>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK SELECTOR HORIZONTAL BAR */}
      <div className="space-y-2 border-t border-b border-slate-105 dark:border-slate-800/60 py-4">
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
            Explorador por Pieza Dental ( FDI ):
          </span>
          <span className="text-[10px] font-mono text-slate-400 font-light">
            Selecciona un diente para ver profundidad, recesión, NIC y gráficos.
          </span>
        </div>
        
        <div className="flex gap-2 overflow-x-auto py-2 px-1 scrollbar-thin">
          {teethList.map((num) => {
            const { bleeding, plaque, maxPocket, hasSuppuration } = getToothSummary(num);
            const isSelected = selectedTooth === num;
            const hasSeverePocket = maxPocket >= 4;
            const stateIsImplant = odontogram?.[num]?.condition === "implante";
            const stateIsMissing = odontogram?.[num]?.condition === "ausente";

            return (
              <button
                key={num}
                onClick={() => setSelectedTooth(num)}
                className={`flex-shrink-0 w-14 p-2 rounded-xl border text-center transition-all cursor-pointer relative ${
                  isSelected
                    ? "bg-teal-600 border-teal-600 text-white shadow-sm scale-102"
                    : stateIsMissing
                    ? "bg-slate-100 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-800/40 text-slate-350 opacity-40 line-through"
                    : stateIsImplant
                    ? "bg-cyan-500/10 border-cyan-400/55 dark:border-cyan-500/30 text-teal-600 dark:text-cyan-400 focus:ring-1 focus:ring-cyan-500"
                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 text-slate-800 dark:text-slate-200"
                }`}
              >
                {/* Tooth number and small icons */}
                <div className="flex justify-between items-center px-0.5">
                  <span className={`text-[9px] font-mono font-extrabold ${isSelected ? 'text-white/90' : 'text-slate-400'}`}>
                    {num}
                  </span>
                  {stateIsImplant && <span className="text-[8px] font-bold text-cyan-500 font-mono" title="Implante Dental">Im</span>}
                </div>
                
                {/* Max Pocket Depth */}
                <div className={`text-sm font-display font-bold mt-1 ${
                  isSelected ? 'text-white' : stateIsMissing ? 'text-slate-300 dark:text-slate-700' : hasSeverePocket ? 'text-rose-500' : 'text-slate-800 dark:text-slate-100'
                }`}>
                  {stateIsMissing ? "Ø" : `${maxPocket}mm`}
                </div>

                {/* Flags indicators */}
                <div className="flex justify-center gap-1 mt-1.5 h-1.5">
                  {bleeding > 0 && <span className={`w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-red-500"}`} />}
                  {plaque > 0 && <span className={`w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-amber-400"}`} />}
                  {hasSuppuration && <span className={`w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-cyan-400"}`} />}
                </div>

                {hasSeverePocket && !stateIsMissing && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-150 dark:border-slate-800"
          >
            {/* LEFT AREA: Advanced Control Config / Key Shortcuts / Bio SVG (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Specialized Keyboard Shortcuts Mode Switch */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-3.5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Keyboard className="w-4 h-4 text-teal-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Modo Teclado Ultrarrápido PerioTools
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400 leading-snug">
                    Digita números 0-9 para rellenar sondajes y avanzar de celda de forma continua.
                  </p>
                </div>

                <div className="flex items-center gap-3.5">
                  <button
                    onClick={() => setKeyboardMode(!keyboardMode)}
                    className={`text-xs font-bold py-1 px-3.5 rounded-full border cursor-pointer transition-all ${
                      keyboardMode 
                        ? "bg-teal-500/10 text-teal-600 border-teal-500/20 shadow-xs" 
                        : "bg-slate-50 text-slate-450 border-slate-205 dark:bg-slate-850 dark:text-slate-400"
                    }`}
                  >
                    {keyboardMode ? "⌨️ Activo" : "⌨️ Desactivado"}
                  </button>
                </div>
              </div>

              {/* Keyboard Mode Helper Info - Interactive Guide */}
              {keyboardMode && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-teal-950/20 dark:bg-teal-950/15 border border-teal-500/20 p-3 rounded-lg space-y-2 text-[10.5px] leading-relaxed"
                >
                  <p className="font-semibold text-teal-700 dark:text-teal-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Guía de Teclado Rápida (PerioTools)
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-650 dark:text-slate-350 font-mono">
                    <div><span className="text-teal-600 font-bold bg-white dark:bg-slate-800 px-1 rounded dark:border dark:border-slate-700 font-sans">0-9</span> mm Sondaje/Recesión</div>
                    <div><span className="text-teal-600 font-bold bg-white dark:bg-slate-800 px-1 rounded dark:border dark:border-slate-700 font-sans">S / B</span> Toggle Sangrado</div>
                    <div><span className="text-teal-600 font-bold bg-white dark:bg-slate-800 px-1 rounded dark:border dark:border-slate-700 font-sans font-semibold">P / L</span> Toggle Placa (Bact)</div>
                    <div><span className="text-teal-600 font-bold bg-white dark:bg-slate-800 px-1 rounded dark:border dark:border-slate-700 font-sans">U / D</span> Toggle Supuración</div>
                    <div><span className="text-teal-600 font-bold bg-white dark:bg-slate-800 px-1 rounded dark:border dark:border-slate-705 font-sans">&larr; / &rarr;</span> Siguiente Diente</div>
                    <div><span className="text-teal-600 font-bold bg-white dark:bg-slate-800 px-1 rounded dark:border dark:border-slate-705 font-sans">&uarr; / &darr;</span> Alternar Medición</div>
                  </div>
                  <div className="pt-2 border-t border-teal-500/10 flex flex-wrap gap-2 text-[10px]">
                    <span className="text-slate-400 font-sans">Celda Activa:</span>
                    <span className="bg-slate-800 text-white dark:bg-slate-900 border border-slate-700 px-2 py-0.5 rounded font-bold uppercase">
                      {inputSurface} - {inputPosition} ({inputMetric === "pocket" ? "Sondaje" : "Recesión"})
                    </span>
                  </div>
                </motion.div>
              )}

              {/* LIVE SVG ANATOMICAL CROSS SECTION GRAPH */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800/85">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">
                  Esquema Anatómico Interactivo de Raíz y Corona
                </span>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* The actual SVG tooth representation */}
                  <div className="w-full max-w-[200px] h-[220px] bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800/40 relative flex items-center justify-center">
                    <svg viewBox="0 0 100 160" className="w-full h-full select-none">
                      {/* Definitions */}
                      <defs>
                        <linearGradient id="toothGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ffffff" />
                          <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.85" />
                        </linearGradient>
                        <linearGradient id="implantGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#64748b" />
                          <stop offset="50%" stopColor="#94a3b8" />
                          <stop offset="100%" stopColor="#cbd5e1" />
                        </linearGradient>
                      </defs>

                      {/* Tooth Anatomy drawings based on FDI specifications */}
                      {toothIsMissing ? (
                        /* Missing representation */
                        <g opacity="0.3">
                          <line x1="20" y1="20" x2="80" y2="140" stroke="#ef4444" strokeWidth="3" />
                          <line x1="80" y1="20" x2="20" y2="140" stroke="#ef4444" strokeWidth="3" />
                        </g>
                      ) : toothIsImplant ? (
                        /* Implant structure */
                        <g>
                          {/* Implant screw in bone */}
                          <rect x="42" y="15" width="16" height="65" fill="url(#implantGrad)" rx="2" />
                          {/* Screw threads details */}
                          <line x1="40" y1="30" x2="60" y2="33" stroke="#475569" strokeWidth="1.5" />
                          <line x1="40" y1="42" x2="60" y2="45" stroke="#475569" strokeWidth="1.5" />
                          <line x1="40" y1="54" x2="60" y2="57" stroke="#475569" strokeWidth="1.5" />
                          <line x1="40" y1="66" x2="60" y2="69" stroke="#475569" strokeWidth="1.5" />
                          {/* Metal abutment crown */}
                          <path d="M 35,80 L 45,80 L 45,95 L 30,115 L 70,115 L 55,95 L 55,80 L 65,80 C 75,95 72,120 62,125 L 38,125 C 28,120 25,95 35,80 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
                        </g>
                      ) : activeArch === "upper" ? (
                        /* Upper Tooth: roots upwards (Y < 80), crown downwards (Y > 80) */
                        <g>
                          {/* Roots drawing */}
                          <path d="M 35,80 C 20,40 38,20 42,10 C 45,25 48,50 48,80 C 50,50 53,25 56,10 C 60,20 78,40 65,80 Z" fill="url(#toothGrad)" stroke="#94a3b8" strokeWidth="1" />
                          {/* Tooth Crown (pointing down) */}
                          <path d="M 35,80 C 25,95 28,125 50,132 C 72,125 75,95 65,80 Z" fill="url(#toothGrad)" stroke="#475569" strokeWidth="1.2" />
                        </g>
                      ) : (
                        /* Lower Tooth: root downwards (Y > 80), crown upwards (Y < 80) */
                        <g>
                          {/* Roots drawing */}
                          <path d="M 35,80 C 20,120 38,140 42,150 C 45,135 48,110 48,80 C 50,110 53,135 56,150 C 60,140 78,120 65,80 Z" fill="url(#toothGrad)" stroke="#94a3b8" strokeWidth="1" />
                          {/* Tooth Crown (pointing up) */}
                          <path d="M 35,80 C 25,65 28,35 50,28 C 72,35 75,65 65,80 Z" fill="url(#toothGrad)" stroke="#475569" strokeWidth="1.2" />
                        </g>
                      )}

                      {/* Plotting points - drawing Gingival Margin & Pocket based on selected face */}
                      {(() => {
                        if (toothIsMissing) return null;
                        
                        const pocketData = inputSurface === "vestibular" 
                          ? (activeToothData.vestibularPocket || { mesial: 2, central: 1, distal: 2 }) 
                          : (activeToothData.palatinoPocket || { mesial: 2, central: 1, distal: 2 });
                        const recessData = inputSurface === "vestibular" 
                          ? (activeToothData.vestibularRecess || { mesial: 0, central: 0, distal: 0 }) 
                          : (activeToothData.palatinoRecess || { mesial: 0, central: 0, distal: 0 });

                        // Baseline CEJ is Y=80.
                        // For upper teeth, roots go UP, so recession (loss towards root) moves up (decreasing Y).
                        // Recession value (e.g. 0-6 mm) maps to pixels. Let's use scale of 4.5px per mm.
                        const scale = 4.5;
                        const direction = activeArch === "upper" ? -1 : 1;

                        const yCEJ = 80;
                        const xMesial = 26;
                        const xCentral = 50;
                        const xDistal = 74;

                        // Margin offset (NIC REC)
                        const yMarginM = yCEJ + (recessData.mesial * scale * direction);
                        const yMarginC = yCEJ + (recessData.central * scale * direction);
                        const yMarginD = yCEJ + (recessData.distal * scale * direction);

                        // Pocket Bottom offset (REC + Pocket mm)
                        const yPocketM = yMarginM + (pocketData.mesial * scale * direction);
                        const yPocketC = yMarginC + (pocketData.central * scale * direction);
                        const yPocketD = yMarginD + (pocketData.distal * scale * direction);

                        return (
                          <g>
                            {/* Horizontal Millimeter Scale Grid (PerioTools style) */}
                            {/* CEJ / Baseline 0 Line */}
                            <line 
                              x1="12" 
                              y1={yCEJ} 
                              x2="88" 
                              y2={yCEJ} 
                              stroke="#0d9488" 
                              strokeWidth="0.8" 
                              strokeDasharray="3,2" 
                              opacity="0.8"
                            />
                            <text 
                              x="8" 
                              y="82" 
                              fill="#0d9488" 
                              className="text-[6px] font-mono font-black select-none text-right dark:fill-teal-400" 
                              textAnchor="end"
                            >
                              0
                            </text>
                            <text 
                              x="92" 
                              y="82" 
                              fill="#0d9488" 
                              className="text-[6px] font-mono font-black select-none text-start dark:fill-teal-400" 
                              textAnchor="start"
                            >
                              0
                            </text>

                            {/* Rootward Milimeter Lines: Even & Odd */}
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((mm) => {
                              const yLine = yCEJ + (mm * scale * direction);
                              const isEven = mm % 2 === 0;
                              return (
                                <g key={`root-grid-${mm}`} opacity={isEven ? "0.4" : "0.15"}>
                                  <line 
                                    x1="12" 
                                    y1={yLine} 
                                    x2="88" 
                                    y2={yLine} 
                                    stroke={isEven ? "#64748b" : "#94a3b8"} 
                                    strokeWidth={isEven ? "0.6" : "0.4"} 
                                    strokeDasharray={isEven ? "2,2" : "1,3"} 
                                  />
                                  {isEven && (
                                    <>
                                      <text 
                                        x="8" 
                                        y={yLine + 2} 
                                        fill="#64748b" 
                                        className="text-[5px] font-mono font-bold select-none text-right dark:fill-slate-400"
                                        textAnchor="end"
                                      >
                                        {mm}
                                      </text>
                                      <text 
                                        x="92" 
                                        y={yLine + 2} 
                                        fill="#64748b" 
                                        className="text-[5px] font-mono font-bold select-none text-start dark:fill-slate-400"
                                        textAnchor="start"
                                      >
                                        {mm}
                                      </text>
                                    </>
                                  )}
                                </g>
                              );
                            })}

                            {/* Crownward Milimeter Lines (for hyperplasia) */}
                            {[1, 2, 3, 4].map((mm) => {
                              const yLine = yCEJ - (mm * scale * direction);
                              const isEven = mm % 2 === 0;
                              return (
                                <g key={`crown-grid-${mm}`} opacity={isEven ? "0.2" : "0.1"}>
                                  <line 
                                    x1="12" 
                                    y1={yLine} 
                                    x2="88" 
                                    y2={yLine} 
                                    stroke="#64748b" 
                                    strokeWidth="0.5" 
                                    strokeDasharray="1,2" 
                                  />
                                  {isEven && (
                                    <>
                                      <text 
                                        x="8" 
                                        y={yLine + 2} 
                                        fill="#64748b" 
                                        className="text-[4.5px] font-mono font-semibold select-none text-right dark:fill-slate-500"
                                        textAnchor="end"
                                      >
                                        -{mm}
                                      </text>
                                      <text 
                                        x="92" 
                                        y={yLine + 2} 
                                        fill="#64748b" 
                                        className="text-[4.5px] font-mono font-semibold select-none text-start dark:fill-slate-500"
                                        textAnchor="start"
                                      >
                                        -{mm}
                                      </text>
                                    </>
                                  )}
                                </g>
                              );
                            })}

                            {/* Area shaded between CEJ and pocket bottom showing loss of insertion */}
                            <path 
                              d={`M 15,${yCEJ} L ${xMesial},${yCEJ} L ${xCentral},${yCEJ} L ${xDistal},${yCEJ} L 85,${yCEJ} L 85,${yPocketD} L ${xDistal},${yPocketD} L ${xCentral},${yPocketC} L ${xMesial},${yPocketM} L 15,${yPocketM} Z`}
                              fill="rgba(244, 63, 94, 0.12)"
                              stroke="none"
                            />

                            {/* Gingival Margin line (Blue/cyan) - Clinical Polyline passing exactly through nodes */}
                            <path 
                              d={`M 12,${yMarginM} L ${xMesial},${yMarginM} L ${xCentral},${yMarginC} L ${xDistal},${yMarginD} L 88,${yMarginD}`}
                              fill="none"
                              stroke="#06b6d4" 
                              strokeWidth="2.5" 
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />

                            {/* Pocket base path (Red) - Clinical Polyline passing exactly through nodes */}
                            <path 
                              d={`M 12,${yPocketM} L ${xMesial},${yPocketM} L ${xCentral},${yPocketC} L ${xDistal},${yPocketD} L 88,${yPocketD}`}
                              fill="none" 
                              stroke="#ef4444" 
                              strokeWidth="2.5" 
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeDasharray="2,2"
                            />

                            {/* Node markers for Gingival Margin (Cyan) */}
                            <g>
                              <circle cx={xMesial} cy={yMarginM} r="2.5" fill="#06b6d4" stroke="#ffffff" strokeWidth="0.8" />
                              <circle cx={xCentral} cy={yMarginC} r="2.5" fill="#06b6d4" stroke="#ffffff" strokeWidth="0.8" />
                              <circle cx={xDistal} cy={yMarginD} r="2.5" fill="#06b6d4" stroke="#ffffff" strokeWidth="0.8" />
                            </g>

                            {/* Node markers for Pocket Bottom (Red) */}
                            <g>
                              <circle cx={xMesial} cy={yPocketM} r="2.5" fill="#ef4444" stroke="#ffffff" strokeWidth="0.8" />
                              <circle cx={xCentral} cy={yPocketC} r="2.5" fill="#ef4444" stroke="#ffffff" strokeWidth="0.8" />
                              <circle cx={xDistal} cy={yPocketD} r="2.5" fill="#ef4444" stroke="#ffffff" strokeWidth="0.8" />
                            </g>

                            {/* Active position vertical dashed guide */}
                            <line 
                              x1={inputPosition === "mesial" ? xMesial : inputPosition === "central" ? xCentral : xDistal}
                              y1="10"
                              x2={inputPosition === "mesial" ? xMesial : inputPosition === "central" ? xCentral : xDistal}
                              y2="150"
                              stroke="#0d9488"
                              strokeWidth="1"
                              strokeDasharray="2,2"
                              opacity="0.8"
                            />

                            {/* Position & Metric selector markers (Moves dynamically to match selected parameter: recess vs pocket) */}
                            {(() => {
                              const activeY = inputMetric === "pocket"
                                ? (inputPosition === "mesial" ? yPocketM : inputPosition === "central" ? yPocketC : yPocketD)
                                : (inputPosition === "mesial" ? yMarginM : inputPosition === "central" ? yMarginC : yMarginD);
                              return (
                                <g>
                                  <circle 
                                    cx={inputPosition === "mesial" ? xMesial : inputPosition === "central" ? xCentral : xDistal}
                                    cy={activeY} 
                                    r="6" 
                                    fill={inputMetric === "pocket" ? "#ef4444" : "#06b6d4"} 
                                    stroke="#ffffff" 
                                    strokeWidth="1.5"
                                    className="animate-ping"
                                    style={{ transformOrigin: "center" }}
                                  />
                                  <circle 
                                    cx={inputPosition === "mesial" ? xMesial : inputPosition === "central" ? xCentral : xDistal}
                                    cy={activeY} 
                                    r="4.5" 
                                    fill={inputMetric === "pocket" ? "#b91c1c" : "#0891b2"} 
                                    stroke="#ffffff" 
                                    strokeWidth="1.5"
                                  />
                                </g>
                              );
                            })()}

                            {/* Clickable Overlay Zones for Mesial, Central, Distal */}
                            <g>
                              {/* Left / Mesial Target */}
                              <rect 
                                x="10" 
                                y="10" 
                                width="28" 
                                height="140" 
                                fill="transparent" 
                                className="cursor-pointer hover:fill-teal-500/5 transition-all"
                                onClick={() => {
                                  setInputPosition("mesial");
                                }}
                              />
                              {/* Middle / Central Target */}
                              <rect 
                                x="38" 
                                y="10" 
                                width="24" 
                                height="140" 
                                fill="transparent" 
                                className="cursor-pointer hover:fill-teal-500/5 transition-all"
                                onClick={() => {
                                  setInputPosition("central");
                                }}
                              />
                              {/* Right / Distal Target */}
                              <rect 
                                x="62" 
                                y="10" 
                                width="28" 
                                height="140" 
                                fill="transparent" 
                                className="cursor-pointer hover:fill-teal-500/5 transition-all"
                                onClick={() => {
                                  setInputPosition("distal");
                                }}
                              />
                            </g>
                          </g>
                        );
                      })()}
                    </svg>
                  </div>

                  {/* Anatomical Explanation and Details Side Column */}
                  <div className="flex-1 space-y-3 w-full">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                        {inputSurface === "vestibular" ? "Vista Externa (Vestibular)" : "Vista Interna (Palatino/Lingual)"}
                      </span>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        {toothIsImplant ? (
                          <span className="bg-cyan-500/10 text-cyan-500 text-xs px-2 py-0.5 rounded-md font-mono">Abutment Implant</span>
                        ) : (
                          <span>Pieza Anatomía {isUpper ? "Anisognata Maxilar Superior" : "Anisognata Mandibular Inferior"}</span>
                        )}
                      </h4>
                    </div>

                    {/* REAL-TIME DYNAMIC METRICS FOR SELECTED POSITION */}
                    {(() => {
                      if (toothIsMissing) return null;
                      const pocketData = inputSurface === "vestibular" 
                        ? (activeToothData.vestibularPocket || { mesial: 2, central: 1, distal: 2 }) 
                        : (activeToothData.palatinoPocket || { mesial: 2, central: 1, distal: 2 });
                      const recessData = inputSurface === "vestibular" 
                        ? (activeToothData.vestibularRecess || { mesial: 0, central: 0, distal: 0 }) 
                        : (activeToothData.palatinoRecess || { mesial: 0, central: 0, distal: 0 });

                      const scale = 4.5;
                      const currentPocketVal = pocketData[inputPosition] ?? 2;
                      const currentRecessVal = recessData[inputPosition] ?? 0;
                      const currentCalVal = currentPocketVal + currentRecessVal;

                      return (
                        <div className="p-3 bg-teal-500/5 dark:bg-teal-950/10 border border-teal-550/10 rounded-xl space-y-2 animate-fade-in">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-slate-500 dark:text-slate-400 uppercase">Valores Punto Seleccionado:</span>
                            <span className="font-mono bg-teal-500/15 text-teal-600 dark:text-teal-400 px-2 py-0.5 rounded font-black uppercase text-[9px] tracking-wider">
                              Zona {inputPosition}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center font-mono">
                            <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 p-2 rounded-lg">
                              <span className="text-[9px] text-slate-400 dark:text-slate-550 block font-sans font-medium uppercase">Sondaje</span>
                              <span className={`text-sm font-black ${currentPocketVal >= 4 ? 'text-rose-500 animate-pulse' : 'text-slate-700 dark:text-slate-200'}`}>
                                {currentPocketVal}mm
                              </span>
                            </div>
                            <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 p-2 rounded-lg">
                              <span className="text-[9px] text-slate-400 dark:text-slate-550 block font-sans font-medium uppercase">Recesión</span>
                              <span className="text-sm font-black text-cyan-550 dark:text-cyan-400">
                                {currentRecessVal}mm
                              </span>
                            </div>
                            <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 p-2 rounded-lg">
                              <span className="text-[9px] text-slate-400 dark:text-slate-550 block font-sans font-medium uppercase">NIC (CAL)</span>
                              <span className={`text-sm font-black ${currentCalVal >= 5 ? 'text-rose-500' : 'text-teal-555 dark:text-teal-400'}`}>
                                {currentCalVal}mm
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="space-y-2 text-[10.5px] leading-relaxed text-slate-600 dark:text-slate-350 bg-slate-50/60 dark:bg-slate-800/20 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full inline-block" />
                        <span><span className="font-semibold text-slate-700 dark:text-slate-300">Margen Gingival (Celeste)</span>: Determina la recesión.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-rose-500 rounded-full inline-block" />
                        <span><span className="font-semibold text-slate-700 dark:text-slate-300">Fondo del Surco (Rojo)</span>: Profundidad del sondaje.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-rose-500/20 rounded-xs inline-block border border-rose-400/20" />
                        <span><span className="font-semibold text-slate-700 dark:text-slate-300">Zona Sombreada (Rojo claro)</span>: Pérdida de inserción (CAL).</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT AREA: Expanded Surgical Inputs for Vestibular/Palatino & Mobility (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* FACE SELECTOR BUTTONS */}
              <div className="bg-white dark:bg-slate-900 duration-200 border border-slate-100 dark:border-slate-800 p-1 rounded-xl flex">
                <button
                  onClick={() => setInputSurface("vestibular")}
                  className={`flex-1 text-center py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    inputSurface === "vestibular"
                      ? "bg-slate-900 border-slate-900 text-white dark:bg-slate-800 dark:text-white"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Cara Vestibular (Externa)
                </button>
                <button
                  onClick={() => setInputSurface("palatino")}
                  className={`flex-1 text-center py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    inputSurface === "palatino"
                      ? "bg-slate-900 border-slate-900 text-white dark:bg-slate-800 dark:text-white"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Cara Palatina/Lingual
                </button>
              </div>

              {/* INPUT VALUES PANEL */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/80 pb-2.5">
                  <span className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider block">
                    {inputSurface === "vestibular" ? "Parámetros Vestibulares" : "Parámetros Palatinos"}
                  </span>
                  <span className="bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-teal-600 dark:text-teal-400 font-mono font-bold py-0.5 px-2.5 rounded-md text-xs">
                    PIEZA {selectedTooth}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {(["mesial", "central", "distal"] as const).map((pos) => {
                    const pocketMetric = inputSurface === "vestibular" ? "vestibularPocket" : "palatinoPocket";
                    const recessMetric = inputSurface === "vestibular" ? "vestibularRecess" : "palatinoRecess";
                    const bopMetric = inputSurface === "vestibular" ? "sangradoVestibular" : "sangradoPalatino";
                    const plaqueMetric = inputSurface === "vestibular" ? "placaVestibular" : "placaPalatino";
                    const suppMetric = inputSurface === "vestibular" ? "supuracionVestibular" : "supuracionPalatino";

                    const pocketVal = activeToothData[pocketMetric]?.[pos] ?? 2;
                    const recessVal = activeToothData[recessMetric]?.[pos] ?? 0;
                    const bopActive = activeToothData[bopMetric]?.[pos] ?? false;
                    const plaqueActive = activeToothData[plaqueMetric]?.[pos] ?? false;
                    const suppActive = activeToothData[suppMetric]?.[pos] ?? false;

                    const calVal = pocketVal + recessVal;
                    const isSevere = pocketVal >= 4;
                    const activeShortCursor = keyboardMode && inputSurface === inputSurface && inputPosition === pos;

                    return (
                      <div 
                        key={`cell-${inputSurface}-${pos}`} 
                        className={`space-y-4 text-center p-2.5 rounded-xl border transition-all ${
                          activeShortCursor 
                            ? "bg-teal-500/5 border-teal-500 shadow-xs ring-1 ring-teal-500/20" 
                            : "bg-slate-50/50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800/50"
                        }`}
                      >
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                          {pos}
                        </span>
                        
                        {/* Pocket metric */}
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-tight block">
                            Sondaje (mm)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="15"
                            value={pocketVal}
                            onChange={(e) => handlePocketChange(selectedTooth, pocketMetric, pos, parseInt(e.target.value) || 0)}
                            className={`w-full py-1.5 text-center font-display font-black text-base bg-white dark:bg-slate-800 rounded-lg border outline-none focus:ring-2 focus:ring-teal-500/20 transition-all ${
                              isSevere 
                                ? "border-rose-400 text-rose-500 bg-rose-50/10" 
                                : "border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                            }`}
                          />
                        </div>

                        {/* Gingival recession metric */}
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-tight block">
                            Recesión (mm)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={recessVal}
                            onChange={(e) => handlePocketChange(selectedTooth, recessMetric, pos, parseInt(e.target.value) || 0)}
                            className="w-full py-1.5 text-center font-display font-bold text-xs bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-teal-350/10"
                          />
                        </div>

                        {/* NIC Attachment Level calculations */}
                        <div className="pt-2 border-t border-slate-150 dark:border-slate-800/80 flex justify-between items-center px-0.5 text-[9.5px]">
                          <span className="text-slate-400 block">NIC (CAL):</span>
                          <span className={`font-mono font-bold ${calVal >= 5 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>
                            {calVal}mm
                          </span>
                        </div>

                        {/* Interactive toggle buttons */}
                        <div className="flex justify-center gap-1.5 pt-1 border-t border-slate-105 dark:border-slate-800/50">
                          {/* Bleeding (BOP) */}
                          <button 
                            onClick={() => handleToggleFlag(selectedTooth, bopMetric, pos)}
                            className={`p-1.5 rounded-lg transition-all border shrink-0 cursor-pointer ${
                              bopActive 
                                ? "bg-red-500 text-white border-red-500 shadow-xs" 
                                : "bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 border-slate-200 dark:border-slate-800"
                            }`}
                            title="Hemorragia al sondaje (BOP)"
                          >
                            <Droplet className="w-3.5 h-3.5" />
                          </button>

                          {/* Plaque Index (PI) */}
                          <button 
                            onClick={() => handleToggleFlag(selectedTooth, plaqueMetric, pos)}
                            className={`p-1.5 rounded-lg transition-all border shrink-0 cursor-pointer ${
                              plaqueActive 
                                ? "bg-amber-400 text-slate-800 border-amber-400 shadow-xs" 
                                : "bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/15 border-slate-200 dark:border-slate-800"
                            }`}
                            title="Presencia de Placa Bacteriana"
                          >
                            <CircleDot className="w-3.5 h-3.5" />
                          </button>

                          {/* Suppuration outflow toggle */}
                          <button 
                            onClick={() => handleToggleSupuracion(selectedTooth, suppMetric, pos)}
                            className={`p-1.5 rounded-lg transition-all border shrink-0 cursor-pointer ${
                              suppActive 
                                ? "bg-cyan-500 text-white border-cyan-500 shadow-xs" 
                                : "bg-white dark:bg-slate-800 text-slate-450 hover:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-500/15 border-slate-200 dark:border-slate-800"
                            }`}
                            title="Supuración Activa (Pus)"
                          >
                            <span className="text-[7.5px] font-sans font-bold block">Pus</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Miller Mobility & Hamp Furca Involvement */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 space-y-3 shadow-2xs">
                {/* Mobility */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-405 dark:text-slate-400 font-extrabold uppercase tracking-wider block">
                    Grado de Movilidad Unitaria (Miller modificada):
                  </span>
                  <div className="flex gap-1.5">
                    {([0, 1, 2, 3] as const).map((grade) => (
                      <button
                        key={`mov-${grade}`}
                        onClick={() => handleNumberFlag(selectedTooth, "movilidad", grade)}
                        className={`flex-1 py-1 px-2.5 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                          activeToothData.movilidad === grade
                            ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-900 dark:border-white shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-150 dark:border-slate-700"
                        }`}
                      >
                        G{grade}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Furca Involvement */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-405 dark:text-slate-400 font-extrabold uppercase tracking-wider block">
                    Lesión de Furca Radicular (Clasificación de Hamp):
                  </span>
                  <div className="flex gap-1.5">
                    {([0, 1, 2, 3] as const).map((grade) => (
                      <button
                        key={`furc-${grade}`}
                        onClick={() => handleNumberFlag(selectedTooth, "furca", grade)}
                        className={`flex-1 py-1 px-2.5 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                          activeToothData.furca === grade
                            ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-900 dark:border-white shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-400 border-slate-150 dark:border-slate-700"
                        }`}
                      >
                        C{grade}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LANG & TONETTI PERIODONTAL RISK ASSESSMENT (PRA) INTERACTIVE CALCULATOR */}
      <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl border border-slate-800 p-6 text-white space-y-6 relative overflow-hidden">
        {/* Glow graphics background decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] tracking-wider text-teal-400 font-mono font-bold uppercase block">
              Algoritmo de Valoración y Pronóstico Periodontal
            </span>
            <h4 className="text-base font-display font-black flex items-center gap-2">
              <Award className="w-5 h-5 text-teal-400 animate-pulse" />
              Evaluación de Riesgo de Lang & Tonetti (Universidad de Berna / PRA)
            </h4>
            <div className="text-[10px] text-teal-400 bg-teal-400/10 border border-teal-400/20 rounded-lg px-2.5 py-1 inline-flex items-center gap-2 mt-1.5">
              <span>💡</span>
              <span><strong>¡Nuevo!</strong> Accede a la pestaña superior <strong>&quot;Análisis de Riesgo PRA&quot;</strong> para interactuar con el Polígono de Araña Bernés tridimensional.</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-black/30 px-4 py-2 rounded-xl border border-white/5">
            <span className="text-xs text-slate-400">Riesgo Global:</span>
            <span className={`text-sm font-black tracking-wide px-2.5 py-0.5 rounded-md font-mono ${
              overallRiskLevel === "ALTO" 
                ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                : overallRiskLevel === "MODERADO" 
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            }`}>
              {overallRiskLevel}
            </span>
          </div>
        </div>

         {/* INTERACTIVE SIMULATORS FOR INSTANT PATIENT EVALUATION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white/5 p-4 rounded-xl border border-white/10">
          {/* Smoking slider input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wide flex justify-between">
              <span>Hábito Tabáquico:</span>
              <span className="text-teal-400 font-mono">{praSmoking} cigs/dia</span>
            </label>
            <input 
              type="range" 
              min="0" 
              max="30"
              value={praSmoking}
              onChange={(e) => handleSmokingChange(parseInt(e.target.value) || 0)}
              className="w-full accent-teal-400 font-bold"
            />
            <span className="text-[9px] text-slate-400 block font-light">
              &ge; 10 cig/día representa factor de alto riesgo según criterios Berna.
            </span>
          </div>

          {/* Diabetes status toggle */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wide block">
              Condición Metabólica (Diabetes):
            </label>
            <select 
              value={praDiabetes} 
              onChange={(e) => handleDiabetesChange(e.target.value as any)}
              className="w-full bg-slate-900 border border-white/15 rounded-lg py-1 px-2.5 text-xs outline-none text-white focus:border-teal-400"
            >
              <option value="none">Sano / Sin Diabetes</option>
              <option value="controlled">Diabetes Controlada (HbA1c &lt; 7.0%)</option>
              <option value="severe">Diabetes Descompensada (HbA1c &ge; 7.0%)</option>
            </select>
            <span className="text-[9px] text-slate-400 block font-light">
              Niveles HbA1c &ge; 7% aceleran gravemente la pérdida ósea alveolar.
            </span>
          </div>

          {/* Patient simulated age slider */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wide flex justify-between">
              <span>Edad del Paciente:</span>
              <span className="text-teal-400 font-mono">{praAge} años</span>
            </label>
            <input 
              type="range" 
              min="18" 
              max="95"
              value={praAge}
              onChange={(e) => handleAgeChange(parseInt(e.target.value) || 45)}
              className="w-full accent-teal-400"
            />
            <span className="text-[9px] text-slate-400 block font-light">
              Determina la relación entre pérdida ósea (NIC máx) y edad.
            </span>
          </div>
        </div>

        {/* 6 LANG AND TONETTI PILLARS DASHBOARD REPRESENTATION */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* BOP Pillar */}
          <div className="bg-black/40 border border-white/5 p-3 rounded-xl space-y-1 text-center">
            <span className="text-[9px] text-slate-400 uppercase font-mono block">1. Sangrado BOP</span>
            <div className={`text-base font-extrabold font-mono ${isBopHigh ? "text-red-400" : "text-emerald-400"}`}>
              {normalizedBop}%
            </div>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full inline-block font-mono ${
              isBopHigh ? "bg-red-500/10 text-red-300" : "bg-emerald-500/10 text-emerald-300"
            }`}>
              {isBopHigh ? "Alto Riesgo" : "Saludable"}
            </span>
          </div>

          {/* Residual Pockets Pillar */}
          <div className="bg-black/40 border border-white/5 p-3 rounded-xl space-y-1 text-center">
            <span className="text-[9px] text-slate-400 uppercase font-mono block">2. Bolsas &ge;5mm</span>
            <div className={`text-base font-extrabold font-mono ${isPocketsHigh ? "text-red-400" : "text-emerald-400"}`}>
              {pocketsGreaterEqual5} sitio(s)
            </div>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full inline-block font-mono ${
              isPocketsHigh ? "bg-red-500/10 text-red-300" : "bg-emerald-500/10 text-emerald-300"
            }`}>
              {isPocketsHigh ? "Alto Riesgo" : "Normal"}
            </span>
          </div>

          {/* Teeth Loss Pillar */}
          <div className="bg-black/40 border border-white/5 p-3 rounded-xl space-y-1 text-center">
            <span className="text-[9px] text-slate-400 uppercase font-mono block">3. Pérdida Dentaria</span>
            <div className={`text-base font-extrabold font-mono ${isMissingHigh ? "text-red-400" : "text-emerald-400"}`}>
              {missingTeethCount} perdida(s)
            </div>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full inline-block font-mono ${
              isMissingHigh ? "bg-red-500/10 text-red-300" : "bg-emerald-500/10 text-emerald-300"
            }`}>
              {isMissingHigh ? "Alto Riesgo" : "Normal"}
            </span>
          </div>

          {/* Bone loss / Age ratio Pillar */}
          <div className="bg-black/40 border border-white/5 p-3 rounded-xl space-y-1 text-center">
            <span className="text-[9px] text-slate-400 uppercase font-mono block">4. Alveolar/Edad</span>
            <div className={`text-base font-extrabold font-mono ${isBoneLossHigh ? "text-red-400" : "text-emerald-400"}`}>
              {praiseRatio.toFixed(2)}
            </div>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full inline-block font-mono ${
              isBoneLossHigh ? "bg-red-500/10 text-red-300" : "bg-emerald-500/10 text-emerald-300"
            }`}>
              {isBoneLossHigh ? "Alto Riesgo" : "Normal"}
            </span>
          </div>

          {/* Diabetes status Pillar */}
          <div className="bg-black/40 border border-white/5 p-3 rounded-xl space-y-1 text-center">
            <span className="text-[9px] text-slate-400 uppercase font-mono block">5. Diabetes</span>
            <div className={`text-xs font-mono font-bold truncate ${isDiabetesHigh ? "text-red-400" : "text-emerald-400"}`}>
              {praDiabetes === "none" ? "Sin diabetes" : praDiabetes === "controlled" ? "HbA1c < 7.0%" : "HbA1c ≥ 7.0%"}
            </div>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full inline-block font-mono ${
              isDiabetesHigh ? "bg-red-500/10 text-red-300" : "bg-emerald-500/10 text-emerald-300"
            }`}>
              {isDiabetesHigh ? "Alto Riesgo" : "Normal"}
            </span>
          </div>

          {/* Smoking status Pillar */}
          <div className="bg-black/40 border border-white/5 p-3 rounded-xl space-y-1 text-center">
            <span className="text-[9px] text-slate-400 uppercase font-mono block">6. Tabaquismo</span>
            <div className={`text-base font-extrabold font-mono ${isSmokingHigh ? "text-red-400" : "text-emerald-400"}`}>
              {praSmoking} al día
            </div>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full inline-block font-mono ${
              isSmokingHigh ? "bg-red-500/10 text-red-300" : "bg-emerald-500/10 text-emerald-300"
            }`}>
              {isSmokingHigh ? "Alto Riesgo" : "Normal"}
            </span>
          </div>
        </div>

        {/* CLINICAL DECISION SUPPORT & GUIDANCE REMARKS */}
        <div className="bg-white/[0.03] border border-white/10 p-5 rounded-xl space-y-3">
          <span className="text-xs font-bold text-teal-400 block uppercase tracking-wider">
            Recomendaciones Clínicas de Apoyo a la Decisión Periodontal:
          </span>
          
          <div className="text-xs text-slate-300 leading-relaxed font-light space-y-2">
            <p>
              {overallRiskLevel === "ALTO" ? (
                <span>
                  <strong>🚨 ACCIÓN INMEDIATA:</strong> El paciente experimenta una tasa de susceptibilidad periodontal crítica. Se sugiere programar terapia periodontal activa de fase I (raspado y alisado radicular) o derivación a especialista si persisten multi-furcas clase II o III. Es vital instruir reducción estricta del hábito tabáquico y control de glucosa HbA1c para estabilización de inserción.
                </span>
              ) : overallRiskLevel === "MODERADO" ? (
                <span>
                  <strong>⚠️ MONITORIZACIÓN CLÍNICA:</strong> Riesgo periodontal intermedio. Programar profilaxis clínica y descontaminación subgingival periodontal cada 3-6 meses. Reforzar uso de enjuagues periodontales antisépticos o cepillos interproximales en nichos de bolsas &ge; 4mm.
                </span>
              ) : (
                <span>
                  <strong>✅ MANTENIMIENTO:</strong> El paciente presenta un perfil de susceptibilidad periodontal controlado. Se sugiere agendar visitas de mantenimiento preventivo anuales. Conservar tácticas de motivación e higiene vigentes.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Guide details panel */}
      <div className="bg-teal-50/20 dark:bg-slate-800/10 border border-teal-500/10 p-4 rounded-xl flex gap-3 text-xs text-teal-800 dark:text-teal-300">
        <Info className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="font-bold">Guía Clínica de Parámetros Periodontales</h5>
          <p className="font-light leading-relaxed">
            <strong>Sondaje (Profundidad de Bolsa PS):</strong> Valores habituales están entre &le; 3 mm de surco saludable. Un PS &ge; 4 mm representa pérdida clínica patológica que requiere instrumentación clínica. 
            <br />
            <strong>Nivel de Inserción Clínica (NIC / CAL):</strong> Sumatoria absoluta del Sondaje y la Recesión Gingival (PS + REC), definiendo con rigor científico el grado de soporte óseo remanente del diente tratado.
          </p>
        </div>
      </div>

    </div>
  );
}
