import React, { useState, useRef, useEffect } from 'react';
import { TreatmentProcedure, Patient, InformedConsentRecord } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileCheck, 
  Camera, 
  PenTool, 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  RefreshCw, 
  ShieldCheck, 
  User, 
  CreditCard, 
  Upload, 
  Eye, 
  Printer, 
  Check,
  Lock,
  QrCode,
  Send,
  Edit3,
  FileText,
  Smartphone,
  Copy,
  Share2,
  Sparkles
} from 'lucide-react';

interface InformedConsentModalProps {
  procedure: TreatmentProcedure;
  patient: Patient;
  onSaveConsent: (procedureId: string, consent: InformedConsentRecord) => void;
  onClose: () => void;
}

const CONSENT_TEMPLATES: Record<string, { title: string; categoryName: string; clauses: string; risks: string }> = {
  general: {
    title: 'Odontología General y Restauradora',
    categoryName: 'General / Operatoria',
    clauses: 'Declaró haber sido informado minuciosamente sobre el diagnóstico, beneficios, alternativas y costos de las restauraciones o procedimientos conservadores. Autorizo el uso de anestésicos locales y materiales odontológicos normados.',
    risks: 'Posible sensibilidad dental transitoria al frío/calor, hiperemia pulpar leve o necesidad de ajuste oclusal complementario post-atención.'
  },
  endodoncia: {
    title: 'Endodoncia y Tratamiento de Conducto',
    categoryName: 'Endodoncia',
    clauses: 'El profesional me ha explicado la necesidad de instrumentar, desinfectar y obturar los conductos radiculares de la pieza dentaria para eliminar infección o inflamación irrecuperable y así conservar la pieza en boca.',
    risks: 'Riesgo de molestia inflamatoria post-operatoria, fractura instrumental atípica por anatomía compleja, sobreobturación o requerimiento futuro de re-endodoncia o cirugía periapical.'
  },
  cirugia: {
    title: 'Cirugía Oral e Implantología',
    categoryName: 'Cirugía / Implantes',
    clauses: 'Comprendo que el procedimiento quirúrgico requiere incisiones, colgajos, osteotomía, extracción o colocación de implantes con anestesia local. Prometo seguir estrictamente la pauta antibiótica e indicaciones de reposo.',
    risks: 'Proceso inflamatorio (edema/equimosis), parestesia nerviosa temporal o permanente en labio/lengua, sangrado post-quirúrgico o falta de osteointegración en implantes.'
  },
  periodoncia: {
    title: 'Periodoncia y Terapia Soporte',
    categoryName: 'Periodoncia',
    clauses: 'Autorizo el tratamiento periodontal de destartraje, raspado y alisado radicular para frenar la destrucción de soporte óseo y sangrado de encías.',
    risks: 'Sensibilidad dentinaria térmica, recesión gingival fisiológica por desinflamación, mayor espacio interdental y movilidad dentaria temporal.'
  },
  ortodoncia: {
    title: 'Ortodoncia y Alineación Dental',
    categoryName: 'Ortodoncia',
    clauses: 'Acepto la instalación y controles de aparatología de ortodoncia para corregir maloclusiones y restablecer la alineación funcional y estética.',
    risks: 'Uso de fuerzas ortodóncicas puede ocasionar molestias masticatorias iniciales, ulceraciones de mucosa por roce, reabsorción radicular leve o recidiva sin uso de retenedores.'
  },
  estetica: {
    title: 'Estética Dental y Blanqueamiento',
    categoryName: 'Estética',
    clauses: 'He sido informado sobre el protocolo de blanqueamiento / carillas y las expectativas reales de tonalidad según mi esmalte natural.',
    risks: 'Sensibilidad dentaria aguda transitoria durante o post-tratamiento, iridiscencias y restricción estricta de alimentos o bebidas con pigmentos.'
  }
};

