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
    
    const handleOpenSearch = () => {
      setIsOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("periodash-open-search", handleOpenSearch);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("periodash-open-search", handleOpenSearch);
    };
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

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
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-slate-950/60 backdrop-blur-md flex items-start justify-center pt-[15vh] p-4"
          onClick={() => setIsOpen(false)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -16 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800/80 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-900/50">
              <Search className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
              <input 
                ref={inputRef}
                type="text" 
                placeholder="Buscar pacientes o acciones rápidas..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent px-4 py-2 outline-none text-slate-800 dark:text-white text-sm"
              />
              <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md font-mono font-bold tracking-wide">
                ESC
              </span>
            </div>

            <div className="max-h-96 overflow-y-auto p-2">
              {!query ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Escribe para buscar expedientes clínicos.
                </div>
              ) : (
                <>
                  {filteredPatients.length > 0 ? (
                    <div className="mb-2">
                      <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Pacientes Encontrados
                      </div>
                      {filteredPatients.map(p => (
                        <button 
                          key={p.id}
                          onClick={() => handleSelectPatient(p.id)}
                          className="w-full flex items-center justify-between p-3 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 rounded-xl transition-all text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800/60 flex flex-col justify-center items-center font-bold text-xs">
                              {p.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{p.name}</div>
                              <div className="text-[10px] text-slate-450">{p.phone}</div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No se encontraron resultados
                    </div>
                  )}
                  
                  {query.toLowerCase().includes("ag") || query.toLowerCase().includes("cit") ? (
                    <button 
                      onClick={() => handleAction("agenda")}
                      className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-all text-left"
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
      )}
    </AnimatePresence>
  );
}
