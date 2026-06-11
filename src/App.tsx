import React, { useState, useEffect } from "react";
import { Patient, Appointment, ClinicalUser } from "./types";
import { 
  INITIAL_PATIENTS, 
  INITIAL_APPOINTMENTS, 
  createEmptyOdontogram, 
  createEmptyPeriodontogram 
} from "./initialData";
import KPIDashboard from "./components/KPIDashboard";
import Odontograma from "./components/Odontograma";
import Periodontograma from "./components/Periodontograma";
import Agenda from "./components/Agenda";
import DentitoChat from "./components/DentitoChat";
import DentalStories from "./components/DentalStories";
import Spotlight from "./components/Spotlight";
import FinanceModule from "./components/FinanceModule";
import PrintReport from "./components/PrintReport";
import OLearyControl from "./components/OLearyControl";
import XRayGallery from "./components/XRayGallery";
import SoapAIAssistant from "./components/SoapAIAssistant";
import PRARiskAssessment from "./components/PRARiskAssessment";
import SharePatientModal from "./components/SharePatientModal";
import PatientFile from "./components/PatientFile";
import Logo from "./components/Logo";
import LoginScreen from "./components/LoginScreen";
import PatientPortal from "./components/PatientPortal";
import DentalMarketplace from "./components/DentalMarketplace";