export const InformedConsentModal: React.FC<InformedConsentModalProps> = ({
  procedure,
  patient,
  onSaveConsent,
  onClose
}) => {
  const existingConsent = procedure.informedConsent;
  const isAlreadySigned = existingConsent?.accepted;

  // Infer initial template based on procedure description
  const detectTemplateKey = () => {
    if (existingConsent?.templateCategory) return existingConsent.templateCategory;
    const desc = procedure.description.toLowerCase();
    if (desc.includes('endo') || desc.includes('conducto') || desc.includes('pulpar')) return 'endodoncia';
    if (desc.includes('cirug') || desc.includes('implante') || desc.includes('extracción') || desc.includes('exodoncia')) return 'cirugia';
    if (desc.includes('perio') || desc.includes('raspado') || desc.includes('destartraje') || desc.includes('profila')) return 'periodoncia';
    if (desc.includes('orto') || desc.includes('bracket') || desc.includes('alinead')) return 'ortodoncia';
    if (desc.includes('blanquea') || desc.includes('carilla') || desc.includes('estéti')) return 'estetica';
    return 'general';
  };

  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>(detectTemplateKey());
  const activeTemplate = CONSENT_TEMPLATES[selectedTemplateKey] || CONSENT_TEMPLATES.general;

  // Custom Clauses Editor State
  const [isEditingClauses, setIsEditingClauses] = useState<boolean>(false);
  const [customClauses, setCustomClauses] = useState<string>(
    existingConsent?.customClauses || activeTemplate.clauses
  );
  const [customRisks, setCustomRisks] = useState<string>(
    existingConsent?.customRisks || activeTemplate.risks
  );

  // Tab mode
  const [activeTab, setActiveTab] = useState<'signature' | 'camera' | 'qr_mobile'>(
    existingConsent?.verificationMethod === 'camera' ? 'camera' : 
    existingConsent?.verificationMethod === 'mobile_qr' ? 'qr_mobile' : 'signature'
  );

  // Form Fields
  const [patientName, setPatientName] = useState<string>(existingConsent?.patientName || patient.name || '');
  const [patientDocumentId, setPatientDocumentId] = useState<string>(
    existingConsent?.patientDocumentId || patient.rut || patient.dni || ''
  );
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(isAlreadySigned ? true : false);
  const [notes, setNotes] = useState<string>(existingConsent?.notes || '');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Signature Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState<boolean>(!!existingConsent?.signatureDataUrl);
  const [signatureUrl, setSignatureUrl] = useState<string | undefined>(existingConsent?.signatureDataUrl);

  // Camera State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | undefined>(existingConsent?.photoEvidenceUrl);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Simulated Verification Hash
  const verificationHash = useRef<string>(
    `PD-HASH-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString().slice(-4)}`
  ).current;

  // Update clauses when template selector changes (if not already signed)
  const handleSelectTemplate = (key: string) => {
    if (isAlreadySigned) return;
    setSelectedTemplateKey(key);
    const t = CONSENT_TEMPLATES[key] || CONSENT_TEMPLATES.general;
    setCustomClauses(t.clauses);
    setCustomRisks(t.risks);
  };

  // Initialize Canvas
  useEffect(() => {
    if (activeTab === 'signature' && canvasRef.current && !isAlreadySigned) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0284c7'; // Sky / Teal blue tone
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [activeTab, isAlreadySigned]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isAlreadySigned) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isAlreadySigned) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current && hasSignature) {
      setSignatureUrl(canvasRef.current.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setSignatureUrl(undefined);
  };

  // Camera Stream Handlers
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('No se pudo acceder a la cámara. Revisa las licencias o usa la carga de archivo adjunto.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  const takePhotoSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedPhotoUrl(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedPhotoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // WhatsApp & Link Sharing
  const mobileLink = `${window.location.origin}/consent-sign?pat=${encodeURIComponent(patient.id)}&proc=${encodeURIComponent(procedure.id)}`;
  
  const handleCopyMobileLink = () => {
    navigator.clipboard.writeText(mobileLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSendWhatsApp = () => {
    const phoneClean = (patient.phone || '').replace(/[^0.9]/g, '');
    const message = encodeURIComponent(
      `Estimado/a ${patient.name}, adjuntamos el Consentimiento Informado para el procedimiento: "${procedure.description}". Por favor revise las condiciones médicas y complete la firma digital aquí: ${mobileLink}`
    );
    window.open(`https://wa.me/${phoneClean}?text=${message}`, '_blank');
  };

  const handleConfirmConsent = () => {
    if (!acceptedTerms) return;

    let method: 'signature' | 'camera' | 'both' | 'mobile_qr' = activeTab === 'qr_mobile' ? 'mobile_qr' : activeTab;
    if (signatureUrl && capturedPhotoUrl) {
      method = 'both';
    }

    const consentRecord: InformedConsentRecord = {
      accepted: true,
      acceptedAt: new Date().toLocaleString('es-CL'),
      patientName: patientName.trim() || patient.name,
      patientDocumentId: patientDocumentId.trim() || 'N/A',
      signatureDataUrl: signatureUrl,
      photoEvidenceUrl: capturedPhotoUrl,
      verificationMethod: method,
      notes: notes.trim(),
      templateCategory: selectedTemplateKey,
      customClauses,
      customRisks,
      shareToken: verificationHash
    };

    onSaveConsent(procedure.id, consentRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col my-auto"
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 p-5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
              <ShieldCheck className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight flex items-center gap-2">
                Consentimiento Informado Odontológico
                {isAlreadySigned ? (
                  <span className="bg-emerald-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-2xs">
                    ✓ Validado y Firmado
                  </span>
                ) : (
                  <span className="bg-amber-400/20 text-amber-200 border border-amber-300/30 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                    Pendiente Firma
                  </span>
                )}
              </h3>
              <p className="text-xs text-teal-100/90 mt-0.5">
                Módulo unificado de protección legal, personalización clínica y firma móvil.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto scrollbar-thin">
          
          {/* PILLAR 2: TEMPLATE SELECTOR & MEDICAL CLAUSES EDITOR */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase text-teal-600 dark:text-teal-400 block tracking-wider">
                  Tratamiento Requerido
                </span>
                <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  {procedure.description} {procedure.tooth ? `• Pieza #${procedure.tooth}` : ''}
                </h4>
              </div>

              {/* Template Category Selector Dropdown */}
              {!isAlreadySigned && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <FileText className="w-4 h-4 text-teal-500 shrink-0" />
                  <select
                    value={selectedTemplateKey}
                    onChange={(e) => handleSelectTemplate(e.target.value)}
                    className="text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
                  >
                    {Object.entries(CONSENT_TEMPLATES).map(([k, t]) => (
                      <option key={k} value={k}>
                        Plantilla: {t.categoryName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Medical Clauses & Risks Card */}
            <div className="space-y-3 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-500" />
                  Declaración y Cláusulas del Consentimiento
                </span>
                
                {!isAlreadySigned && (
                  <button
                    type="button"
                    onClick={() => setIsEditingClauses(!isEditingClauses)}
                    className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {isEditingClauses ? 'Guardar Texto' : 'Personalizar Cláusulas'}
                  </button>
                )}
              </div>

              {isEditingClauses && !isAlreadySigned ? (
                <div className="space-y-3 p-3 bg-white dark:bg-slate-900 border border-teal-500/30 rounded-2xl">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      Texto Principal de Declaración Paciente:
                    </label>
                    <textarea
                      rows={3}
                      value={customClauses}
                      onChange={(e) => setCustomClauses(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      Riesgos Potenciales y Molestias post-atención:
                    </label>
                    <textarea
                      rows={2}
                      value={customRisks}
                      onChange={(e) => setCustomRisks(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed bg-white/60 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <p><strong className="text-slate-900 dark:text-slate-100">Declaración Médica:</strong> {customClauses}</p>
                  <p className="text-amber-700 dark:text-amber-400 font-medium">
                    <strong className="text-amber-800 dark:text-amber-300 font-extrabold">⚠️ Riesgos Aceptados:</strong> {customRisks}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* PATIENT IDENTIFICATION INPUTS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-500" />
                Nombre Completo del Paciente / Apoderado:
              </label>
              <input
                type="text"
                disabled={isAlreadySigned}
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-100 outline-none disabled:opacity-75"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-teal-500" />
                Cédula Identidad / RUN / DNI:
              </label>
              <input
                type="text"
                disabled={isAlreadySigned}
                value={patientDocumentId}
                onChange={(e) => setPatientDocumentId(e.target.value)}
                placeholder="Ej. 12.345.678-9"
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold font-mono text-slate-800 dark:text-slate-100 outline-none disabled:opacity-75"
              />
            </div>
          </div>

          {/* PILLAR 3: VALIDATION METHOD TABS (Tactile Signature, WebCam, QR Mobile) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Canal de Firma y Verificación Digital
              </span>
              
              {!isAlreadySigned && (
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => { stopCamera(); setActiveTab('signature'); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      activeTab === 'signature' ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5" /> Firma Táctil
                  </button>
                  <button
                    type="button"
                    onClick={() => { stopCamera(); setActiveTab('qr_mobile'); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      activeTab === 'qr_mobile' ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" /> QR / Móvil Paciente
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('camera')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      activeTab === 'camera' ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" /> Foto Evidencia
                  </button>
                </div>
              )}
            </div>

            {/* TAB 1: DIGITAL SIGNATURE CANVAS */}
            {activeTab === 'signature' && (
              <div className="space-y-2">
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-2 bg-slate-50/50 dark:bg-slate-950/50 relative flex flex-col items-center justify-center">
                  {isAlreadySigned && existingConsent?.signatureDataUrl ? (
                    <div className="p-4 text-center space-y-2">
                      <p className="text-[10px] font-black uppercase text-emerald-600">Firma Digital Registrada</p>
                      <img 
                        src={existingConsent.signatureDataUrl} 
                        alt="Firma Paciente" 
                        className="max-h-32 mx-auto border rounded-xl bg-white p-2 shadow-xs" 
                      />
                    </div>
                  ) : (
                    <>
                      <canvas
                        ref={canvasRef}
                        width={560}
                        height={160}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="touch-none bg-white dark:bg-slate-900 rounded-xl cursor-crosshair border border-slate-200 dark:border-slate-800 w-full"
                      />
                      <div className="flex items-center justify-between w-full pt-2 px-1">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {hasSignature ? '✓ Trazo detectado' : 'Dibuje la firma usando la pantalla táctil o mouse.'}
                        </span>
                        <button
                          type="button"
                          onClick={clearCanvas}
                          className="text-xs font-bold text-rose-500 hover:text-rose-600 cursor-pointer"
                        >
                          Limpiar Trazo
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: QR MOBILE SELF-SIGNATURE */}
            {activeTab === 'qr_mobile' && (
              <div className="p-5 border-2 border-dashed border-teal-500/30 rounded-2xl bg-teal-500/5 text-center space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  {/* Dynamic QR Code Render */}
                  <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200 shrink-0">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(mobileLink)}`}
                      alt="Escaneo QR Móvil Paciente"
                      className="w-32 h-32"
                    />
                    <span className="text-[9px] font-mono font-bold text-slate-500 block mt-1">Escanear con Cámara</span>
                  </div>

                  <div className="text-left space-y-2 max-w-xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                      Firma en Celular / Tablet
                    </span>
                    <h5 className="text-xs font-black text-slate-900 dark:text-white">
                      Permita al paciente firmar directamente en su propio teléfono
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      El paciente puede escanear el código QR o recibir el enlace por WhatsApp para leer las cláusulas y firmar con su dedo de forma cómoda y remota.
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleSendWhatsApp}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" /> Enviar por WhatsApp
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyMobileLink}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedLink ? '¡Copiado!' : 'Copiar Link'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CAMERA PHOTO CAPTURE */}
            {activeTab === 'camera' && (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950/50 text-center space-y-3">
                  
                  {capturedPhotoUrl ? (
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase text-emerald-500 block">Fotografía de Aceptación Capturada</span>
                      <img 
                        src={capturedPhotoUrl} 
                        alt="Evidencia Paciente" 
                        className="max-h-48 mx-auto rounded-2xl border-2 border-emerald-500/30 shadow-md object-cover" 
                      />
                      {!isAlreadySigned && (
                        <button
                          type="button"
                          onClick={() => { setCapturedPhotoUrl(undefined); startCamera(); }}
                          className="text-xs font-bold text-teal-600 hover:underline cursor-pointer"
                        >
                          Tomar Otra Foto
                        </button>
                      )}
                    </div>
                  ) : cameraActive ? (
                    <div className="space-y-3">
                      <div className="relative rounded-2xl overflow-hidden bg-black max-w-sm mx-auto shadow-md">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          className="w-full h-48 object-cover" 
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          En Vivo
                        </div>
                      </div>

                      <div className="flex justify-center gap-3">
                        <button
                          type="button"
                          onClick={takePhotoSnapshot}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-xs font-black flex items-center gap-2 shadow-md cursor-pointer"
                        >
                          <Camera className="w-4 h-4" /> Capturar Foto Ahora
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                        >
                          Cancelar Cámara
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 py-4">
                      <Camera className="w-10 h-10 text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Capture una fotografía facial del paciente o de su documento firmado usando la cámara web.
                      </p>
                      
                      {cameraError && (
                        <p className="text-xs font-bold text-rose-500">{cameraError}</p>
                      )}

                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-sm cursor-pointer"
                        >
                          <Camera className="w-4 h-4" /> Activar Cámara Web
                        </button>

                        <label className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-extrabold flex items-center gap-2 shadow-sm cursor-pointer">
                          <Upload className="w-4 h-4" /> Subir Imagen
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileUpload} 
                            className="hidden" 
                          />
                        </label>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>

          {/* OBSERVATIONS AND FINAL LEGAL CHECKBOX */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Observaciones o Indicaciones Médicas Adicionales (Opcional):
              </label>
              <textarea
                rows={2}
                disabled={isAlreadySigned}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Paciente refiere comprender la necesidad de profilaxis previa y dieta blanda 48 hrs."
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium outline-none disabled:opacity-75"
              />
            </div>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/25 cursor-pointer">
              <input
                type="checkbox"
                disabled={isAlreadySigned}
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                Confirmo que el paciente ha leído y aceptado expresamente el consentimiento informado y presupuesto para: <span className="text-teal-600 dark:text-teal-400 font-extrabold">{procedure.description}</span>.
              </span>
            </label>
          </div>

          {/* AUDIT HASH & VALIDATION TIMESTAMP */}
          {isAlreadySigned && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <span className="font-extrabold block">Validado el {existingConsent?.acceptedAt}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                    HASH Audit: {existingConsent?.shareToken || verificationHash}
                  </span>
                </div>
              </div>
              <span className="text-[10px] uppercase font-mono font-extrabold bg-emerald-500/20 px-2.5 py-1 rounded-lg">
                RUN: {existingConsent?.patientDocumentId}
              </span>
            </div>
          )}

        </div>

        {/* Modal Actions Footer */}
        <div className="p-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            {isAlreadySigned ? 'Cerrar' : 'Cancelar'}
          </button>

          {!isAlreadySigned ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="px-3 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Enviar WhatsApp
              </button>

              <button
                type="button"
                disabled={!acceptedTerms || (!hasSignature && !capturedPhotoUrl && activeTab !== 'qr_mobile')}
                onClick={handleConfirmConsent}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 text-white text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <FileCheck className="w-4 h-4" /> Validar y Registrar Consentimiento
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Compartir en WhatsApp
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Imprimir Comprobante Legal
              </button>
            </div>
          )}
        </div>

      </motion.div>
    </div>
  );
};
