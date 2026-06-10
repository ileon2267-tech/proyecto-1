import React, { useState, useEffect } from "react";
import { Copy, Link as LinkIcon, QrCode, X, CheckCircle2 } from "lucide-react";
import { Patient } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface SharePatientModalProps {
  patient: Patient;
  onClose: () => void;
}

export default function SharePatientModal({ patient, onClose }: SharePatientModalProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://periodash.app/p/${patient.id}/informe-seguro`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ y: 20, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-3xl w-full max-w-md overflow-hidden relative"
      >
         <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
           <X className="w-5 h-5"/>
         </button>

         <div className="p-8 pb-6">
           <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mb-6 border border-teal-100 dark:border-teal-500/20">
             <QrCode className="w-7 h-7 text-teal-600 dark:text-teal-400" />
           </div>
           <h2 className="text-2xl font-display font-bold text-slate-800 dark:text-white mb-2 tracking-tight">Portal del Paciente</h2>
           <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Comparte este enlace seguro con {patient.name.split(" ")[0]} para que pueda revisar su diagnóstico, odontograma y plan de tratamiento en 3D interactivo desde su móvil.</p>
         </div>

         <div className="px-8 pb-8 space-y-6">
           <div className="relative group">
             <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden cursor-pointer" onClick={handleCopy}>
                <LinkIcon className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-sm font-mono text-slate-600 dark:text-slate-300 truncate select-all">{shareUrl}</span>
                <button className="ml-auto shrink-0 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 transition-all flex items-center gap-1.5 shadow-sm">
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
             </div>
           </div>

           <div className="flex border-t border-slate-100 dark:border-slate-800 pt-6">
             <button onClick={onClose} className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-teal-500/20 cursor-pointer">
               Listo, enlace enviado
             </button>
           </div>
         </div>
      </motion.div>
    </motion.div>
  );
}