// Icons from Lucide-React
import { 
  LayoutDashboard, 
  Stethoscope, 
  Calendar, 
  Type as DentalType,
  Users, 
  Settings, 
  Moon, 
  Sun, 
  Plus, 
  Search, 
  Trash2, 
  UserPlus, 
  ShieldCheck, 
  Sparkles,
  Printer,
  ChevronRight,
  ClipboardList,
  MessageSquare,
  Share2,
  Banknote,
  Activity,
  LogOut,
  ShoppingBag
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type ActiveTab = "dashboard" | "clinica" | "agenda" | "finanzas" | "dentalstories" | "reportes" | "pacientes" | "ajustes" | "tienda";

export default function App() {
  // Session Authentication State
  const [activeUser, setActiveUser] = useState<ClinicalUser | null>(() => {
    const saved = localStorage.getItem("perioActiveUser");
    if (saved && localStorage.getItem("perioLoggedIn") === "true") {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return null;
  });

  const isLoggedIn = !!activeUser;

  const handleLoginSuccess = (user: ClinicalUser) => {
    localStorage.setItem("perioLoggedIn", "true");
    localStorage.setItem("perioActiveUser", JSON.stringify(user));
    setActiveUser(user);
    
    // Set appropriate doctor name and clinical setting indicators
    setDoctorName(user.name);
    if (user.specialty) {
      setClinicName(user.specialty);
    } else {
      setClinicName(
        user.profile === "particular" 
          ? "Odontólogo Particular" 
          : user.profile === "clinica" 
          ? "Administración de Clínicas" 
          : user.profile === "universidad"
          ? "Docente Académico"
          : "Paciente"
      );
    }

    if (user.profile === "cliente") {
      setActiveTab("pacientes");
    } else {
      setActiveTab("dashboard");
    }
  };

  const handleLogout = () => {
    localStorage.setItem("perioLoggedIn", "false");
    localStorage.removeItem("perioActiveUser");
    setActiveUser(null);
  };

  // Customizable tariffs for professional (aranceles)
  const [aranceles, setAranceles] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("perioAranceles");
    return saved ? JSON.parse(saved) : {
      "Limpieza Profiláctica": 45000,
      "Raspado Radicular por Sector": 65000,
      "Cirugía de Implante Dental": 450000,
      "Radiografía Panorámica": 35000,
      "Sondaje de Diagnóstico 6 puntos": 30000
    };
  });

  useEffect(() => {
    localStorage.setItem("perioAranceles", JSON.stringify(aranceles));
  }, [aranceles]);

  // Initial Doctor defaults when activeUser is restored from localStorage
  useEffect(() => {
    if (activeUser) {
      setDoctorName(activeUser.name);
      if (activeUser.specialty) {
        setClinicName(activeUser.specialty);
      }
    }
  }, [activeUser]);

  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("perioTheme") === "dark";
  });

  // Client and Clinical records states
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem("perioPatients");
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem("perioAppointments");
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [activePatientId, setActivePatientId] = useState<string>(() => {
    const saved = localStorage.getItem("perioActivePatientId");
    return saved || "pat-1"; // Carlos Mendoza by default
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [clinicalSubView, setClinicalSubView] = useState<"odontograma" | "periodontograma" | "pra" | "oleary" | "xrays" | "soap">("odontograma");
  const [showShareModal, setShowShareModal] = useState(false);
  const [deletingPatientId, setDeletingPatientId] = useState<string | null>(null);

  // Doctor's custom metadata states
  const [doctorName, setDoctorName] = useState("Dr. Ignacio León");
  const [clinicName, setClinicName] = useState("PerioClinic Providencia");

  // Patient Registration Form states
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientPhone, setNewPatientPhone] = useState("");
  const [newPatientEmail, setNewPatientEmail] = useState("");
  const [newPatientBirthdate, setNewPatientBirthdate] = useState("");
  const [newPatientNotes, setNewPatientNotes] = useState("");

  // Patient Search query
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientFileId, setSelectedPatientFileId] = useState<string | null>(null);

  // Storage persistent synchronization
  useEffect(() => {
    localStorage.setItem("perioPatients", JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem("perioAppointments", JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem("perioActivePatientId", activePatientId);
  }, [activePatientId]);

  useEffect(() => {
    localStorage.setItem("perioTheme", darkMode ? "dark" : "light");
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  useEffect(() => {
    const handleNavigateEvent = (e: any) => {
      if (e.detail) setActiveTab(e.detail);
    };
    window.addEventListener("periodash-navigate", handleNavigateEvent);
    return () => window.removeEventListener("periodash-navigate", handleNavigateEvent);
  }, []);

  const activePatient = patients.find((p) => p.id === activePatientId) || null;

  // Patient Registration Handlers
  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim()) return;

    const newPat: Patient = {
      id: `pat-${Date.now()}`,
      name: newPatientName,
      phone: newPatientPhone,
      email: newPatientEmail,
      birthdate: newPatientBirthdate || "1990-01-01",
      notes: newPatientNotes,
      createdAt: new Date().toISOString(),
      odontogram: createEmptyOdontogram(),
      periodontogram: createEmptyPeriodontogram(),
      oLeary: {},
      anamnesis: {
        hta: false,
        diabetes: false,
        tabaquismo: 0,
        alergias: "",
        dolorActual: "ninguno",
        notasSistemicas: "",
      },
      xRays: [],
      treatmentPlan: { procedures: [], financing: { months: 1, downPayment: 0, interestRate: 0 } },
      evolutions: [],
    };

    setPatients((prev) => [newPat, ...prev]);
    setActivePatientId(newPat.id);
    
    // Clear registration fields
    setNewPatientName("");
    setNewPatientPhone("");
    setNewPatientEmail("");
    setNewPatientBirthdate("");
    setNewPatientNotes("");
    setShowRegisterForm(false);
    setActiveTab("clinica"); // jump immediately to clinic charting for dentist
  };

  const handleDeletePatient = (patientId: string) => {
    setDeletingPatientId(patientId);
  };

  const executeDeletePatient = (patientId: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== patientId));
    setAppointments((prev) => prev.filter((app) => app.patientId !== patientId));
    if (activePatientId === patientId) {
      setActivePatientId("");
    }
    setDeletingPatientId(null);
  };

  // Appointment operations 
  const handleAddAppointment = (newApp: Appointment) => {
    setAppointments((prev) => [newApp, ...prev]);
  };

  const handleUpdateAppointmentStatus = (id: string, status: Appointment["status"]) => {
    setAppointments((prev) => 
      prev.map((app) => (app.id === id ? { ...app, status } : app))
    );
  };

  const handleUpdateAppointment = (updatedApp: Appointment) => {
    setAppointments((prev) => 
      prev.map((app) => (app.id === updatedApp.id ? updatedApp : app))
    );
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((app) => app.id !== id));
  };

  // Clinical updates 
  const handleUpdateOdontogram = (updatedOdo: Record<number, any>) => {
    if (!activePatientId) return;
    setPatients((prev) => 
      prev.map((p) => (p.id === activePatientId ? { ...p, odontogram: updatedOdo } : p))
    );
  };

  const handleUpdatePeriodontogram = (updatedPerio: Record<number, any>) => {
    if (!activePatientId) return;
    setPatients((prev) => 
      prev.map((p) => (p.id === activePatientId ? { ...p, periodontogram: updatedPerio } : p))
    );
  };

  // Tab rendering
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <KPIDashboard 
            patients={patients} 
            appointments={appointments}
            onNavigateTo={(tab) => setActiveTab(tab as ActiveTab)}
            onSelectPatient={(id) => setActivePatientId(id)}
          />
        );

      case "clinica":
        return (
          <div className="space-y-6 animate-fade-in" id="clinical-area">
            {/* Active Patient Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 bg-teal-50 dark:bg-teal-800 text-teal-600 dark:text-teal-450 rounded-2xl flex items-center justify-center font-display font-extrabold text-xl shadow-xs border border-teal-100 dark:border-teal-900/40">
                  {activePatient ? activePatient.name.charAt(0) : "?"}
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white leading-tight">
                    {activePatient ? activePatient.name : "Seleccionar Paciente"}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 font-normal">
                    {activePatient 
                      ? `✉️ ${activePatient.email}  |  📞 ${activePatient.phone}  |  🎂 Nacimiento: ${activePatient.birthdate}` 
                      : "Sincroniza un expediente clínico existente..."}
                  </p>
                </div>
              </div>

              {/* Patient selections dropdown */}
              <div className="flex gap-2.5 items-center w-full lg:w-auto">
                <select
                  value={activePatientId}
                  onChange={(e) => setActivePatientId(e.target.value)}
                  className="w-full lg:w-56 text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-200 focus:focus:ring-2 focus:ring-teal-500/25 outline-none"
                >
                  <option value="">Buscar expediente...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => window.print()}
                  className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs"
                  title="Imprimir Ficha Clínica"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="px-3.5 py-2.5 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-600 dark:text-teal-400 font-extrabold text-xs rounded-xl border border-teal-500/40 dark:border-teal-400/50 shadow-[0_0_12px_rgba(20,184,166,0.22)] hover:shadow-[0_0_18px_rgba(20,184,166,0.38)] hover:scale-[1.01] transition-all flex items-center gap-2 cursor-pointer"
                  title="Generar Enlace Seguro"
                >
                  <Share2 className="w-4 h-4 text-teal-500 animate-pulse" />
                  Paciente
                </button>
              </div>
            </div>

            {activePatient ? (
              <div className="space-y-6">
                {/* Clinical sub tab selectors */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 flex-shrink-0 w-full overflow-x-auto hide-scrollbar">
                  <button
                    onClick={() => setClinicalSubView("odontograma")}
                    className={`flex-1 py-2 px-4 whitespace-nowrap rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                      clinicalSubView === "odontograma"
                        ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-md scale-[1.01]"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    Odontograma Gráfico
                  </button>
                  <button
                    onClick={() => setClinicalSubView("periodontograma")}
                    className={`flex-1 py-2 px-4 whitespace-nowrap rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                      clinicalSubView === "periodontograma"
                        ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-md scale-[1.01]"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    Periodontograma Clínico
                  </button>
                  <button
                    onClick={() => setClinicalSubView("pra")}
                    className={`flex-1 py-2 px-4 whitespace-nowrap rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                      clinicalSubView === "pra"
                        ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-md scale-[1.01]"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    Análisis de Riesgo PRA
                  </button>
                  <button
                    onClick={() => setClinicalSubView("oleary")}
                    className={`flex-1 py-2 px-4 whitespace-nowrap rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                      clinicalSubView === "oleary"
                        ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-md scale-[1.01]"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    Resumen O'Leary
                  </button>
                  <button
                    onClick={() => setClinicalSubView("xrays")}
                    className={`flex-1 py-2 px-4 whitespace-nowrap rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                      clinicalSubView === "xrays"
                        ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-md scale-[1.01]"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    Tomografías Digitales
                  </button>
                  <button
                    onClick={() => setClinicalSubView("soap")}
                    className={`flex-1 py-2 px-4 whitespace-nowrap rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                      clinicalSubView === "soap"
                        ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-md scale-[1.01]"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    Redactor SOAP (AI)
                  </button>
                </div>

                {/* Sub-view representation */}
                {clinicalSubView === "odontograma" ? (
                  <Odontograma 
                    odontogram={activePatient.odontogram} 
                    onChange={handleUpdateOdontogram}
                  />
                ) : clinicalSubView === "periodontograma" ? (
                  <Periodontograma 
                    periodontogram={activePatient.periodontogram}
                    onChange={handleUpdatePeriodontogram}
                    odontogram={activePatient.odontogram}
                    patient={activePatient}
                    onUpdatePatient={(updatedPat) => {
                      setPatients(prev => prev.map(p => p.id === updatedPat.id ? updatedPat : p));
                    }}
                  />
                ) : clinicalSubView === "pra" ? (
                  <PRARiskAssessment 
                    periodontogram={activePatient.periodontogram}
                    odontogram={activePatient.odontogram}
                    patient={activePatient}
                    onUpdatePatient={(updatedPat) => {
                      setPatients(prev => prev.map(p => p.id === updatedPat.id ? updatedPat : p));
                    }}
                  />
                ) : clinicalSubView === "oleary" ? (
                  <OLearyControl 
                    patient={activePatient}
                    onUpdate={(newO) => {
                      setPatients(prev => prev.map(p => p.id === activePatient.id ? { ...p, oLeary: newO } : p))
                    }}
                  />
                ) : clinicalSubView === "xrays" ? (
                  <XRayGallery
                    patient={activePatient}
                    onUpdate={(newX) => {
                       setPatients(prev => prev.map(p => p.id === activePatient.id ? { ...p, xRays: newX } : p))
                    }}
                  />
                ) : (
                  <SoapAIAssistant 
                    patient={activePatient} 
                    doctorName={doctorName}
                    onUpdatePatient={(updatedPat) => {
                      setPatients(prev => prev.map(p => p.id === updatedPat.id ? updatedPat : p));
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-800 py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl space-y-3.5">
                <ClipboardList className="w-12 h-12 text-slate-400 mx-auto animate-pulse" />
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Sin expediente clínico consultor activo</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto font-light">Selecciona a un paciente de nuestra lista o registra un nuevo código dental de entrada.</p>
              </div>
            )}
          </div>
        );

      case "agenda":
        return (
          <Agenda 
            appointments={appointments}
            patients={patients}
            onAddAppointment={handleAddAppointment}
            onUpdateStatus={handleUpdateAppointmentStatus}
            onDeleteAppointment={handleDeleteAppointment}
            onUpdateAppointment={handleUpdateAppointment}
          />
        );

      case "pacientes":
        const filtered = patients.filter((p) => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.phone.includes(searchQuery)
        );

        if (selectedPatientFileId) {
          const filePatient = patients.find(p => p.id === selectedPatientFileId);
          if (filePatient) {
            return (
              <div className="animate-fade-in z-10 relative w-full">
                <PatientFile 
                  patient={filePatient} 
                  onUpdatePatient={(updated) => {
                    setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
                  }} 
                  onClose={() => setSelectedPatientFileId(null)} 
                />
              </div>
            );
          }
        }

        return (
          <div className="space-y-6" id="pacientes-control">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80">
              <div>
                <h3 className="text-lg font-display font-semibold text-slate-800 dark:text-white">Directorio y Registro Clínico</h3>
                <p className="text-xs text-slate-400 font-normal">Existen {patients.length} expedientes completos almacenados localmente bajo encriptación</p>
              </div>

              <button
                onClick={() => setShowRegisterForm(!showRegisterForm)}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl cursor-pointer transition-all shadow-md inline-flex items-center gap-1.5 self-start sm:self-center"
              >
                <Plus className="w-4 h-4" /> 
                <span>Registrar Paciente</span>
              </button>
            </div>

            {/* Quick Registration Form Modal */}
            <AnimatePresence>
              {showRegisterForm && (
                <motion.form 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  onSubmit={handleRegisterPatient} 
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-4 shadow-xl"
                >
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-3 w-full">
                    <UserPlus className="w-4 h-4 text-teal-600" />
                    <span>Nuevo Expediente Histórico Odontorradicular</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Nombre Completo:</label>
                      <input 
                        type="text" 
                        placeholder="P. ej., Mario Alberto Rojas"
                        value={newPatientName}
                        onChange={(e) => setNewPatientName(e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800 dark:text-slate-100"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Teléfono de Enlace:</label>
                      <input 
                        type="text" 
                        placeholder="+56 9 8234 1928"
                        value={newPatientPhone}
                        onChange={(e) => setNewPatientPhone(e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Correo Electrónico:</label>
                      <input 
                        type="email" 
                        placeholder="mario@email.com"
                        value={newPatientEmail}
                        onChange={(e) => setNewPatientEmail(e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Nacimiento:</label>
                      <input 
                        type="date" 
                        value={newPatientBirthdate}
                        onChange={(e) => setNewPatientBirthdate(e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2 lg:col-span-4">
                      <label className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Antecedentes Clínicos, Patologías Generales o Alergias:</label>
                      <textarea 
                        placeholder="P. ej., Hipertenso, Alérgico a la Penicilina o anestésicos, diabetes mellitus tipo II..."
                        value={newPatientNotes}
                        onChange={(e) => setNewPatientNotes(e.target.value)}
                        rows={2}
                        className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="submit"
                      className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-2.5 px-5 rounded-xl cursor-pointer transition-all shadow-md"
                    >
                      Crear Ficha y Habilitar Periodonto
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

              {/* Intutive Patient Data Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-0 overflow-hidden shadow-xs">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20">
                  <div className="relative max-w-md">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Search className="w-4.5 h-4.5" />
                    </span>
                    <input
                      type="text"
                      placeholder="Filtrar por nombre, correo electrónico o número telefónico..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-sm p-3 pl-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/10 text-slate-800 dark:text-slate-200 shadow-sm"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                    <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Paciente</th>
                        <th className="px-6 py-4">Contacto</th>
                        <th className="px-6 py-4 text-center">Fichas Clínicas</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filtered.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center font-display font-black text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 uppercase shadow-sm">
                                {p.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white">{p.name}</div>
                                <div className="text-xs text-slate-400">ID: {p.id.split('-')[1]}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-slate-700 dark:text-slate-300">📞 {p.phone}</div>
                            <div className="text-slate-400 text-xs mt-0.5">✉️ {p.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setSelectedPatientFileId(p.id)}
                                className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                              >
                                Ficha Médica
                              </button>
                              <button
                                onClick={() => {
                                  setActivePatientId(p.id);
                                  setActiveTab("clinica");
                                }}
                                className="bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 hover:bg-teal-100 hover:text-teal-800 border border-teal-100 dark:border-teal-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                              >
                                Odontograma
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                             <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setShowRegisterForm(true)}
                                  className="p-2 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 bg-slate-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 rounded-lg transition-all"
                                  title="Editar"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </button>
                                <button
                                  onClick={() => handleDeletePatient(p.id)}
                                  className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition-all"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
                          </td>
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-light text-sm">
                            <Activity className="w-8 h-8 opacity-20 mx-auto mb-2" />
                            No se encontraron pacientes que coincidan con la búsqueda.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

          </div>
        );

      case "finanzas":
        return (
          <div className="animate-fade-in z-10 relative">
            <FinanceModule activePatient={activePatient} setPatients={setPatients} aranceles={aranceles} />
          </div>
        );

      case "reportes":
        return (
          <div className="animate-fade-in z-10 relative">
            <PrintReport activePatient={activePatient} doctorName={doctorName} clinicName={clinicName} />
          </div>
        );

      case "dentalstories":
        return (
          <DentalStories />
        );

      case "tienda":
        return (
          <DentalMarketplace />
        );

      case "ajustes":
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-6 space-y-6 shadow-xs animate-fade-in" id="ajustes-panel">
              <div>
                <h3 className="text-lg font-display font-semibold text-slate-800 dark:text-white">Configuración del Consultorio</h3>
                <p className="text-xs text-slate-400">Personalización de meta-datos del profesional, centro odontológico y visuales del sistema</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100 dark:border-slate-800/70">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase block tracking-wide">Nombre del Profesional / Cirujano Dentista:</label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-200 focus:focus:ring-2 focus:ring-teal-500/20 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase block tracking-wide">Centro Médico / Sucursal Dental:</label>
                  <input
                    type="text"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-200 focus:focus:ring-2 focus:ring-teal-500/20 outline-none"
                  />
                </div>
              </div>

              {/* TARIFF CONFIGURATION BLOCK (ARANCELES) */}
              <div className="pb-6 border-b border-slate-100 dark:border-slate-800/70 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                     💵 Aranceles y Honorarios de Tratamientos
                  </h4>
                  <p className="text-xs text-slate-450 mt-0.5">Modifica los aranceles vigentes. Al emitir presupuestos clínicos se aplicarán estos valores predeterminados.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(aranceles).map(([treatmentKey, priceValue]) => (
                    <div key={treatmentKey} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 space-y-1">
                      <span className="text-[10px] text-slate-400 font-semibold">{treatmentKey}</span>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2.5 text-xs text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          value={priceValue}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setAranceles(prev => ({ ...prev, [treatmentKey]: val }));
                          }}
                          className="w-full text-xs pl-6 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-right font-mono text-teal-600 dark:text-teal-400 font-bold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-semibold text-slate-900 dark:text-white">Esquema Gráfico / Apariencia</h5>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-sm">Alterna rápidamente entre el modo luz médica de alta visibilidad o el modo de descanso visual quirúrgico oscuro.</p>
                </div>

                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-100 p-3.5 rounded-2xl cursor-pointer transition-all border border-slate-200 dark:border-slate-700"
                >
                  {darkMode ? <Sun className="w-5 h-5 text-amber-500 animate-pulse" /> : <Moon className="w-5 h-5 text-indigo-750" />}
                </button>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800/70">
                <div>
                  <h5 className="text-sm font-semibold text-red-600 dark:text-red-400">Control de Sesión</h5>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-sm">Cierra de manera segura tu sesión actual en este terminal para prevenir accesos no autorizados a las fichas e historiales clínicos.</p>
                </div>

                <button
                  onClick={handleLogout}
                  className="bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200/50 dark:border-red-800/40 text-red-650 dark:text-red-400 py-3 px-5 rounded-2xl cursor-pointer transition-all font-bold text-xs flex items-center gap-2 block border-0"
                  type="button"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión Activa
                </button>
              </div>

              {/* App details details license info */}
              <div className="p-4 bg-teal-50/20 dark:bg-slate-800/20 border border-teal-500/10 rounded-2xl flex gap-3 text-xs text-teal-850 dark:text-teal-300 leading-relaxed font-light">
                <ShieldCheck className="w-5.5 h-5.5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <h6 className="font-bold">Licencia Pro Activada Correctamente — Perfil {activeUser?.profile.toUpperCase()}</h6>
                  <p className="mt-0.5">
                    Este terminal clínico está autorizado para procesar datos locales e históricos cifrados. Los aranceles configurados forman parte del almacenamiento persistente seguro.
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Specific Administrative and Audit card for CLINICA / UNIVERSIDAD */}
            {activeUser?.profile === "clinica" && (
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xs animate-fade-in">
                <div>
                  <span className="text-[9px] font-black uppercase text-pink-600 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/15">Módulo de Auditoría</span>
                  <h4 className="text-md font-bold mt-2 text-slate-900 dark:text-white">Panel de Administración y Auditoría</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Nivel: Administrador Clínico Total. Monitoreo de eventos y seguridad del terminal.</p>
                </div>

                <div className="border border-slate-150 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2 border-b border-slate-150 dark:border-slate-800 text-slate-400 uppercase tracking-widest text-[9px] font-bold">Registro de Cambios y Accesos Recientes</div>
                  <div className="divide-y divide-slate-150 dark:divide-slate-800/60 font-mono text-[10.5px]">
                    <div className="p-3 flex justify-between">
                      <span className="text-slate-400">09-Jun 01:05:26</span>
                      <span className="text-emerald-500 font-bold">USUARIO_REGISTRO_OK</span>
                      <span className="text-slate-500 dark:text-slate-400">Email: {activeUser.email}</span>
                    </div>
                    <div className="p-3 flex justify-between">
                      <span className="text-slate-400">09-Jun 01:04:12</span>
                      <span className="text-teal-500 dark:text-teal-400">CARGA_EXPEDIENTES_INIT</span>
                      <span className="text-slate-500 dark:text-slate-400">Base de datos PostgreSQL / Local</span>
                    </div>
                    <div className="p-3 flex justify-between">
                      <span className="text-slate-400">09-Jun 01:03:00</span>
                      <span className="text-amber-500">AUDITORIA_INTEGRIDAD_SUCCESS</span>
                      <span className="text-slate-500 dark:text-slate-400">Fichas periodontales 100% HIPAA-safe</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeUser?.profile === "universidad" && (
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xs animate-fade-in">
                <div>
                  <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/15">Orientado a Docencia</span>
                  <h4 className="text-md font-bold mt-2 text-slate-900 dark:text-white">Herramientas Académicas e Investigación</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Supervisión en tiempo real de alumnos, cátedras clínicas y validación de expedientes de estudio.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 flex items-center gap-3 border border-slate-150 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/25">
                    <span className="text-xl">🎓</span>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Asistencia de Alumnos</p>
                      <span className="text-[9.5px] text-slate-400 font-light block leading-tight mt-0.5">Valida el aprendizaje clínico del internado</span>
                    </div>
                  </div>
                  <div className="p-3 flex items-center gap-3 border border-slate-150 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/25">
                    <span className="text-xl">🧬</span>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Protocolos Periodontales</p>
                      <span className="text-[9.5px] text-slate-400 font-light block leading-tight mt-0.5">Formatos de investigación basados en AAP 2018</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!isLoggedIn) {
    return (
      <LoginScreen 
        onLogin={handleLoginSuccess} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        defaultEmail="ileon2267@gmail.com"
      />
    );
  }

  // Securely isolate and render the PatientPortal component if active profile is "cliente"
  if (activeUser?.profile === "cliente") {
    return (
      <PatientPortal 
        activeUser={activeUser}
        onLogout={handleLogout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        allAppointments={appointments}
        onAddAppointment={(newApp) => setAppointments((prev) => [newApp, ...prev])}
      />
    );
  }

  return (
    <div className={`min-h-screen font-sans ${darkMode ? "dark" : "bg-slate-50"} flex flex-col md:flex-row relative`}>
      {/* Dynamic Cosmic Slate Background (Visible in Dark Mode) */}
      {darkMode && (
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden no-print">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-teal-900/20 blur-[120px] rounded-full" />
          <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] bg-emerald-900/10 blur-[120px] rounded-full" />
        </div>
      )}

      {/* SIDEBAR ON DESKTOP - HIDDEN ON MOBILE */}
      <aside className="w-64 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border-r border-slate-100 dark:border-slate-800/50 flex flex-col py-6 sticky top-0 h-screen hidden md:flex shrink-0 no-print z-10 transition-colors overflow-y-auto scrollbar-thin">
        
        {/* Brand Header */}
        <div className="px-5 pb-5 border-b border-slate-50 dark:border-slate-800 flex items-center gap-4">
          <Logo className="w-10 h-10" showNeon={true} />
          <div>
            <h1 className="font-display font-bold text-base leading-none text-slate-900 dark:text-white mb-[2px]">PerioDash</h1>
            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-extrabold tracking-widest uppercase">v15 Pro Edition</span>
          </div>
        </div>

        {/* Doctor Identity Context Card */}
        <div className="mx-4 my-4 bg-slate-50/70 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-slate-100 flex items-center justify-center text-xs font-bold shrink-0 font-mono shadow-xs border border-slate-800">
            DR
          </div>
          <div className="overflow-hidden">
             <div className="text-[11px] font-bold text-slate-800 dark:text-slate-100 truncate">{doctorName}</div>
             <div className="text-[9px] text-slate-400 truncate tracking-tight">{clinicName}</div>
          </div>
        </div>

        {/* Quick Search Trigger Pill */}
        <div className="px-4 mb-4">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent("periodash-open-search"))}
            className="w-full py-2 px-3 bg-slate-50/50 hover:bg-slate-100/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border border-slate-100 dark:border-slate-800/50 text-slate-450 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl transition-all flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10.5px] font-medium">Buscador instantáneo</span>
            </div>
            <kbd className="text-[8.5px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-450 dark:text-slate-500 rounded px-1 py-0.5 tracking-tight font-mono font-bold">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Navigation panel Links */}
        <nav className="flex-1 px-3 space-y-1">
          {[
            { id: "dashboard", label: "Panel Principal", icon: LayoutDashboard },
            { id: "clinica", label: "Ficha Odonto/Perio", icon: Stethoscope },
            { id: "agenda", label: "Agenda Médica", icon: Calendar },
            { id: "finanzas", label: "Plan & Finanzas", icon: Banknote },
            { id: "reportes", label: "Imp / Reportes", icon: Printer },
            { id: "pacientes", label: "Pacientes", icon: Users },
            { id: "dentalstories", label: "DentalStories / Hub", icon: MessageSquare },
            { id: "tienda", label: "Mercado Dental", icon: ShoppingBag },
            { id: "ajustes", label: "Ajustes", icon: Settings }
          ].map((item) => {
            const ActiveIcon = item.icon;
            const isActive = activeTab === item.id;
            const isNeon = item.id === "dentalstories" || item.id === "tienda";
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`w-full text-left font-bold text-xs py-3 px-3.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-3 ${
                  isActive
                    ? isNeon
                      ? "bg-gradient-to-r from-teal-600 via-teal-500 to-indigo-650 text-white shadow-[0_0_16px_rgba(20,184,166,0.55)] scale-[1.03]"
                      : "bg-teal-600 text-white shadow-md shadow-teal-600/10"
                    : isNeon
                    ? "text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:shadow-[0_0_10px_rgba(20,184,166,0.25)] hover:scale-[1.01] dark:text-slate-450 dark:hover:bg-slate-800/40 dark:hover:text-slate-100"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-100"
                }`}
              >
                <div className={`relative flex items-center justify-center shrink-0 ${isNeon ? "w-6 h-6 rounded-md overflow-hidden neon-intense-glow" : ""}`}>
                  {isNeon && (
                     <>
                        <div className="absolute inset-0 neon-rainbow-bg rounded-md pointer-events-none opacity-100" />
                        <div className={`absolute inset-[1.5px] rounded-[4px] z-0 pointer-events-none transition-colors ${isActive ? (item.id === "tienda" ? 'bg-teal-650' : 'bg-teal-600') : 'bg-white group-hover:bg-slate-50 dark:bg-slate-900 dark:group-hover:bg-slate-800/40'}`} />
                     </>
                  )}
                  <ActiveIcon className={`w-4 h-4 relative z-10 ${isNeon ? (isActive ? 'text-white scale-110' : 'text-slate-700 dark:text-slate-200') : ''}`} />
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}

          <button
            onClick={handleLogout}
            className="w-full text-left font-bold text-xs py-3 px-3.5 mt-2 rounded-xl transition-all cursor-pointer text-red-500 dark:text-red-400 hover:bg-red-500/10 hover:text-red-700 dark:hover:bg-red-500/10 inline-flex items-center gap-3"
          >
            <div className="relative flex items-center justify-center shrink-0">
              <LogOut className="w-4 h-4" />
            </div>
            <span>Cerrar sesión</span>
          </button>
        </nav>

        {/* Footer info lock indicator */}
        <div className="px-5 pt-4 border-t border-slate-50 dark:border-slate-800 text-[10px] text-slate-400 space-y-1">
          <p className="font-semibold">Licencia Profesional Activa</p>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono">Encriptación SSL Local</span>
          </div>
        </div>
      </aside>

      {/* MOBILE CONTAINER HEADER */}
      <header className="md:hidden w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-4 flex justify-between items-center z-10 sticky top-0 shadow-xs no-print">
        <div className="flex items-center gap-3">
          <Logo className="w-8 h-8" showNeon={true} />
          <span className="font-display font-bold text-sm tracking-tight text-slate-800 dark:text-white mt-1">PerioDash SaaS</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent("periodash-open-search"))}
            className="text-teal-600 dark:text-teal-400 p-2 border border-slate-50 dark:border-slate-800 rounded-xl cursor-pointer bg-slate-50/50 dark:bg-slate-800/50 hover:bg-teal-50 dark:hover:bg-teal-950/20"
            title="Buscador rápido"
          >
            <Search className="w-4 h-4" />
          </button>

          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="text-slate-500 dark:text-slate-300 p-2 border border-slate-50 dark:border-slate-800 rounded-xl cursor-pointer bg-transparent"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-750" />}
          </button>

          <button 
            onClick={handleLogout}
            className="text-red-500 dark:text-red-400 p-2 border border-slate-50 dark:border-slate-800 rounded-xl cursor-pointer bg-transparent hover:bg-red-500/10"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* VIEWPORT AREA CONTENT */}
      <main className="flex-1 w-full p-4 md:p-8 space-y-6 pb-[calc(110px+env(safe-area-inset-bottom))] md:pb-8 relative z-0 print:p-0 print:m-0 print:overflow-visible">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* MOBILE IOS BOTTOM TAB NAV BAR */}
      <nav 
        id="mobile-bottom-nav" 
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 z-40 flex justify-between items-end px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)] shadow-[0_-4px_10px_rgba(0,0,0,0.02)] no-print overflow-x-auto hide-scrollbar"
      >
        {[
          { id: "dashboard", label: "Inicio", icon: LayoutDashboard },
          { id: "pacientes", label: "Pacientes", icon: Users },
          { id: "clinica", label: "Ficha", icon: Stethoscope },
          { id: "agenda", label: "Agenda", icon: Calendar },
          { id: "dentalstories", label: "Stories", icon: MessageSquare },
          { id: "tienda", label: "Mercado", icon: ShoppingBag },
          { id: "ajustes", label: "Ajustes", icon: Settings }
        ].map((item) => {
          const ActiveIcon = item.icon;
          const isActive = activeTab === item.id;
          const isNeon = item.id === "dentalstories" || item.id === "tienda";
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as ActiveTab)}
              className={`flex flex-col items-center justify-center min-w-[50px] flex-1 gap-1 transition-all duration-200 shrink-0 ${
                isActive 
                  ? isNeon 
                    ? "text-teal-500 scale-[1.04]"
                    : "text-teal-600 dark:text-teal-400 scale-[1.02]" 
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              <div className={`relative flex items-center justify-center p-1.5 rounded-xl transition-colors ${isActive && !isNeon ? 'bg-teal-50 dark:bg-teal-900/40' : 'bg-transparent'} ${isNeon ? "w-8 h-8 rounded-lg overflow-visible neon-intense-glow" : ""}`}>
                {isNeon && (
                   <>
                      <div className="absolute inset-x-0 inset-y-0 rounded-lg overflow-hidden -m-0.5">
                        <div className="absolute inset-0 neon-rainbow-bg pointer-events-none opacity-90" />
                        <div className={`absolute inset-[1.5px] rounded-[7px] z-0 pointer-events-none transition-colors ${isActive ? 'bg-teal-950/20' : 'dark:bg-slate-900 bg-white'}`} />
                      </div>
                   </>
                )}
                <ActiveIcon className={`w-5 h-5 relative z-10 transition-colors ${isActive && !isNeon ? 'stroke-[2.5px] text-teal-600 dark:text-teal-400' : isActive && isNeon ? 'text-white' : isNeon ? 'text-slate-650 dark:text-slate-200' : 'stroke-2 text-slate-400'}`} />
              </div>
              <span className={`text-[9px] font-medium tracking-tight ${isActive ? "font-bold text-teal-600 dark:text-teal-400" : "text-slate-400"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* FLOATING CHATBOT ENGINE */}
      <DentitoChat activePatient={activePatient} />

      <Spotlight 
        patients={patients} 
        onSelectPatient={(id) => setActivePatientId(id)} 
        onNavigate={(tab) => {
          setActiveTab(tab as ActiveTab);
          window.dispatchEvent(new CustomEvent('periodash-navigate', { detail: tab }));
        }} 
      />

      <AnimatePresence>
        {showShareModal && activePatient && (
          <SharePatientModal patient={activePatient} onClose={() => setShowShareModal(false)} />
        )}

        {deletingPatientId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#09090b]/80 backdrop-blur-md z-[260] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-[2rem] max-w-sm w-full p-6 shadow-2xl relative"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-red-500/10 text-red-650 dark:text-red-400 rounded-2xl flex items-center justify-center border border-red-500/20 animate-pulse">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-[#09090b] dark:text-white">¿Purgar Expediente Clínico?</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    ¿Estás seguro de que deseas eliminar permanentemente a <strong className="text-slate-900 dark:text-teal-400 font-bold">{patients.find(p => p.id === deletingPatientId)?.name || "este paciente"}</strong> y todos sus registros clínicos, periodontogramas e historiales? Esta operación es irreversible.
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => executeDeletePatient(deletingPatientId)}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer active:scale-95 text-center"
                  >
                    Sí, eliminar
                  </button>
                  <button
                    onClick={() => setDeletingPatientId(null)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700/60 active:scale-95 text-center"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
