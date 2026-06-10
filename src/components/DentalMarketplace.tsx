import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Tag, 
  Search, 
  PlusCircle, 
  Filter, 
  MessageCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Trash2, 
  Layers, 
  Sparkles, 
  Info, 
  CheckCircle,
  Clock,
  ShieldCheck,
  ChevronDown,
  X,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface DentalListing {
  id: string;
  title: string;
  category: "Consumibles" | "Piezas de Mano" | "Instrumental" | "Equipamiento" | "Ortodoncia/Endodoncia" | "Otros";
  condition: "Nuevo" | "Usado - Como nuevo" | "Usado - Buen estado" | "Para repuesto";
  price: number;
  currency: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  location: string;
  description: string;
  createdAt: string;
  isMine?: boolean;
}

const DEFAULT_LISTINGS: DentalListing[] = [
  {
    id: "lst-1",
    title: "Turbina NSK FX205 M4 con Luz LED",
    category: "Piezas de Mano",
    condition: "Nuevo",
    price: 185000,
    currency: "CLP",
    sellerName: "Dra. Camila Toledo",
    sellerEmail: "camila.toledo@odontomail.com",
    sellerPhone: "+56 9 7788 9911",
    location: "Santiago Centro, Metropolitana",
    description: "Turbina con cabezal estándar, rodamiento de cerámica y acople de 4 vías. Totalmente nueva en caja sellada por error en importación. Garantía de fábrica vigente (6 meses).",
    createdAt: "Hace 1 día"
  },
  {
    id: "lst-2",
    title: "Kit Quirúrgico Curetas Gracey Hu-Friedy (7 piezas)",
    category: "Instrumental",
    condition: "Usado - Como nuevo",
    price: 120000,
    currency: "CLP",
    sellerName: "Dr. Ignacio León",
    sellerEmail: "ignacio.leon@periodash.cl",
    sellerPhone: "+56 9 8234 1928",
    location: "Providencia, Metropolitana",
    description: "Kit completo de curetas Gracey EverEdge 2.0. Un solo uso académico, perfectamente afiladas y esterilizadas químicamente. En caja organizadora original Hu-Friedy.",
    createdAt: "Hace 2 días",
    isMine: true
  },
  {
    id: "lst-3",
    title: "Lámpara de Fotocurado LED Elipar DeepCure-S 3M ESPE",
    category: "Equipamiento",
    condition: "Usado - Buen estado",
    price: 380000,
    currency: "CLP",
    sellerName: "Dr. Francisco Valdés",
    sellerEmail: "f.valdes@ortodonciachile.cl",
    sellerPhone: "+56 9 9544 3322",
    location: "Concepción, Biobío",
    description: "Lámpara inalámbrica de fotocurado de alta gama con carcasa de acero inoxidable. Excelente distribución de luz para polimerizaciones homogéneas. 2 años de uso clínico moderado.",
    createdAt: "Hace 4 días"
  },
  {
    id: "lst-4",
    title: "Kit 5 Tubos Composite Filtek Z250 3M ESPE (Jeringas)",
    category: "Consumibles",
    condition: "Nuevo",
    price: 65000,
    currency: "CLP",
    sellerName: "Dra. Carmen González",
    sellerEmail: "carmen.g@dentalclinicas.cl",
    sellerPhone: "+56 9 8833 4455",
    location: "Viña del Mar, Valparaíso",
    description: "Tonos A1, A2, A3, B2 y Opaco. Vencimiento prolongado para marzo de 2028. Sellados de fábrica. Vendo por cambio de marca preferencial.",
    createdAt: "Hace 5 días"
  },
  {
    id: "lst-5",
    title: "Localizador de Ápices Digital Woodpecker Woodpex V",
    category: "Ortodoncia/Endodoncia",
    condition: "Nuevo",
    price: 110000,
    currency: "CLP",
    sellerName: "Dr. Marcelo Tapia",
    sellerEmail: "m.tapia.endo@gmail.com",
    sellerPhone: "+56 9 7654 3210",
    location: "Las Condes, Metropolitana",
    description: "Modelo de quinta generación, pantalla LCD brillante y alertas por sonido. Gran precisión clínica en endodoncias complejas. Incluye todos los clips labiales y accesorios originales.",
    createdAt: "Hace 1 semana"
  },
  {
    id: "lst-6",
    title: "Fórceps Dentales de Extracción Adulto (Set de 5)",
    category: "Instrumental",
    condition: "Usado - Buen estado",
    price: 75000,
    currency: "CLP",
    sellerName: "Dra. Paula Rivas",
    sellerEmail: "p_rivas_dent@live.com",
    sellerPhone: "+56 9 9988 7766",
    location: "Antofagasta",
    description: "Fórceps para molar superior, molar inferior, premolares y restos radiculares. Acero de grado quirúrgico médico alemán, esterilizable en autoclave. Tienen marcas mínimas de uso estético pero 100% funcionales.",
    createdAt: "Hace 1 semana"
  }
];

