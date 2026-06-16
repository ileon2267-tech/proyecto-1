import React, { useState } from 'react';
import { Patient, TreatmentProcedure, TreatmentPlan } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Plus, Trash2, Calculator, CheckCircle2, DollarSign } from 'lucide-react';

interface TreatmentPlanModuleProps {
  patient: Patient;
  aranceles: Record<string, number>;
  onUpdatePatient: (updated: Patient) => void;
}

export default function TreatmentPlanModule({ patient, aranceles, onUpdatePatient }: TreatmentPlanModuleProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newCost, setNewCost] = useState<number>(0);
  const [newPhase, setNewPhase] = useState<TreatmentProcedure['phase']>('Saneamiento');

  const tp = patient.treatmentPlan || { procedures: [], financing: { months: 1, downPayment: 0, interestRate: 0 } };
  const procedures = tp.procedures || [];

  const handleAddDefault = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val && aranceles[val] !== undefined) {
      setNewDesc(val);
      setNewCost(aranceles[val]);
    }
  };

  const handleAddProcedure = () => {
    if (!newDesc.trim()) return;
    
    const newProc: TreatmentProcedure = {
      id: `proc-${Date.now()}`,
      phase: newPhase,
      description: newDesc,
      cost: newCost,
      completed: false
    };

    const updatedPln: TreatmentPlan = {
      ...tp,
      procedures: [...procedures, newProc]
    };

    onUpdatePatient({ ...patient, treatmentPlan: updatedPln });
    setNewDesc('');
    setNewCost(0);
    setShowAddForm(false);
  };

  const handleToggleComplete = (id: string) => {
    const updated = procedures.map(p => p.id === id ? { ...p, completed: !p.completed } : p);
    onUpdatePatient({ ...patient, treatmentPlan: { ...tp, procedures: updated } });
  };

  const handleDelete = (id: string) => {
    const updated = procedures.map(p => p).filter(p => p.id !== id);
    onUpdatePatient({ ...patient, treatmentPlan: { ...tp, procedures: updated } });
  };

  const totalCost = procedures.reduce((acc, p) => acc + p.cost, 0);
  const totalCompleted = procedures.filter(p => p.completed).reduce((acc, p) => acc + p.cost, 0);
  const totalRemaining = totalCost - totalCompleted;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
        <div>
          <h3 className="text-lg font-display font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            Plan de Tratamiento / Presupuesto
          </h3>
          <p className="text-xs text-slate-400 font-normal">Planifica procedimientos clínicos y define presupuestos formales para el paciente.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-2 px-4 rounded-xl cursor-pointer transition-all shadow-md inline-flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> 
          <span>Agregar Procedimiento</span>
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-teal-100 dark:border-teal-900/30 shadow-sm space-y-4 mb-2">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Nuevo Procedimiento Clínico</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Arancel Predefinido:</label>
                  <select
                    onChange={handleAddDefault}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                    defaultValue=""
                  >
                    <option value="">Selección Rápida...</option>
                    {Object.keys(aranceles).map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Fase:</label>
                  <select
                    value={newPhase}
                    onChange={(e) => setNewPhase(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  >
                    <option value="Diagnostico">Diagnóstico / Preventiva</option>
                    <option value="Saneamiento">Saneamiento Básico</option>
                    <option value="Rehabilitacion">Rehabilitación Compleja</option>
                    <option value="Mantenimiento">Mantenimiento Periodontal</option>
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-1">
                 <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Descripción:</label>
                  <input
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="E.j. Endodoncia pieza 1.4"
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Valor ($):</label>
                  <input
                    type="number"
                    value={newCost}
                    onChange={(e) => setNewCost(parseInt(e.target.value) || 0)}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-mono font-bold text-teal-600 dark:text-teal-400"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleAddProcedure}
                  className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-bold py-2 px-5 rounded-lg text-xs transition-all shadow-sm"
                >
                  Confirmar Acción
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-0 overflow-hidden shadow-xs">
        {procedures.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Calculator className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-semibold">No data / Presupuesto vacío</p>
            <p className="text-xs font-light mt-1">Acá se listarán los procedimientos y costos aprobados para este plan de tratamiento.</p>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="text-[10px] uppercase bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Estado</th>
                    <th className="px-6 py-3">Fase Tratamiento</th>
                    <th className="px-6 py-3">Descripción</th>
                    <th className="px-6 py-3 text-right">Costo ($)</th>
                    <th className="px-6 py-3 text-center">Gestión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {procedures.map((proc) => (
                    <tr key={proc.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${proc.completed ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <button 
                          onClick={() => handleToggleComplete(proc.id)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${proc.completed ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 hover:bg-emerald-50 dark:bg-slate-800 dark:text-slate-500'}`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-md border ${
                          proc.phase === 'Saneamiento' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' :
                          proc.phase === 'Diagnostico' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' :
                          proc.phase === 'Rehabilitacion' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' :
                          'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800'
                        }`}>
                          {proc.phase}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-medium text-slate-800 dark:text-slate-200">
                        <span className={proc.completed ? 'line-through decoration-slate-400 text-slate-400' : ''}>{proc.description}</span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                        ${proc.cost.toLocaleString('es-CL')}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-center text-red-500 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" onClick={() => handleDelete(proc.id)}>
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Budget Summary Footer */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between sm:justify-end items-center gap-8">
              <div className="text-right space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500">Ejecutado (Pagado)</p>
                <div className="text-sm font-mono font-medium text-slate-600 dark:text-slate-400">${totalCompleted.toLocaleString('es-CL')}</div>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500">Total Restante</p>
                <div className="text-sm font-mono font-medium text-amber-650 dark:text-amber-500">${totalRemaining.toLocaleString('es-CL')}</div>
              </div>
              <div className="text-right space-y-1 pl-6 border-l border-slate-200 dark:border-slate-700">
                <p className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400">Presupuesto Global</p>
                <div className="text-xl font-mono font-black text-slate-900 dark:text-white flex flex-row items-center gap-1 justify-end">
                   <DollarSign className="w-4 h-4 text-slate-400" />
                   {totalCost.toLocaleString('es-CL')}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
