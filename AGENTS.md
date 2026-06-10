# PerioDash v15 Pro - Directrices de Diseño y Desarrollo (Cosmic Slate)

Estas instrucciones aseguran que la plataforma mantenga su integridad visual, estructural y clínica en futuras integraciones de funciones o al modificar el código.

## 🎨 1. Identidad Visual y Filosofía de Diseño: "Cosmic Slate"
- **Contraste y Gradientes Premium:** En modo oscuro, utilizar difuminados fluidos de fondo (`bg-teal-950/20`) y detalles esmeralda/verde azulado para reducir la fatiga visual. Siempre usar bordes sutiles y fondos de cristal (glassmorphism).
- **Tipografía de Alto Nivel:** Utilizar fuentes geométricas (`Space Grotesk` o `Inter`/`sans`) para encabezados y balancear en gran manera el espacio negativo (paddings amplios, diseño que respire).
- **Micro-animaciones:** La navegación entre pestañas y la barra de búsqueda `Ctrl+K` deben utilizar transiciones fluidas de elevación e ingreso con `motion` (por ejemplo, entradas de escala y opacidad, o deslizamientos en Y). No hacer cambios abruptos. Ninguna animación debe ser exagerada o distractora.

## 🗄️ 2. Estructura de Datos Científica
- Nunca modifiques o simplifiques `types.ts` si no es para ampliar características oficiales.
- PerioDash incluye tipado dental fuerte basado en dentición permanente adulta (32 piezas con notación FDI 11-48).
- **Odontograma:** Cada diente tiene 5 caras formales (`vestibular`, `occlusal/incisal`, `lingual/palatino`, `mesial`, `distal`) y estado general (`sano`, `caries`, `ausente`, `endodoncia`, `implante`).
- **Periodontograma:** Almacenamiento paramétrico a 6 puntos, guardando sondaje, recesión, sangrado y placa bacteriana, además de grado de movilidad y furca.

## 🤖 3. Copiloto Dentito (IA)
- Debe conservar un diseño visual (holograma/avatar creado mediante HTML/CSS crudo) que sea animado, amigable pero muy tecnológico y sin recargar la interfaz.
- Cuenta con API de Voz local: reacciona a comandos de control de la app (ej. "Abre expediente") e incluye protocolos médicos de emergencia.
- Tiene contexto: al momento de pedir sugerencias, se inyecta en el servidor el estado actual de la ficha activa del paciente (JSON de pacientes serializado).

## 💡 Reglas Generales de UX/UI
- **Pantalla Única pero Modular:** La aplicación está centralizada en `App.tsx` organizando paneles mediante el estado de pestañas. No se usan enrutadores como `react-router` a menos que sea estrictamente necesario. Modos minimalistas de pantalla en lugar de múltiples ventanas.
- **Acceso Directo Print (Impresión):** Generación de plantillas optimizadas para PDF siempre que se consulte el odontograma/periodontograma, escondiendo barras laterales `@media print`.
