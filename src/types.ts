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

  // Parámetros Críticos de Seguridad Clínica y Bioseguridad Multidisciplinaria
  anticoagulantes?: boolean;
  tipoAnticoagulante?: string; // e.g. "Warfarina", "Sintrom", "Rivaroxabán", "Aspirina"
  valorINR?: string; // Valor de INR (e.g. "2.3", alerta si > 3.0 para cirugía/sondaje)
  bifosfonatos?: boolean;
  viaBifosfonatos?: "oral" | "intravenoso" | "ninguno"; // Alerta Roja de Osteonecrosis (MRONJ)
  profilaxisAntibiotica?: boolean;
  razonProfilaxis?: string; // e.g. "Prótesis valvular", "Cardiopatía congénita", "Prótesis articular"
  presionSistolica?: number; // mmHg (e.g. 120, alerta si >= 140)
  presionDiastolica?: number; // mmHg (e.g. 80, alerta si >= 90)
  alergiaAnestesia?: string; // e.g. "Lidocaína", "Articaína", "Epinefrina/Bisulfito", "Ninguna"
  alergiaLatex?: boolean;
  embarazo?: boolean;
  trimestreEmbarazo?: 1 | 2 | 3;
  biotipoPeriodontal?: "fino" | "medio" | "grueso"; // Para riesgo de recesión e implantes
}

export interface XRayImage {
  id: string;
  url: string;
  date: string;
  type: "panoramica" | "periapical" | "bite-wing";
  notes: string;
}

export interface InformedConsentRecord {
  accepted: boolean;
  acceptedAt: string;
  patientName?: string;
  patientDocumentId?: string;
  signatureDataUrl?: string; // Digital signature canvas URL
  photoEvidenceUrl?: string; // Camera snapshot or file upload
  verificationMethod: 'signature' | 'camera' | 'both' | 'mobile_qr';
  notes?: string;
  templateCategory?: string;
  customClauses?: string;
  customRisks?: string;
  shareToken?: string;
}

export interface TreatmentProcedure {
  id: string;
  phase: "Diagnostico" | "Saneamiento" | "Rehabilitacion" | "Mantenimiento";
  description: string;
  cost: number;
  completed: boolean;
  tooth?: string; // e.g. "1.4" or "Arcada Superior"
  surface?: string; // e.g. "Mesial", "Vestibular", "Todas"
  discount?: number; // percentage
  informedConsent?: InformedConsentRecord;
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

export interface PeriodontogramVisit {
  id: string;
  date: string;
  title: string;
  oLearyScore: number;
  bopScore: number; // Bleeding on Probing %
  meanPocketDepth: number; // Average sondaje in mm
  notes?: string;
  periodontogram: Record<number, PeriodonState>;
}

export type PatientStatus = 'evaluacion' | 'en_tratamiento' | 'mantenimiento' | 'alta' | 'inactivo';

export type ClinicalFlowStatus = 'programado' | 'espera' | 'en_sillon' | 'atendido' | 'completado' | 'ausente' | 'cancelado';

export interface PeriodontalRisk {
  stage: 'I' | 'II' | 'III' | 'IV';
  grade: 'A' | 'B' | 'C';
  riskLevel: 'bajo' | 'medio' | 'alto';
}

export interface CustomSpecialtyMarker {
  id: string;
  specialty: string; // 'endodoncia' | 'ortodoncia' | 'odontopediatria' | 'cirugia' | 'estetica' | 'periodoncia'
  title: string;
  toothNumber?: number;
  severityLevel: 'normal' | 'leve' | 'moderado' | 'severo' | 'critico';
  color: string; // Tailwind color token or hex
  scoreValue?: number;
  scaleMax?: number;
  notes?: string;
  createdAt: string;
}

export interface ClinicalPhoto {
  id: string;
  url: string;
  date: string;
  category: "facial" | "intraoral" | "oclusal" | "perfil" | "sonrisa" | "antes_despues";
  tag: "antes" | "despues" | "seguimiento";
  notes?: string;
}

export interface PatientCommunication {
  id: string;
  date: string;
  type: "whatsapp" | "email" | "sms";
  template: "recordatorio_cita" | "postoperatorio" | "presupuesto" | "higiene_mantenimiento" | "custom";
  recipient: string;
  message: string;
  status: "sent" | "failed" | "queued";
}

export interface PaymentTransaction {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  amount: number;
  method: "webpay" | "mercadopago" | "stripe" | "transferencia" | "efectivo" | "tarjeta_pos";
  status: "completed" | "pending" | "failed";
  concept: string;
  receiptNumber?: string;
  transactionRef?: string;
  paymentGateway?: string;
}

export interface Patient {
  id: string;
  name: string;
  rut?: string;
  dni?: string;
  phone: string;
  email: string;
  notes: string;
  birthdate: string;
  createdAt: string;
  status?: PatientStatus;
  flowStatus?: ClinicalFlowStatus;
  chairAssigned?: string; // e.g. "Sillón 1", "Sillón 2", "Gabinete Quirúrgico"
  checkInTime?: string; // e.g. "15:10"
  statusUpdatedAt?: string;
  periodontalRisk?: PeriodontalRisk;
  lastVisitDate?: string;
  odontogram: Record<number, ToothState>;
  periodontogram: Record<number, PeriodonState>;
  periodontogramHistory?: PeriodontogramVisit[];
  oLeary: Record<number, OLearyState>;
  anamnesis: Anamnesis;
  xRays: XRayImage[];
  clinicalPhotos?: ClinicalPhoto[];
  communications?: PatientCommunication[];
  treatmentPlan: TreatmentPlan;
  evolutions: Evolution[];
  consentimientos?: Consentimiento[];
  payments?: PaymentTransaction[];
  activeSpecialty?: string;
  specialtyData?: Record<string, any>;
  customSpecialtyMarkers?: CustomSpecialtyMarker[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  treatment: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  flowStatus?: ClinicalFlowStatus;
  box?: string; // e.g., "Sillón 1", "Sillón 2", "Sillón 3"
  googleCalendarEventId?: string;
  googleCalendarSyncedAt?: string;
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

