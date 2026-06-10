import React, { useState } from "react";
import { Appointment, Patient } from "../types";
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Edit, 
  Search, 
  MessageSquare,
  User,
  Coffee,
  X,
  Phone,
  Filter,
  CheckSquare,
  XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AgendaProps {
  appointments: Appointment[];
  patients: Patient[];
  onAddAppointment: (newApp: Appointment) => void;
  onUpdateStatus: (id: string, status: Appointment["status"]) => void;
  onDeleteAppointment: (id: string) => void;
  onUpdateAppointment?: (updatedApp: Appointment) => void;
}

export default function Agenda({
  appointments,
  patients,
  onAddAppointment,
  onUpdateStatus,
  onDeleteAppointment,
  onUpdateAppointment,
}: AgendaProps) {
  // Use "2026-06-07" as default today to sync with mock clinical records
  const [selectedDate, setSelectedDate] = useState("2026-06-07");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Confirmed" | "Completed">("All");
  const [agendaView, setAgendaView] = useState<"list" | "grid">("list");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formPatientId, setFormPatientId] = useState("");
  const [formDate, setFormDate] = useState("2026-06-07");
  const [formTime, setFormTime] = useState("10:00");
  const [formBox, setFormBox] = useState("Sillón 1");
  const [formTreatment, setFormTreatment] = useState("");
  const [formStatus, setFormStatus] = useState<Appointment["status"]>("Confirmed");

  const AVAILABLE_BOXES = ["Sillón 1", "Sillón 2", "Sillón 3"];

  // Frequently used clinical presets to maximize productivity
  const CLINICAL_PRESETS = [
    "Periodontodiagnóstico Integral",
    "Sondaje Periodontal de 6 Puntos",
    "Destartraje Ultrasónico y Pulido Coronario",
    "Raspado y Alisado Radicular (RAR) x Cuadrante",
    "Cirugía Plástica Gingival o Injerto Libre",
    "Control de Placa Bacteriana O'Leary",
    "Mantenimiento Periodontal y Soporte de Citas",
    "Evaluación de Urgencia Clínica"
  ];

  // Default mock hours
  const COMMON_HOURS = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", 
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", 
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", 
    "17:00", "17:30", "18:00"
  ];

  // Quick week days selector (around June 2026)
  const WEEK_DAYS = [
    { value: "2026-06-07", label: "Dom", dayNum: "07", isToday: true }, // Main mock date
    { value: "2026-06-08", label: "Lun", dayNum: "08", isToday: false },
    { value: "2026-06-09", label: "Mar", dayNum: "09", isToday: false },
    { value: "2026-06-10", label: "Mié", dayNum: "10", isToday: false },
    { value: "2026-06-11", label: "Jue", dayNum: "11", isToday: false },
    { value: "2026-06-12", label: "Vie", dayNum: "12", isToday: false },
  ];

  // Map to select patient from state
  const handleOpenAddForm = (initialTime?: string, initialBox?: string) => {
    setEditingId(null);
    setFormPatientId("");
    setFormDate(selectedDate);
    setFormTime(initialTime || "10:00");
    setFormBox(initialBox || "Sillón 1");
    setFormTreatment("");
    setFormStatus("Confirmed");
    setShowForm(true);
  };

  const handleOpenEditForm = (app: Appointment) => {
    setEditingId(app.id);
    setFormPatientId(app.patientId);
    setFormDate(app.date);
    setFormTime(app.time);
    setFormBox(app.box || "Sillón 1");
    setFormTreatment(app.treatment);
    setFormStatus(app.status);
    setShowForm(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPatientId || !formDate || !formTime || !formTreatment) return;

    const matchedPatient = patients.find(p => p.id === formPatientId);
    if (!matchedPatient) return;

    if (editingId) {
      // Correct optimization: use onUpdateAppointment callback to save state properly
      const updatedApp: Appointment = {
        id: editingId,
        patientId: formPatientId,
        patientName: matchedPatient.name,
        date: formDate,
        time: formTime,
        treatment: formTreatment,
        status: formStatus,
        box: formBox
      };

      if (onUpdateAppointment) {
        onUpdateAppointment(updatedApp);
      } else {
        // Fallback for older interface compatibility
        onDeleteAppointment(editingId);
        onAddAppointment(updatedApp);
      }
    } else {
      // Add new appointment with unique ID
      const newApp: Appointment = {
        id: `app-${Date.now()}`,
        patientId: formPatientId,
        patientName: matchedPatient.name,
        date: formDate,
        time: formTime,
        treatment: formTreatment,
        status: formStatus,
        box: formBox
      };
      onAddAppointment(newApp);
    }

    // Reset and close
    setShowForm(false);
    setEditingId(null);
    setFormTreatment("");
  };

  // Safe WhatsApp Link Generator
  const handleSendWhatsApp = (app: Appointment) => {
    const matchedPatient = patients.find(p => p.id === app.patientId);
    if (!matchedPatient || !matchedPatient.phone) return;

    // Clean phone number
    const tel = matchedPatient.phone.replace(/[\s+()-]/g, "");
    const formattedDate = new Date(app.date + "T00:00:00").toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });

    const msg = `Hola ${matchedPatient.name}, te recordamos tu cita odontológica para el día *${formattedDate}* a las *${app.time} hrs*.\n\n📍 *Tratamiento:* ${app.treatment}\n\nPor favor, responde a este mensaje para confirmar tu asistencia. ¡Que tengas un excelente día!`;
    const url = `https://wa.me/${tel}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  // Filter appointments for active date and filters
  const dateAppointments = appointments.filter(app => app.date === selectedDate);
  const filteredAppointments = dateAppointments.filter(app => {
    const matchesSearch = app.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.treatment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => a.time.localeCompare(b.time));

  // Daily statistics metrics
  const totalCount = dateAppointments.length;
  const pendingCount = dateAppointments.filter(a => a.status === "Pending").length;
  const confirmedCount = dateAppointments.filter(a => a.status === "Confirmed").length;
  const completedCount = dateAppointments.filter(a => a.status === "Completed").length;

  return (
    <div className="relative w-full h-full flex flex-col gap-6" id="agenda-clinical-panel">
      {/* Visual background ambient glow matching cosmic slate */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/5 dark:bg-teal-400/3 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-400/3 rounded-full blur-[120px] pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
            <h2 className="text-2xl font-display font-black tracking-tight text-slate-800 dark:text-teal-400">
              Agenda Quirúrgica y Clínica
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gestión y confirmación de citas odontológicas en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar cita o tratamiento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 text-xs font-medium rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md outline-none dark:text-white transition-all focus:border-teal-500/50"
            />
          </div>

          <button
            onClick={() => handleOpenAddForm()}
            className="px-4 py-2 text-xs font-bold leading-none text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-teal-500/20 hover:scale-[1.02] border-0 transition-all duration-200 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar Cita
          </button>
        </div>
      </div>

      {/* QUICK STATUS TICKER & KPI STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0 relative z-10">
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Registradas</span>
            <span className="text-xl font-black text-slate-800 dark:text-white mt-1 block leading-none">{totalCount} citas</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-500">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Por Confirmar</span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1 block leading-none">{pendingCount} pendientes</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-4 h-4 animate-bounce" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Confirmadas</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block leading-none">{confirmedCount} citas</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Check className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Atendidas</span>
            <span className="text-xl font-black text-teal-600 dark:text-teal-400 mt-1 block leading-none">{completedCount} listas</span>
          </div>
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* CORE MASTER DETAILS LAYOUT (2 COLUMNS) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 relative z-10">
        
        {/* LEFT COLUMN: DATE SELECTORS, QUICK FILTERS AND CREATE FORM */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* INTERACTIVE WEEK & CALENDAR STRIP */}
          <div className="p-4 rounded-2.5xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 dark:text-teal-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-500" />
                Fecha Operativa
              </span>
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setFormDate(e.target.value);
                }}
                className="text-xs font-bold leading-none p-2 bg-slate-100 dark:bg-slate-800 rounded-lg outline-none border-0 dark:text-white"
              />
            </div>

            {/* Quick Interactive Selector */}
            <div className="grid grid-cols-6 gap-1 bg-slate-100/50 dark:bg-slate-950/40 p-1 rounded-xl">
              {WEEK_DAYS.map((day) => {
                const isActive = selectedDate === day.value;
                return (
                  <button
                    key={day.value}
                    onClick={() => {
                      setSelectedDate(day.value);
                      setFormDate(day.value);
                    }}
                    className={`py-2 px-1.5 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer border-0 outline-none ${
                      isActive 
                        ? "bg-teal-600 text-white shadow-md shadow-teal-500/10" 
                        : "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <span className="text-[9px] font-semibold uppercase">{day.label}</span>
                    <span className="text-sm font-black mt-0.5">{day.dayNum}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STATUS FILTERS CARD */}
          <div className="p-4 rounded-2.5xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-2 shrink-0">
            <span className="text-xs font-black text-slate-800 dark:text-teal-400 uppercase tracking-widest flex items-center gap-2 mb-1">
              <Filter className="w-4 h-4 text-teal-500" />
              Filtrar por Estado
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { value: "All", label: "Todos" },
                { value: "Pending", label: "Pendientes" },
                { value: "Confirmed", label: "Confirmados" },
                { value: "Completed", label: "Atendidos" }
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value as any)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border cursor-pointer transition-colors ${
                    statusFilter === f.value
                      ? "bg-teal-500/10 dark:bg-teal-500/20 border-teal-500/40 text-teal-600 dark:text-teal-400"
                      : "bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800/50 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* DR`S CLINIC METRICS CARD */}
          <div className="p-5 rounded-2.5xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-3">
            <span className="text-xs font-black text-slate-800 dark:text-teal-400 uppercase tracking-widest flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-teal-500" />
              Eficiencia de Agenda
            </span>
            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Citas Completadas:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {completedCount} / {totalCount}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800/60 rounded-full overflow-hidden shrink-0">
                <div 
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                />
              </div>
              <p className="text-[10.5px] leading-relaxed text-slate-400 dark:text-slate-500 font-light">
                * Registrar el egreso del paciente al completar su atención nutre de forma inteligente el redactor de notas evolutivas SOAP de Dentito.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MAIN TIMELINE LIST PLANNED WITH DUAL-VIEW */}
        <div className="lg:col-span-8 flex flex-col min-h-0 bg-white/70 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/50 rounded-2.5xl backdrop-blur-md overflow-hidden">
          
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20 flex items-center justify-between shrink-0">
            <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              Pacientes Citados ({filteredAppointments.length} Programados)
            </span>
            
            <div className="flex items-center gap-3">
              {/* Dual View Tab selector */}
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 ring-1 ring-slate-200/50 dark:ring-slate-850 p-1 rounded-xl shrink-0">
                <button
                  onClick={() => setAgendaView("list")}
                  className={`text-[9px] uppercase tracking-wide font-black px-2.5 py-1.5 rounded-lg transition-all cursor-pointer border-0 ${
                    agendaView === "list"
                      ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs"
                      : "text-slate-400 hover:text-slate-650 bg-transparent"
                  }`}
                >
                  Lista
                </button>
                <button
                  onClick={() => setAgendaView("grid")}
                  className={`text-[9px] uppercase tracking-wide font-black px-2.5 py-1.5 rounded-lg transition-all cursor-pointer border-0 ${
                    agendaView === "grid"
                      ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs"
                      : "text-slate-400 hover:text-slate-650 bg-transparent"
                  }`}
                >
                  Horarios
                </button>
              </div>

              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-teal-500/10 dark:bg-teal-500/5 text-teal-600 dark:text-teal-400 px-3 py-1.5 rounded-xl border border-teal-500/10 hidden sm:inline-block">
                Citas del {new Date(selectedDate + "T00:00:00").toLocaleDateString("es-ES", { day: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <AnimatePresence mode="popLayout">
              {agendaView === "list" ? (
                filteredAppointments.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400"
                  >
                    <CoffeeAndSmile />
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No hay citas asignadas</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mx-auto">
                      {searchQuery || statusFilter !== "All" 
                        ? "Prueba cambiando los criterios de filtro o limpia la búsqueda."
                        : `No se han agendado tratamientos clínicos para el día ${selectedDate}.`
                      }
                    </p>
                    {!showForm && !searchQuery && (
                      <button
                        onClick={() => handleOpenAddForm()}
                        className="mt-4 px-4 py-2 bg-teal-600 text-white font-bold text-xs rounded-xl cursor-pointer border-0 flex items-center gap-2 mx-auto shadow-md"
                      >
                        <Plus className="w-3.5 h-3.5" /> Registrar Primera Cita
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    {filteredAppointments.map((app) => {
                      const matchedPatient = patients.find(p => p.id === app.patientId);
                      
                      return (
                        <motion.div
                          key={app.id}
                          layoutId={`card-${app.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`p-4 rounded-2xl border transition-all relative flex flex-col md:flex-row md:items-center justify-between gap-4 group ${
                            app.status === "Confirmed"
                              ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30 shadow-[0_4px_20px_rgba(16,185,129,0.02)]"
                              : app.status === "Completed"
                              ? "bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/80 opacity-70"
                              : app.status === "Cancelled"
                              ? "bg-red-500/5 dark:bg-red-500/10 border-red-500/30"
                              : "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30 shadow-[0_4px_20px_rgba(245,158,11,0.02)]"
                          }`}
                        >
                          {/* Status Accent Left Bar */}
                          <div className={`absolute top-0 left-0 w-1 rounded-l-full h-full ${
                            app.status === "Confirmed" 
                              ? "bg-emerald-500" 
                              : app.status === "Completed" 
                              ? "bg-slate-400" 
                              : app.status === "Cancelled"
                              ? "bg-red-500"
                              : "bg-amber-500"
                          }`} />

                          {/* LEFT AREA: TIME, PATIENT DETAILS, CLINICAL CARE */}
                          <div className="pl-2 flex items-start gap-4">
                            {/* Chrono Slot with Clock */}
                            <div className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-xl flex flex-col items-center justify-center shadow-xs shrink-0 self-center">
                              <Clock className="w-3.5 h-3.5 text-teal-500 animate-pulse" />
                              <span className="font-mono text-xs font-black text-slate-800 dark:text-slate-100 mt-1">
                                {app.time}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-display font-black text-slate-900 dark:text-white text-sm">
                                  {app.patientName}
                                </span>
                                
                                {matchedPatient?.phone && (
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> {matchedPatient.phone}
                                  </span>
                                )}
                              </div>

                              {/* Applied Procedure Title */}
                              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium max-w-prose">
                                <span className="font-bold text-slate-400 dark:text-slate-500 mr-1 uppercase text-[9px] tracking-wider font-sans">Tratamiento:</span>
                                {app.treatment}
                              </p>
                            </div>
                          </div>

                          {/* RIGHT AREA: ACTION BUTTONS AND STATUS SELECTORS */}
                          <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                            {/* Unified Status Badge picker */}
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg ${
                                app.status === 'Confirmed' 
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                                  : app.status === 'Completed' 
                                  ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' 
                                  : app.status === 'Cancelled'
                                  ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              }`}>
                                {app.status === 'Confirmed' ? '✓ Confirmado' : app.status === 'Completed' ? 'Atendido' : app.status === 'Cancelled' ? 'Cancelado' : '● Pendiente'}
                              </span>

                              {/* Mini Toggle controllers */}
                              <div className="flex gap-1">
                                {app.status === 'Pending' && (
                                  <button
                                    onClick={() => onUpdateStatus(app.id, 'Confirmed')}
                                    className="p-1 px-1.5 bg-amber-500/10 hover:bg-emerald-500 hover:text-white text-amber-600 dark:text-amber-400 text-[10px] font-black rounded-lg transition-colors cursor-pointer border-0"
                                    title="Confirmar asistencia"
                                  >
                                    Confirmar
                                  </button>
                                )}
                                {app.status === 'Confirmed' && (
                                  <button
                                    onClick={() => onUpdateStatus(app.id, 'Completed')}
                                    className="p-1 px-1.5 bg-emerald-500 text-white hover:bg-teal-600 text-[10px] font-black rounded-lg transition-all cursor-pointer border-0"
                                    title="Terminar servicio"
                                  >
                                    Atender
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

                            {/* Options toolbox */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleSendWhatsApp(app)}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors cursor-pointer border-0 bg-transparent"
                                title="Enviar recordatorio WhatsApp"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenEditForm(app)}
                                className="p-2 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-xl transition-colors cursor-pointer border-0 bg-transparent"
                                title="Reagendar / Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDeleteAppointment(app.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors cursor-pointer border-0 bg-transparent"
                                title="Eliminar del cronograma"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )
              ) : (
                // CLINICAL DUAL-COLUMN DENTIDESK STYLE SCHEDULER
                <div className="w-full overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/10 backdrop-blur-md">
                  <div className="min-w-[840px] flex flex-col">
                    {/* Grid Columns Header */}
                    <div className="grid grid-cols-11 bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider py-3.5 px-2 items-center sticky top-0 z-25">
                      <div className="col-span-2 text-center flex items-center justify-center gap-1 font-bold">
                        <Clock className="w-3.5 h-3.5 text-teal-500" />
                        Horario
                      </div>
                      {AVAILABLE_BOXES.map((bName) => (
                        <div key={bName} className="col-span-3 text-center flex items-center justify-center gap-1.5 border-l border-slate-200/50 dark:border-slate-805/50 font-bold">
                          <span className="w-2.5 h-2.5 rounded-full bg-teal-500 dark:bg-teal-400 animate-pulse" />
                          {bName}
                        </div>
                      ))}
                    </div>

                    {/* Hourly rows scroll container */}
                    <div className="max-h-[660px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                      {COMMON_HOURS.map((hr) => {
                        return (
                          <div key={hr} className="grid grid-cols-11 items-stretch hover:bg-slate-55/40 dark:hover:bg-slate-900/10 transition-colors">
                            {/* Time Column */}
                            <div className="col-span-2 flex items-center justify-center font-mono text-xs font-black text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/30 py-4">
                              {hr} hrs
                            </div>

                            {/* Sillón Columns mapping */}
                            {AVAILABLE_BOXES.map((bName) => {
                              // Find appointment matching date, hour and box
                              const matchedApp = dateAppointments.find(
                                (app) => app.time === hr && (app.box === bName || (!app.box && bName === "Sillón 1"))
                              );

                              return (
                                <div key={bName} className="col-span-3 border-l border-slate-200/60 dark:border-slate-800/70 p-2.5 flex flex-col justify-center min-h-[82px] relative group/cell">
                                  {matchedApp ? (
                                    <div
                                      className={`p-3 rounded-2xl border relative overflow-hidden flex flex-col justify-between h-full text-left transition-all ${
                                        matchedApp.status === "Confirmed"
                                          ? "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/35 shadow-[0_2px_12px_rgba(16,185,129,0.04)]"
                                          : matchedApp.status === "Completed"
                                          ? "bg-slate-100/60 dark:bg-slate-900/40 border-slate-205 dark:border-slate-800/80 opacity-65"
                                          : matchedApp.status === "Cancelled"
                                          ? "bg-red-500/5 dark:bg-red-500/10 border-red-500/30"
                                          : "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/35 shadow-[0_2px_12px_rgba(245,158,11,0.04)]"
                                      }`}
                                    >
                                      {/* Color-coded box indicators on card edges */}
                                      <div className={`absolute top-0 left-0 w-1 h-full ${
                                        matchedApp.status === "Confirmed" 
                                          ? "bg-emerald-500" 
                                          : matchedApp.status === "Completed" 
                                          ? "bg-slate-400" 
                                          : matchedApp.status === "Cancelled"
                                          ? "bg-red-500"
                                          : "bg-amber-500"
                                      }`} />

                                      {/* Patient and details */}
                                      <div>
                                        <div className="pl-1 text-xs font-black text-slate-800 dark:text-slate-100 leading-tight truncate">
                                          {matchedApp.patientName}
                                        </div>
                                        <div className="pl-1 text-[10.5px] text-slate-500 dark:text-slate-400 leading-tight mt-1 line-clamp-2 font-medium">
                                          {matchedApp.treatment}
                                        </div>
                                      </div>

                                      {/* Actions toolbar */}
                                      <div className="pl-1 mt-2.5 flex items-center justify-between gap-1.5 pt-1.5 border-t border-slate-100/50 dark:border-slate-800/40">
                                        <span className={`text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                          matchedApp.status === "Confirmed"
                                            ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                                            : matchedApp.status === "Completed"
                                            ? "bg-slate-200 dark:bg-slate-800 text-slate-500"
                                            : matchedApp.status === "Cancelled"
                                            ? "bg-red-500/20 text-red-700 dark:text-red-400"
                                            : "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                                        }`}>
                                          {matchedApp.status === "Confirmed" ? "Confirmado" : matchedApp.status === "Completed" ? "Atendido" : matchedApp.status === "Cancelled" ? "Cancelado" : "Pendiente"}
                                        </span>

                                        <div className="flex items-center gap-0.5 opacity-0 group-hover/cell:opacity-100 transition-opacity">
                                          <button
                                            onClick={() => handleSendWhatsApp(matchedApp)}
                                            className="p-1 text-emerald-600 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors border-0 bg-transparent cursor-pointer"
                                            title="Recordatorio WhatsApp"
                                          >
                                            <MessageSquare className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => handleOpenEditForm(matchedApp)}
                                            className="p-1 text-teal-600 hover:bg-teal-100/50 dark:hover:bg-teal-950/40 rounded-lg transition-colors border-0 bg-transparent cursor-pointer"
                                            title="Editar"
                                          >
                                            <Edit className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => onDeleteAppointment(matchedApp.id)}
                                            className="p-1 text-slate-400 hover:text-red-550 hover:bg-red-100/40 rounded-lg transition-colors border-0 bg-transparent cursor-pointer"
                                            title="Eliminar"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    /* Blank slot matching chair and hour */
                                    <button
                                      onClick={() => handleOpenAddForm(hr, bName)}
                                      className="w-full h-full min-h-[48px] border border-dashed border-slate-200/60 dark:border-slate-800/80 rounded-xl hover:border-teal-500/40 hover:bg-teal-500/3 dark:hover:bg-teal-500/3 flex items-center justify-center transition-all group/btn cursor-pointer bg-transparent"
                                    >
                                      <span className="text-[9.5px] font-bold text-slate-350 dark:text-slate-650 group-hover/btn:text-teal-500 flex items-center gap-1 opacity-0 group-hover/cell:opacity-100 transition-all duration-200">
                                        <Plus className="w-3.5 h-3.5 text-teal-550" />
                                        Reservar {bName.split(" ")[1]}
                                      </span>
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick clinical footer notes */}
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/10 flex items-center justify-between shrink-0">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-500" />
              Sincronización Clínica Integrada v15 Pro
            </span>
            <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
              Copiloto Dentito listo
            </span>
          </div>

        </div>

      </div>

      {/* FLOATING OVERLAY MODAL FORM */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.form
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleFormSubmit}
              className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2.5xl shadow-2xl overflow-hidden flex flex-col shrink-0"
            >
              <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 dark:text-teal-400 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-500" />
                  {editingId ? "Reagendar / Editar Cita" : "Nueva Reserva Odontológica"}
                </span>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingId(null); }}
                  className="p-1 px-1.5 text-slate-400 hover:text-slate-650 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg border-0 cursor-pointer flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                
                {/* Slot conflict alerting warning in real-time */}
                {(() => {
                  const hourConflictApp = appointments.find(
                    (app) => app.date === formDate && app.time === formTime && (app.box === formBox || (!app.box && formBox === "Sillón 1")) && app.id !== editingId
                  );
                  if (hourConflictApp) {
                    return (
                      <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs rounded-xl flex items-start gap-2.5 leading-relaxed font-medium animate-pulse">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold block mb-0.5 uppercase tracking-wider text-[10px]">¡Conflicto de Horario en {formBox}!</strong> 
                          El paciente <span className="font-bold underline">{hourConflictApp.patientName}</span> ya se encuentra agendado en {formBox} para el horario seleccionado ({formTime} hrs - {formDate}).
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Patient Selection Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest block font-sans">Paciente</label>
                  <select
                    value={formPatientId}
                    onChange={(e) => setFormPatientId(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none dark:text-white focus:border-teal-500/50 font-medium font-sans"
                    required
                  >
                    <option value="">Seleccione Paciente...</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Date, Time & Box Input Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest block font-sans">Fecha Operadora</label>
                    <input 
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none dark:text-white font-medium font-sans"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 dark:text-slate-505 font-bold uppercase tracking-widest block font-sans">Franja Horaria</label>
                    <select
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none dark:text-white focus:border-teal-500/50 font-medium font-sans"
                    >
                      {COMMON_HOURS.map(hr => (
                        <option key={hr} value={hr}>{hr} hrs</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest block font-sans">Sillón / Box</label>
                    <select
                      value={formBox}
                      onChange={(e) => setFormBox(e.target.value)}
                      className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none dark:text-white focus:border-teal-500/50 font-medium font-sans font-semibold"
                    >
                      {AVAILABLE_BOXES.map(box => (
                        <option key={box} value={box}>{box}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest block font-sans">Estado Inicial</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as Appointment["status"])}
                    className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none dark:text-white focus:border-teal-500/50 font-medium font-sans"
                  >
                    <option value="Pending">● Pendiente por Confirmar</option>
                    <option value="Confirmed">✓ Confirmado (Listo para Box)</option>
                    <option value="Completed">Atendido / Completado</option>
                    <option value="Cancelled">Cancelado / En Espera</option>
                  </select>
                </div>

                {/* Treatment Text description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest block font-bold font-sans">Procedimiento Dental</label>
                  <input
                    type="text"
                    placeholder="Ej, Raspado radicular, Sondaje, limpieza..."
                    value={formTreatment}
                    onChange={(e) => setFormTreatment(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none dark:text-white font-semibold placeholder-slate-400 font-sans"
                    required
                  />
                  
                  {/* Presets dropdown inline */}
                  <div className="pt-1.5">
                    <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider block mb-1">Pre-cargar Plantillas Clínicas Rápidas</span>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                      {CLINICAL_PRESETS.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setFormTreatment(p)}
                          className="px-2 py-1 text-[9px] rounded-md border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-950/20 text-slate-600 dark:text-slate-400 hover:text-teal-600 hover:border-teal-500/30 transition-colors cursor-pointer"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex gap-2 justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingId(null); }}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-750 dark:text-slate-400 dark:hover:text-white bg-transparent border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black text-white bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer border-0 shadow-lg shadow-teal-500/10"
                >
                  {editingId ? "Guardar Cambios" : "Guardar Reserva"}
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const CoffeeAndSmile = () => (
  <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-full flex items-center justify-center mb-3.5 border border-slate-200/50 dark:border-slate-800/60 shadow-inner">
    <Coffee className="w-6 h-6 text-slate-400 dark:text-slate-500 animate-bounce" />
  </div>
);
