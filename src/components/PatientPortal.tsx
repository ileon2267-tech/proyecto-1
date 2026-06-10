import React, { useState } from "react";
import Logo from "./Logo";
import { 
  Search, 
  MapPin, 
  Clock, 
  Calendar, 
  MessageSquare, 
  ShieldAlert, 
  User, 
  Star, 
  Award, 
  Sparkles, 
  BookOpen, 
  LogOut, 
  Heart, 
  Activity, 
  Grid,
  FileCheck2,
  CheckCircle,
  HelpCircle,
  Send,
  Stethoscope
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ClinicalUser, Appointment } from "../types";

interface PatientPortalProps {
  activeUser: ClinicalUser;
  onLogout: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  allAppointments: Appointment[];
  onAddAppointment: (app: Appointment) => void;
}

const CLINICS_DIRECTORY = [
  {
    id: "clinic-1",
    name: "PerioClinic Providencia",
    address: "Av. Providencia 1040, Of. 602, Santiago",
    rating: 4.9,
    reviews: 124,
    phone: "+56 2 2481 9000",
    specialties: ["Periodoncia Avanzada", "Implantes", "Rehabilitación Oral"],
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "clinic-2",
    name: "Centro Dental Las Condes",
    address: "Av. Apoquindo 4500, Las Condes, Santiago",
    rating: 4.8,
    reviews: 98,
    phone: "+56 2 2915 3200",
    specialties: ["Odontología General", "Estética Dental", "Endodoncia"],
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "clinic-3",
    name: "Clínica Dental Vitacura",
    address: "Camino El Huinganal 2900, Vitacura",
    rating: 5.0,
    reviews: 64,
    phone: "+56 2 2307 4100",
    specialties: ["Ortodoncia Invisible", "Odontopediatría", "Cirugía Maxilofacial"],
    image: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=300&q=80"
  }
];

const CLINICIANS_DIRECTORY = [
  {
    id: "doc-1",
    name: "Dr. Ignacio León",
    specialty: "Especialista en Periodoncia e Implantología",
    clinic: "PerioClinic Providencia",
    rating: 4.9,
    experience: "12 años de trayectoria",
    availability: "Mañana y tarde",
    avatar: "IL"
  },
  {
    id: "doc-2",
    name: "Dra. Camila Silva",
    specialty: "Odontopediatría y Estética",
    clinic: "Centro Dental Las Condes",
    rating: 4.8,
    experience: "8 años de trayectoria",
    availability: "Tarde de Lunes a Jueves",
    avatar: "CS"
  },
  {
    id: "doc-3",
    name: "Dr. Sebastián Prado",
    specialty: "Cirujano Maxilofacial y Rehabilitador",
    clinic: "Clínica Dental Vitacura",
    rating: 5.0,
    experience: "15 años de trayectoria",
    availability: "Solo viernes por la mañana",
    avatar: "SP"
  }
];

const HEALTH_TIPS = [
  {
    title: "Mantenimiento Preventivo de Encias",
    category: "Periodoncia",
    readingTime: "3 min de lectura",
    description: "El cepillado interdental diario reduce en un 87% el sangrado de las encías activa y previene la resorción ósea temprana.",
    color: "from-teal-500 to-cyan-500",
    icon: Heart
  },
  {
    title: "Por qué sangran las encías al cepillarse",
    category: "Gingivitis",
    readingTime: "4 min de lectura",
    description: "La inflamación periodontal es la respuesta inmune al biofilm dental. Acude a una limpieza ultrasónica profiláctica semestral.",
    color: "from-emerald-500 to-teal-600",
    icon: ShieldAlert
  },
  {
    title: "Cuidado Avanzado de Implantes Dentales",
    category: "Implantología",
    readingTime: "5 min de lectura",
    description: "Aprende cómo el enjuague de clorhexidina bajo supervisión clínica mantiene la osteointegración libre de mucositis periimplantaria.",
    color: "from-blue-500 to-indigo-600",
    icon: Sparkles
  }
];