export default function DentalMarketplace() {
  const [listings, setListings] = useState<DentalListing[]>(() => {
    const saved = localStorage.getItem("perioDentalListings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_LISTINGS;
      }
    }
    return DEFAULT_LISTINGS;
  });

  // Filters State
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [selectedCondition, setSelectedCondition] = useState<string>("Todos");
  const [activeSubTab, setActiveSubTab] = useState<"explorer" | "mine">("explorer");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc">("newest");

  // Interaction State
  const [activeContactItem, setActiveContactItem] = useState<DentalListing | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // New Listing Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<DentalListing["category"]>("Consumibles");
  const [newCondition, setNewCondition] = useState<DentalListing["condition"]>("Nuevo");
  const [newPrice, setNewPrice] = useState("");
  const [newCurrency, setNewCurrency] = useState("CLP");
  const [newSellerName, setNewSellerName] = useState("Doctor PerioDash");
  const [newSellerEmail, setNewSellerEmail] = useState("contacto@clinica.cl");
  const [newSellerPhone, setNewSellerPhone] = useState("+56 9 ");
  const [newLocation, setNewLocation] = useState("Santiago, Metropolitana");
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    localStorage.setItem("perioDentalListings", JSON.stringify(listings));
  }, [listings]);

  // Load current user context if available to prefill listing contact info
  useEffect(() => {
    const userSaved = localStorage.getItem("perioActiveUser");
    if (userSaved) {
      try {
        const u = JSON.parse(userSaved);
        if (u.name) setNewSellerName(u.name);
        if (u.email) setNewSellerEmail(u.email);
      } catch (e) {}
    }
  }, []);

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice || !newDescription) return;

    const parsedPrice = parseFloat(newPrice.replace(/[^0-9]/g, ""));
    if (isNaN(parsedPrice) || parsedPrice <= 0) return;

    const newItem: DentalListing = {
      id: `lst-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      condition: newCondition,
      price: parsedPrice,
      currency: newCurrency,
      sellerName: newSellerName,
      sellerEmail: newSellerEmail,
      sellerPhone: newSellerPhone,
      location: newLocation,
      description: newDescription,
      createdAt: "Recién publicado",
      isMine: true
    };

    setListings([newItem, ...listings]);
    setShowAddModal(false);
    
    // Clear form
    setNewTitle("");
    setNewPrice("");
    setNewDescription("");
    
    // Show toast notification
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleDeleteListing = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("¿Estás seguro de que deseas eliminar permanentemente esta publicación?")) {
      setListings(listings.filter(l => l.id !== id));
      if (activeContactItem?.id === id) setActiveContactItem(null);
    }
  };

  const handleOpenContact = (item: DentalListing) => {
    setActiveContactItem(item);
    setContactMessage(`Hola ${item.sellerName}, estoy interesado en tu producto "${item.title}" publicado en el Mercado PerioDash. ¿Sigue disponible?`);
  };

  const handleSendSimulation = (item: DentalListing) => {
    // Open preset Whatsapp / Email or simulate beautifully
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(item.sellerPhone)}&text=${encodeURIComponent(contactMessage)}`;
    window.open(whatsappUrl, "_blank");
    setActiveContactItem(null);
  };

  // Filter listings
  const filteredListings = listings.filter(item => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                        item.description.toLowerCase().includes(search.toLowerCase()) ||
                        item.sellerName.toLowerCase().includes(search.toLowerCase());
    
    const matchCategory = selectedCategory === "Todos" || item.category === selectedCategory;
    const matchCondition = selectedCondition === "Todos" || item.condition === selectedCondition;
    const matchUserTab = activeSubTab === "mine" ? item.isMine : true;

    return matchSearch && matchCategory && matchCondition && matchUserTab;
  });

  // Sort listings
  const sortedAndFilteredListings = [...filteredListings].sort((a, b) => {
    if (sortBy === "price_asc") {
      return a.price - b.price;
    } else if (sortBy === "price_desc") {
      return b.price - a.price;
    } else {
      // Newest first - putting newly generated items first by their date/id index
      return b.id.localeCompare(a.id);
    }
  });

  const categories = ["Todos", "Consumibles", "Piezas de Mano", "Instrumental", "Equipamiento", "Ortodoncia/Endodoncia", "Otros"];
  const conditions = ["Todos", "Nuevo", "Usado - Como nuevo", "Usado - Buen estado", "Para repuesto"];

  return (
    <div className="space-y-6" id="dental-marketplace-root">
      
      {/* Dynamic Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-teal-600 dark:bg-teal-500 text-white font-bold p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-teal-400 select-none cursor-pointer"
            onClick={() => setShowSuccessToast(false)}
          >
            <CheckCircle className="w-5 h-5 text-white animate-bounce" />
            <div>
              <p className="text-sm">¡Publicación exitosa!</p>
              <p className="text-[10px] opacity-90 font-mono">Tu material ya está disponible para el gremio clínico.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner Section */}
      <div className="bg-white dark:bg-slate-900 duration-200 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm relative overflow-hidden bg-gradient-to-r from-transparent via-teal-50/10 to-teal-50/20 dark:via-teal-950/5 dark:to-teal-900/10">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 font-extrabold text-[9px] rounded-full uppercase tracking-wider border border-teal-500/20">
              Gremio & Colegas PerioDash
            </span>
          </div>
          <h2 className="text-xl font-display font-black text-slate-800 dark:text-white flex items-center gap-2 mt-1">
            <ShoppingBag className="w-5.5 h-5.5 text-teal-600 dark:text-teal-400" />
            <span>Mercado Dental Colaborativo</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl font-normal leading-relaxed">
            Compra y vende instrumental médico, piezas de mano, autoclaves o excedente de insumos garantizados de colega a colega. Optimiza costos con materiales nuevos o de segunda mano en perfecto estado de esterilización.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer transition-all shadow-md active:scale-98 flex items-center gap-2 self-stretch md:self-center shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Vender mi Material</span>
        </button>
      </div>

      {/* Primary Explorer Selector Sub-tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 flex-shrink-0 w-full overflow-x-auto select-none">
        <button
          onClick={() => setActiveSubTab("explorer")}
          className={`flex-1 py-2 px-4 whitespace-nowrap rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
            activeSubTab === "explorer"
              ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-md scale-[1.01]"
              : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          Explorar Productos ({listings.length})
        </button>
        <button
          onClick={() => setActiveSubTab("mine")}
          className={`flex-1 py-2 px-4 whitespace-nowrap rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
            activeSubTab === "mine"
              ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-md scale-[1.01]"
              : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          Mis Publicaciones ({listings.filter(l => l.isMine).length})
        </button>
      </div>

      {/* Filter and Search controls bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Search Bar */}
        <div className="lg:col-span-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por marca, instrumental o insumo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/25 duration-150 text-slate-800 dark:text-slate-200 shadow-xs"
          />
        </div>

        {/* Categories Select Dropdown */}
        <div className="lg:col-span-3 flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:block shrink-0 select-none">Filtro:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full text-xs p-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === "Todos" ? "Todas las Categorías" : c}</option>
            ))}
          </select>
        </div>

        {/* Conditions Select Dropdown */}
        <div className="lg:col-span-3">
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="w-full text-xs p-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            {conditions.map(cond => (
              <option key={cond} value={cond}>{cond === "Todos" ? "Cualquier Estado" : cond}</option>
            ))}
          </select>
        </div>

        {/* Sort select dropdown */}
        <div className="lg:col-span-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full text-xs p-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="newest">Más Recientes</option>
            <option value="price_asc">Precio: Bajo a Alto</option>
            <option value="price_desc">Precio: Alto a Bajo</option>
          </select>
        </div>
      </div>

      {/* Grid of Listings */}
      <motion.div 
        layout 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        id="listings-grid"
      >
        <AnimatePresence mode="popLayout">
          {sortedAndFilteredListings.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-5 flex flex-col justify-between hover:border-teal-500/30 dark:hover:border-teal-500/30 hover:shadow-lg dark:hover:shadow-teal-950/20 transition-all duration-300 relative group overflow-hidden"
            >
              {/* Product Background Accents */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal-500/5 to-transparent rounded-bl-full pointer-events-none group-hover:scale-105 duration-300" />
              
              <div className="space-y-4">
                {/* Visual Badges Row */}
                <div className="flex justify-between items-center select-none">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                    item.condition === "Nuevo" 
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : item.condition.includes("Como nuevo")
                      ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/25"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  }`}>
                    {item.condition}
                  </span>

                  <span className="text-[10px] font-medium text-slate-400 font-mono inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {item.createdAt}
                  </span>
                </div>

                {/* Main title and Category */}
                <div className="space-y-1">
                  <div className="text-[9px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">{item.category}</div>
                  <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100 leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-150 line-clamp-1">
                    {item.title}
                  </h3>
                </div>

                {/* Description snippet */}
                <p className="text-[11px] text-slate-400 dark:text-slate-400 font-normal leading-relaxed line-clamp-3">
                  {item.description}
                </p>

                {/* Seller and Location summary */}
                <div className="pt-3 border-t border-slate-50 dark:border-slate-800/80 space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-350">
                    <div className="w-4 h-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full flex items-center justify-center font-extrabold text-[8px] border border-slate-200 dark:border-slate-700">
                      {item.sellerName.charAt(0)}
                    </div>
                    <span className="font-bold truncate">{item.sellerName} {item.isMine && <span className="text-[9px] text-teal-600 dark:text-teal-400 font-extrabold">(Tú)</span>}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{item.location}</span>
                  </div>
                </div>
              </div>

              {/* Price and Action Buttons Footer */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 -mx-5 -mb-5 p-5 flex justify-between items-center gap-2">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">Precio</span>
                  <span className="font-mono text-base font-black text-slate-800 dark:text-white select-text">
                    {item.currency === "CLP" ? `$${item.price.toLocaleString("es-CL")}` : `${item.currency} ${item.price.toLocaleString("en-US")}`}
                  </span>
                </div>

                <div className="flex gap-1.5">
                  {item.isMine ? (
                    <button
                      onClick={(e) => handleDeleteListing(item.id, e)}
                      className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl cursor-pointer border border-red-100 dark:border-red-900/30 transition-all"
                      title="Eliminar Publicación"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenContact(item)}
                      className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold text-xs py-2 px-3.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shadow-sm shadow-teal-600/10 active:scale-97"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Contactar</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {sortedAndFilteredListings.length === 0 && (
          <div className="col-span-full bg-slate-50 dark:bg-slate-800/40 py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl space-y-4">
            <ShoppingBag className="w-12 h-12 text-slate-350 dark:text-slate-650 mx-auto animate-pulse" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300">No se encontraron productos</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto font-light">Prueba ajustando los filtros de búsqueda o alternando las pestañas superior.</p>
            </div>
            <button
              onClick={() => { setSearch(""); setSelectedCategory("Todos"); setSelectedCondition("Todos"); }}
              className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold py-2 px-4 rounded-xl cursor-pointer hover:bg-slate-300 duration-150"
            >
              Restablecer Filtros
            </button>
          </div>
        )}
      </motion.div>

      {/* MODAL: Add New Listing Form */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-6 rounded-2xl w-full max-w-2xl max-h-[90svh] overflow-y-auto shadow-2xl relative block"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-100 bg-slate-50 dark:bg-slate-800 hover:bg-slate-150 dark:hover:bg-slate-750 rounded-xl cursor-pointer transition-all duration-150"
              >
                <X className="w-4 h-4" />
              </button>

              <form onSubmit={handleCreateListing} className="space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-display font-black text-lg text-slate-800 dark:text-white flex items-center gap-2">
                    <Tag className="w-5 h-5 text-teal-600 dark:text-teal-400 animate-pulse" />
                    <span>Publicar Material Dental</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-normal">Ofrece insumos excedentes, piezas, instrumental o mobiliario en perfectas condiciones.</p>
                </div>

                <div className="space-y-4">
                  {/* Title Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Título de la publicación:</label>
                    <input
                      type="text"
                      placeholder="P. ej., Unidad de ultrasonido Piezoeléctrico Woodpecker U600"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800 dark:text-slate-100"
                      required
                    />
                  </div>

                  {/* Category and Condition Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Categoría de Material:</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as any)}
                        className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:focus:ring-2 focus:ring-teal-500/20"
                        required
                      >
                        <option value="Consumibles">Consumibles (Resinas, Alginatos...)</option>
                        <option value="Piezas de Mano">Piezas de Mano (Turbina, Contras...)</option>
                        <option value="Instrumental">Instrumental Odontológico</option>
                        <option value="Equipamiento">Equipamiento Clínico Grande</option>
                        <option value="Ortodoncia/Endodoncia">Endodoncia / Ortodoncia</option>
                        <option value="Otros">Otros Materiales</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estado del Material:</label>
                      <select
                        value={newCondition}
                        onChange={(e) => setNewCondition(e.target.value as any)}
                        className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:focus:ring-2 focus:ring-teal-500/20"
                        required
                      >
                        <option value="Nuevo">Completamente Nuevo (Sello de fábrica)</option>
                        <option value="Usado - Como nuevo">Segunda mano - Como nuevo (Poco uso)</option>
                        <option value="Usado - Buen estado">Segunda mano - Buen estado (100% funcional)</option>
                        <option value="Para repuesto">Para repuestos / Detalles estéticos</option>
                      </select>
                    </div>
                  </div>

                  {/* Price Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Valor de Venta ($):</label>
                      <input
                        type="text"
                        placeholder="P. ej., 150000"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800 dark:text-slate-100 font-mono"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Divisa:</label>
                      <select
                        value={newCurrency}
                        onChange={(e) => setNewCurrency(e.target.value)}
                        className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
                      >
                        <option value="CLP">CLP ($)</option>
                        <option value="USD">USD (Dólares)</option>
                      </select>
                    </div>
                  </div>

                  {/* Seller Details Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-3 md:space-y-0">
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-slate-450 dark:text-slate-400 font-bold uppercase tracking-wider block">Tu Nombre de Contacto:</label>
                      <input
                        type="text"
                        value={newSellerName}
                        onChange={(e) => setNewSellerName(e.target.value)}
                        className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-slate-450 dark:text-slate-400 font-bold uppercase tracking-wider block">WhatsApp / Teléfono:</label>
                      <input
                        type="text"
                        value={newSellerPhone}
                        onChange={(e) => setNewSellerPhone(e.target.value)}
                        className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 outline-none font-mono"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-slate-450 dark:text-slate-400 font-bold uppercase tracking-wider block">Ubicación / Región:</label>
                      <input
                        type="text"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Description Form */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Descripción del Producto, Esterilización o Empaque (sé detallado):</label>
                    <textarea
                      placeholder="Explica el origen, tiempo de uso, marcas de desgaste, accesorios que incluye o por qué vendes el material quirúrgico."
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      rows={4}
                      className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800 dark:text-slate-100 resize-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer duration-150"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md duration-150 flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Publicar Ahora</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Contact Seller / Live simulation sheet */}
      <AnimatePresence>
        {activeContactItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => setActiveContactItem(null)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-100 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer transition-all duration-150"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-display font-black text-base text-slate-800 dark:text-white">Contactar Dentista / Colega</h3>
                  <p className="text-xs text-slate-450 dark:text-slate-400">Ponte en contacto directo para acordar pago o programar entrega física del material.</p>
                </div>

                {/* Listing Summary Row */}
                <div className="p-3 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center font-black text-lg">
                    {activeContactItem.title.charAt(0)}
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">{activeContactItem.title}</h4>
                    <span className="font-mono text-[11px] font-extrabold text-teal-600 dark:text-teal-400">
                      {activeContactItem.currency === "CLP" ? `$${activeContactItem.price.toLocaleString("es-CL")}` : `${activeContactItem.currency} ${activeContactItem.price.toLocaleString("en-US")}`}
                    </span>
                  </div>
                </div>

                {/* Direct info list */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2.5 p-1 text-slate-600 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span><strong>Sector:</strong> {activeContactItem.location}</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-1 text-slate-600 dark:text-slate-300">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="font-mono"><strong>WhatsApp:</strong> {activeContactItem.sellerPhone}</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-1 text-slate-600 dark:text-slate-300">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="truncate"><strong>Email:</strong> {activeContactItem.sellerEmail}</span>
                  </div>
                </div>

                {/* Pre-written message box */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Mensaje preestablecido:</label>
                  <textarea
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    rows={3}
                    className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-slate-100 resize-none font-normal"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <a 
                    href={`mailto:${activeContactItem.sellerEmail}?subject=Interés en ${encodeURIComponent(activeContactItem.title)}&body=${encodeURIComponent(contactMessage)}`}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-150 font-bold text-xs rounded-xl cursor-pointer text-center duration-150 inline-flex items-center justify-center gap-1.5"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Enviar Email</span>
                  </a>

                  <button
                    onClick={() => handleSendSimulation(activeContactItem)}
                    className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl cursor-pointer duration-150 flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Ir a WhatsApp</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 text-[10px] text-amber-600 dark:text-amber-400 font-normal leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Para tu seguridad, realiza transacciones en clínicas acreditadas. PerioDash declina responsabilidad comercial de transbrokering.</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
