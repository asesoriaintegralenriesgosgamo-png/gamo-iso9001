/**
 * Field configurations for ISO 9001 specialized exercises.
 * Imported from App.jsx and referenced via item.fieldConfig.
 *
 * Each schema is named after the exercise it serves so future additions
 * (Etapas 2-4) can co-locate their configs here.
 */

/* ───── Tables (Etapa 1.1) ───── */

export const KPI_MASTER_TABLE = {
  columns: [
    { key: "objetivo", label: "Objetivo", type: "text" },
    { key: "kpi", label: "KPI", type: "text" },
    { key: "meta", label: "Meta", type: "text", width: 110 },
    { key: "frecuencia", label: "Frecuencia", type: "select", options: ["Diaria", "Semanal", "Mensual", "Trimestral", "Semestral", "Anual"], width: 130 },
    { key: "responsable", label: "Responsable", type: "text", width: 150 },
    { key: "fuente", label: "Fuente de datos", type: "text" },
  ],
};

export const TRAINING_PLAN_TABLE = {
  columns: [
    { key: "puesto", label: "Puesto", type: "text", width: 140 },
    { key: "tema", label: "Tema de capacitación", type: "text" },
    { key: "modalidad", label: "Modalidad", type: "select", options: ["Presencial", "En línea", "On-the-job", "Mentoría"], width: 130 },
    { key: "frecuencia", label: "Frecuencia", type: "select", options: ["Única", "Mensual", "Trimestral", "Semestral", "Anual"], width: 120 },
    { key: "instructor", label: "Instructor", type: "text", width: 150 },
    { key: "evaluacion", label: "Método de evaluación", type: "text" },
  ],
};

export const PROCESS_RECORDS_TABLE = {
  columns: [
    { key: "proceso", label: "Proceso", type: "text", width: 140 },
    { key: "registro", label: "Registro", type: "text" },
    { key: "formato", label: "Formato", type: "select", options: ["Papel", "LEGION", "Email", "PDF", "Excel", "Otro"], width: 110 },
    { key: "responsable", label: "Responsable", type: "text", width: 130 },
    { key: "almacenamiento", label: "Almacenamiento", type: "text", width: 150 },
    { key: "retencion", label: "Retención", type: "text", width: 100 },
  ],
};

export const SUPPLIER_CRITERIA_TABLE = {
  columns: [
    { key: "criterio", label: "Criterio", type: "text", width: 160 },
    { key: "descripcion", label: "Descripción / qué evalúa", type: "text" },
    { key: "peso", label: "Peso (%)", type: "number", width: 90 },
    { key: "metodo", label: "Método de medición", type: "text" },
  ],
};

/* ───── Structured forms (Etapa 1.2) ───── */

export const QUALITY_POLICY_FORM = {
  sections: [
    {
      key: "compromiso",
      label: "Compromiso",
      hint: "ISO 9001 cláusula 5.2: la política debe ser apropiada al propósito, comprometerse a cumplir requisitos y a mejora continua.",
      fields: [
        { key: "queHacemos", label: "¿Qué hacemos?", type: "textarea", placeholder: "Asesoría profesional en seguros de vida y GMM..." },
        { key: "paraQuien", label: "¿Para quién?", type: "textarea", placeholder: "Familias mexicanas que buscan protección patrimonial..." },
        { key: "nivelCalidad", label: "¿Qué nivel de calidad garantizamos?", type: "textarea", placeholder: "Cumplimiento de requisitos legales y expectativas del cliente..." },
        { key: "como", label: "¿Cómo lo lograremos?", type: "textarea", placeholder: "Mediante asesores certificados, procesos documentados, tecnología LEGION..." },
        { key: "enfoque", label: "Enfoque permanente", type: "textarea", placeholder: "Mejora continua, satisfacción del cliente, desarrollo de nuestro equipo..." },
      ],
    },
    {
      key: "formal",
      label: "Datos del documento",
      fields: [
        { key: "version", label: "Versión", type: "text", placeholder: "1.0" },
        { key: "fechaAprobacion", label: "Fecha de aprobación", type: "date" },
        { key: "aprobadoPor", label: "Aprobado por", type: "text", placeholder: "Nombre del Promotor / Director" },
      ],
    },
  ],
};

export const SMART_OBJECTIVE_FORM = {
  sections: [
    {
      key: "smart",
      label: "Objetivo SMART",
      hint: "Específico, Medible, Alcanzable, Relevante y con Tiempo definido.",
      fields: [
        { key: "titulo", label: "Título del objetivo", type: "text", placeholder: "Ej: Incrementar base de asesores activos" },
        { key: "especifico", label: "S — Específico", type: "textarea", placeholder: "¿Qué exactamente queremos lograr?" },
        { key: "medible", label: "M — Medible", type: "textarea", placeholder: "¿Cómo lo vamos a medir? Indicador y meta numérica." },
        { key: "alcanzable", label: "A — Alcanzable", type: "textarea", placeholder: "¿Por qué creemos que es realista? ¿Qué recursos requiere?" },
        { key: "relevante", label: "R — Relevante", type: "textarea", placeholder: "¿Cómo se alinea con la estrategia y la política de calidad?" },
        { key: "tiempo", label: "T — Tiempo límite", type: "date" },
        { key: "responsable", label: "Responsable", type: "text", placeholder: "Nombre / puesto" },
      ],
    },
  ],
};

