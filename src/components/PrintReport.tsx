import React from "react";
import { Patient } from "../types";
import { Printer, ShieldCheck, User } from "lucide-react";
import Odontograma from "./Odontograma";
import Periodontograma from "./Periodontograma";
import OLearyControl from "./OLearyControl";

interface PrintReportProps {
  activePatient: Patient | null;
  doctorName: string;
  clinicName: string;
}

export default function PrintReport({ activePatient, doctorName, clinicName }: PrintReportProps) {
  if (!activePatient) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
        <Printer className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-700" />
        <h3 className="text-xl font-bold font-display">Sin Paciente para Imprimir</h3>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const oLearyPct = () => {
    let totals = 0;
    let withPlaque = 0;
    
    // Constant teeth arrays corresponding to standard adult dentition
    const UPPER_TEETH = {
      right: [18, 17, 16, 15, 14, 13, 12, 11],
      left: [21, 22, 23, 24, 25, 26, 27, 28]
    };
    const LOWER_TEETH = {
      right: [48, 47, 46, 45, 44, 43, 42, 41],
      left: [31, 32, 33, 34, 35, 36, 37, 38]
    };
    const allTeeth = [...Object.values(UPPER_TEETH).flat(), ...Object.values(LOWER_TEETH).flat()];

    allTeeth.forEach(toothNum => {
      const isAbsent = activePatient.odontogram?.[toothNum]?.condition === "ausente";
      if (!isAbsent) {
        totals += 4;
        const f = activePatient.oLeary?.[toothNum];
        if (f) {
          if (f.mesial) withPlaque++;
          if (f.distal) withPlaque++;
          if (f.vestibular) withPlaque++;
          if (f.lingual) withPlaque++;
        }
      }
    });

    if (totals === 0) return 0;
    return Math.round((withPlaque / totals) * 100);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full">
      {/* Non-Printable Header Config */}
      <div className="no-print bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 flex justify-between items-center shadow-xs">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-3">
             <Printer className="w-7 h-7 text-indigo-600 dark:text-indigo-400" /> Generador de Reportes A4
          </h2>
          <p className="text-sm text-slate-500 mt-1">Imprime el informe médico con validez de ficha técnica.</p>
        </div>
        <button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 cursor-pointer transition-colors">
          <Printer className="w-5 h-5"/> Imprimir Documento Oficial
        </button>
      </div>

      {/* A4 Document Simulation (Visible on Screen, formatted for print) */}
      <div className="bg-white print:bg-white text-black p-8 md:p-12 print:p-0 rounded-2xl shadow-2xl print:shadow-none border border-slate-200 print:border-none min-h-[1056px] relative" id="print-document">
         
         {/* Clinic Header */}
         <div className="border-b-2 border-slate-900 pb-6 mb-6 flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-display font-black tracking-tight uppercase text-slate-900">{clinicName || "PerioClinic Pro"}</h1>
              <p className="text-slate-600 font-mono mt-2 flex items-center gap-2 text-sm"><ShieldCheck className="w-4 h-4"/> Documento Clínico Certificado</p>
            </div>
            <div className="text-right text-sm leading-relaxed">
              <p className="font-bold text-lg">{doctorName || "Dr. Titular"}</p>
              <p className="font-mono text-slate-500">Fecha de Impresión: {new Date().toLocaleDateString('es-ES')}</p>
            </div>
         </div>

         {/* Patient Demographics */}
         <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg mb-8 flex gap-8">
            <User className="w-16 h-16 text-slate-400 bg-white rounded-xl border border-slate-200 p-2"/>
            <div className="flex-1 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 text-xs uppercase font-bold tracking-widest">Paciente</p>
                <p className="font-semibold text-lg">{activePatient.name}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase font-bold tracking-widest">Identificador ID</p>
                <p className="font-mono">{activePatient.id.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase font-bold tracking-widest">Fecha Nto.</p>
                <p>{activePatient.birthdate}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase font-bold tracking-widest">Teléfono</p>
                <p className="font-mono">{activePatient.phone}</p>
              </div>
            </div>
         </div>

         {/* Medical Warnings */}
         <div className="mb-8 p-4 border-l-4 border-rose-500 bg-rose-50">
            <h3 className="font-bold text-rose-900 uppercase tracking-widest text-xs mb-2">Alertas Sistémicas (Anamnesis)</h3>
            <div className="flex gap-4 font-mono text-rose-800 text-sm">
              {activePatient.anamnesis?.hta && <span>[!] Hipertensión</span>}
              {activePatient.anamnesis?.diabetes && <span>[!] Diabetes</span>}
              {activePatient.anamnesis?.tabaquismo > 0 && <span>Tabaquismo: {activePatient.anamnesis.tabaquismo} cigs/dia</span>}
            </div>
         </div>

         {/* Clinical Assessment */}
         <div className="space-y-12">
           <section>
             <h3 className="font-bold text-xl border-b border-slate-200 pb-2 mb-4 font-display">1. Odontograma de Diagnóstico</h3>
             <div className="scale-90 origin-top-left">
               <Odontograma 
                 odontogram={activePatient.odontogram} 
                 onChange={(v) => console.log(v)} 
               />
             </div>
           </section>

           <section className="print:break-before-page">
             <div className="flex justify-between items-end border-b border-slate-200 pb-2 mb-6">
                <h3 className="font-bold text-xl font-display">2. Parámetros Periodontales Biométricos</h3>
                <span className="font-mono bg-teal-100 text-teal-800 px-3 py-1 rounded text-sm font-bold">
                  Índice Placa: {oLearyPct()}%
                </span>
             </div>
             
             {/* Using the standard periodontograma component but disabling interactions via CSS wrapper pointer-events-none */}
             <div className="pointer-events-none scale-90 origin-top-left -ml-4">
                <Periodontograma 
                  periodontogram={activePatient.periodontogram}
                  odontogram={activePatient.odontogram}
                  onChange={(v) => console.log(v)}
                />
             </div>
           </section>

           {/* O'Leary Index Summary */}
           <section className="print:break-inside-avoid">
             <h3 className="font-bold text-xl border-b border-slate-200 pb-2 mb-4 font-display">3. Mapa de Higiene - Índice O'Leary</h3>
             <div className="pointer-events-none scale-90 origin-top-left -ml-4">
                <OLearyControl 
                  patient={activePatient}
                  onUpdate={(v) => console.log(v)}
                />
             </div>
           </section>

           {/* Treatment summary */}
           <section className="print:break-inside-avoid">
             <h3 className="font-bold text-xl border-b border-slate-200 pb-2 mb-4 font-display">4. Resumen de Plan de Tratamiento</h3>
             <table className="w-full text-left border-collapse text-sm">
               <thead>
                 <tr className="bg-slate-100">
                   <th className="border border-slate-300 p-2 uppercase text-xs font-bold w-24">Fase</th>
                   <th className="border border-slate-300 p-2 uppercase text-xs font-bold w-16">Pieza</th>
                   <th className="border border-slate-300 p-2 uppercase text-xs font-bold">Procedimiento</th>
                   <th className="border border-slate-300 p-2 uppercase text-xs font-bold w-24 text-right">Valor Base</th>
                   <th className="border border-slate-300 p-2 uppercase text-xs font-bold w-16 text-right">Dto(%)</th>
                   <th className="border border-slate-300 p-2 uppercase text-xs font-bold w-24 text-right">Subtotal</th>
                 </tr>
               </thead>
               <tbody>
                  {activePatient.treatmentPlan?.procedures.map(p => {
                    const discountValue = p.discount || 0;
                    const subtotal = Math.round(p.cost * (1 - (discountValue / 100)));
                    return (
                    <tr key={p.id}>
                      <td className="border border-slate-300 p-2 text-slate-500 text-xs">{p.phase}</td>
                      <td className="border border-slate-300 p-2 font-mono text-xs">{p.tooth || '-'}</td>
                      <td className="border border-slate-300 p-2 font-medium">{p.description} {p.surface ? `(${p.surface})` : ''}</td>
                      <td className="border border-slate-300 p-2 font-mono text-right text-slate-500">${p.cost.toLocaleString('es-CL')}</td>
                      <td className="border border-slate-300 p-2 font-mono text-right text-rose-500">{discountValue > 0 ? `-${discountValue}%` : '-'}</td>
                      <td className="border border-slate-300 p-2 font-mono text-right font-bold">${subtotal.toLocaleString('es-CL')}</td>
                    </tr>
                    );
                  })}
               </tbody>
             </table>
           </section>
         </div>

         {/* Signature block */}
         <div className="mt-24 pt-8 border-t border-slate-300 flex justify-end print:break-inside-avoid">
           <div className="text-center">
             <div className="w-48 h-16 border-b border-slate-800 mb-2"></div>
             <p className="font-bold text-sm uppercase tracking-wider">{doctorName || "Firma Titular"}</p>
             <p className="text-xs text-slate-500">Reg Méd. Especialista</p>
           </div>
         </div>

      </div>
    </div>
  );
}
