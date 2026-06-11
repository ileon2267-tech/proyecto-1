import React, { useState } from 'react';
import { Patient, Evolution, Anamnesis } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Save, Plus, FileText, HeartPulse, Activity, User, Calendar, Trash2, Edit2 } from 'lucide-react';

interface PatientFileProps {
  patient: Patient;
  onUpdatePatient: (updatedPatient: Patient) => void;
  onClose: () => void;
}

export default function PatientFile({ patient, onUpdatePatient, onClose }: PatientFileProps) {
  const [activeTab, setActiveTab] = useState<'anamnesis' | 'evoluciones'>('anamnesis');
  
  // Anamnesis State
  const [anamnesis, setAnamnesis] = useState<Anamnesis>(patient.anamnesis || {
    hta: false,
    diabetes: false,
    tabaquismo: 0,
    alergias: "",
    dolorActual: "ninguno",
    notasSistemicas: "",
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Evolutions State
  const [evolutions, setEvolutions] = useState<Evolution[]>(patient.evolutions || []);
  const [newEvolutionText, setNewEvolutionText] = useState("");
  const [deletingEvolutionId, setDeletingEvolutionId] = useState<string | null>(null);

  const handleSaveAnamnesis = () => {
    onUpdatePatient({ ...patient, anamnesis });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddEvolution = () => {
    if (!newEvolutionText.trim()) return;
    const newEvol: Evolution = {
      id: `evo-${Date.now()}`,
      date: new Date().toISOString(),
      description: newEvolutionText,
      professional: "Dr. Principal" // Mock for now
    };
    const updatedEvolutions = [newEvol, ...evolutions];
    setEvolutions(updatedEvolutions);
    onUpdatePatient({ ...patient, evolutions: updatedEvolutions });
    setNewEvolutionText("");
  };

  const handleDeleteEvolution = (id: string) => {
    setDeletingEvolutionId(id);
  };

  const executeDeleteEvolution = (id: string) => {
    const updatedEvolutions = evolutions.filter((e) => e.id !== id);
    setEvolutions(updatedEvolutions);
    onUpdatePatient({ ...patient, evolutions: updatedEvolutions });
    setDeletingEvolutionId(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xl overflow-hidden relative w-full"
    >
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-800 p-6 flex justify-between items-start md:items-center border-b border-slate-100 dark:border-slate-800 flex-col md:flex-row gap-4">
        <div className="flex flex-row items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center font-display font-black text-2xl text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 uppercase shadow-sm">
            {patient.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white leading-tight">
              {patient.name}
            </h2>
            <div className="text-sm text-slate-500 font-normal flex flex-wrap gap-x-4 gap-y-1 mt-1">
              <span className="inline-flex items-center gap-1"><User className="w-3.5 h-3.5"/> ID: {patient.id.split('-')[1]}</span>
              <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> Nacimiento: {patient.birthdate}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-colors font-bold text-sm">
          Cerrar Ficha
        </button>
      </div>

      {/* Basic Contact Info */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap gap-6 text-sm text-slate-600 dark:text-slate-300">
        <div><strong>Teléfono:</strong> {patient.phone || "N/A"}</div>
        <div><strong>Email:</strong> {patient.email || "N/A"}</div>
        <div className="w-full"><strong>Notas Generales:</strong> {patient.notes || "Sin notas"}</div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 px-6">
        <button
          onClick={() => setActiveTab('anamnesis')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'anamnesis' 
              ? 'border-teal-500 text-teal-600 dark:text-teal-400' 
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          Anamnesis & Historial Medico
        </button>
        <button
          onClick={() => setActiveTab('evoluciones')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'evoluciones' 
              ? 'border-teal-500 text-teal-600 dark:text-teal-400' 
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Activity className="w-4 h-4" />
          Evoluciones Clínicas
        </button>
      </div>

      {/* Content */}
      <div className="p-6 bg-slate-50/30 dark:bg-slate-900/50 w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'anamnesis' && (
            <motion.div
              key="anamnesis"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 max-w-4xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2">Patologías Sistémicas</h3>
                  
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={anamnesis.hta} onChange={(e) => setAnamnesis({...anamnesis, hta: e.target.checked})} className="w-4 h-4 text-teal-600 rounded dark:bg-slate-700 dark:border-slate-600 focus:ring-teal-500 focus:ring-2" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-teal-600 transition-colors">Hipertensión Arterial (HTA)</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={anamnesis.diabetes} onChange={(e) => {
                      const checked = e.target.checked;
                      setAnamnesis({
                        ...anamnesis,
                        diabetes: checked,
                        diabetesStatus: checked ? (anamnesis.diabetesStatus === 'none' ? 'controlled' : anamnesis.diabetesStatus) : 'none'
                      });
                    }} className="w-4 h-4 text-teal-600 rounded dark:bg-slate-700 dark:border-slate-600 focus:ring-teal-500 focus:ring-2" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-teal-600 transition-colors">Diabetes Mellitus</span>
                  </label>

                  {anamnesis.diabetes && (
                    <div className="pl-7 pt-1 space-y-1 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Estado y Control Glicémico (HbA1c):</label>
                      <select 
                        value={anamnesis.diabetesStatus || "controlled"} 
                        onChange={(e) => setAnamnesis({...anamnesis, diabetesStatus: e.target.value as any})}
                        className="w-full text-xs p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500/20"
                      >
                        <option value="controlled">Diabetes Controlada (HbA1c &lt; 7.0%)</option>
                        <option value="severe">Diabetes Descompensada (HbA1c &ge; 7.0%)</option>
                      </select>
                      <span className="text-[9px] text-teal-600/70 dark:text-teal-400/70 block mt-0.5">Esto influye directamente en el grado de riesgo óseo del Periodontograma.</span>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tabaquismo (Cigarrillos / día)</label>
                    <input type="number" min="0" value={anamnesis.tabaquismo} onChange={(e) => setAnamnesis({...anamnesis, tabaquismo: parseInt(e.target.value) || 0})} className="w-full text-sm p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500/20" />
                  </div>

                  <div className="pt-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Edad Simulada para Análisis PRA (Años)</label>
                    <input type="number" min="18" max="95" placeholder="P. ej., 45" value={anamnesis.edadSimulada || ""} onChange={(e) => setAnamnesis({...anamnesis, edadSimulada: parseInt(e.target.value) || undefined})} className="w-full text-sm p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500/20" />
                    <span className="text-[9px] text-slate-400 block mt-1">Si se deja vacío, se calculará automáticamente según su fecha de nacimiento registrada.</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2">Datos Clínicos Específicos</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Alergias Conocidas</label>
                    <textarea 
                      value={anamnesis.alergias} 
                      onChange={(e) => setAnamnesis({...anamnesis, alergias: e.target.value})} 
                      placeholder="Ej. Penicilina, AINES, Látex..."
                      rows={2}
                      className="w-full text-sm p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500/20" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Motivo de Consulta (Dolor Actual)</label>
                    <select 
                      value={anamnesis.dolorActual} 
                      onChange={(e) => setAnamnesis({...anamnesis, dolorActual: e.target.value as any})} 
                      className="w-full text-sm p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500/20"
                    >
                      <option value="ninguno">Ninguno (Control/Rutina)</option>
                      <option value="leve">Leve / Ocasional</option>
                      <option value="pulsatil">Pulsátil / Constante</option>
                      <option value="agudo">Agudo / Insoportable</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2">Notas Médicas y Otros Antecedentes Fisiológicos</h3>
                <div>
                  <textarea 
                    value={anamnesis.notasSistemicas} 
                    onChange={(e) => setAnamnesis({...anamnesis, notasSistemicas: e.target.value})} 
                    placeholder="Otros detalles sistémicos, embarazo, uso de anticoagulantes, bisfofonatos..."
                    rows={4}
                    className="w-full text-sm p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500/20" 
                  />
                </div>
              </div>
              
              <div className="pt-4 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/10 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-400">
                  Reflejo bidireccional activo con el Periodontograma de Lang & Tonetti.
                </div>
                <div className="flex items-center gap-3">
                  <AnimatePresence>
                    {savedSuccess && (
                      <motion.span 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs font-bold text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-md border border-emerald-100 dark:border-emerald-800/45 inline-flex items-center gap-1"
                      >
                        ✓ ¡Guardado con éxito!
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <button
                    onClick={handleSaveAnamnesis}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-5 h-5" />
                    Guardar Anamnesis
                  </button>
                </div>
              </div>

            </motion.div>
          )}

          {activeTab === 'evoluciones' && (
            <motion.div
              key="evoluciones"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-3">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Registrar Nueva Evolución Clínica</h3>
                <textarea
                  value={newEvolutionText}
                  onChange={(e) => setNewEvolutionText(e.target.value)}
                  placeholder="Detalle los procedimientos realizados hoy, recetas emitidas y progreso..."
                  rows={3}
                  className="w-full text-sm p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                <button
                  onClick={handleAddEvolution}
                  disabled={!newEvolutionText.trim()}
                  className="self-end bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition-all flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Registrar
                </button>
              </div>

              <div className="space-y-3">
                {evolutions.map((evo) => (
                  <div key={evo.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm animate-fade-in group relative overflow-hidden">
                    <AnimatePresence>
                      {deletingEvolutionId === evo.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-sm z-50 flex items-center justify-between px-4 py-2"
                        >
                          <div className="flex flex-col">
                            <span className="text-white text-xs font-bold font-display leading-tight">¿Eliminar esta evolución clínica?</span>
                            <span className="text-[10px] text-slate-400 font-normal mt-0.5">Esta acción no se puede deshacer.</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => executeDeleteEvolution(evo.id)}
                              className="px-3 py-1.5 bg-rose-500 hover:bg-rose-650 text-white font-extrabold text-[11px] rounded-lg cursor-pointer transition-all active:scale-95"
                            >
                              Sí, eliminar
                            </button>
                            <button
                              onClick={() => setDeletingEvolutionId(null)}
                              className="px-3 py-1.5 bg-slate-850 hover:bg-slate-700 text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-[11px] rounded-lg cursor-pointer transition-all active:scale-95 border border-slate-700/50"
                            >
                              No
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="flex justify-between items-start mb-2">
                       <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-slate-100 dark:bg-slate-900 text-slate-500 px-2.5 py-1 rounded-md">
                            {new Date(evo.date).toLocaleString()}
                          </span>
                          <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                             {evo.professional}
                          </span>
                       </div>
                       <button onClick={() => handleDeleteEvolution(evo.id)} className="text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{evo.description}</p>
                  </div>
                ))}
                
                {evolutions.length === 0 && (
                   <div className="text-center py-12 bg-white dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                      <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-500">No hay evoluciones clínicas registradas</p>
                      <p className="text-xs text-slate-400">Las notas clínicas agregadas aparecerán aquí chronológicamente.</p>
                   </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </motion.div>
  );
}
