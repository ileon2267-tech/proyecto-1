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
          <h2 className="text-2xl font-display font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-teal-600" />
            Agenda y Horarios
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gestión intuitiva y confirmación de citas en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar cita..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 w-64 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none dark:text-white transition-all focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/10 shadow-sm"
            />
          </div>

          <button
            onClick={() => handleOpenAddForm()}
            className="px-5 py-2.5 text-xs font-bold leading-none text-white bg-teal-600 hover:bg-teal-700 rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nueva Cita
          </button>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm shrink-0 relative z-10">
        {/* Date Controls */}
        <div className="flex flex-1 overflow-x-auto gap-2 px-2 no-scrollbar items-center">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mr-2 px-3 py-1.5 shrink-0 border border-slate-200 dark:border-slate-700/50">
               <input 
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setFormDate(e.target.value);
                }}
                className="text-xs font-bold bg-transparent outline-none border-0 text-slate-700 dark:text-slate-300"
              />
            </div>
             {WEEK_DAYS.map((day) => {
                const isActive = selectedDate === day.value;
                return (
                  <button
                    key={day.value}
                    onClick={() => {
                      setSelectedDate(day.value);
                      setFormDate(day.value);
                    }}
                    className={`py-1.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer border-0 outline-none shrink-0 ${
                      isActive 
                        ? "bg-teal-600 text-white shadow-sm" 
                        : "bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="text-[10px] font-semibold uppercase opacity-80">{day.label}</span>
                    <span className="text-sm font-black">{day.dayNum}</span>
                  </button>
                );
              })}
        </div>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

        {/* Filters */}
        <div className="flex items-center gap-1.5 px-2 overflow-x-auto no-scrollbar">
              {[
                { value: "All", label: `Todas (${totalCount})` },
                { value: "Pending", label: `Ptes (${pendingCount})` },
                { value: "Confirmed", label: `Conf (${confirmedCount})` },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value as any)}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border cursor-pointer transition-colors whitespace-nowrap ${
                    statusFilter === f.value
                      ? "bg-teal-50 dark:bg-teal-500/10 border-teal-500/30 text-teal-700 dark:text-teal-400 shadow-sm"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  {f.label}
                </button>
              ))}
        </div>

        {/* View Toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setAgendaView("list")}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer border-0 ${
                agendaView === "list" ? "bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm font-bold" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium bg-transparent"
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setAgendaView("grid")}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer border-0 ${
                agendaView === "grid" ? "bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm font-bold" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium bg-transparent"
              }`}
            >
              Malla
            </button>
        </div>
      </div>

      {/* CORE MASTER DETAILS LAYOUT (1 COLUMN FULL WIDTH) */}
      <div className="flex-1 bg-white/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 rounded-2.5xl flex flex-col min-h-0 relative z-10 overflow-hidden shadow-sm">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar">
            <AnimatePresence mode="popLayout">
              {agendaView === "list" ? (
                filteredAppointments.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 text-slate-400"
                  >
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                       <Calendar className="w-8 h-8 text-teal-500" />
                    </div>
                    <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">Día despejado</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-2 mx-auto">
                      {searchQuery || statusFilter !== "All" 
                        ? "No hay citas que coincidan con tu búsqueda."
                        : `No hay citas agendadas para ${selectedDate}.`
                      }
                    </p>
                    {!showForm && !searchQuery && (
                      <button
                        onClick={() => handleOpenAddForm()}
                        className="mt-6 px-5 py-2.5 bg-teal-600 text-white font-bold text-sm rounded-xl cursor-pointer border-0 flex items-center gap-2 shadow-md hover:bg-teal-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Registrar Cita
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {filteredAppointments.map((app) => {
                      const matchedPatient = patients.find(p => p.id === app.patientId);
                      
                      return (
                        <motion.div
                          key={app.id}
                          layoutId={`card-${app.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`p-4 rounded-2xl border transition-all relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                            app.status === "Confirmed"
                              ? "bg-white dark:bg-slate-800/80 border-emerald-500/30"
                              : app.status === "Completed"
                              ? "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800/80 opacity-70"
                              : app.status === "Cancelled"
                              ? "bg-white dark:bg-slate-800/80 border-red-500/30"
                              : "bg-white dark:bg-slate-800/80 border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/5"
                          }`}
                        >
                          {/* Color bar indicator */}
                          <div className={`absolute top-0 left-0 w-1.5 h-full rounded-l-2xl ${
                            app.status === "Confirmed" ? "bg-emerald-500" :
                            app.status === "Completed" ? "bg-slate-400" :
                            app.status === "Cancelled" ? "bg-red-500" : "bg-amber-500"
                          }`} />

                          {/* LEFT AREA: TIME & PATIENT */}
                          <div className="pl-3 flex items-start gap-4 flex-1">
                            {/* Chrono Slot with Clock */}
                            <div className="px-3 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center shrink-0">
                               <span className="font-mono text-sm font-black text-slate-800 dark:text-slate-100">
                                {app.time}
                               </span>
                               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{app.box || "Sillón 1"}</span>
                            </div>

                            <div className="space-y-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                <span className="font-bold text-slate-900 dark:text-white text-base leading-none">
                                  {app.patientName}
                                </span>
                                {matchedPatient?.phone && (
                                  <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1 w-fit">
                                    <Phone className="w-3 h-3" /> {matchedPatient.phone}
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                                <span className="font-bold text-slate-400 dark:text-slate-500 mr-1 uppercase text-[10px] tracking-wider">Tx:</span>
                                {app.treatment}
                              </p>
                            </div>
                          </div>

                          {/* RIGHT AREA: ACTION BUTTONS AND STATUS */}
                          <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                            <div className="flex items-center gap-1.5">
                              {app.status === 'Pending' && (
                                <button
                                  onClick={() => onUpdateStatus(app.id, 'Confirmed')}
                                  className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-700 dark:text-emerald-400 text-[11px] font-bold rounded-lg transition-colors cursor-pointer border-0"
                                >
                                  ✔ Confirmar
                                </button>
                              )}
                              {app.status === 'Confirmed' && (
                                <button
                                  onClick={() => onUpdateStatus(app.id, 'Completed')}
                                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold rounded-lg transition-all cursor-pointer border-0 shadow-sm"
                                >
                                  Atender
                                </button>
                              )}
                            </div>

                            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

                            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                              <button
                                onClick={() => handleSendWhatsApp(app)}
                                className="p-2 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-slate-700 transition-colors cursor-pointer border-0 bg-transparent flex items-center justify-center border-r border-slate-200 dark:border-slate-700"
                                title="Enviar WhatsApp"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenEditForm(app)}
                                className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer border-0 bg-transparent flex items-center justify-center border-r border-slate-200 dark:border-slate-700"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDeleteAppointment(app.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors cursor-pointer border-0 bg-transparent flex items-center justify-center"
                                title="Eliminar"
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
                /* Malla Horaria (Grid) */
                <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="min-w-[800px] overflow-x-auto">
                    {/* Headers */}
                    <div className="grid grid-cols-10 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 uppercase tracking-wider items-center sticky top-0 z-20">
                      <div className="col-span-1 text-center py-3">Hora</div>
                      {AVAILABLE_BOXES.map((bName) => (
                        <div key={bName} className="col-span-3 text-center border-l border-slate-200 dark:border-slate-700 py-3 relative">
                           {bName}
                        </div>
                      ))}
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {COMMON_HOURS.map((hr) => {
                        return (
                          <div key={hr} className="grid grid-cols-10 group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            {/* Time */}
                            <div className="col-span-1 flex flex-col items-center justify-center font-mono text-xs font-semibold text-slate-500 bg-slate-50/30 dark:bg-slate-900/50 py-3">
                              <span>{hr}</span>
                            </div>

                            {/* Sillón Slots */}
                            {AVAILABLE_BOXES.map((bName) => {
                              const matchedApp = dateAppointments.find(
                                (app) => app.time === hr && (app.box === bName || (!app.box && bName === "Sillón 1"))
                              );

                              return (
                                <div key={bName} className="col-span-3 border-l border-slate-100 dark:border-slate-800 p-2 relative min-h-[70px]">
                                  {matchedApp ? (
                                    <div
                                      onClick={() => handleOpenEditForm(matchedApp)}
                                      className={`h-full p-2.5 rounded-xl border relative cursor-pointer flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-all ${
                                        matchedApp.status === "Confirmed" ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" :
                                        matchedApp.status === "Completed" ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-70" :
                                        matchedApp.status === "Cancelled" ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" :
                                        "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                                      }`}
                                    >
                                      <div className={`absolute left-0 top-0 w-1 h-full ${
                                        matchedApp.status === "Confirmed" ? "bg-emerald-500" :
                                        matchedApp.status === "Completed" ? "bg-slate-400" :
                                        matchedApp.status === "Cancelled" ? "bg-red-500" : "bg-amber-500"
                                      }`} />
                                      <div className="pl-2">
                                        <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate pr-4">{matchedApp.patientName}</div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{matchedApp.treatment}</div>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleOpenAddForm(hr, bName)}
                                      className="w-full h-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-700 cursor-pointer text-xs font-semibold"
                                    >
                                      + Agendar
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
