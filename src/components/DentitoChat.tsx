import React, { useState, useRef, useEffect } from "react";
import { Patient, ChatMessage } from "../types";
import { Send, Maximize2, Minimize2, Mic, AlertTriangle, Activity, HeartPulse, BrainCircuit, Search, Info, Move } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";

interface DentitoChatProps {
  activePatient: Patient | null;
}

// Helper: Custom Event dispatcher to interact with App.tsx navigation/selection
const dispatchPeriodashNav = (route: string) => {
  window.dispatchEvent(new CustomEvent('periodash-navigate', { detail: route }));
};

const DENTITO_KNOWLEDGE: Record<string, string> = {
  "periodontitis": "La periodontitis es una patología inflamatoria crónica, de origen infeccioso, que destruye los tejidos de soporte del diente.",
  "gingivitis": "La gingivitis es una inflamación reversible de la encía, inducida por placa bacteriana, sin pérdida de inserción.",
  "amoxicilina": "Antibiótico beta-lactámico de amplio espectro. Dosis habitual: 500mg - 875mg c/8h por 7 días.",
  "clorhexidina": "Antiséptico bisbiguanida. Uso en odontología usualmente al 0.12% en colutorios.",
  "dentito": "Soy Dentito v15, tu asistente IA holográfico para PerioDash. Puedo guiarte por protocolos médicos, registrar notas o buscar pacientes."
};