export default function PatientPortal({ 
  activeUser, 
  onLogout, 
  darkMode, 
  setDarkMode, 
  allAppointments, 
  onAddAppointment 
}: PatientPortalProps) {
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClinician, setSelectedClinician] = useState("");
  const [selectedDate, setSelectedDate] = useState("2026-06-10");
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [selectedTreatment, setSelectedTreatment] = useState("Consulta de Diagnóstico y Plan");
  const [formSuccess, setFormSuccess] = useState(false);
  
  // Local active chat with Patient's personalized Assistant Dentito-Lite
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([
    {
      role: "assistant",
      content: `¡Hola, ${activeUser.name}! Bienvenido a tu Portal del Paciente. Soy **Dentito IA**, tu copiloto virtual de salud oral. ¿Tienes alguna pregunta sobre tu tratamiento, dolor dental o cómo cuidar tus encías? Escríbeme y te guiaré con gusto.`
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Filter clinician/clinic search
  const filteredClinicians = CLINICIANS_DIRECTORY.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.clinic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClinics = CLINICS_DIRECTORY.filter(clinic => 
    clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clinic.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
    clinic.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Client's specific upcoming appointments linked to their registered login email
  const myAppointments = allAppointments.filter(app => 
    app.patientName.toLowerCase() === activeUser.name.toLowerCase() ||
    app.patientId === "pat-client" ||
    app.treatment.toLowerCase().includes("diagnóstico") && activeUser.profile === "cliente"
  );

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClinician) return;

    const matchedDoc = CLINICIANS_DIRECTORY.find(doc => doc.id === selectedClinician);
    const doctorName = matchedDoc ? matchedDoc.name : "Dr. Especialista";

    const newApp: Appointment = {
      id: `app-client-${Date.now()}`,
      patientId: "pat-client", // generic user-patient client indicator
      patientName: activeUser.name,
      date: selectedDate,
      time: selectedTime,
      treatment: `${selectedTreatment} - [Solicitado por Portal de Cliente]`,
      status: "Pending", // Starts as pending approval
      box: "Sillón 1" // Default placement representation
    };

    onAddAppointment(newApp);
    setFormSuccess(true);
    
    // Clear success message after 4s
    setTimeout(() => {
      setFormSuccess(false);
    }, 4000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsChatLoading(true);

    // Call server API for patient assistant
    try {
      const response = await fetch("/api/dentito", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...chatMessages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: userMsg }
          ],
          context: `Paciente: ${activeUser.name} (${activeUser.email}). Rol: Cliente/Paciente sin conocimientos odontológicos complejos. Habla con tono cálido, preventivo, motivacional y claro para un consumidor dental. Recomienda cepillado 3 veces al día, hilo dental, y acudir a la clínica si manifiesta dolor actual.`
        })
      });

      const data = await response.json();
      if (data.text) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
      } else {
        throw new Error(data.error || "Ocurrió un error");
      }
    } catch (e) {
      // Fallback
      setTimeout(() => {
        setChatMessages(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            content: `**Dentito:** Disculpa, tengo una interferencia en mi señal satelital, pero recuerda siempre cepillarte usando la técnica de Bass modificada e hilo dental diariamente. Para agendar formalmente tu hora de control periodontal, utiliza el formulario de reserva ubicado al centro del portal.` 
          }
        ]);
      }, 500);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans ${darkMode ? "dark bg-slate-950 text-white" : "bg-slate-50 text-slate-800"} pb-12`}>
      {/* Background blobs for premium depth */}
      {darkMode && (
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-teal-950/20 blur-[130px] rounded-full" />
          <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-emerald-950/10 blur-[140px] rounded-full" />
        </div>
      )}

      {/* Top Main Navigation for Clinical Patients */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-150 dark:border-slate-800/80 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10" showNeon={true} />
            <div>
              <h1 className="font-display font-bold text-base leading-none text-slate-900 dark:text-white mb-0.5">PerioDash</h1>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-extrabold tracking-widest uppercase">Portal del Paciente</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* User profile capsule info */}
            <div className="hidden sm:flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-800">
              <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                {activeUser.name.charAt(0)}
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 leading-none">{activeUser.name}</p>
                <span className="text-[8.5px] font-semibold text-slate-400 uppercase tracking-wider">Paciente de Convenio</span>
              </div>
            </div>

            {/* Logout actions */}
            <button
              onClick={onLogout}
              className="p-2.5 rounded-xl border border-red-200/55 dark:border-red-950/30 bg-red-50/50 dark:bg-red-950/20 text-red-650 dark:text-red-400 hover:bg-red-100/50 dark:hover:bg-red-950/40 cursor-pointer transition-all flex items-center gap-1.5 font-bold text-xs"
              title="Cerrar sesión segura"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Patient Experience */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Welcome greeting card with premium layout */}
        <div className="bg-gradient-to-r from-teal-900/20 via-teal-950/10 to-slate-900/40 rounded-3xl border border-teal-500/10 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] bg-teal-500/10 border border-teal-500/25 text-teal-600 dark:text-teal-400 font-extrabold uppercase px-3 py-1 rounded-full tracking-widest inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Acceso Paciente Seguro
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
              ¡Hola, {activeUser.name}!
            </h2>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-light">
              Desde tu portal puedes buscar clínicas autorizadas PerioDash, coordinar nuevas consultas presenciales con los mejores especialistas de la región y revisar recomendaciones médicas en tiempo real.
            </p>
          </div>
          
          <div className="bg-white/5 dark:bg-slate-900/50 backdrop-blur-md border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shrink-0 flex items-center gap-3 w-full md:w-auto">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Tu Índice de Salud</p>
              <h4 className="text-lg font-black text-slate-800 dark:text-white">Excelente (94%)</h4>
              <p className="text-[9px] text-teal-500 leading-none font-semibold mt-0.5">Control periodontal al día</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT PANEL: Directory Search, Clinical Tip, and Book form */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. Clinicians Directory & Clinics Search Engine */}
            <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-5">
                <div>
                  <h3 className="text-md font-display font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-teal-500" />
                    Buscar Profesionales y Clínicas Dentales
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Encuentra disponibilidad y agenda de manera directa</p>
                </div>

                {/* Live directories search field */}
                <div className="relative w-full md:w-72">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrar por especialidad o apellido..."
                    className="w-full text-xs p-2.5 pl-9 rounded-xl outline-none border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-white focus:border-teal-500/40"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-2.5 text-[10px] font-bold text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer"
                    >
                      Borrador
                    </button>
                  )}
                </div>
              </div>

              {/* Grid Clinicians Results */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-teal-600 dark:text-teal-400 tracking-widest">Doctores Disponibles</h4>
                
                {filteredClinicians.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">No se encontraron especialistas con el término ingresado.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {filteredClinicians.map((doc) => (
                      <div 
                        key={doc.id}
                        className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10 flex flex-col justify-between hover:border-teal-500/30 transition-all group"
                      >
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-start">
                            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs border border-teal-500/10">
                              {doc.avatar}
                            </div>
                            <div className="flex items-center gap-1 bg-amber-500/5 border border-amber-500/20 rounded px-1.5 py-0.5">
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              <span className="text-[9.5px] font-bold text-amber-600 dark:text-amber-400">{doc.rating}</span>
                            </div>
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-tight group-hover:text-teal-550 dark:group-hover:text-teal-400 transition-colors">{doc.name}</h5>
                            <p className="text-[10px] text-teal-500 font-semibold mt-1 leading-snug">{doc.specialty}</p>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800/40 pt-2.5 mt-3 space-y-1.5 text-[10px] text-slate-400">
                          <p className="truncate">🏢 {doc.clinic}</p>
                          <p>📅 {doc.availability}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Grid Clinic branches Results */}
              <div className="space-y-4 pt-2">
                <h4 className="text-[10px] font-black uppercase text-teal-600 dark:text-teal-400 tracking-widest">Sedes de Clínicas Dentales</h4>
                
                {filteredClinics.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">No se encontraron clínicas asociadas con la búsqueda.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {filteredClinics.map((clinic) => (
                      <div 
                        key={clinic.id}
                        className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10 overflow-hidden flex flex-col justify-between hover:border-teal-500/30 transition-all"
                      >
                        <div className="h-28 overflow-hidden relative">
                          <img 
                            src={clinic.image} 
                            alt={clinic.name} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                          <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-[9px] text-white font-bold px-2 py-0.5 rounded flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                            {clinic.rating} ({clinic.reviews} reviews)
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <div>
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{clinic.name}</h5>
                            <p className="text-[10px] text-slate-400 mt-1 block h-8 line-clamp-2 leading-snug">📍 {clinic.address}</p>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {clinic.specialties.map((spec) => (
                              <span 
                                key={spec} 
                                className="text-[8px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md px-1.5 py-0.5"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 2. CLINICAL APPOINTMENT REQUEST FORM */}
            <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 space-y-6">
              <div>
                <h3 className="text-md font-display font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-500" />
                  Agendar Nueva Cita Quirúrgica / Control
                </h3>
                <p className="text-xs text-slate-400 mt-1">Completa los parámetros médicos solicitados. La clínica autorizará la hora a la brevedad.</p>
              </div>

              {formSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <strong className="font-bold block uppercase text-[10px] tracking-wider mb-0.5">¡Solicitud Procesada Correctamente!</strong>
                    La cita ha sido recibida en el módulo del odontólogo en estado *Pendiente*. Se enviará un SMS e email automático.
                  </div>
                </div>
              )}

              <form onSubmit={handleBookAppointment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block font-sans">Especialista Requerido</label>
                  <select
                    value={selectedClinician}
                    onChange={(e) => setSelectedClinician(e.target.value)}
                    className="w-full text-xs p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none dark:text-white focus:border-teal-500/40"
                    required
                  >
                    <option value="">Seleccione el odontólogo...</option>
                    {CLINICIANS_DIRECTORY.map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.name} - ({doc.clinic})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block font-sans">Tratamiento de Interés</label>
                  <select
                    value={selectedTreatment}
                    onChange={(e) => setSelectedTreatment(e.target.value)}
                    className="w-full text-xs p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none dark:text-white focus:border-teal-500/40"
                  >
                    <option value="Consulta de Diagnóstico y Plan">Control Periodontal Profiláctico</option>
                    <option value="Sondaje Periodontal Completo">Sondaje Periodontal Estructurado 6 puntos</option>
                    <option value="Raspado y Alisado Radicular">Raspado y Alisado Radicular (Curetaje)</option>
                    <option value="Diseño Estético e Implantes">Evaluación de Implante / Corona Dental</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block font-sans">Fecha Solicitada</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none dark:text-white focus:border-teal-500/40"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block font-sans">Horario Preferido</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none dark:text-white focus:border-teal-500/40"
                  >
                    {["09:00", "10:00", "11:00", "12:00", "15:00", "16:30", "18:00"].map(hr => (
                      <option key={hr} value={hr}>{hr} hrs</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 pt-2">
                  <button
                    type="submit"
                    className="bg-teal-650 hover:bg-teal-700 text-white font-bold text-xs py-3.5 px-6 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-teal-500/10"
                  >
                    <Calendar className="w-4 h-4" />
                    Solicitar Reserva en Agenda Médica
                  </button>
                </div>
              </form>
            </div>

            {/* 3. HEALTH EDUCATION TIPS (DENTAL STORIES) */}
            <div className="space-y-4">
              <h3 className="text-sm font-display font-black text-slate-900 dark:text-white tracking-widest uppercase flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-400" />
                Consejos Clínicos de Salud Oral
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {HEALTH_TIPS.map((tip) => {
                  const Icon = tip.icon;
                  return (
                    <div 
                      key={tip.title}
                      className="p-5 bg-white dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-2xl relative overflow-hidden flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] bg-teal-500/10 text-teal-500 border border-teal-500/10 font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                            {tip.category}
                          </span>
                          <span className="text-[9px] text-slate-400">{tip.readingTime}</span>
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{tip.title}</h5>
                          <p className="text-[10.5px] text-slate-400 mt-2 leading-relaxed h-[68px] line-clamp-4 font-light">
                            {tip.description}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800/40 pt-3 mt-4 flex items-center gap-2 text-teal-650 dark:text-teal-400 text-[10px] font-bold">
                        <Icon className="w-4.5 h-4.5 text-teal-500" />
                        <span>Artículo Validado</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR: Upcoming schedules and Personal AI Assistant */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* A) MY UPCOMING APPOINTMENTS */}
            <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 space-y-5">
              <div>
                <h4 className="text-xs font-black uppercase text-teal-600 dark:text-teal-400 tracking-widest block font-sans">
                  Mis Próximas Citas
                </h4>
                <p className="text-[11px] text-slate-400 font-medium">Controles médicos solicitados o confirmados</p>
              </div>

              {myAppointments.length === 0 ? (
                <div className="p-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-500">
                  <p>No tienes citas agendadas actualmente.</p>
                  <p className="text-[10px] text-slate-400 mt-1">Realiza tu primera solicitud con el panel izquierdo.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {myAppointments.map((app) => (
                    <div 
                      key={app.id}
                      className="p-3.5 border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/30 rounded-2xl flex items-start gap-3 relative overflow-hidden"
                    >
                      <div className={`absolute top-0 left-0 w-1 h-full ${
                        app.status === "Confirmed" ? "bg-emerald-500" : app.status === "Completed" ? "bg-slate-400" : "bg-amber-500"
                      }`} />

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[10px] font-black text-slate-800 dark:text-slate-200 shrink-0 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {app.time} hrs
                          </span>

                          <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            app.status === "Confirmed"
                              ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                              : app.status === "Completed"
                              ? "bg-slate-200 dark:bg-slate-800 text-slate-500"
                              : "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                          }`}>
                            {app.status === "Confirmed" ? "Confirmado" : app.status === "Completed" ? "Atendido" : "Pendiente"}
                          </span>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {app.treatment.replace(" - [Solicitado por Portal de Cliente]", "")}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            📅 {app.date}  |  🏥 {app.box}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* B) DENTITO PERSONAL PATIENT CO-PILOT CHAT */}
            <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 flex flex-col h-[480px]">
              <div className="pb-4 border-b border-slate-150 dark:border-slate-800/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center font-bold text-xs ring-1 ring-teal-500/30">
                  🤖
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-teal-600 dark:text-teal-400 tracking-widest block font-sans">
                    Chat con Dentito IA
                  </h4>
                  <span className="text-[9.5px] text-slate-400 mt-0.5 inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Asesor clínico activo
                  </span>
                </div>
              </div>

              {/* Messages viewport */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin scrollbar-thumb-teal-800">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx}
                    className={`flex ${msg.role === 'user' ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`p-3 rounded-2xl text-[11px] leading-relaxed max-w-[85%] ${
                      msg.role === 'user'
                        ? "bg-teal-600 text-white rounded-br-none font-medium ml-4"
                        : "bg-slate-50 dark:bg-slate-900/80 border border-slate-150 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-none font-light border-l-3 border-l-teal-500"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="p-3 bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-2xl text-[11px] text-slate-400">
                      Dentito está escribiendo...
                    </div>
                  </div>
                )}
              </div>

              {/* Chat action footer */}
              <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Escribe tu consulta médica..."
                  className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none dark:text-white focus:border-teal-500/40"
                  disabled={isChatLoading}
                />
                <button
                  type="submit"
                  className="bg-teal-600 font-bold p-3 text-white hover:bg-teal-700 cursor-pointer rounded-xl transition-all border-0 flex items-center justify-center shrink-0"
                  disabled={isChatLoading}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
