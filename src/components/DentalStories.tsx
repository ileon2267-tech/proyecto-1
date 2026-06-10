import React, { useState } from "react";
import { MessageSquare, Share2, Coins, ArrowUpRight, Upload, Download, FileText, CheckCircle, Search, UserCheck, Heart, Sparkles, Filter, ChevronRight, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Interfaces
interface ForumPost {
  id: string;
  author: string;
  title: string;
  category: string;
  content: string;
  likes: number;
  commentsCount: number;
  createdAt: string;
  hasLiked?: boolean;
}

interface SharedStudy {
  id: string;
  title: string;
  author: string;
  description: string;
  fileSize: string;
  price: number;
  purchases: number;
  rating: number;
  isUnlocked?: boolean;
}

export default function DentalStories() {
  const [activeTab, setActiveTab] = useState<"foro" | "estudios">("foro");
  
  // Doctor Wallet State
  const [earnings, setEarnings] = useState<number>(340.50);
  const [walletHistory, setWalletHistory] = useState([
    { id: "w-1", desc: "Venta de Estudio: Regeneración Tisular Guiada", amount: 75.00, date: "2026-06-06" },
    { id: "w-2", desc: "Venta de Guía: Diagnóstico de Crestas Alveolares", amount: 45.00, date: "2026-06-05" },
    { id: "w-3", desc: "Venta de Estudio: Colgajo de Widman", amount: 29.99, date: "2026-06-04" },
  ]);

  // Forum state
  const [posts, setPosts] = useState<ForumPost[]>([
    {
      id: "post-1",
      author: "Dr. Ignacio León",
      category: "Cirugía Periodontal",
      title: "Manejo reconstructivo de furca Clase III en pieza 36",
      content: "Se presenta caso de paciente fumador con compromiso de furca Severo Clase III en la pieza 36. Llevamos a cabo raspado de campo abierto combinado con injerto óseo desmineralizado y membrana reabsorbible de colágeno. En la revaluación a los 6 meses obtuvimos un CAL estable de 4mm. ¿Recomendarían ferulización preventiva o carga de implante?",
      likes: 24,
      commentsCount: 12,
      createdAt: "Hace 2 horas",
      hasLiked: false
    },
    {
      id: "post-2",
      author: "Dra. Andrea Valenzuela",
      category: "Casos Clínicos",
      title: "Asociación de periodontitis agresiva incipiente en paciente de 24 años",
      content: "Paciente joven acude con recesiones localizadas y sangrado marginal severo. Índice de O'Leary inicial de 68%. Iniciamos terapia higiénica estricta combinada con antibioterapia (Amoxicilina + Metronidazol) por 7 días. El retroceso en la inflamación fue del 90% en la semana 3. Adjunto periodontograma.",
      likes: 18,
      commentsCount: 5,
      createdAt: "Hace 5 horas",
      hasLiked: false
    },
    {
      id: "post-3",
      author: "Dr. Carlos Soto",
      category: "Microbiología",
      title: "Índice de O'Leary de 72% - Protocolo clínico inmediato",
      content: "Reisados los índices de caries y placa, comparto mi protocolo de choque con clorhexidina en gel al 0.2% aplicado interproximal. Ideal para pacientes poco cooperadores con destreza motriz limitada.",
      likes: 11,
      commentsCount: 3,
      createdAt: "Ayer",
      hasLiked: false
    }
  ]);

  // Studies marketplace state
  const [studies, setStudies] = useState<SharedStudy[]>([
    {
      id: "study-1",
      title: "Atlas Clínico y Guía Quirúrgica de Regeneración Tisular Guiada (RTG)",
      author: "Dr. Ignacio León",
      description: "Contiene 12 casos documentados paso a paso con radiografías CBCT pre y post operatorias, diseños de colgajo y manejo posquirúrgico.",
      fileSize: "18.4 MB (PDF/DICOM)",
      price: 75.00,
      purchases: 8,
      rating: 4.9,
      isUnlocked: true
    },
    {
      id: "study-2",
      title: "Guía de Diagnóstico Clínico de Crestas Alveolares Reabsorbidas",
      author: "Dr. Ignacio León",
      description: "Estudio de clasificación y toma de decisiones quirúrgicas previas a la colocación de implantes periodontales utilizando guías 3D.",
      fileSize: "12.1 MB (PDF)",
      price: 45.00,
      purchases: 14,
      rating: 4.8,
      isUnlocked: false
    },
    {
      id: "study-3",
      title: "Colgajo de Widman Modificado en Bolsas Periodontales de ≥ 7mm",
      author: "Dra. Andrea Valenzuela",
      description: "Análisis retrospectivo multivariable del clearance de bacterias anaerobias estrictas y cicatrización epitelial en bolsas críticas en sector anterior.",
      fileSize: "6.5 MB (PDF/MP4)",
      price: 29.99,
      purchases: 19,
      rating: 4.7,
      isUnlocked: false
    }
  ]);

  // Form states for adding posts/studies
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("Casos Clínicos");
  const [newPostContent, setNewPostContent] = useState("");

  const [newStudyTitle, setNewStudyTitle] = useState("");
  const [newStudyDesc, setNewStudyDesc] = useState("");
  const [newStudyPrice, setNewStudyPrice] = useState("");
  const [newStudySize, setNewStudySize] = useState("4.8 MB (PDF)");
  
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Handlers
  const handleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const isL = !post.hasLiked;
          return {
            ...post,
            likes: isL ? post.likes + 1 : post.likes - 1,
            hasLiked: isL,
          };
        }
        return post;
      })
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const newPost: ForumPost = {
      id: `post-${Date.now()}`,
      author: "Tú (Dr. Ignacio León)",
      category: newPostCategory,
      title: newPostTitle,
      content: newPostContent,
      likes: 0,
      commentsCount: 0,
      createdAt: "Recién publicado",
      hasLiked: false
    };

    setPosts([newPost, ...posts]);
    setNewPostTitle("");
    setNewPostContent("");
  };

  const handleUploadStudy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudyTitle.trim() || !newStudyDesc.trim() || !newStudyPrice) return;

    setIsUploading(true);

    setTimeout(() => {
      const priceNum = parseFloat(newStudyPrice) || 0;
      const newStudy: SharedStudy = {
        id: `study-${Date.now()}`,
        title: newStudyTitle,
        author: "Tú (Dr. Ignacio León)",
        description: newStudyDesc,
        fileSize: newStudySize,
        price: priceNum,
        purchases: 0,
        rating: 5.0,
        isUnlocked: true // uploaded studies are always unlocked for the author
      };

      setStudies([newStudy, ...studies]);
      setIsUploading(false);
      setUploadSuccess(true);
      
      // Add a dummy purchase / transaction visual log
      setTimeout(() => setUploadSuccess(false), 3000);

      // Clean inputs
      setNewStudyTitle("");
      setNewStudyDesc("");
      setNewStudyPrice("");
    }, 1200);
  };

  const handleBuyStudy = (studyId: string, price: number, title: string) => {
    if (confirm(`¿Deseas licenciar y desbloquear "${title}" por $${price} USD de tus fondos quirúrgicos de PerioSaaS?`)) {
      setStudies((prev) =>
        prev.map((study) => {
          if (study.id === studyId) {
            return { ...study, isUnlocked: true, purchases: study.purchases + 1 };
          }
          return study;
        })
      );
      
      // Update balance & purchase logs
      setEarnings((prev) => Math.max(0, prev - price));
      setWalletHistory([
        { id: `w-${Date.now()}`, desc: `Compra de Estudio: ${title}`, amount: -price, date: "Hoy" },
        ...walletHistory
      ]);
      alert("Estudio clínico desbloqueado. Ya puedes descargar los sets radiográficos complentos.");
    }
  };

  return (
    <div className="relative rounded-[2rem] p-[4px] group w-full" id="dentalstories-root">
      {/* Animated neon border background */}
      <div className="absolute inset-0 neon-rainbow-bg rounded-[2rem] pointer-events-none opacity-100" />
      <div className="absolute inset-0 neon-rainbow-bg rounded-[2rem] pointer-events-none blur-xl opacity-50 dark:opacity-70" />
      <div className="absolute inset-[4px] rounded-[calc(2rem-4px)] bg-[#f8fafc] dark:bg-[#09090b] z-0 pointer-events-none" />
      
      <div className="relative z-10 space-y-6 p-2 md:p-3 bg-transparent">
      
      {/* Sub header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <span>DentalStories & Study Hub</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Conecta con médicos periodoncistas, revisa atlas clínicos o sube tus estudios odontológicos y obtén rentabilidad certificada</p>
        </div>

        {/* Sub Navigation pills */}
        <div className="bg-slate-50 dark:bg-slate-800 p-1 rounded-xl flex border border-slate-100 dark:border-slate-800 w-full md:w-auto relative">
          <button
            onClick={() => setActiveTab("foro")}
            className={`flex-1 md:flex-none text-xs py-2 px-4 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === "foro"
                ? "bg-white dark:bg-slate-800 shadow-sm text-teal-600 dark:text-teal-400"
                : "text-slate-400 hover:text-slate-800 dark:hover:text-slate-100"
            }`}
          >
            Foro DentalStories
          </button>
          <button
            onClick={() => setActiveTab("estudios")}
            className={`flex-1 md:flex-none text-xs py-2 px-4 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === "estudios"
                ? "bg-white dark:bg-slate-800 shadow-sm text-teal-600 dark:text-teal-400"
                : "text-slate-400 hover:text-slate-800 dark:hover:text-slate-100"
            }`}
          >
            Monetización & Estudios
          </button>
        </div>
      </div>

      {/* RENDER FORUM */}
      {activeTab === "foro" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Feed (Post Feed) */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Create Post Card */}
            <form onSubmit={handleCreatePost} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-4 shadow-xs">
              <span className="text-[10px] bg-teal-50 dark:bg-teal-800/40 text-teal-700 dark:text-teal-450 border border-teal-500/10 font-bold uppercase tracking-wider py-1 px-2 rounded-md">
                Nueva Publicación en Comunidad
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Título del Caso Clínico o consulta..."
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="md:col-span-2 p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/10 text-slate-800 dark:text-slate-100"
                  required
                />
                <select
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value)}
                  className="p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none"
                >
                  <option value="Casos Clínicos">Casos Clínicos</option>
                  <option value="Cirugía Periodontal">Cirugía Periodontal</option>
                  <option value="Microbiología">Microbiología</option>
                  <option value="Docencia">Docencia / Tips</option>
                </select>
              </div>

              <textarea
                placeholder="Describe los bioindicadores, hallazgos radiográficos, el periodontograma, tipo de colgajo, medicaciones terapéuticas o dudas..."
                rows={3}
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50/75 dark:bg-slate-855 border border-slate-100 dark:border-slate-800 rounded-xl outline-none"
                required
              />

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-700 text-white font-semibold text-xs py-2 px-4 rounded-xl cursor-pointer shadow-xs inline-flex items-center gap-1.5 transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Publicar en Foro Médico</span>
                </button>
              </div>
            </form>

            {/* Post Feed List */}
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-3.5 hover:shadow-xs transition-all relative">
                  
                  {/* Category, Author & Date Row */}
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span className="font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-800/30 py-0.5 px-2 rounded">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>Ref: <strong>{post.author}</strong></span>
                      <span>•</span>
                      <span>{post.createdAt}</span>
                    </div>
                  </div>

                  {/* Title & Content */}
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-white leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed font-light">
                      {post.content}
                    </p>
                  </div>

                  {/* Likes and comments footer */}
                  <div className="flex items-center gap-4 border-t border-slate-50 dark:border-slate-800/60 pt-3.5">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={`text-[11px] font-bold py-1 px-2.5 rounded-lg border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                        post.hasLiked
                          ? "bg-red-50 text-red-500 border-red-200"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-400 border-transparent hover:text-red-500 hover:bg-slate-100"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${post.hasLiked ? "fill-red-505" : ""}`} />
                      <span>{post.likes} Doctor{post.likes !== 1 ? 's' : ''}</span>
                    </button>

                    <span className="text-[11px] text-slate-400 inline-flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span>{post.commentsCount} respuestas médicas</span>
                    </span>
                  </div>

                </div>
              ))}
            </div>

          </div>

          {/* Forum Sidebar (Guideline info / community rules) */}
          <div className="space-y-4">
            
            <div className="bg-gradient-to-br from-slate-900 to-teal-800 text-white rounded-2xl p-5 border border-slate-800 shadow-lg space-y-4">
              <div className="p-1 px-1.5 bg-teal-500/20 text-teal-400 border border-teal-400/20 rounded-xl inline-flex self-start">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-semibold text-xs uppercase text-teal-300 tracking-widest">Garantía PerioSaaS</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed font-light">
                  Todos los debates publicados en este foro respetan la confidencialidad de la ficha clínica de acuerdo con estándares HIPAA mundiales. Los nombres de los pacientes oclusales de PerioDash son anonimizados automáticamente en el feed.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-3.5">
              <h5 className="text-xs font-bold font-sans uppercase tracking-wider text-slate-400">Canales Especializados</h5>
              <div className="space-y-2 text-xs">
                {[
                  { tag: "AAP Clasificación 2018", count: 48 },
                  { tag: "Injerción de Tejido Conectivo", count: 32 },
                  { tag: "Biochips y Diagnóstico Genético", count: 14 }
                ].map((ch) => (
                  <div key={ch.tag} className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">#{ch.tag}</span>
                    <span className="font-mono text-[10px] text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{ch.count}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* RENDER MARKETPLACE & MONETIZATION HUB */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main List & Upload form */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Upload form */}
            <form onSubmit={handleUploadStudy} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <span className="text-[10px] bg-teal-50 dark:bg-teal-800/40 text-teal-700 dark:text-teal-450 border border-teal-500/10 font-bold uppercase tracking-wider py-1 px-2.5 rounded-md inline-flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>Monetizar tus Estudios Clínicos</span>
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block ml-0.5">Título del Documento o Set CBCT:</label>
                  <input
                    type="text"
                    placeholder="P. ej., Anatomía de Senos Maxilares en Injertos Alveolares"
                    value={newStudyTitle}
                    onChange={(e) => setNewStudyTitle(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/10 text-slate-800 dark:text-slate-100"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block ml-0.5">Precio de Licencia (USD):</label>
                    <input
                      type="number"
                      placeholder="P. ej., 29.99"
                      value={newStudyPrice}
                      onChange={(e) => setNewStudyPrice(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block ml-0.5">Formato & Peso:</label>
                    <select
                      value={newStudySize}
                      onChange={(e) => setNewStudySize(e.target.value)}
                      className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none"
                    >
                      <option value="4.8 MB (PDF)">4.8 MB (PDF)</option>
                      <option value="12.5 MB (PDF/DICOM)">12.5 MB (DICOM)</option>
                      <option value="22.1 MB (ZIP/CBCT)">22.1 MB (Radiografías/ZIP)</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block ml-0.5">Descripción Quirúrgica / Resumen de Contenidos:</label>
                  <textarea
                    placeholder="Describe el cuadro clínico de la periodontitis o cirugía, muestras tisulares, hallazgos óseos y valor clínico de tus archivos..."
                    rows={2}
                    value={newStudyDesc}
                    onChange={(e) => setNewStudyDesc(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1 items-center gap-4">
                {uploadSuccess && (
                  <span className="text-[11px] text-emerald-500 font-bold inline-flex items-center gap-1 animate-pulse">
                    <CheckCircle className="w-4 h-4" /> ¡Estudio monetizable publicado con éxito!
                  </span>
                )}
                
                <button
                  type="submit"
                  disabled={isUploading}
                  className="bg-teal-600 hover:bg-teal-750 text-white font-semibold text-xs py-2 px-4 rounded-xl cursor-pointer shadow-md inline-flex items-center gap-1.5 transition-all"
                >
                  {isUploading ? (
                    <span className="w-3.5 h-3.5 rounded-full border border-t-transparent border-white animate-spin" />
                  ) : (
                    <Coins className="w-3.5 h-3.5" />
                  )}
                  <span>Cargar y Configurar Cobro</span>
                </button>
              </div>
            </form>

            {/* Marketplace list */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase font-sans font-bold tracking-wider text-slate-400">Archivos e Informes Clínicos en Venta ({studies.length})</h3>
              
              {studies.map((study) => (
                <div key={study.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="inline-flex items-center gap-1 font-mono font-medium bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800/80">
                        <FileText className="w-3.5 h-3.5 text-teal-600" />
                        {study.fileSize}
                      </span>
                      <span>•</span>
                      <span>Autor: {study.author}</span>
                      <span>•</span>
                      <span className="text-amber-500">★ {study.rating}</span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{study.title}</h4>
                      <p className="text-xs text-slate-400 max-w-xl font-light font-sans">{study.description}</p>
                    </div>

                    <div className="text-[10px] text-slate-400">
                      Licencia activa para <strong>{study.purchases} doctores</strong> de la comunidad odontológica.
                    </div>
                  </div>

                  {/* Actions column pricing */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center gap-2 md:w-44 self-start md:self-center shrink-0">
                    <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Acceso Clínico</div>
                    <div className="text-2xl font-display font-bold text-slate-800 dark:text-slate-100">${study.price.toFixed(2)} <span className="text-[11px] text-teal-600 font-bold">USD</span></div>
                    
                    {study.isUnlocked ? (
                      <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 rounded-lg cursor-pointer transition-all inline-flex items-center justify-center gap-1">
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar Archivos</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleBuyStudy(study.id, study.price, study.title)}
                        className="w-full bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-700 text-white font-semibold text-xs py-2 rounded-lg cursor-pointer transition-all inline-flex items-center justify-center gap-1"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>Desbloquear</span>
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>

          </div>

          {/* Wallet and stats row sidebar */}
          <div className="space-y-4">
            
            {/* Wallet panel */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-4 shadow-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-slate-800">
                <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider inline-flex items-center gap-1.5">
                  <Coins className="w-4.5 h-4.5 text-teal-600 animate-spin" />
                  <span>Billetera PerioPay Wallet</span>
                </span>
                <span className="text-[10px] bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded text-emerald-500 font-bold border border-slate-100 dark:border-slate-800">
                  Activa
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block ml-0.5">FONDOS TOTALES ACUMULADOS POR ESTUDIOS:</span>
                <h3 className="text-3xl font-display font-semibold text-teal-600 dark:text-teal-400 tracking-tight">${earnings.toFixed(2)} USD</h3>
              </div>

              <div className="p-3 bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border border-emerald-500/10 rounded-xl text-[10px] leading-relaxed font-light">
                Tus cobros acumulados son transferidos automáticamente a tu cuenta clíinica los días 25 de cada mes de forma recurrente.
              </div>

              {/* Transactions log */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 block tracking-wider">Historial de Cobros Recientes:</span>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px] font-sans">
                  {walletHistory.map((item) => (
                    <div key={item.id} className="py-2 flex justify-between items-center">
                      <div className="truncate pr-4 flex-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">{item.desc}</span>
                        <span className="text-[10px] text-slate-400 font-normal block">{item.date}</span>
                      </div>
                      <span className={`font-mono font-bold shrink-0 ${item.amount < 0 ? "text-red-500" : "text-emerald-600"}`}>
                        {item.amount < 0 ? "" : "+"}${item.amount.toFixed(2)} USD
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}
      </div>
    </div>
  );
}
