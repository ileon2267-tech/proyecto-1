export interface ToothState {
  toothNumber: number;
  surfaces: {
    vestibular: "sano" | "caries" | "obturado";
    occlusal: "sano" | "caries" | "obturado"; // or incisal
    lingual: "sano" | "caries" | "obturado";  // or palatino
    mesial: "sano" | "caries" | "obturado";
    distal: "sano" | "caries" | "obturado";
  };
  condition: "sano" | "ausente" | "corona" | "endodoncia" | "implante";
}

export interface PeriodonState {
  toothNumber: number;
  // Pocket depth (sondaje)
  vestibularPocket: { mesial: number; central: number; distal: number; };
  palatinoPocket: { mesial: number; central: number; distal: number; };
  // Gingival recession (recesion)
  vestibularRecess: { mesial: number; central: number; distal: number; };
  palatinoRecess: { mesial: number; central: number; distal: number; };
  // Sangrado al sondaje (true/false index for mesial, central, distal surfaces)
  sangradoVestibular: { mesial: boolean; central: boolean; distal: boolean };
  sangradoPalatino: { mesial: boolean; central: boolean; distal: boolean };
  // Supuration
  supuracionVestibular: { mesial: boolean; central: boolean; distal: boolean };
  supuracionPalatino: { mesial: boolean; central: boolean; distal: boolean };
  // Placa bacteriana
  placaVestibular: { mesial: boolean; central: boolean; distal: boolean };
  placaPalatino: { mesial: boolean; central: boolean; distal: boolean };
  
  movilidad: 0 | 1 | 2 | 3;
  furca: 0 | 1 | 2 | 3; // furcation involvement
}

export interface OLearyState {
  toothNumber: number;
  mesial: boolean;
  distal: boolean;
  vestibular: boolean;
  lingual: boolean;
}

export interface Anamnesis {
  motivoConsulta?: string;
  historiaMotivoConsulta?: string;
  hta: boolean;
  diabetes: boolean;
  diabetesStatus?: "none" | "controlled" | "severe";
  tabaquismo: number; // cigarrillos/dia
  alergias: string;
  dolorActual: "ninguno" | "leve" | "pulsatil" | "agudo";
  notasSistemicas: string;
  edadSimulada?: number;
}

export interface XRayImage {
  id: string;
  url: string;
  date: string;
  type: "panoramica" | "periapical" | "bite-wing";
  notes: string;
}

export interface TreatmentProcedure {
  id: string;
  phase: "Diagnostico" | "Saneamiento" | "Rehabilitacion" | "Mantenimiento";
  description: string;
  cost: number;
  completed: boolean;
}

export interface TreatmentPlan {
  procedures: TreatmentProcedure[];
  financing: {
    months: number;
    downPayment: number;
    interestRate: number; // annual percentage
  };
}

export interface Evolution {
  id: string;
  date: string;
  description: string;
  professional: string;
}

export interface Consentimiento {
  id: string;
  date: string;
  documentType: string;
  signature: string | null; // null if not signed
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  birthdate: string;
  createdAt: string;
  odontogram: Record<number, ToothState>;
  periodontogram: Record<number, PeriodonState>;
  oLeary: Record<number, OLearyState>;
  anamnesis: Anamnesis;
  xRays: XRayImage[];
  treatmentPlan: TreatmentPlan;
  evolutions: Evolution[];
  consentimientos?: Consentimiento[];
  activeSpecialty?: string;
  specialtyData?: Record<string, any>;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  treatment: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  box?: string; // e.g., "Sillón 1", "Sillón 2", "Sillón 3"
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ClinicalUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  profile: 'particular' | 'clinica' | 'universidad' | 'cliente';
  role: 'odontologo' | 'admin' | 'cliente';
  specialty?: string;
  createdAt: string;
}