export const JOB_DESCRIPTION_FORM = {
  sections: [
    {
      key: "identificacion",
      label: "Identificación del puesto",
      fields: [
        { key: "nombrePuesto", label: "Nombre del puesto", type: "text" },
        { key: "area", label: "Área", type: "text", placeholder: "Dirección / Ventas / Operaciones / Soporte" },
        { key: "reportaA", label: "Reporta a", type: "text" },
        { key: "supervisaA", label: "Supervisa a", type: "text", placeholder: "Listar puestos subordinados o 'N/A'" },
        { key: "objetivoPuesto", label: "Objetivo del puesto (1-2 oraciones)", type: "textarea" },
      ],
    },
    {
      key: "responsabilidades",
      label: "Responsabilidades y autoridad",
      fields: [
        { key: "funciones", label: "Funciones principales", type: "list-string", placeholder: "Función específica..." },
        { key: "autoridad", label: "Autoridad y alcance de decisión", type: "textarea", placeholder: "Qué decisiones puede tomar, montos que puede aprobar..." },
      ],
    },
    {
      key: "perfil",
      label: "Perfil requerido",
      fields: [
        { key: "escolaridad", label: "Escolaridad / certificaciones", type: "textarea" },
        { key: "experiencia", label: "Experiencia previa", type: "textarea" },
        { key: "competenciasTecnicas", label: "Competencias técnicas", type: "list-string", placeholder: "Conocimiento técnico requerido..." },
        { key: "competenciasBlandas", label: "Competencias blandas", type: "list-string", placeholder: "Competencia interpersonal..." },
      ],
    },
    {
      key: "indicadores",
      label: "Indicadores de desempeño",
      hint: "3-5 KPIs con meta clara que servirán para evaluar el desempeño en este puesto.",
      fields: [
        { key: "kpis", label: "KPIs", type: "list-string", placeholder: "Indicador + meta..." },
      ],
    },
  ],
};

export const CLIENT_INTERVIEW_FORM = {
  sections: [
    {
      key: "perfil",
      label: "Perfil del cliente",
      fields: [
        { key: "nombre", label: "Nombre", type: "text" },
        { key: "edad", label: "Edad", type: "number" },
        { key: "ocupacion", label: "Ocupación / fuente de ingreso", type: "text" },
        { key: "situacionFamiliar", label: "Situación familiar", type: "textarea", placeholder: "Estado civil, dependientes económicos..." },
        { key: "fechaEntrevista", label: "Fecha de la entrevista", type: "date" },
      ],
    },
    {
      key: "necesidades",
      label: "Diagnóstico de necesidades",
      fields: [
        { key: "necesidadesProteccion", label: "Necesidades de protección detectadas", type: "list-string", placeholder: "Riesgo o necesidad específica..." },
        { key: "objetivosFinancieros", label: "Objetivos financieros / patrimoniales", type: "list-string" },
        { key: "presupuestoMensual", label: "Capacidad de pago mensual estimada", type: "text" },
      ],
    },
    {
      key: "propuesta",
      label: "Propuesta presentada",
      fields: [
        { key: "productosPropuestos", label: "Productos propuestos", type: "list-string", placeholder: "Producto + suma asegurada + prima..." },
        { key: "argumentosClave", label: "Argumentos clave de la asesoría", type: "textarea" },
      ],
    },
    {
      key: "decision",
      label: "Decisión y siguientes pasos",
      fields: [
        { key: "decision", label: "Decisión del cliente", type: "select", options: ["Aceptado", "En análisis", "Rechazado", "Pospuesto"] },
        { key: "siguientePaso", label: "Siguiente paso acordado", type: "textarea" },
        { key: "fechaProximoContacto", label: "Próximo contacto", type: "date" },
      ],
    },
  ],
};

/* ───── 2x2 Matrix (Etapa 1.3) ───── */

export const FODA_CROSS_MATRIX = {
  quadrants: {
    q1: {
      label: "FO — Fortalezas + Oportunidades",
      hint: "Estrategias ofensivas: usar fortalezas para aprovechar oportunidades.",
    },
    q2: {
      label: "FA — Fortalezas + Amenazas",
      hint: "Estrategias defensivas: usar fortalezas para mitigar amenazas.",
    },
    q3: {
      label: "DO — Debilidades + Oportunidades",
      hint: "Estrategias de mejora: superar debilidades aprovechando el contexto.",
    },
    q4: {
      label: "DA — Debilidades + Amenazas",
      hint: "Estrategias de supervivencia: minimizar debilidades ante amenazas.",
    },
  },
};

/* ───── Matrix (Etapa 1.4) ───── */

export const COMPETENCY_MATRIX = {
  rows: [
    { key: "promotor", label: "Promotor / Director" },
    { key: "gerente", label: "Gerente de Ventas" },
    { key: "asesor_jr", label: "Asesor Jr (0-2 años)" },
    { key: "asesor_sr", label: "Asesor Sr (2-5 años)" },
    { key: "asesor_mdrt", label: "Asesor MDRT+" },
    { key: "reclutador", label: "Reclutador" },
    { key: "asistente", label: "Asistente Administrativo" },
  ],
  cols: [
    { key: "productos", label: "Productos SMNYL" },
    { key: "regulacion", label: "Regulación CNSF" },
    { key: "legion", label: "Uso de LEGION" },
    { key: "venta", label: "Venta consultiva" },
    { key: "comunicacion", label: "Comunicación" },
    { key: "liderazgo", label: "Liderazgo" },
    { key: "gestion", label: "Gestión administrativa" },
  ],
  cellType: "number-scale",
  cellConfig: {
    max: 4,
    levelLabels: ["No aplica", "Básico", "Intermedio", "Avanzado", "Experto"],
  },
};
