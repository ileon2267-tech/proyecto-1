import React, { useState, useEffect } from "react";
import Logo from "./Logo";
import { 
  Lock, 
  Mail, 
  User, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Fingerprint, 
  ShieldCheck, 
  Moon, 
  Sun,
  Stethoscope,
  Briefcase,
  GraduationCap,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ClinicalUser } from "../types";

interface LoginScreenProps {
  onLogin: (user: ClinicalUser) => void;
  defaultEmail?: string;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

// Read or initialize custom user data list
const getStoredUsers = (): ClinicalUser[] => {
  const saved = localStorage.getItem("perioUsuarios");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
  }
  
  const defaultUsers: ClinicalUser[] = [
    {
      id: "usr-default",
      name: "Dr. Ignacio León",
      email: "ileon2267@gmail.com",
      password: "admin123",
      profile: "particular",
      role: "odontologo",
      specialty: "Periodoncia e Implantología",
      createdAt: new Date().toISOString()
    }
  ];
  localStorage.setItem("perioUsuarios", JSON.stringify(defaultUsers));
  return defaultUsers;
};

export default function LoginScreen({ onLogin, defaultEmail = "ileon2267@gmail.com", darkMode, setDarkMode }: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [users, setUsers] = useState<ClinicalUser[]>(getStoredUsers);

  // Login variables
  const [loginEmail, setLoginEmail] = useState(defaultEmail);
  const [loginPassword, setLoginPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<ClinicalUser | null>(null);

  // Registration variables 
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regProfile, setRegProfile] = useState<'particular' | 'clinica' | 'universidad' | 'cliente'>("particular");
  const [regSpecialty, setRegSpecialty] = useState("");
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccessMessage, setRegSuccessMessage] = useState<string | null>(null);

  // Synchronize users database
  const saveUsers = (updatedUsers: ClinicalUser[]) => {
    localStorage.setItem("perioUsuarios", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  // Perform Clinical Authentication
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const emailTrim = loginEmail.trim().toLowerCase();
    
    if (!emailTrim) {
      setLoginError("Por favor, ingrese un correo electrónico válido.");
      return;
    }
    if (!loginPassword) {
      setLoginError("La contraseña es requerida.");
      return;
    }

    setIsLoading(true);

    // Verify against DB.usuarios in local state
    setTimeout(() => {
      const match = users.find(u => u.email.toLowerCase() === emailTrim && u.password === loginPassword);
      
      if (match) {
        setIsLoading(false);
        setAuthSuccess(true);
        setLoggedInUser(match);
        
        // Complete authorization after success animation
        setTimeout(() => {
          onLogin(match);
        }, 800);
      } else {
        setIsLoading(false);
        setLoginError("Fallo de autenticación. Verifique su correo o contraseña clínica.");
      }
    }, 1000);
  };

  // Registration Submitter
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccessMessage(null);

    const nameTrim = regName.trim();
    const emailTrim = regEmail.trim().toLowerCase();
    
    // Validations
    if (!nameTrim) {
      setRegError("Por favor ingrese su nombre completo.");
      return;
    }
    if (!emailTrim) {
      setRegError("Por favor ingrese una dirección de correo válida.");
      return;
    }
    if (regPassword.length < 6) {
      setRegError("La contraseña de seguridad debe tener un mínimo de 6 caracteres.");
      return;
    }

    // Check email duplication
    const emailExists = users.some(u => u.email.toLowerCase() === emailTrim);
    if (emailExists) {
      setRegError("El correo clínico ingresado ya se encuentra registrado.");
      return;
    }

    // Determine default Clinician or Client roles
    // Perfil: particular -> odontologo
    // Perfil: clinica -> admin
    // Perfil: universidad -> odontologo
    // Perfil: cliente -> cliente
    let resolvedRole: 'odontologo' | 'admin' | 'cliente' = "odontologo";
    if (regProfile === "clinica") {
      resolvedRole = "admin";
    } else if (regProfile === "cliente") {
      resolvedRole = "cliente";
    }

    const newUser: ClinicalUser = {
      id: `usr-${Date.now()}`,
      name: nameTrim,
      email: emailTrim,
      password: regPassword,
      profile: regProfile,
      role: resolvedRole,
      specialty: regSpecialty.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    // Update state and DB
    const updatedUsersList = [...users, newUser];
    saveUsers(updatedUsersList);

    // Autocomplete fields for immediate comfortable action
    setLoginEmail(newUser.email);
    setLoginPassword(newUser.password || "");
    
    setRegSuccessMessage("¡Cuenta registrada con éxito! Redirigiendo para iniciar sesión...");
    
    // Delay slightly to let success message breathe, then redirect to Iniciar Sesión tab
    setTimeout(() => {
      setActiveTab("login");
      setRegName("");
      setRegEmail("");
      setRegPassword("");
      setRegSpecialty("");
      setRegSuccessMessage(null);
    }, 1500);
  };

  const handleBiometricLogin = () => {
    setLoginError(null);
    setIsLoading(true);
    
    // Simulate biometric clinical signature
    setTimeout(() => {
      // Find default doctor or first available user
      const defaultUser = users.find(u => u.email === defaultEmail) || users[0];
      if (defaultUser) {
        setIsLoading(false);
        setAuthSuccess(true);
        setLoggedInUser(defaultUser);
        
        setTimeout(() => {
          onLogin(defaultUser);
        }, 800);
      } else {
        setIsLoading(false);
        setLoginError("No se encontró usuario clínico por defecto para firmar biométricamente.");
      }
    }, 1200);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300 font-sans ${darkMode ? "dark bg-slate-950 text-white" : "bg-slate-50 text-slate-800"}`}>
      {/* Background gradients */}
      {darkMode && (
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-[-30%] left-[-20%] w-[60%] h-[60%] bg-teal-950/40 blur-[130px] rounded-full" />
          <div className="absolute bottom-[-35%] right-[-20%] w-[60%] h-[60%] bg-emerald-900/20 blur-[140px] rounded-full" />
        </div>
      )}
      {!darkMode && (
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-teal-500/5 blur-[100px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-400/5 blur-[100px] rounded-full" />
        </div>
      )}

      {/* Mode Switch floating at top right */}
      <div className="absolute top-6 right-6">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-3 rounded-2xl border transition-all cursor-pointer bg-transparent ${darkMode ? "hover:bg-slate-950 border-slate-800 text-amber-400" : "hover:bg-slate-100 border-slate-200 text-slate-700"} shadow-xs`}
          aria-label="Alternar Modo Oscuro"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        {/* Core Auth Panel */}
        <div className={`rounded-3xl border p-8 backdrop-blur-xl relative overflow-hidden transition-all ${darkMode ? "bg-slate-900/60 border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.37)]" : "bg-white border-slate-100 shadow-[0_12px_40px_rgba(15,23,42,0.06)]"}`}>
          
          {/* Subtle top decoration beam */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

          {/* Clinical Header */}
          <div className="text-center space-y-4 mb-6">
            <div className="flex justify-center">
              <Logo className="w-14 h-14" showNeon={true} />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl tracking-tight">PerioDash v15</h1>
              <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 tracking-widest uppercase mt-1">Terminal Clínico Integrado</p>
            </div>
          </div>

          {/* Dynamic Tab Switchers (No-flicker transitions) */}
          {!authSuccess && (
            <div className={`p-1 rounded-xl mb-6 grid grid-cols-2 ${darkMode ? "bg-slate-950" : "bg-slate-100/80"}`}>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("login");
                  setLoginError(null);
                }}
                className={`py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer border-0 ${
                  activeTab === "login" 
                    ? (darkMode ? "bg-slate-800 text-white shadow-xs" : "bg-white text-slate-800 shadow-xs")
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 bg-transparent"
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("register");
                  setRegError(null);
                }}
                className={`py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer border-0 ${
                  activeTab === "register"
                    ? (darkMode ? "bg-slate-800 text-white shadow-xs" : "bg-white text-slate-800 shadow-xs")
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 bg-transparent"
                }`}
              >
                Crear Cuenta
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {authSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 text-center space-y-4"
                key="success-prompt"
              >
                <div className="inline-flex p-4 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-500 rounded-full animate-bounce">
                  <ShieldCheck className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-emerald-500">Sesión Autorizada</h3>
                  <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider mt-1">Sincronizando Perfil {loggedInUser?.profile}</p>
                  <p className={`text-xs mt-2 max-w-xs mx-auto ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                    Cargando expediente clínico del {loggedInUser?.name}...
                  </p>
                </div>
              </motion.div>
            ) : activeTab === "login" ? (
              // TAB A: LOGIN FORM
              <motion.form 
                onSubmit={handleLoginSubmit}
                key="login-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Form Error Message */}
                {loginError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 text-xs rounded-xl font-medium animate-pulse">
                    ⚠️ {loginError}
                  </div>
                )}

                {/* Account Email Input */}
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-bold uppercase tracking-widest block ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                    Dirección de Correo
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <Mail className="w-4.5 h-4.5" />
                    </span>
                    <input 
                      type="email" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="ileon2267@gmail.com"
                      className={`w-full text-xs p-3.5 pl-10.5 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 border transition-all ${
                        darkMode 
                          ? "bg-slate-950 border-slate-800 text-white focus:border-teal-500/40" 
                          : "bg-slate-50 border-slate-200 text-slate-800 focus:border-teal-500/40"
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* Password / Pin Input */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className={`text-[10px] font-bold uppercase tracking-widest block ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                      Contraseña Clínica
                    </label>
                    <span className="text-[10px] font-bold text-teal-600 dark:text-teal-450 hover:underline cursor-pointer">defecto: admin123</span>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <Lock className="w-4.5 h-4.5" />
                    </span>
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full text-xs p-3.5 pl-10.5 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 border transition-all ${
                        darkMode 
                          ? "bg-slate-950 border-slate-800 text-white focus:border-teal-500/40" 
                          : "bg-slate-50 border-slate-200 text-slate-800 focus:border-teal-500/40"
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer border-0 bg-transparent"
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-teal-650 hover:bg-teal-700 text-white font-bold text-xs py-3.5 px-4 rounded-xl transition-all shadow-md cursor-pointer hover:shadow-teal-500/10 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Iniciando sesión...</span>
                    </>
                  ) : (
                    <span>Ingresar al Sistema Clínico</span>
                  )}
                </button>

                {/* Divider lines */}
                <div className="relative flex py-2 items-center">
                  <div className={`flex-grow border-t ${darkMode ? "border-slate-800" : "border-slate-100"}`} />
                  <span className={`flex-shrink mx-4 text-[10px] font-bold uppercase tracking-widest ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                    Firma Biométrica
                  </span>
                  <div className={`flex-grow border-t ${darkMode ? "border-slate-800" : "border-slate-100"}`} />
                </div>

                {/* Biometric quick touch mock option */}
                <button
                  type="button"
                  onClick={handleBiometricLogin}
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                    darkMode 
                      ? "bg-slate-900 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700 text-slate-350" 
                      : "bg-slate-50/50 border-slate-200 hover:bg-slate-100/50 text-slate-600"
                  }`}
                >
                  <Fingerprint className="w-4.5 h-4.5 text-teal-500 animate-pulse" />
                  <span>Autenticar con Huella Dactilar / FaceID</span>
                </button>
              </motion.form>
            ) : (
              // TAB B: CREAR CUENTA FORM (REGISTER FLOW)
              <motion.form 
                onSubmit={handleRegisterSubmit}
                key="register-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Form Error or Success Message */}
                {regError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 text-xs rounded-xl font-medium">
                    ⚠️ {regError}
                  </div>
                )}

                {regSuccessMessage && (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-650 dark:text-emerald-400 text-xs rounded-xl font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-pulse" />
                    {regSuccessMessage}
                  </div>
                )}

                {/* Full name input */}
                <div className="space-y-1">
                  <label className={`text-[9.5px] font-bold uppercase tracking-widest block ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <User className="w-4.5 h-4.5" />
                    </span>
                    <input 
                      type="text" 
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Dr(a). Camila Silva Mendoza"
                      className={`w-full text-xs p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 border transition-all ${
                        darkMode 
                          ? "bg-slate-950 border-slate-800 text-white focus:border-teal-500/40" 
                          : "bg-slate-50 border-slate-200 text-slate-800 focus:border-teal-500/40"
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* Grid row: Email + Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className={`text-[9.5px] font-bold uppercase tracking-widest block ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                      Dirección de Correo
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                        <Mail className="w-4.5 h-4.5" />
                      </span>
                      <input 
                        type="email" 
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="doctora@periodash.com"
                        className={`w-full text-xs p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 border transition-all ${
                          darkMode 
                            ? "bg-slate-950 border-slate-800 text-white focus:border-teal-500/40" 
                            : "bg-slate-50 border-slate-200 text-slate-800 focus:border-teal-500/40"
                        }`}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className={`text-[9.5px] font-bold uppercase tracking-widest block ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-450 pointer-events-none">
                        <Lock className="w-4.5 h-4.5" />
                      </span>
                      <input 
                        type="password" 
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min. 6 caracteres"
                        className={`w-full text-xs p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 border transition-all ${
                          darkMode 
                            ? "bg-slate-950 border-slate-800 text-white focus:border-teal-500/40" 
                            : "bg-slate-50 border-slate-200 text-slate-800 focus:border-teal-500/40"
                        }`}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Profile selection (particular, clinica, universidad, cliente) */}
                <div className="space-y-2">
                  <label className={`text-[9.5px] font-bold uppercase tracking-widest block ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                    Perfil de Acceso Clínico
                  </label>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { id: "particular", title: "Profesional", desc: "Particular (Odontólogo)", icon: Stethoscope },
                      { id: "clinica", title: "Clínica", desc: "Gestión & Auditoría", icon: Briefcase },
                      { id: "universidad", title: "Universidad", desc: "Docente / Académico", icon: GraduationCap },
                      { id: "cliente", title: "Cliente", desc: "Portal de Paciente", icon: Users }
                    ].map((prof) => {
                      const Icon = prof.icon;
                      const isSelected = regProfile === prof.id;
                      return (
                        <div
                          key={prof.id}
                          onClick={() => setRegProfile(prof.id as any)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 relative select-none ${
                            isSelected
                              ? "bg-teal-500/10 border-teal-500/45 dark:border-teal-500/60 ring-1 ring-teal-500/20"
                              : (darkMode ? "bg-slate-950 border-slate-800 hover:border-slate-700" : "bg-slate-50 border-slate-200 hover:bg-slate-100")
                          }`}
                        >
                          <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${isSelected ? "text-teal-500" : "text-slate-450"}`} />
                          <div className="text-left">
                            <p className={`text-[10px] font-bold ${isSelected ? "text-teal-600 dark:text-teal-400" : "text-slate-500"}`}>{prof.title}</p>
                            <span className="text-[8.5px] text-slate-400 font-medium block leading-tight mt-0.5">{prof.desc}</span>
                          </div>

                          {/* Subtle checked dot */}
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-teal-500 absolute top-2 right-2 animate-pulse" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Specialty code */}
                {regProfile !== "cliente" && (
                  <div className="space-y-1">
                    <label className={`text-[9.5px] font-bold uppercase tracking-widest block ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                      Especialidad Dental <span className="text-slate-450 font-medium font-mono text-[8.5px]">(Opcional)</span>
                    </label>
                    <input 
                      type="text" 
                      value={regSpecialty}
                      onChange={(e) => setRegSpecialty(e.target.value)}
                      placeholder="Ej. Periodoncia, Endodoncia, Odontopediatría"
                      className={`w-full text-xs p-3 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 border transition-all ${
                        darkMode 
                          ? "bg-slate-950 border-slate-800 text-white focus:border-teal-500/40" 
                          : "bg-slate-50 border-slate-200 text-slate-800 focus:border-teal-500/40"
                      }`}
                    />
                  </div>
                )}

                {/* Action Submit */}
                <button
                  type="submit"
                  className="w-full bg-teal-650 hover:bg-teal-700 text-white font-bold text-xs py-3.5 px-4 rounded-xl transition-all shadow-md cursor-pointer hover:shadow-teal-500/10 flex items-center justify-center gap-2 mt-2"
                >
                  <CheckCircle2 className="w-4.5 h-4.5" />
                  <span>Registrar Nueva Cuenta de Usuario</span>
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Technical foot info */}
        <p className={`text-center text-[9px] mt-6 leading-relaxed font-semibold tracking-wider uppercase ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
          🔒 HIPAA Secure Network • PerioDash SaaS v15 Cryptographic Engine
        </p>
      </motion.div>
    </div>
  );
}
