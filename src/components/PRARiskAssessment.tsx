import React, { useState } from "react";
import { PeriodonState, ToothState, Patient } from "../types";
import { UPPER_TEETH, LOWER_TEETH } from "../initialData";
import { 
  Award, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Heart, 
  Shield, 
  Info, 
  Sliders, 
  User, 
  Layers,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PRARiskAssessmentProps {
  periodontogram: Record<number, PeriodonState>;
  odontogram?: Record<number, ToothState>;
  patient: Patient;
  onUpdatePatient: (updatedPatient: Patient) => void;
}

export default function PRARiskAssessment({ 
  periodontogram, 
  odontogram, 
  patient, 
  onUpdatePatient 
}: PRARiskAssessmentProps) {

  // Fallbacks in case tabaquismo (smoking), diabetesStatus, or edadSimulada are not set in the parent
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
    onUpdatePatient({
      ...patient,
      anamnesis: {
        ...patient.anamnesis,
        tabaquismo: val
      }
    });
  };

  const handleDiabetesChange = (val: "none" | "controlled" | "severe") => {
    onUpdatePatient({
      ...patient,
      anamnesis: {
        ...patient.anamnesis,
        diabetes: val !== "none",
        diabetesStatus: val
      }
    });
  };

  const handleAgeChange = (val: number) => {
    onUpdatePatient({
      ...patient,
      anamnesis: {
        ...patient.anamnesis,
        edadSimulada: val
      }
    });
  };

  // CALCULATE PILLAR METRICS FROM ACTIVE DENTAL STATE
  let totalEvaluatedSurfaces = 0;
  let plaqueSurfaces = 0;
  let bopSurfaces = 0;
  let pocketsGreaterEqual5 = 0;
  let maxCALInMouth = 0;

  Object.entries(periodontogram || {}).forEach(([toothNumStr, state]) => {
    // We count mesial, central, distal for both vestibular and palatino
    // total evaluated surfaces is based on teeth present in periodontogram
    totalEvaluatedSurfaces += 6; 

    // Plaque Surfaces (OLeary Plaque Control Record indices)
    if (state.placaVestibular?.mesial) plaqueSurfaces++;
    if (state.placaVestibular?.central) plaqueSurfaces++;
    if (state.placaVestibular?.distal) plaqueSurfaces++;
    if (state.placaPalatino?.mesial) plaqueSurfaces++;
    if (state.placaPalatino?.central) plaqueSurfaces++;
    if (state.placaPalatino?.distal) plaqueSurfaces++;

    // BOP (Bleeding on Probing) Indices
    if (state.sangradoVestibular?.mesial) bopSurfaces++;
    if (state.sangradoVestibular?.central) bopSurfaces++;
    if (state.sangradoVestibular?.distal) bopSurfaces++;
    if (state.sangradoPalatino?.mesial) bopSurfaces++;
    if (state.sangradoPalatino?.central) bopSurfaces++;
    if (state.sangradoPalatino?.distal) bopSurfaces++;

    // Residual pockets counts (pocket >= 5 mm)
    const vPk = state.vestibularPocket || { mesial: 0, central: 0, distal: 0 };
    const pPk = state.palatinoPocket || { mesial: 0, central: 0, distal: 0 };
    if (vPk.mesial >= 5) pocketsGreaterEqual5++;
    if (vPk.central >= 5) pocketsGreaterEqual5++;
    if (vPk.distal >= 5) pocketsGreaterEqual5++;
    if (pPk.mesial >= 5) pocketsGreaterEqual5++;
    if (pPk.central >= 5) pocketsGreaterEqual5++;
    if (pPk.distal >= 5) pocketsGreaterEqual5++;

    // Clinical Attachment Loss (CAL / NIC = Pocket + Recession)
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
  });

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
    Object.values(periodontogram || {}).forEach((state) => {
      const is0 = (state.vestibularPocket?.mesial === 0) && (state.vestibularPocket?.central === 0) && (state.vestibularPocket?.distal === 0);
      if (is0) missingTeethCount++;
    });
  }

  // PRA continuous metrics
  const praiseRatio = praAge > 0 ? maxCALInMouth / praAge : 0;
  
  // Risk thresholds checking (Lang & Tonetti criteria)
  const isBopHigh = normalizedBop > 25;
  const isPocketsHigh = pocketsGreaterEqual5 > 4;
  const isMissingHigh = missingTeethCount > 8;
  const isBoneLossHigh = praiseRatio > 1.0;
  const isDiabetesHigh = praDiabetes === "severe";
  const isSmokingHigh = praSmoking >= 10;

  // Global Risk Assessment Formula (Lang & Tonetti PRA: 
  // High risk if >= 2 vectors are in high category (or 1 critical)
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

  // RADAR CHART COORDINATES MAPPINGS (6 Angles: 0, 60, 120, 180, 240, 300)
  // Maps values to a score of [0.1, 3] representing center-to-edge
  const getBopScore = () => {
    if (normalizedBop <= 10) return 0.2 + (normalizedBop / 10) * 0.8; // Low
    if (normalizedBop <= 25) return 1.0 + ((normalizedBop - 10) / 15) * 1.0; // Mod
    return 2.0 + Math.min(1.0, ((normalizedBop - 25) / 75) * 1.0); // High
  };

  const getPocketsScore = () => {
    if (pocketsGreaterEqual5 <= 4) return 0.2 + (pocketsGreaterEqual5 / 4) * 0.8;
    if (pocketsGreaterEqual5 <= 8) return 1.0 + ((pocketsGreaterEqual5 - 4) / 4) * 1.0;
    return 2.0 + Math.min(1.0, ((pocketsGreaterEqual5 - 8) / 12) * 1.0);
  };

  const getMissingScore = () => {
    if (missingTeethCount <= 4) return 0.2 + (missingTeethCount / 4) * 0.8;
    if (missingTeethCount <= 8) return 1.0 + ((missingTeethCount - 4) / 4) * 1.0;
    return 2.0 + Math.min(1.0, ((missingTeethCount - 8) / 16) * 1.0);
  };

  const getBoneLossScore = () => {
    if (praiseRatio <= 0.5) return 0.2 + (praiseRatio / 0.5) * 0.8;
    if (praiseRatio <= 1.0) return 1.0 + ((praiseRatio - 0.5) / 0.5) * 1.0;
    return 2.0 + Math.min(1.0, ((praiseRatio - 1.0) / 1.0) * 1.0);
  };

  const getDiabetesScore = () => {
    if (praDiabetes === "none") return 0.5;
    if (praDiabetes === "controlled") return 1.5;
    return 2.5;
  };

  const getSmokingScore = () => {
    if (praSmoking === 0) return 0.2;
    if (praSmoking < 10) return 1.0 + (praSmoking / 10) * 0.8;
    return 2.1 + Math.min(0.9, ((praSmoking - 10) / 20) * 0.9);
  };

  const scores = [
    getBopScore(),       // Axis 0: BOP
    getPocketsScore(),   // Axis 1: Pockets >= 5mm
    getMissingScore(),   // Axis 2: Lost teeth
    getBoneLossScore(),  // Axis 3: BL / Age Ratio
    getDiabetesScore(),  // Axis 4: Diabetes Status
    getSmokingScore()    // Axis 5: Smoking status
  ];

  // Helper code for rendering background hexagons
  const getPoint = (cx: number, cy: number, r: number, index: number) => {
    const angle = (index * 60 - 90) * (Math.PI / 180);
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  };

  const getPolygonPath = (cx: number, cy: number, currentScores: number[]) => {
    return currentScores.map((score, index) => {
      const radius = score * 36.6; // multiplier to stretch max (3) to ~110px radius
      const angle = (index * 60 - 90) * (Math.PI / 180);
      return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
    }).join(" ");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* BRAND & EXPANATIVE METRICS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gradient-to-r from-teal-500/10 via-cyan-500/5 to-transparent p-5 rounded-2xl border border-teal-500/10 dark:border-teal-500/10">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded-md font-mono uppercase mb-2 inline-block">
            HERRAMIENTA ACADÉMICA MULTIPARÁMETRO
          </span>
          <h3 className="text-xl font-display font-black text-slate-800 dark:text-white">
            Análisis de Riesgo Periodontal (PRA)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
            <Activity className="w-3.5 h-3.5 text-teal-500" />
            Modelo funcional de Lang & Tonetti (Universidad de Berna / Quintessence Publishing)
          </p>
        </div>

        {/* Global risk indicator badge */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
          <div className="space-y-0.5">
            <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">RIESGO GLOBAL</span>
            <span className={`text-base font-black tracking-wide font-mono ${
              overallRiskLevel === "ALTO" 
                ? "text-red-600 dark:text-red-400" 
                : overallRiskLevel === "MODERADO" 
                ? "text-amber-500 dark:text-amber-400" 
                : "text-emerald-600 dark:text-emerald-400"
            }`}>
              {overallRiskLevel}
            </span>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
          <div className="text-center">
            <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">VECTORES ALTOS</span>
            <span className="text-lg font-mono font-black text-slate-800 dark:text-slate-200">
              {highRiskPillarsCount} / 6
            </span>
          </div>
        </div>
      </div>

      {/* TWO PANEL CORE WORKSPACE */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COMPONENT: PATIENT SLIDERS + DESCRIPTION PILLARS */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* BIDIRECTIONAL EDITING SYSTEM */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Sliders className="w-4 h-4 text-teal-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Parámetros Clínicos Modificables (Anamnesis Activa)
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Smoking slider input */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex justify-between">
                  <span>Hábito Tabáquico:</span>
                  <span className="text-teal-600 dark:text-teal-400 font-mono font-bold">{praSmoking} cigs/dia</span>
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="30"
                  value={praSmoking}
                  onChange={(e) => handleSmokingChange(parseInt(e.target.value) || 0)}
                  className="w-full accent-teal-500 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[9px] text-slate-400 block font-light leading-snug">
                  &ge; 10 cigs/día reclasifica al tabaquismo como un factor de alta vulnerabilidad biológica.
                </span>
              </div>

              {/* Diabetes condition */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
                  Estado Glucémico (Diabetes):
                </label>
                <select 
                  value={praDiabetes} 
                  onChange={(e) => handleDiabetesChange(e.target.value as any)}
                  className="w-full bg-slate-55 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 px-2.5 text-xs outline-none text-slate-700 dark:text-white focus:border-teal-500"
                >
                  <option value="none">Sano / Sin Diabetes</option>
                  <option value="controlled">Diabetes Controlada (HbA1c &lt; 7.0%)</option>
                  <option value="severe">Diabetes Descompensada (HbA1c &ge; 7.0%)</option>
                </select>
                <span className="text-[9px] text-slate-400 block font-light leading-snug">
                  Un mal control de HbA1c severo altera drásticamente la cicatrización e inmunidad periodontal.
                </span>
              </div>

              {/* Simulated Age */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex justify-between">
                  <span>Edad del Paciente:</span>
                  <span className="text-teal-600 dark:text-teal-400 font-mono font-bold">{praAge} años</span>
                </label>
                <input 
                  type="range" 
                  min="18" 
                  max="95"
                  value={praAge}
                  onChange={(e) => handleAgeChange(parseInt(e.target.value) || 45)}
                  className="w-full accent-teal-500 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[9px] text-slate-400 block font-light leading-snug">
                  Calcula de forma dinámica la velocidad de reabsorción ósea relativa a la edad del paciente.
                </span>
              </div>
            </div>

            <div className="bg-teal-50/50 dark:bg-teal-900/10 border border-dashed border-teal-200 dark:border-teal-900/40 p-3 rounded-xl text-[10px] text-teal-700 dark:text-teal-300 flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-500 flex-shrink-0" />
              <span>
                <strong>Novedad bidireccional activa:</strong> Los ajustes modificados aquí actualizan automáticamente la anamnesis en la ficha general de <strong>{patient.name}</strong> en tiempo real.
              </span>
            </div>
          </div>

          {/* INDIVIDUAL PILLARS CRITERIA DETAILED DISPLAY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Bleeding Pillar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-start gap-3 shadow-sm">
              <div className={`p-2 rounded-lg ${isBopHigh ? "bg-red-50 dark:bg-red-950/30 text-red-500" : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500"}`}>
                <Activity className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">1. Sangrado al Sondaje (BOP)</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-black font-mono text-slate-800 dark:text-slate-100">{normalizedBop}%</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${isBopHigh ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"}`}>
                    {isBopHigh ? "Alto Riesgo (&gt;25%)" : "Bajo/Moderado (&le;25%)"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-light leading-snug">
                  Mide el porcentaje de sitios sangrantes. Refleja la inflamación gingival activa en boca.
                </p>
              </div>
            </div>

            {/* Pockets Pillar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-start gap-3 shadow-sm">
              <div className={`p-2 rounded-lg ${isPocketsHigh ? "bg-red-50 dark:bg-red-950/30 text-red-500" : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500"}`}>
                <Layers className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">2. Bolsas Residuales &ge; 5mm</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-black font-mono text-slate-800 dark:text-slate-100">{pocketsGreaterEqual5} sitios</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${isPocketsHigh ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"}`}>
                    {isPocketsHigh ? "Alto Riesgo (&gt;4)" : "Bajo/Moderado (&le;4)"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-light leading-snug">
                  Sitios periodontales con profundidad crítica residual que promueven colonización bacteriana anaerobia.
                </p>
              </div>
            </div>

            {/* Lost Teeth Pillar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-start gap-3 shadow-sm">
              <div className={`p-2 rounded-lg ${isMissingHigh ? "bg-red-50 dark:bg-red-950/30 text-red-500" : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500"}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">3. Pérdida Dentaria</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-black font-mono text-slate-800 dark:text-slate-100">{missingTeethCount} ausentes</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${isMissingHigh ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"}`}>
                    {isMissingHigh ? "Alto Riesgo (&gt;8)" : "Bajo/Moderado (&le;8)"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-light leading-snug">
                  Carga masticatoria residual. Un mayor número de dientes perdidos sobrecarga mecánicamente los remanentes.
                </p>
              </div>
            </div>

            {/* Bone Loss Ratio */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-start gap-3 shadow-sm">
              <div className={`p-2 rounded-lg ${isBoneLossHigh ? "bg-red-50 dark:bg-red-950/30 text-red-500" : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500"}`}>
                <Shield className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">4. Alveolar / Edad (Pérdida/Edad)</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-black font-mono text-slate-800 dark:text-slate-100">{praiseRatio.toFixed(2)}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${isBoneLossHigh ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"}`}>
                    {isBoneLossHigh ? "Alto Riesgo (&gt;1.0)" : "Bajo/Moderado (&le;1.0)"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-light leading-snug">
                  Pérdida ósea máxima aproximada en boca (NIC {maxCALInMouth}mm) dividida entre la edad del paciente ({praAge}).
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COMPONENT: INTERACTIVE SVG RADAR HEXAGON */}
        <div className="xl:col-span-5 flex flex-col justify-between space-y-6">
          <div className="bg-slate-900 dark:bg-slate-950 border border-slate-800 p-5 rounded-2xl text-white flex flex-col items-center justify-center space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full filter blur-3xl pointer-events-none" />
            
            <div className="text-center space-y-1">
              <h4 className="text-xs font-bold font-display uppercase tracking-widest text-teal-400">
                Visualizador de Riesgo Periodontal
              </h4>
              <p className="text-[10px] text-slate-400 font-light">
                Polígono Dinámico Berna de 6 Dimensiones
              </p>
            </div>

            {/* THE SVG RADAR CHART */}
            <div className="w-full max-w-[280px] aspect-square relative flex items-center justify-center">
              <svg 
                viewBox="0 0 300 300" 
                className="w-full h-full overflow-visible drop-shadow-[0_0_15px_rgba(20,184,166,0.15)]"
              >
                {/* Definiciones y degradados para el polígono de riesgo */}
                <defs>
                  <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.45" />
                  </radialGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Concentric grid lines indicating Low (score 1.0), Medium (score 2.0), High (score 3.0) boundaries */}
                {/* 1. Low risk Hexagon background (Light green hue) */}
                <polygon 
                  points={[0,1,2,3,4,5].map(i => getPoint(150, 150, 36.6, i)).join(" ")}
                  fill="rgba(16, 185, 129, 0.04)"
                  stroke="rgba(16, 185, 129, 0.25)"
                  strokeWidth="1.2"
                  strokeDasharray="4,4"
                />
                
                {/* 2. Moderate risk Hexagon boundary (Yellowish orange hue) */}
                <polygon 
                  points={[0,1,2,3,4,5].map(i => getPoint(150, 150, 73.2, i)).join(" ")}
                  fill="none"
                  stroke="rgba(245, 158, 11, 0.25)"
                  strokeWidth="1.2"
                  strokeDasharray="4,4"
                />

                {/* 3. Outer maximum boundary (Red hue) */}
                <polygon 
                  points={[0,1,2,3,4,5].map(i => getPoint(150, 150, 110, i)).join(" ")}
                  fill="none"
                  stroke="rgba(239, 68, 68, 0.25)"
                  strokeWidth="1.5"
                />

                {/* Draw axes radiating lines from center to outer point */}
                {[0, 1, 2, 3, 4, 5].map((index) => {
                  const endPoint = getPoint(150, 150, 112, index);
                  return (
                    <line 
                      key={index}
                      x1={150} 
                      y1={150} 
                      x2={endPoint.split(",")[0]} 
                      y2={endPoint.split(",")[1]} 
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* RENDER THE ACTUAL PATIENT'S SCORE POLYGON */}
                <polygon 
                  points={getPolygonPath(150, 150, scores)}
                  fill="url(#radarGrad)"
                  stroke="#14b8a6"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glow)"
                />

                {/* Draw point nodes for highlight */}
                {scores.map((score, index) => {
                  const pt = getPoint(150, 150, score * 36.6, index);
                  const x = parseFloat(pt.split(",")[0]);
                  const y = parseFloat(pt.split(",")[1]);
                  const isSpecificHigh = score >= 2.0;

                  return (
                    <circle 
                      key={index}
                      cx={x}
                      cy={y}
                      r={6}
                      fill={isSpecificHigh ? "#ef4444" : "#14b8a6"}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  );
                })}

                {/* Angle label coordinates for text markers inside SVG */}
                {[
                  { label: "BOP", yOffset: -12, xOffset: 0, textAnchor: "middle" },
                  { label: "BOLSAS", yOffset: -2, xOffset: 12, textAnchor: "start" },
                  { label: "PÉRDIDAS", yOffset: 15, xOffset: 12, textAnchor: "start" },
                  { label: "PÉRDIDA/EDAD", yOffset: 15, xOffset: 0, textAnchor: "middle" },
                  { label: "DIABETES", yOffset: 15, xOffset: -12, textAnchor: "end" },
                  { label: "FUMADOR", yOffset: -2, xOffset: -12, textAnchor: "end" }
                ].map((marker, idx) => {
                  const outerPt = getPoint(150, 150, 126, idx);
                  const tx = parseFloat(outerPt.split(",")[0]) + marker.xOffset;
                  const ty = parseFloat(outerPt.split(",")[1]) + marker.yOffset;
                  const isCurrentHigh = [isBopHigh, isPocketsHigh, isMissingHigh, isBoneLossHigh, isDiabetesHigh, isSmokingHigh][idx];

                  return (
                    <text 
                      key={idx}
                      x={tx}
                      y={ty}
                      textAnchor={marker.textAnchor as any}
                      className={`text-[8.5px] font-mono font-black tracking-wider ${isCurrentHigh ? "fill-red-450 dark:fill-red-400" : "fill-slate-350"}`}
                    >
                      {marker.label}
                    </text>
                  );
                })}
              </svg>
            </div>

            {/* Legend guide */}
            <div className="flex gap-4 text-[9px] font-mono font-bold text-slate-400 border-t border-white/5 pt-3 w-full justify-center">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> Bajo
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" /> Moderado
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" /> Alto
              </span>
            </div>
          </div>

          {/* DYNAMIC ACTIONABLE DECISION BOARD MODULE */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4 flex-1">
            <span className="text-[10px] font-bold text-teal-650 dark:text-teal-400 uppercase tracking-widest block">
              RECOMENDACIONES CLÍNICAS DE APOYO:
            </span>
            
            <div className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-light flex-1">
              {overallRiskLevel === "ALTO" ? (
                <div className="space-y-2">
                  <p className="font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <Heart className="w-4 h-4" /> COMPROMISO CLÍNICO SEVERO:
                  </p>
                  <p>
                    El polígono de Berna demuestra una susceptibilidad periodontal crítica descompensada. Se sugiere programar terapia de Fase I (raspado y alisado radicular) y visitas repetidas cada 2 semanas. Es fundamental interceder con consejería antitabaco y monitoreo médico de diabetes (HbA1c).
                  </p>
                </div>
              ) : overallRiskLevel === "MODERADO" ? (
                <div className="space-y-2">
                  <p className="font-medium text-amber-650 dark:text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> VIGILANCIA PERIÓDICA REQUERIDA:
                  </p>
                  <p>
                    Representa un nivel intermedio de susceptibilidad biológica. Se sugiere programar desbridamiento subgingival periodontal mecánico cada 3 a 6 meses. Reforzar tácticas de higiene bucal con cepillos interdentarios especiales.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="font-medium text-emerald-650 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> ESTADO CONTROLADO / MANTENIMIENTO:
                  </p>
                  <p>
                    Perfil periodontal sumamente estable. Se sugiere mantener citas preventivas semestrales o anuales para sustentabilidad a largo plazo. Felicitar al paciente por su excelente apego a las metas de control.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex text-[9px] text-slate-450 dark:text-slate-500 font-mono italic">
              * El polígono y su área de riesgo aumentan proporcionalmente ante tabaquismo progresivo, mala regulación glicémica y presencia de bolsas &ge; 5mm.
            </div>
          </div>

        </div>

      </div>

    </motion.div>
  );
}
