import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronRight, User, Calendar, Settings } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Patient } from "../types";

interface SpotlightProps {
  patients: Patient[];
  onSelectPatient: (id: string) => void;
  onNavigate: (tab: string) => void;
}

export default function Spotlight({ patients, onSelectPatient, onNavigate }: SpotlightProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    } else {
      setQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredPatients = query ? patients.filter((p) => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.phone.includes(query)
  ) : [];

  const handleSelectPatient = (id: string) => {
    onSelectPatient(id);
    onNavigate("clinica");
    setIsOpen(false);
  };

  const handleAction = (tab: string) => {
    onNavigate(tab);
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
        onClick={() => setIsOpen(false)}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <Search className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Buscar pacientes o acciones rápidas..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent px-4 py-2 outline-none text-slate-800 dark:text-white text-sm"
            />
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md font-mono">
              ESC para cerrar
            </span>
          </div>

          <div className="max-h-96 overflow-y-auto p-2">
            {!query ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Escribe para buscar expedientes clínicos.
              </div>
            ) : (
              <>
                {filteredPatients.length > 0 && (
                  <div className="mb-4">
                    <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Pacientes Encontrados
                    </div>
                    {filteredPatients.map(p => (
                      <button 
                        key={p.id}
                        onClick={() => handleSelectPatient(p.id)}
                        className="w-full flex items-center justify-between p-3 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-xl transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex flex-col justify-center items-center font-bold text-xs">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{p.name}</div>
                            <div className="text-[10px] text-slate-500">{p.phone}</div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-teal-600" />
                      </button>
                    ))}
                  </div>
                )}
                
                {query.toLowerCase().includes("ag") || query.toLowerCase().includes("cit") ? (
                  <button 
                    onClick={() => handleAction("agenda")}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all text-left"
                  >
                    <Calendar className="w-5 h-5 text-slate-500" />
                    <div>
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">Ver Agenda</div>
                      <div className="text-[10px] text-slate-500">Ir al calendario de citas médicas</div>
                    </div>
                  </button>
                ) : null}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
