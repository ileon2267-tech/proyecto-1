import React, { useState } from "react";
import { Patient } from "../types";
import { BrainCircuit, Loader2, Save } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface SoapAIAssistantProps {
  patient: Patient;
}

export default function SoapAIAssistant({ patient }: SoapAIAssistantProps) {
  const [soapNote, setSoapNote] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSoap = () => {
    setIsGenerating(true);
    
    // Simulating LLM analysis using the periodontogram & odontogram data
    setTimeout(() => {
      let subjective = `Paciente ${patient.name} de edad ${patient.birthdate}. `;
      if (patient.anamnesis?.hta) subjective += "Refiere HTA en tratamiento. ";
      if (patient.anamnesis?.tabaquismo > 0) subjective += `Tabaquismo activo (${patient.anamnesis.tabaquismo} cigs/dia). `;
      
      let objective = `Al examen clínico: `;
      let totalBolsas = 0;
      Object.values(patient.periodontogram || {}).forEach(p => {
        Object.values(p.vestibularPocket).forEach(d => { if(d >= 4) totalBolsas++ });
        Object.values(p.palatinoPocket).forEach(d => { if(d >= 4) totalBolsas++ });
      });
      if (totalBolsas > 0) {
        objective += `Se registran ${totalBolsas} localizaciones con sacos periodontales ≥ 4mm. BOP positivo generalizado. `;
      } else {
        objective += `Profundidades de sondaje dentro de rangos biológicos conservados. `;
      }

      let analysis = "Enfermedad periodontal estabilizada / clínicamente sano en periodonto reducido.";
      if (totalBolsas > 5) analysis = "Periodontitis Estadio III, Grado B (Generalizada).";
      else if (totalBolsas > 0) analysis = "Periodontitis Estadio II, Grado A (Localizada).";

      let plan = "- Instrucción en Higiene Oral técnica de BASS Modificada.\n- RAR (Raspado y alisado radicular) cuadrantes 1 y 2 bajo anestesia local.\n- Cita de reevaluación en 4 semanas.\n- Interconsulta médica por control de HTA y cesación tabáquica.";

      const markdownNote = `### [S] Subjetivo\n${subjective}\n\n### [O] Objetivo\n${objective}\n\n### [A] Análisis / Diagnóstico\n${analysis}\n\n### [P] Plan de Tratamiento Clínico\n${plan}`;
      
      setSoapNote(markdownNote);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
       <div className="flex justify-between items-center mb-6">
         <div>
           <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
             <BrainCircuit className="w-6 h-6 text-teal-600 dark:text-teal-450" /> Asistente de Evolución SOAP
           </h3>
           <p className="text-xs text-slate-500 mt-1">Genera automáticamente la redacción clínica evaluando los datos periodontales ingresados.</p>
         </div>
         <button 
           onClick={generateSoap}
           disabled={isGenerating}
           className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-lg shadow-teal-900/10 cursor-pointer disabled:opacity-50"
         >
           {isGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : <BrainCircuit className="w-4 h-4"/>}
           <span className="text-sm">Redactar Evolución AI</span>
         </button>
       </div>

       <div className="relative min-h-[300px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-inner text-sm text-slate-700 dark:text-slate-300">
         {isGenerating ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-teal-600 dark:text-teal-400 bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-xl">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-mono text-xs animate-pulse">Analizando profundidades de bolsas crónicas y sangrado...</p>
            </div>
         ) : soapNote ? (
            <div className="markdown-body text-slate-800 dark:text-slate-200 hide-scrollbar overflow-y-auto">
              <ReactMarkdown>{soapNote}</ReactMarkdown>
            </div>
         ) : (
           <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
              <BrainCircuit className="w-12 h-12 opacity-20" />
              <p className="text-xs">Presiona generar para que la IA escudriñe el expediente de {patient.name}.</p>
           </div>
         )}
       </div>

       {soapNote && (
         <div className="mt-4 flex justify-end">
           <button className="flex items-center gap-2 text-xs font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors cursor-pointer border border-teal-200 dark:border-teal-900/50 bg-teal-50 dark:bg-teal-900/20 px-4 py-2 rounded-lg">
             <Save className="w-4 h-4" /> Guardar en Ficha Permanente
           </button>
         </div>
       )}
    </div>
  );
}
