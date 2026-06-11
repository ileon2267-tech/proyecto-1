import React, { useState, useEffect } from "react";
import { Patient, TreatmentProcedure, TreatmentPlan } from "../types";
import { Banknote, CheckCircle, Circle, Calculator, Percent, CreditCard, ChevronRight, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";

interface FinanceModuleProps {
  activePatient: Patient | null;
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  aranceles?: Record<string, number>;
}

export default function FinanceModule({ activePatient, setPatients, aranceles }: FinanceModuleProps) {
  if (!activePatient) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
        <Banknote className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-700" />
        <h3 className="text-xl font-bold font-display">Sin Paciente Activo</h3>
        <p className="text-sm">Seleccione un paciente para ver su plan de tratamiento y finanzas.</p>
      </div>
    );
  }

  const plan: TreatmentPlan = activePatient.treatmentPlan || { procedures: [], financing: { months: 12, downPayment: 0, interestRate: 15 } };
  
  const [newDesc, setNewDesc] = useState("");
  const [newCost, setNewCost] = useState("");
  const [newPhase, setNewPhase] = useState<"Diagnostico" | "Saneamiento" | "Rehabilitacion" | "Mantenimiento">("Diagnostico");
  
  // Simulator State
  const [months, setMonths] = useState(plan.financing?.months || 12);
  const [down, setDown] = useState(plan.financing?.downPayment || 0);
  const [rate, setRate] = useState(plan.financing?.interestRate || 15);
  const [contractSuccess, setContractSuccess] = useState(false);

  const totalCost = plan.procedures.reduce((acc, p) => acc + p.cost, 0);
  const completedCost = plan.procedures.filter(p => p.completed).reduce((acc, p) => acc + p.cost, 0);
  const principal = Math.max(0, totalCost - down); // Lo que se va a financiar
  
  // Formula francesa (anualidad)
  const monthlyRate = (rate / 100) / 12;
  const calculateInstallment = () => {
    if (principal <= 0) return 0;
    if (months <= 0) return 0;
    if (monthlyRate === 0) return principal / months;
    return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  };
  const installment = calculateInstallment();

  const handleUpdatePlan = (newPlan: TreatmentPlan) => {
    setPatients(prev => prev.map(p => p.id === activePatient.id ? { ...p, treatmentPlan: newPlan } : p));
  };

  const handleApproveContract = () => {
    const newEvolution = {
      id: `evo-fin-${Date.now()}`,
      date: new Date().toLocaleDateString("es-ES"),
      description: `💳 CONTRATO DE FINANCIAMIENTO PLANIFICADO:\n\n- Costo Total Tratamientos: $${Math.round(totalCost).toLocaleString("es-CL")} CLP\n- Abono Enganche: $${Math.round(down).toLocaleString("es-CL")} CLP\n- Capital Financiado: $${Math.round(principal).toLocaleString("es-CL")} CLP\n- Plazo: ${months} meses con Tasa de ${rate}% interés anual.\n- Cuota Mensual Estimada: $${Math.round(installment).toLocaleString("es-CL")} CLP.`,
      professional: "Administración / Finanzas",
    };

    const updatedEvolutions = [newEvolution, ...(activePatient.evolutions || [])];

    setPatients(prev => prev.map(p => p.id === activePatient.id ? {
      ...p,
      evolutions: updatedEvolutions,
      treatmentPlan: {
        ...plan,
        financing: { months, downPayment: down, interestRate: rate }
      }
    } : p));

    setContractSuccess(true);
    setTimeout(() => {
      setContractSuccess(false);
    }, 4000);
  };

  const handleAddProcedure = () => {
    if (!newDesc.trim() || !newCost) return;
    const costNum = parseFloat(newCost);
    if (isNaN(costNum)) return;

    const newProc: TreatmentProcedure = {
      id: `proc-${Date.now()}`,
      phase: newPhase,
      description: newDesc,
      cost: costNum,
      completed: false
    };

    handleUpdatePlan({
      ...plan,
      procedures: [...plan.procedures, newProc]
    });
    setNewDesc("");
    setNewCost("");
  };

  const toggleStatus = (procId: string) => {
    handleUpdatePlan({
      ...plan,
      procedures: plan.procedures.map(p => p.id === procId ? { ...p, completed: !p.completed } : p)
    });
  };

  const deleteProcedure = (procId: string) => {
    handleUpdatePlan({
      ...plan,
      procedures: plan.procedures.filter(p => p.id !== procId)
    });
  };

  // Sync parameters when patient changes to avoid cross-patient overwriting
  useEffect(() => {
    if (activePatient) {
      const f = activePatient.treatmentPlan?.financing;
      setMonths(f?.months ?? 12);
      setDown(f?.downPayment ?? 0);
      setRate(f?.interestRate ?? 15);
    }
  }, [activePatient.id]);

  useEffect(() => {
    if (activePatient) {
      const currentFin = activePatient.treatmentPlan?.financing;
      const currentMonths = currentFin?.months ?? 12;
      const currentDown = currentFin?.downPayment ?? 0;
      const currentRate = currentFin?.interestRate ?? 15;

      if (months !== currentMonths || down !== currentDown || rate !== currentRate) {
        handleUpdatePlan({
          ...plan,
          financing: { months, downPayment: down, interestRate: rate }
        });
      }
    }
  }, [months, down, rate]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 flex justify-between items-center shadow-xs">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-3">
             <Banknote className="w-7 h-7 text-teal-600 dark:text-teal-400" /> Plan Financiero Integral
          </h2>
          <p className="text-sm text-slate-500 font-mono mt-1">Paciente: <span className="font-bold text-slate-800 dark:text-slate-200">{activePatient.name}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Treatment Plan List */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 space-y-5">
           <h3 className="font-bold text-lg border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              Procedimientos
              <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-700 dark:text-slate-300 font-mono">
                ${completedCost.toLocaleString("es-CL")} / ${totalCost.toLocaleString("es-CL")} CLP
              </span>
           </h3>

            {aranceles && (
              <div className="flex flex-col md:flex-row items-center gap-2 p-3 bg-teal-500/5 rounded-xl border border-teal-500/10 mb-2">
                <span className="text-[10px] font-black uppercase tracking-wide text-teal-600 dark:text-teal-400 shrink-0">Presupuesto Rápido (Arancel):</span>
                <select
                  onChange={(e) => {
                    const selected = e.target.value;
                    if (selected && aranceles[selected] !== undefined) {
                      setNewDesc(selected);
                      setNewCost(aranceles[selected].toString());
                    }
                  }}
                  className="flex-1 bg-white dark:bg-slate-800 text-xs px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 outline-none text-slate-700 dark:text-slate-350"
                  defaultValue=""
                >
                  <option value="" disabled>-- Seleccione Arancel Preconfigurado --</option>
                  {Object.entries(aranceles).map(([name, price]) => (
                    <option key={name} value={name}>{name} (${price.toLocaleString("es-CL")} CLP)</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-2 text-sm text-slate-600 dark:text-slate-300 flex-col md:flex-row">
              <input type="text" placeholder="Tratamiento..." value={newDesc} onChange={e => setNewDesc(e.target.value)} className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg outline-none text-xs" />
              <select value={newPhase} onChange={e => setNewPhase(e.target.value as any)} className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg outline-none text-xs">
                <option value="Diagnostico">Diagnóstico</option>
                <option value="Saneamiento">Saneamiento</option>
                <option value="Rehabilitacion">Rehabilitación</option>
                <option value="Mantenimiento">Mantenimiento</option>
              </select>
              <input type="number" placeholder="Costo " value={newCost} onChange={e => setNewCost(e.target.value)} className="w-24 px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg outline-none text-xs" />
              <button onClick={handleAddProcedure} className="bg-teal-600 hover:bg-teal-700 text-white p-2 rounded-lg cursor-pointer transition-colors"><Plus className="w-5 h-5"/></button>
            </div>

           <div className="space-y-4 pt-4 h-64 overflow-y-auto pr-2">
             {["Diagnostico", "Saneamiento", "Rehabilitacion", "Mantenimiento"].map(phase => {
               const procs = plan.procedures.filter(p => p.phase === phase);
               if(procs.length === 0) return null;
               return (
                 <div key={phase}>
                    <h4 className="text-xs font-bold uppercase text-teal-600 dark:text-teal-400 mb-2">{phase}</h4>
                    <div className="space-y-2">
                      {procs.map(proc => (
                        <div key={proc.id} className={`flex items-center justify-between p-3 rounded-xl border ${proc.completed ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800/40 text-slate-500' : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                           <div className="flex items-center gap-3">
                             <button onClick={() => toggleStatus(proc.id)} className="cursor-pointer text-emerald-500 hover:text-emerald-700">
                               {proc.completed ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />}
                             </button>
                             <span className={`text-sm ${proc.completed ? 'line-through opacity-70' : 'font-semibold'}`}>{proc.description}</span>
                           </div>
                           <div className="flex items-center gap-4 border-l border-slate-200 dark:border-slate-750 pl-3">
                             <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">${proc.cost.toLocaleString("es-CL")} CLP</span>
                             <button onClick={() => deleteProcedure(proc.id)} className="text-slate-305 hover:text-red-500 hover:scale-105 active:scale-95 duration-200 p-1 cursor-pointer transition-colors"><Trash2 className="w-4 h-4" /></button>
                           </div>
                        </div>
                      ))}
                    </div>
                 </div>
               )
             })}
           </div>
        </div>

        {/* Financial Simulator */}
        <div className="bg-gradient-to-br from-slate-900 to-teal-800 p-6 rounded-2xl shadow-xl border border-slate-800 text-white flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2 mb-6 text-teal-300">
              <Calculator className="w-5 h-5" /> Simulador de Financiamiento
            </h3>

            <div className="space-y-6">
              {/* Controles deslizantes */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Pago Inicial (Enganche)</span>
                  <span className="font-mono font-bold">${down.toLocaleString("es-CL")} CLP</span>
                </div>
                <input 
                  type="range" min="0" max={totalCost} step="5000" value={down} 
                  onChange={e => setDown(Number(e.target.value))} 
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500" 
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Plazo en Meses</span>
                  <span className="font-mono font-bold">{months} meses</span>
                </div>
                <input 
                  type="range" min="1" max="60" step="1" value={months} 
                  onChange={e => setMonths(Number(e.target.value))} 
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500" 
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300 flex items-center gap-1"><Percent className="w-3.5 h-3.5"/> Tasa de Interés Anual</span>
                  <span className="font-mono font-bold">{rate}%</span>
                </div>
                <input 
                  type="range" min="0" max="30" step="0.5" value={rate} 
                  onChange={e => setRate(Number(e.target.value))} 
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500" 
                />
              </div>
            </div>
          </div>

          <div className="mt-8 bg-black/30 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 text-sm">Monto a Financiar</span>
              <span className="font-mono text-lg">${Math.round(principal).toLocaleString("es-CL")} CLP</span>
            </div>
            <div className="h-px w-full bg-white/10 my-3"/>
            <div className="flex justify-between items-end">
              <span className="text-teal-300 text-sm font-semibold">Cuota Mensual Estimada</span>
              <span className="font-mono text-4xl font-black">${Math.round(installment).toLocaleString("es-CL")} CLP</span>
            </div>
            {contractSuccess && (
              <div className="text-[11px] font-bold text-center text-teal-300 bg-teal-900/40 p-2.5 rounded-xl border border-teal-500/20 mt-3 animate-pulse">
                🎉 Contrato aprobado e inyectado con éxito en el Historial de Evoluciones Médicas.
              </div>
            )}
            <button 
              onClick={handleApproveContract}
              disabled={contractSuccess || totalCost === 0}
              className={`w-full mt-5 text-white font-bold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                contractSuccess 
                  ? "bg-teal-800/20 text-slate-400 border border-teal-500/10 cursor-not-allowed"
                  : totalCost === 0
                  ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-50"
                  : "bg-teal-600 hover:bg-teal-500 hover:scale-[1.01] active:scale-[0.99]"
              }`}
            >
               <CreditCard className="w-5 h-5"/> {contractSuccess ? "Contrato Aprobado" : "Aprobar y Generar Contrato"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
