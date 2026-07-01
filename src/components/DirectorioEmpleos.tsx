import React, { useState } from 'react';
import { 
  Briefcase, 
  Star, 
  MapPin, 
  ThumbsUp, 
  MessageSquare, 
  FileText, 
  Search, 
  Award,
  Filter,
  CheckCircle,
  Clock,
  User,
  MoreVertical,
  X,
  Upload,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Mock data for professionals
const INITIAL_PROFESSIONALS = [
  {
    id: "prof-1",
    name: "Dra. Ana Silveira",
    specialty: "Periodoncia e Implantología",
    location: "Sede Centro, CDMX",
    rating: 4.9,
    likes: 124,
    reviews: 48,
    experience: "12 años",
    status: "Disponible", // Disponible, En clínica
    avatar: "https://i.pravatar.cc/150?u=dra-ana",
    about: "Especialista en cirugía mucogingival e implantes dentales. Egresada de la UNAM con maestría en rehabilitación oral avanzada.",
    skills: ["Cirugía Guiada", "Regeneración Ósea", "Láser Dental"]
  },
  {
    id: "prof-2",
    name: "Dr. Carlos Mendoza",
    specialty: "Ortodoncia y Ortopedia",
    location: "Sede Sur, Monterrey",
    rating: 4.7,
    likes: 98,
    reviews: 32,
    experience: "8 años",
    status: "Buscando Oportunidades",
    avatar: "https://i.pravatar.cc/150?u=dr-carlos",
    about: "Certificado en alineadores invisibles. Apasionado por la ortopedia interceptiva en pediatría.",
    skills: ["Ortodoncia Invisible", "Cefalometría", "Diseño Digital"]
  },
  {
    id: "prof-3",
    name: "Dra. Sofía Reyes",
    specialty: "Endodoncia Microscópica",
    location: "Guadalajara, Jalisco",
    rating: 4.8,
    likes: 156,
    reviews: 64,
    experience: "15 años",
    status: "Disponible",
    avatar: "https://i.pravatar.cc/150?u=dra-sofia",
    about: "Manejo de casos complejos, retratamientos y microcirugía apical. Más de 10,000 conductos tratados con éxito.",
    skills: ["Microscopio Operatorio", "Localizadores Rotatorios", "Trauma Dental"]
  },
  {
    id: "prof-4",
    name: "Dr. Javier Orozco",
    specialty: "Odontopediatría Integral",
    location: "Sede Norte, CDMX",
    rating: 5.0,
    likes: 210,
    reviews: 89,
    experience: "10 años",
    status: "En Clínica (Medio Tiempo)",
    avatar: "https://i.pravatar.cc/150?u=dr-javier",
    about: "Manejo compasivo de pacientes infantiles. Enfoque preventivo y educación en salud bucal familiar.",
    skills: ["Manejo de Conducta", "Sedación Consciente", "Odontología Mínimamente Invasiva"]
  }
];

export default function DirectorioEmpleos() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [showMyProfile, setShowMyProfile] = useState(false);
  const [myProfileData, setMyProfileData] = useState({
    name: "Dr. Admin",
    specialty: "Odontología General",
    location: "Sede Principal",
    status: "Disponible",
    about: "Profesional apasionado por brindar el mejor servicio a mis pacientes.",
    skills: ["Odontología General"]
  });

  const filteredProfessionals = INITIAL_PROFESSIONALS.filter(prof => {
    const matchesSearch = prof.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prof.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' ? true : prof.specialty.includes(activeFilter) || prof.status.includes(activeFilter);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col h-full gap-4">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 relative z-10">
        <div>
          <h2 className="text-2xl font-display font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-teal-600" />
            Bolsa de Empleo y Directorio
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Conecta con los mejores especialistas. Revisa sus perfiles corporativos, calificaciones de pacientes, recomendaciones y experiencia clínica verificada.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar por nombre o especialidad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 w-64 md:w-80 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none dark:text-white transition-all focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/10 shadow-sm"
            />
          </div>

          <button 
            onClick={() => setShowMyProfile(true)}
            className="px-5 py-2.5 text-xs font-bold leading-none text-white bg-teal-600 hover:bg-teal-700 rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-all shrink-0"
          >
            <User className="w-4 h-4" />
            Mi Perfil Profesional
          </button>
        </div>
      </div>

      {/* HORIZONTAL FILTERS */}
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
        {[
          { label: "Todos", value: "All" },
          { label: "Periodoncia", value: "Periodoncia" },
          { label: "Ortodoncia", value: "Ortodoncia" },
          { label: "Endodoncia", value: "Endodoncia" },
          { label: "Buscando Oportunidades", value: "Buscando" },
          { label: "Disponibles", value: "Disponible" }
        ].map(filter => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all border cursor-pointer ${
              activeFilter === filter.value 
                ? "bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 shadow-sm" 
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredProfessionals.map((prof, index) => (
              <motion.div
                key={prof.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col hover:shadow-lg hover:border-teal-200 dark:hover:border-teal-900 transition-all cursor-pointer group"
                onClick={() => setSelectedProfile(prof)}
              >
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg ${
                    prof.status.includes('Disponible') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    prof.status.includes('Buscando') ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' :
                    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {prof.status}
                  </span>
                  <button className="text-slate-400 hover:text-red-500 transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col items-center text-center mb-4">
                  <div className="w-20 h-20 rounded-full border-4 border-slate-50 dark:border-slate-800 shadow-sm mb-3 group-hover:scale-105 transition-transform bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <User className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">{prof.name}</h3>
                  <p className="text-teal-600 dark:text-teal-400 text-xs font-semibold mb-1">{prof.specialty}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center justify-center gap-1">
                    <MapPin className="w-3 h-3" /> {prof.location}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-100 dark:border-slate-800 py-3 mb-4">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                      <Star className="w-3.5 h-3.5 fill-current" /> {prof.rating}
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">Rating</span>
                  </div>
                  <div className="flex flex-col items-center border-l border-r border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1 text-slate-700 dark:text-slate-200 font-bold text-sm">
                      <ThumbsUp className="w-3.5 h-3.5" /> {prof.likes}
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">Likes</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1 text-slate-700 dark:text-slate-200 font-bold text-sm">
                      <MessageSquare className="w-3.5 h-3.5" /> {prof.reviews}
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">Reseñas</span>
                  </div>
                </div>

                <div className="mt-auto">
                  <button className="w-full py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors group-hover:bg-teal-50 dark:group-hover:bg-teal-900/20 group-hover:text-teal-700 dark:group-hover:text-teal-400">
                    Ver Expediente
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* PROFILE DETAIL MODAL */}
      <AnimatePresence>
        {selectedProfile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedProfile(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800"
            >
              {/* Header Cover */}
              <div className="h-32 bg-gradient-to-r from-teal-600 to-emerald-600 relative">
                <button 
                  onClick={() => setSelectedProfile(null)}
                  className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Main Info */}
              <div className="px-8 pb-6 relative flex-1 overflow-y-auto">
                <div className="flex flex-col md:flex-row gap-6 items-start relative -mt-12 mb-6">
                  <div className="w-28 h-28 rounded-2xl border-4 border-white dark:border-slate-900 shadow-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                    <User className="w-12 h-12" />
                  </div>
                  
                  <div className="flex-1 pt-14 md:pt-14">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                          {selectedProfile.name}
                          <CheckCircle className="w-5 h-5 text-teal-500" />
                        </h2>
                        <p className="text-teal-600 dark:text-teal-400 font-bold text-sm tracking-wide mt-0.5">{selectedProfile.specialty}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors">
                          <MessageSquare className="w-4 h-4" /> Mensaje
                        </button>
                        <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-colors">
                          <Briefcase className="w-4 h-4" /> Invitar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Left Column */}
                  <div className="md:col-span-2 space-y-8">
                    <section>
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <User className="w-4 h-4 text-teal-600" /> Acerca de Mí
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        {selectedProfile.about}
                      </p>
                    </section>

                    <section>
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4 text-teal-600" /> Habilidades Destacadas
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProfile.skills.map((skill: string, i: number) => (
                          <span key={i} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </section>
                    
                    <section>
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-teal-600" /> Curriculum Vitae (Ficha)
                      </h3>
                      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-white dark:bg-slate-700 rounded-xl shadow-sm">
                            <FileText className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">CV_{selectedProfile.name.replace(/ /g, '_')}_2024.pdf</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Subido hace 2 meses • 2.4 MB</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:text-teal-600 font-bold text-xs rounded-xl shadow-sm transition-colors">
                          Descargar
                        </button>
                      </div>
                    </section>
                  </div>

                  {/* Right Column (Widget info) */}
                  <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-amber-500">
                          <Star className="w-4 h-4 fill-current" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Calificación Pacientes</p>
                          <p className="font-black text-slate-800 dark:text-white text-lg">{selectedProfile.rating} <span className="text-xs font-medium text-slate-400">/ 5.0</span></p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-teal-500">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Experiencia Clínica</p>
                          <p className="font-black text-slate-800 dark:text-white text-sm">{selectedProfile.experience}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-indigo-500">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ubicación</p>
                          <p className="font-black text-slate-800 dark:text-white text-sm">{selectedProfile.location}</p>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* MY PROFILE EDIT MODAL */}
      <AnimatePresence>
        {showMyProfile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowMyProfile(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-teal-600" />
                    Editar Mi Perfil Profesional
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Actualiza tu información para ser visible en la bolsa de empleo.
                  </p>
                </div>
                <button 
                  onClick={() => setShowMyProfile(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl mb-1 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      Cambiar Foto
                    </button>
                    <p className="text-[10px] text-slate-500">JPG o PNG max 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre Completo</label>
                    <input 
                      type="text" 
                      value={myProfileData.name}
                      onChange={(e) => setMyProfileData({...myProfileData, name: e.target.value})}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 outline-none focus:border-teal-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Especialidad</label>
                    <input 
                      type="text" 
                      value={myProfileData.specialty}
                      onChange={(e) => setMyProfileData({...myProfileData, specialty: e.target.value})}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 outline-none focus:border-teal-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ubicación</label>
                    <input 
                      type="text" 
                      value={myProfileData.location}
                      onChange={(e) => setMyProfileData({...myProfileData, location: e.target.value})}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 outline-none focus:border-teal-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Disponibilidad</label>
                    <select 
                      value={myProfileData.status}
                      onChange={(e) => setMyProfileData({...myProfileData, status: e.target.value})}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 outline-none focus:border-teal-500/50"
                    >
                      <option value="Disponible">Disponible para consultas</option>
                      <option value="En clínica">Ya laborando en clínica</option>
                      <option value="Buscando">Buscando Oportunidades</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Acerca de Mí</label>
                  <textarea 
                    rows={4}
                    value={myProfileData.about}
                    onChange={(e) => setMyProfileData({...myProfileData, about: e.target.value})}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 outline-none focus:border-teal-500/50 resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Habilidades / Keywords (separadas por coma)</label>
                  <input 
                    type="text" 
                    value={myProfileData.skills.join(', ')}
                    onChange={(e) => setMyProfileData({...myProfileData, skills: e.target.value.split(',').map(s=>s.trim())})}
                    placeholder="Ej. Ortodoncia, Cirugía, Brackets..."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 outline-none focus:border-teal-500/50"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {myProfileData.skills.filter(Boolean).map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-[10px] font-bold rounded-md">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/30 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Curriculum Vitae</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Sube tu CV en formato PDF</p>
                  </div>
                  <button className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-teal-600 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" /> Subir Archivo
                  </button>
                </div>

              </div>

              <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
                <button 
                  onClick={() => setShowMyProfile(false)}
                  className="px-5 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl font-bold text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => setShowMyProfile(false)}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