const ParticleSystem = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width;
    let height = canvas.height;
    
    // Quantum particle system params from user prompt
    const PARTICLE_COUNT = 30;
    const particles: any[] = [];
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        orbitRadius: 30 + Math.random() * 20,
        size: 0.5 + Math.random() * 1.5,
        speed: 0.002 + Math.random() * 0.015,
        opacity: 0.3 + Math.random() * 0.7,
        orbitInclination: Math.random() * Math.PI,
        twinkle: Math.random() * Math.PI * 2,
      });
    }

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const centerX = width / 2;
      const centerY = height / 2;
      time += 0.05;

      // Draw glowing core
      const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 25);
      gradient.addColorStop(0, "rgba(20, 184, 166, 0.8)");
      gradient.addColorStop(0.5, "rgba(45, 212, 191, 0.4)");
      gradient.addColorStop(1, "rgba(20, 184, 166, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 25 + Math.sin(time) * 2, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.arc(centerX - 6, centerY - 2, 2.5, 0, Math.PI * 2); // left eye
      ctx.arc(centerX + 6, centerY - 2, 2.5, 0, Math.PI * 2); // right eye
      ctx.fill();

      // Draw particles
      particles.forEach((p) => {
        p.angle += p.speed;
        p.twinkle += 0.1;
        
        // 3D-ish projection
        const x = centerX + Math.cos(p.angle) * p.orbitRadius;
        const verticalOffset = Math.sin(p.angle) * Math.sin(p.orbitInclination) * p.orbitRadius;
        const y = centerY + verticalOffset;
        
        const currentOpacity = p.opacity * (0.5 + 0.5 * Math.sin(p.twinkle));
        
        ctx.fillStyle = `rgba(134, 239, 172, ${currentOpacity})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return <canvas ref={canvasRef} width={120} height={120} className="w-full h-full drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" />;
};

export type DentitoPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left" | "fullscreen";

export default function DentitoChat({ activePatient }: DentitoChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "init-1",
      role: "assistant",
      content: "¡Hola! Soy **Dentito v15 Pro**, tu IA clínica asistencial. Puedo analizar gráficos periodontales en tiempo real, guiarte en protocolos de emergencias médicas severas o navegar por PerioDash rápidamente.",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState<string | null>(null); 
  const isDraggingRef = useRef(false);

  const getDragConstraints = () => {
    if (typeof window === "undefined") return { left: -500, right: 500, top: -500, bottom: 500 };
    const w = window.innerWidth;
    const h = window.innerHeight;
    const boxWidth = isMinimized ? 240 : 380;
    const boxHeight = isMinimized ? 64 : 520;
    
    switch (positionState) {
      case "bottom-left":
        return { left: -20, right: w - boxWidth, top: -h + boxHeight + 40, bottom: 20 };
      case "top-right":
        return { left: -w + boxWidth, right: 20, top: -20, bottom: h - boxHeight - 40 };
      case "top-left":
        return { left: -20, right: w - boxWidth, top: -20, bottom: h - boxHeight - 40 };
      case "fullscreen":
        return { left: 0, right: 0, top: 0, bottom: 0 };
      default: // bottom-right
        return { left: -w + boxWidth, right: 20, top: -h + boxHeight + 40, bottom: 20 };
    }
  };
  
  const [positionState, setPositionState] = useState<DentitoPosition>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dentito-position");
      if (saved && ["bottom-right", "bottom-left", "top-right", "top-left", "fullscreen"].includes(saved)) {
        return saved as DentitoPosition;
      }
    }
    return "bottom-right";
  });
  const [showPositionMenu, setShowPositionMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dentito-position", positionState);
    }
  }, [positionState]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getPositionClasses = () => {
    if (isMinimized) {
      switch (positionState) {
        case "bottom-left":
          return "bottom-20 left-4 md:bottom-24 md:left-6 w-16 h-16 cursor-grab active:cursor-grabbing flex items-center justify-center rounded-full shadow-[0_8px_30px_rgba(20,184,166,0.35)] dark:shadow-[0_8px_32px_rgba(20,184,166,0.5)] border border-teal-500/30";
        case "top-right":
          return "top-20 right-4 md:top-6 md:right-6 w-16 h-16 cursor-grab active:cursor-grabbing flex items-center justify-center rounded-full shadow-[0_8px_30px_rgba(20,184,166,0.35)] dark:shadow-[0_8px_32px_rgba(20,184,166,0.5)] border border-teal-500/30";
        case "top-left":
          return "top-20 left-4 md:top-6 md:left-6 w-16 h-16 cursor-grab active:cursor-grabbing flex items-center justify-center rounded-full shadow-[0_8px_30px_rgba(20,184,166,0.35)] dark:shadow-[0_8px_32px_rgba(20,184,166,0.5)] border border-teal-500/30";
        default: // bottom-right
          return "bottom-20 right-4 md:bottom-24 md:right-6 w-16 h-16 cursor-grab active:cursor-grabbing flex items-center justify-center rounded-full shadow-[0_8px_30px_rgba(20,184,166,0.35)] dark:shadow-[0_8px_32px_rgba(20,184,166,0.5)] border border-teal-500/30";
      }
    }

    switch (positionState) {
      case "bottom-left":
        return "bottom-20 left-4 md:bottom-8 md:left-8 w-[calc(100vw-32px)] md:w-[400px] h-[520px] md:h-[600px] overflow-hidden shadow-2xl scale-100 rounded-[2rem]";
      case "top-right":
        return "top-20 right-4 md:top-8 md:right-8 w-[calc(100vw-32px)] md:w-[400px] h-[520px] md:h-[600px] overflow-hidden shadow-2xl scale-100 rounded-[2rem]";
      case "top-left":
        return "top-20 left-4 md:top-8 md:left-8 w-[calc(100vw-32px)] md:w-[400px] h-[520px] md:h-[600px] overflow-hidden shadow-2xl scale-100 rounded-[2rem]";
      case "fullscreen":
        return "top-4 bottom-[calc(90px+env(safe-area-inset-bottom))] inset-x-4 md:top-8 md:bottom-8 md:right-8 md:left-auto md:w-[450px] md:h-[calc(100vh-80px)] overflow-hidden shadow-2xl scale-100 rounded-[2rem]";
      default: // bottom-right
        return "bottom-20 right-4 md:bottom-8 md:right-8 w-[calc(100vw-32px)] md:w-[400px] h-[520px] md:h-[600px] overflow-hidden shadow-2xl scale-100 rounded-[2rem]";
    }
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, emergencyMode]);

  const processInternalCommand = (text: string): string | null => {
    const raw = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // 1. Emergency
    if (raw.includes("emergencia") || raw.includes("protocolo de emergencia") || raw.includes("modo emergencia")) {
      setEmergencyMode("selector");
      return "He activado el panel de emergencias médicas. Selecciona el cuadro clínico en pantalla inmediatamente.";
    }
    
    // 2. Navigation
    if (raw.includes("ir a agenda") || raw.includes("abre agenda") || raw.includes("citas hoy")) {
      dispatchPeriodashNav("agenda");
      return "Abriendo cronograma de citas y agenda médica.";
    }
    if (raw.includes("ir a dashboard") || raw.includes("resumen")) {
      dispatchPeriodashNav("dashboard");
      return "Volviendo al panel general (dashboard).";
    }
    if (raw.includes("ir a pacientes") || raw.includes("directorio") || raw.includes("cuantos pacientes")) {
      dispatchPeriodashNav("pacientes");
      return "Abriendo el directorio de pacientes activos.";
    }
    if (raw.includes("ir a facturación") || raw.includes("finanzas")) {
      dispatchPeriodashNav("facturacion");
      return "Accediendo al módulo financiero y control de recaudación.";
    }

    // 3. Knowledge Base
    for (const [key, def] of Object.entries(DENTITO_KNOWLEDGE)) {
      if (raw.includes(key) || raw.includes("que es " + key) || raw.includes("definicion de " + key)) {
        return `📖 **${key.toUpperCase()}**: ${def}`;
      }
    }

    // 4. Chit Chat
    if (raw.includes("hola") || raw.includes("buenos dias")) {
      return "¡Hola doctor(a)! ¿En qué te ayudo hoy?";
    }
    if (raw.includes("chiste") || raw.includes("broma")) {
      return "¿Por qué a los programadores les gusta la odontología? ¡Porque saben manejar bien los 'bytes'! 🥁";
    }

    return null;
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: textToSend,
      createdAt: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    const localResponse = processInternalCommand(textToSend);
    if (localResponse !== null) {
      setMessages((prev) => [...prev, {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: localResponse,
        createdAt: new Date().toISOString(),
      }]);
      setLoading(false);
      return;
    }

    try {
      const serialisedPatient = activePatient ? JSON.stringify({
        id: activePatient.id,
        name: activePatient.name,
        birthdate: activePatient.birthdate,
        odontogram: activePatient.odontogram,
        periodontogram: activePatient.periodontogram,
        notes: activePatient.notes
      }, null, 2) : "";

      const res = await fetch("/api/dentito", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          context: serialisedPatient,
        }),
      });

      const data = await res.json();
      const botResponse: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: data.text || data.error || "No obtuve una respuesta clara. Prueba decir 'Emergencia' o 'Ir a agenda'.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (err: any) {
      setMessages((prev) => [...prev, {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: "Lo siento, tuve un problema para conectarme con mis servidores de inteligencia artificial. Por favor asegúrate de validar tu clave API de Gemini.",
        createdAt: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador Safari/viejo no soporta Web Speech API. Usa Chrome/Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleSendMessage(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  return (
    <>
      <AnimatePresence>
        {emergencyMode && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
            className="fixed inset-0 z-[999] bg-rose-950/80 backdrop-blur-2xl flex flex-col items-center justify-center p-4 md:p-6 text-white overflow-hidden"
          >
            <div className="max-w-4xl w-full max-h-[92vh] overflow-y-auto bg-rose-900/30 backdrop-blur-md p-6 md:p-10 rounded-3xl border border-rose-500/30 shadow-[0_0_100px_rgba(244,63,94,0.2)] relative hide-scrollbar">
              <button 
                onClick={() => setEmergencyMode(null)}
                className="absolute top-6 right-6 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/40 rounded-full font-bold transition-all text-xs cursor-pointer border border-rose-500/50"
              >
                Cerrar Protocolos
              </button>
              
              <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-10">
                <div className="p-3 md:p-4 bg-rose-500/20 rounded-2xl border border-rose-500/40 animate-pulse shrink-0">
                  <AlertTriangle className="w-8 h-8 md:w-12 md:h-12 text-rose-400" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-4xl font-display font-black tracking-tight text-white mb-1">CÓDIGO ROJO CLÍNICO</h1>
                  <p className="text-xs md:text-sm text-rose-300 font-medium tracking-wide">Protocolos de Estabilización Médica Avanzada</p>
                </div>
              </div>

              {emergencyMode === "selector" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button onClick={() => setEmergencyMode("syncope")} className="bg-black/20 hover:bg-black/40 p-6 md:p-8 rounded-3xl flex flex-col items-center text-center gap-4 transition-all cursor-pointer border border-white/5 hover:border-white/20 group">
                    <Activity className="w-10 h-10 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-lg md:text-xl">Síncope Vasovagal</h3>
                    <p className="text-[11px] md:text-xs text-rose-200/70">Hiperventilación, pérdida de consciencia súbita, palidez extrema.</p>
                  </button>
                  <button onClick={() => setEmergencyMode("anaphylaxis")} className="bg-rose-500/10 hover:bg-rose-500/20 p-6 md:p-8 rounded-3xl flex flex-col items-center text-center gap-4 transition-all cursor-pointer border border-rose-500/30 hover:border-rose-500/60 shadow-[0_0_30px_rgba(244,63,94,0.1)] group">
                    <AlertTriangle className="w-10 h-10 text-yellow-400 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-lg md:text-xl">Shock Anafiláctico</h3>
                    <p className="text-[11px] md:text-xs text-rose-200/70">Reacción alérgica aguda severa, taquicardia, broncoespasmo severo.</p>
                  </button>
                  <button onClick={() => setEmergencyMode("angina")} className="bg-black/20 hover:bg-black/40 p-6 md:p-8 rounded-3xl flex flex-col items-center text-center gap-4 transition-all cursor-pointer border border-white/5 hover:border-white/20 group">
                    <HeartPulse className="w-10 h-10 text-rose-400 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-lg md:text-xl">Angina o IAM</h3>
                    <p className="text-[11px] md:text-xs text-rose-200/70">Dolor torácico opresivo, irradiado a mandíbula o brazo izquierdo.</p>
                  </button>
                </div>
              )}

              {/* Protocol Details remain similar but styling enhanced */}
              {emergencyMode === "syncope" && (
                <div className="space-y-6">
                  <h3 className="text-3xl font-display font-black flex items-center gap-3"><Activity className="w-8 h-8 text-cyan-400"/> Síncope Vasovagal</h3>
                  <div className="space-y-4 font-mono text-base bg-black/40 backdrop-blur-md p-8 rounded-3xl border border-white/10 text-emerald-50">
                    <p className="text-rose-400 font-bold mb-4">1. 🛑 DETENER EL TRATAMIENTO INMEDIATAMENTE.</p>
                    <p>2. 💺 Posición de Trendelenburg (Inclinación del sillón dental con piernas elevadas a 15-30°).</p>
                    <p>3. 💨 Aflojar prendas muy ajustadas (cuellos, corbatas, cinturones).</p>
                    <p>4. 🧊 Aplicar compresa fría húmeda sobre la frente o nuca.</p>
                    <p>5. ⏱️ Monitorear pulso. Si no recupera en 2 mins, activar sistema de emergencias médicas (SEM).</p>
                  </div>
                  <button onClick={() => setEmergencyMode("selector")} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer font-bold text-sm transition-all border border-white/20">← Cambiar Condición</button>
                </div>
              )}
              {emergencyMode === "anaphylaxis" && (
                <div className="space-y-6">
                  <h3 className="text-3xl font-display font-black flex items-center gap-3 text-yellow-400"><AlertTriangle className="w-8 h-8"/> Shock Anafiláctico</h3>
                  <div className="space-y-4 font-mono text-base bg-rose-950/60 backdrop-blur-md p-8 rounded-3xl border border-rose-500/30 text-rose-100 shadow-inner">
                    <p className="font-bold text-yellow-300 text-lg mb-2">1. 📞 ACTIVAR SISTEMA DE EMERGENCIAS (LLAMAR A UNA AMBULANCIA AHORA).</p>
                    <p>2. 🛑 Cancelar procedimiento y retirar todos los materiales dentales/alérgenos de la boca.</p>
                    <p className="font-bold text-white bg-rose-600/30 p-3 rounded-lg border border-rose-500/50">3. 💉 ADRENALINA IM inyectable (Adultos: 0.3 a 0.5 mg, dilución 1:1000) en la cara anterolateral del muslo (vasto externo) INMEDIATAMENTE.</p>
                    <p>4. 💺 Posición supina y elevación pasiva de piernas (si tolera y no hay compromiso respiratorio severo).</p>
                    <p>5. 🌬️ Oxígeno suplementario a alto flujo (15 L/min).</p>
                  </div>
                  <button onClick={() => setEmergencyMode("selector")} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer font-bold text-sm transition-all border border-white/20">← Cambiar Condición</button>
                </div>
              )}
               {emergencyMode === "angina" && (
                <div className="space-y-6">
                  <h3 className="text-3xl font-display font-black flex items-center gap-3 text-rose-300"><HeartPulse className="w-8 h-8"/> Síndrome Coronario (IAM/Angina)</h3>
                  <div className="space-y-4 font-mono text-base bg-black/40 backdrop-blur-md p-8 rounded-3xl border border-white/10 text-emerald-50">
                    <p className="text-rose-400 font-bold mb-4">1. 🛑 DETENER EL TRATAMIENTO INMEDIATAMENTE.</p>
                    <p className="font-bold text-yellow-300">2. 📞 LLAMAR al servicio de emergencias si sospechas Infarto (el dolor no cede en minutos).</p>
                    <p>3. 💺 Posicionar al paciente semisentado para facilitar la ventilación.</p>
                    <p>4. 🌬️ Administrar Oxígeno suplementario de inmediato.</p>
                    <p className="font-bold">5. 💊 Fármacos (SOLO si el paciente no tiene contraindicaciones y sospechas fuertemente): Nitroglicerina sublingual o Aspirina masticable 300mg.</p>
                  </div>
                  <button onClick={() => setEmergencyMode("selector")} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer font-bold text-sm transition-all border border-white/20">← Cambiar Condición</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        key={positionState}
        layout
        drag={positionState !== "fullscreen"}
        dragConstraints={getDragConstraints()}
        dragElastic={0.05}
        dragMomentum={false}
        onDragStart={() => {
          isDraggingRef.current = true;
        }}
        onDragEnd={() => {
          setTimeout(() => {
            isDraggingRef.current = false;
          }, 60);
        }}
        onTap={() => {
          if (isMinimized) {
            setIsMinimized(false);
          }
        }}
        className={`fixed z-[99] print:hidden transition-[background-color,border-color,shadow,opacity] duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col
          bg-white/45 dark:bg-slate-900/65 backdrop-blur-2xl border border-white/60 dark:border-white/10
          ${getPositionClasses()}`}
      >
        {isMinimized ? (
          <div 
            title="Dentito AI - Toca para asistencia"
            className="w-full h-full flex items-center justify-center cursor-pointer relative group"
          >
             <div className="relative w-12 h-12 flex items-center justify-center rounded-full p-[1.5px] shadow-sm">
                <div className="absolute inset-0 neon-rainbow-bg rounded-full pointer-events-none opacity-80 animate-spin-slow" />
                <div className="absolute inset-[1.5px] bg-slate-100 dark:bg-slate-950 rounded-full z-0 pointer-events-none" />
                <div className="relative z-10 w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                   <ParticleSystem />
                </div>
             </div>
             {/* Breathing background effect */}
             <div className="absolute inset-2 bg-teal-500/20 rounded-full animate-ping scale-75 opacity-30 pointer-events-none" />
          </div>
        ) : (
          <>
            {/* Header - Glassmorphic */}
            <div 
              className="flex items-center justify-between px-5 py-3 border-b border-white/20 dark:border-white/5 cursor-grab active:cursor-grabbing relative bg-gradient-to-br from-teal-400/10 to-transparent select-none"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-[48px] h-[48px] flex items-center justify-center rounded-full shadow-inner p-[2px] shrink-0">
                   <div className="absolute inset-0 neon-rainbow-bg rounded-full pointer-events-none opacity-100" />
                   <div className="absolute inset-[2px] bg-slate-100 dark:bg-slate-900 rounded-full z-0 pointer-events-none" />
                   <div className="relative z-10 w-full h-full rounded-full overflow-hidden flex items-center justify-center border border-white/30 dark:border-white/5 bg-slate-50 dark:bg-slate-900">
                      <ParticleSystem />
                   </div>
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-sm text-slate-800 dark:text-white tracking-tight">Dentito AI <span className="font-mono text-teal-500 text-[10px] ml-1 bg-teal-500/10 px-1.5 py-0.5 rounded-sm">v15 Pro</span></h4>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Asistente Cuántico Clínico</span>
                </div>
              </div>

              <div 
                className="flex items-center gap-1.5" 
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {/* Position Toggler Menu */}
                <div className="relative">
                  <button 
                    onClick={() => setShowPositionMenu(!showPositionMenu)}
                    className="p-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded-xl transition-all cursor-pointer border border-white/20 dark:border-white/5 text-slate-600 dark:text-slate-300 flex items-center gap-1"
                    title="Trasladar / Posicionar"
                  >
                    <Move className="w-3.5 h-3.5 text-teal-500" />
                    <span className="text-[10px] font-bold hidden sm:inline">Trasladar</span>
                  </button>
                  
                  <AnimatePresence>
                    {showPositionMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: positionState.startsWith("bottom") ? 10 : -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: positionState.startsWith("bottom") ? 10 : -10, scale: 0.95 }}
                        className={positionState.startsWith("bottom") 
                          ? "absolute right-0 bottom-full mb-2 z-[100] w-52 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-2xl p-2 text-slate-800 dark:text-slate-100"
                          : "absolute right-0 top-full mt-2 z-[100] w-52 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-2xl p-2 text-slate-800 dark:text-slate-100"
                        }
                      >
                        <div className="px-3 py-1.5 text-[9px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                          Trasladar de Posición
                        </div>
                        {[
                          { id: "bottom-right", label: "Abajo Derecha ↘️", desc: "Ubicación inferior derecha" },
                          { id: "bottom-left", label: "Abajo Izquierda ↙️", desc: "Ubicación inferior izquierda" },
                          { id: "top-right", label: "Arriba Derecha ↗️", desc: "Ubicación superior derecha" },
                          { id: "top-left", label: "Arriba Izquierda ↖️", desc: "Ubicación superior izquierda" },
                          { id: "fullscreen", label: "Pantalla Completa 📱", desc: "Optimizado para móviles" }
                        ].map((pos) => (
                          <button
                            key={pos.id}
                            onClick={() => {
                              setPositionState(pos.id as DentitoPosition);
                              setShowPositionMenu(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] transition-all flex flex-col gap-0.5 cursor-pointer border-0 bg-transparent ${
                              positionState === pos.id 
                                ? "bg-teal-500! text-white!" 
                                : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <span className="font-semibold">{pos.label}</span>
                            <span className={`text-[8px] font-normal ${positionState === pos.id ? "text-teal-100" : "text-slate-400 dark:text-slate-500"}`}>
                              {pos.desc}
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(true);
                    setShowPositionMenu(false);
                  }}
                  className="p-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded-full transition-all cursor-pointer border border-white/20 dark:border-white/5 text-slate-600 dark:text-slate-300"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area - Liquid Glass */}
            <div 
              onPointerDown={(e) => e.stopPropagation()} 
              className="flex-1 overflow-y-auto p-5 space-y-5 text-xs bg-gradient-to-b from-white/30 to-slate-50/50 dark:from-slate-900/10 dark:to-slate-800/20 hide-scrollbar shadow-inner relative"
            >
               {/* Context badge floating */}
               <div className="absolute top-3 inset-x-0 flex justify-center z-10 pointer-events-none sticky">
                 <div className="bg-white/80 dark:bg-black/60 backdrop-blur-md border border-slate-200/50 dark:border-white/10 shadow-sm px-3 py-1.5 rounded-full flex items-center gap-2 text-[9px] text-slate-500 font-mono tracking-wide">
                   <BrainCircuit className="w-3 h-3 text-teal-500" />
                   MEMORIA ACTIVA: {activePatient ? activePatient.name.toUpperCase() : "SISTEMA GLOBAL"}
                 </div>
               </div>

              {messages.map((m) => {
                const isBot = m.role === "assistant";
                return (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={m.id} className={`flex gap-3 ${isBot ? "justify-start" : "justify-end"} relative z-20`}>
                    <div className={`p-4 max-w-[88%] md:max-w-[85%] rounded-[1.2rem] leading-relaxed select-text drop-shadow-sm ${
                      isBot 
                        ? "bg-white/80 dark:bg-slate-800/85 backdrop-blur-md text-slate-800 dark:text-slate-100 rounded-tl-sm border border-white dark:border-slate-700/80 font-medium" 
                        : "bg-teal-500 text-white rounded-tr-sm font-medium shadow-md shadow-teal-500/20 border border-teal-400 whitespace-pre-wrap"
                    }`}>
                      {isBot ? (
                        <div className="markdown-body text-slate-800 dark:text-slate-100 [&_p]:mb-2.5 [&_p]:last-child:mb-0 [&_p]:leading-relaxed [&_p]:text-slate-800 dark:[&_p]:text-slate-100 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul]:text-slate-800 dark:[&_ul]:text-slate-100 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol]:text-slate-800 dark:[&_ol]:text-slate-100 [&_li]:mb-1.5 [&_li]:text-slate-800 dark:[&_li]:text-slate-100 [&_table]:w-full [&_table]:my-4 [&_table]:border-collapse [&_table]:text-[11px] [&_table]:text-slate-800 dark:[&_table]:text-slate-100 [&_th]:border [&_th]:border-slate-300 dark:[&_th]:border-slate-600 [&_th]:p-2 [&_th]:bg-slate-100 dark:[&_th]:bg-slate-900/60 [&_th]:font-bold [&_th]:text-slate-900 dark:[&_th]:text-white [&_th]:text-left [&_td]:border [&_td]:border-slate-200 dark:[&_td]:border-slate-700 [&_td]:p-2 [&_td]:text-slate-800 dark:[&_td]:text-slate-100 [&_blockquote]:border-l-4 [&_blockquote]:border-teal-500 [&_blockquote]:pl-3 [&_blockquote]:py-2 [&_blockquote]:italic [&_blockquote]:bg-slate-500/5 dark:[&_blockquote]:bg-white/5 [&_blockquote]:text-slate-700 dark:[&_blockquote]:text-slate-200 [&_blockquote]:rounded-r-lg [&_blockquote]:my-3 [&_h1]:text-sm [&_h1]:font-black [&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-teal-800 dark:[&_h1]:text-teal-300 [&_h2]:text-xs [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1.5 [&_h2]:text-teal-700 dark:[&_h2]:text-teal-300 [&_h3]:font-bold [&_h3]:mt-2 [&_h3]:mb-1 [&_strong]:text-teal-700 dark:[&_strong]:text-teal-300 [&_strong]:font-bold [&_strong]:tracking-tight">
                          <Markdown>{m.content}</Markdown>
                        </div>
                      ) : (
                        m.content
                      )}
                    </div>
                  </motion.div>
                );
              })}
              {loading && (
                <div className="flex gap-2 items-center p-3">
                   <div className="flex gap-1.5 bg-white/60 dark:bg-slate-800/60 p-3 rounded-full backdrop-blur-md">
                     <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: "0ms"}}/>
                     <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: "150ms"}}/>
                     <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: "300ms"}}/>
                   </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Input & Commands Footer */}
            <div 
              onPointerDown={(e) => e.stopPropagation()} 
              className="px-5 pb-5 pt-3 bg-white/40 dark:bg-slate-900/40 border-t border-white/40 dark:border-white/5 backdrop-blur-xl"
            >
              <div className="flex gap-2 mb-3 px-1 overflow-x-auto hide-scrollbar max-w-full">
                <button onClick={() => handleSendMessage("Explícanos en profundidad la clasificación de periodontitis (Estadios y Grados) según el Consenso AAP/EFP 2018.")} className="shrink-0 text-[10px] font-bold tracking-wide px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 hover:bg-teal-500/20 transition-colors cursor-pointer flex items-center gap-1">
                  📚 Periodoncia AAP 2018
                </button>
                <button onClick={() => handleSendMessage("Cuáles son los criterios clínicos del sistema ICDAS para evaluar el nivel de avance de caries?")} className="shrink-0 text-[10px] font-bold tracking-wide px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 transition-colors cursor-pointer flex items-center gap-1">
                  🔍 Caries (ICDAS)
                </button>
                <button onClick={() => handleSendMessage("Explica las clases de Angle de oclusión y la diferencia entre trauma oclusal primario y secundario.")} className="shrink-0 text-[10px] font-bold tracking-wide px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer flex items-center gap-1">
                  ⚖️ Oclusión y Angle
                </button>
                <button onClick={() => handleSendMessage("En prótesis removible, detallame la clasificación de Kennedy y las reglas de Applegate.")} className="shrink-0 text-[10px] font-bold tracking-wide px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors cursor-pointer flex items-center gap-1">
                  🦷 Prótesis (Kennedy)
                </button>
                <button onClick={() => handleSendMessage("¿Cuáles son los signos y el manejo de Alveolitis seca frente al de Alveolitis húmeda?")} className="shrink-0 text-[10px] font-bold tracking-wide px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer flex items-center gap-1">
                  🩸 Alveolitis Seca vs Húmeda
                </button>
                <button onClick={() => handleSendMessage("Qué diferencia hay entre una Pulpotomía y una Pulpectomía en Odontopediatría?")} className="shrink-0 text-[10px] font-bold tracking-wide px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 transition-colors cursor-pointer flex items-center gap-1">
                  👶 Odontopediatría
                </button>
                <button onClick={() => handleSendMessage("Cuál es el protocolo de profilaxis para endocarditis infecciosa y qué antibióticos alternativos darías en alérgicos?")} className="shrink-0 text-[10px] font-bold tracking-wide px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-colors cursor-pointer flex items-center gap-1">
                  💊 Profilaxis
                </button>
                <button onClick={() => handleSendMessage("Cómo diagnostico una Leucoplasia Oral y qué precauciones de malignidad debo tomar?")} className="shrink-0 text-[10px] font-bold tracking-wide px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-colors cursor-pointer flex items-center gap-1">
                  🔬 Patología Oral
                </button>
                <button onClick={() => setEmergencyMode("selector")} className="shrink-0 text-[10px] font-bold tracking-wide px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer flex items-center gap-1">
                  🚨 Protocolos de Emergencia
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={toggleListening}
                  className={`shrink-0 p-3.5 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-inner border backdrop-blur-md ${
                    isListening 
                    ? "bg-rose-100 border-rose-300 text-rose-600 animate-pulse dark:bg-rose-900/30 dark:border-rose-800" 
                    : "bg-white/80 border-slate-200 text-slate-500 hover:text-slate-700 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-400"
                  }`}
                >
                  <Mic className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  placeholder="Instruye a Dentito..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage(input);
                  }}
                  className="flex-1 text-xs p-3.5 border border-white/50 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 rounded-2xl outline-none text-slate-800 dark:text-slate-100 font-medium placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 transition-colors shadow-inner"
                />
                <button
                  onClick={() => handleSendMessage(input)}
                  className="bg-teal-500 hover:bg-teal-600 text-white p-3.5 rounded-2xl cursor-pointer shadow-lg shadow-teal-500/25 transition-all shrink-0 border border-teal-400/50"
                  disabled={loading || !input.trim()}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </>
  );
}
