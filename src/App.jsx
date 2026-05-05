import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";

/* ───── Icons ───── */
const I = {
  foundation: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M8 10v11M12 10v11M16 10v11M20 10v11"/></svg>,
  people: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  gears: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  clipboard: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>,
  rocket: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>,
  chk: (c) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  chev: (c, r) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{transition:"transform .25s",transform:r?"rotate(90deg)":"rotate(0deg)"}}><polyline points="9 18 15 12 9 6"/></svg>,
  hint: (c) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>,
  info: (c) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  layers: (c) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
  edit: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  save: (c) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  book: (c) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
};

/* ───── Palette ───── */
const P = {
  bg:"#f6f5f3", card:"#fff", border:"#e8e6e1", borderL:"#f0eeea",
  s50:"#fafaf9",s100:"#f5f5f4",s200:"#e7e5e4",s300:"#d6d3d1",s400:"#a8a29e",s500:"#78716c",s600:"#57534e",s700:"#44403c",s800:"#292524",s900:"#1c1917",
};
const TH = [
  {main:"#5b6770",acc:"#7b8a94",lt:"#eef1f3"},
  {main:"#5a7260",acc:"#7a9680",lt:"#ecf1ed"},
  {main:"#6b5f75",acc:"#8d8197",lt:"#f0ecf2"},
  {main:"#8a6e4e",acc:"#a9895e",lt:"#f4efe7"},
  {main:"#577080",acc:"#7591a3",lt:"#eaf0f4"},
];

/* ───── DATA ───── */
const PHASES = [
  { id:"p0", phase:"Fase 0", title:"Identidad y Fundamentos Organizacionales", iconKey:"foundation",
    desc:"Antes de pensar en ISO, GAMO necesita definir quién es como organización.",
    sections:[
      { title:"Misión, Visión y Valores", items:[
        { text:"Definir la misión de GAMO", guide:"La misión responde a tres preguntas fundamentales: ¿Qué hacemos? ¿Para quién lo hacemos? ¿Cómo lo hacemos? En el caso de GAMO, deben reflejarse dos vertientes: (1) la protección patrimonial de familias mexicanas a través de seguros de vida y GMM, y (2) la formación y desarrollo de asesores profesionales. Redacten un párrafo de 2-3 oraciones que sea claro, memorable y que cualquier miembro del equipo pueda recitar. Eviten lenguaje genérico — lo que escriban debe diferenciar a GAMO de cualquier otra promotoría. Consideren su trayectoria de 44 años y el modelo de 'ecosistema empresarial' que ya comunican en gamo.mx." },
        { text:"Definir la visión a 5 años", guide:"La visión es aspiracional pero alcanzable. Piensen: ¿cómo se ve GAMO en 2031? Consideren métricas concretas: número de asesores, número de familias protegidas, presencia geográfica, nivel de producción, certificaciones obtenidas. ¿Quieren ser la promotoría #1 de SMNYL en el Bajío? ¿La primera promotoría ISO 9001 del sistema? ¿Tener X asesores MDRT? Redacten una declaración que emocione al equipo y que puedan medir progreso hacia ella año con año." },
        { text:"Establecer valores fundamentales con definición operativa", guide:"Ya tienen tres valores implícitos en su sitio web: meritocracia real, libertad con estructura, y cultura de equipo. Ahora necesitan formalizarlos. Para cada valor, escriban: (1) el nombre del valor, (2) una definición en una oración, y (3) 2-3 comportamientos observables que demuestran ese valor en la práctica diaria. Por ejemplo: 'Meritocracia real — Tu crecimiento depende de tu esfuerzo y resultados. Se demuestra cuando: asignamos oportunidades por desempeño, no antigüedad; celebramos logros públicamente; damos retroalimentación directa sin importar jerarquía.' Consideren agregar valores como integridad, servicio al cliente, o desarrollo continuo." },
        { text:"Crear declaración de política de calidad", guide:"La política de calidad es un compromiso formal de la dirección con la calidad. ISO 9001 Cláusula 5.2 exige que sea: (a) apropiada al propósito de la organización, (b) incluya el compromiso de satisfacer requisitos aplicables, (c) incluya el compromiso de mejora continua del SGC. Debe ser breve (1 párrafo), comunicable a todo el equipo, y revisable periódicamente. Ejemplo de estructura: 'En GAMO nos comprometemos a [qué hacemos] para [para quién], garantizando [qué nivel de calidad], mediante [cómo lo logramos], con un enfoque de [mejora continua / satisfacción del cliente / desarrollo de nuestro equipo].'" },
      ]},
      { title:"Análisis Estratégico — FODA", items:[
        { text:"Identificar fortalezas internas", guide:"Hagan una lluvia de ideas con el equipo clave. Piensen en: ¿qué hace bien GAMO que otras promotorias no? Ejemplos a considerar: 44 años de trayectoria y reputación, +20,000 familias protegidas como prueba social, miembros MDRT/COT/TOT como credencial de excelencia, LEGION como plataforma tecnológica propia (ninguna otra promotoría tiene esto), modelo de ecosistema empresarial vs. empleo tradicional, ubicación en Querétaro (crecimiento económico del Bajío), relación sólida con SMNYL. Clasifíquenlas por importancia y sustentabilidad — ¿cuáles son difíciles de copiar?" },
        { text:"Identificar debilidades internas", guide:"Esto requiere honestidad brutal. Piensen en: ¿dónde perdemos oportunidades? ¿Qué nos frena? Ejemplos a considerar: procesos no documentados (todo vive en la cabeza de pocas personas), falta de manuales y procedimientos escritos, posible dependencia excesiva del promotor principal, rotación de asesores nuevos, falta de métricas formales de satisfacción del cliente, LEGION aún en desarrollo y no adoptado al 100%, sin constitución legal separada, estructura administrativa limitada. Sean específicos — cada debilidad se convertirá en un proyecto de mejora." },
        { text:"Identificar oportunidades externas", guide:"¿Qué está pasando en el mercado que GAMO puede aprovechar? Ejemplos: mercado de seguros de vida en México tiene penetración muy baja (menos del 3% del PIB vs. 7-10% en países desarrollados), crecimiento demográfico y económico del Bajío, digitalización acelerada del sector post-pandemia, SMNYL como marca reconocida abre puertas, generación millennial empezando a pensar en protección, regulación CNSF cada vez más exigente favorece a los profesionales, oportunidad de expandir a otras ciudades del Bajío." },
        { text:"Identificar amenazas externas", guide:"¿Qué factores externos podrían afectar negativamente a GAMO? Ejemplos: insurtechs y plataformas digitales que venden seguros sin asesor, competencia de otras promotorias con más recursos, cambios regulatorios de CNSF que podrían encarecer la operación, percepción negativa del público hacia vendedores de seguros, crisis económicas que reducen la capacidad de ahorro de las familias, rotación de asesores hacia otras promotorias o industrias, dependencia de una sola aseguradora (SMNYL)." },
        { text:"Cruzar FODA para estrategias FO, FA, DO, DA", guide:"Esta es la parte más valiosa del FODA. Creen una matriz 2x2 y para cada cuadrante generen 2-3 estrategias concretas. FO (usar fortalezas para aprovechar oportunidades): ej. 'Usar LEGION para captar asesores tech-savvy en el mercado millennial.' FA (usar fortalezas para mitigar amenazas): ej. 'Usar nuestra trayectoria de 44 años para diferenciarnos de insurtechs sin historial.' DO (superar debilidades con oportunidades): ej. 'Documentar procesos ahora que estamos creciendo, antes de que la falta de estructura nos limite.' DA (minimizar debilidades ante amenazas): ej. 'Formalizar retención de asesores para evitar fuga de talento a la competencia.' Este análisis alimenta directamente la Cláusula 4.1 de ISO 9001." },
      ]},
      { title:"Objetivos Estratégicos y KPIs", items:[
        { text:"Objetivos de crecimiento", guide:"Definan metas numéricas a 1, 3 y 5 años para: número de asesores activos, prima nueva anual, prima en vigor (cartera total), número de pólizas emitidas, número de clientes/familias protegidas. Usen el formato SMART: 'Incrementar la base de asesores activos de 110 a 150 para diciembre 2027, mediante un programa de reclutamiento estructurado que atraiga mínimo 5 candidatos calificados por mes.' Cada objetivo debe tener un responsable y una frecuencia de revisión." },
        { text:"Objetivos de calidad de servicio", guide:"ISO 9001 exige que los objetivos sean medibles y estén alineados a la política de calidad. Piensen en: índice de satisfacción del cliente asegurado (meta: >90%), tasa de conservación de cartera (meta: >85%), tiempo promedio de respuesta a solicitudes del cliente (<24 hrs), tasa de resolución en primer contacto, índice de quejas vs. pólizas en vigor, NPS (Net Promoter Score). Definan cómo van a medir cada uno — encuestas, registros en LEGION, reportes de SMNYL." },
        { text:"Objetivos de desarrollo humano", guide:"El activo más importante de una promotoría es su gente. Definan metas para: número de asesores que alcanzan MDRT/COT/TOT por año, horas de capacitación promedio por asesor por trimestre, tasa de certificación (cédulas CNSF activas), tasa de retención de asesores a 12 y 24 meses, número de asesores en programa de mentoría. Estos indicadores también alimentan la Cláusula 7.2 de ISO (competencia del personal)." },
        { text:"Objetivos operativos", guide:"Métricas de eficiencia interna: tiempo promedio desde solicitud hasta emisión de póliza, porcentaje de trámites sin errores/rechazos, tasa de cobranza exitosa, tiempo promedio de atención a siniestros, porcentaje de pólizas renovadas automáticamente, número de no conformidades por trimestre (una vez implementado el SGC). Cada proceso operativo (Fase 2) debería tener al menos un indicador asociado." },
        { text:"Asignar KPIs medibles a cada objetivo", guide:"Creen una tabla maestra: Objetivo | KPI | Meta | Frecuencia de medición | Responsable | Fuente de datos. Ejemplo: 'Satisfacción del cliente | NPS | >50 | Trimestral | Gerente de Operaciones | Encuesta post-servicio en LEGION'. Sin esta tabla, no podrán demostrar mejora continua en ninguna auditoría ISO. LEGION puede ser la herramienta donde se consoliden todos estos datos automáticamente." },
      ]},
    ]
  },
  { id:"p1", phase:"Fase 1", title:"Estructura Organizacional y Puestos", iconKey:"people",
    desc:"Definir quién hace qué en GAMO. La columna vertebral de cualquier SGC.",
    sections:[
      { title:"Organigrama", items:[
        { text:"Diseñar organigrama formal de GAMO", guide:"Dibujen la estructura real actual de GAMO, no la ideal. ¿Quién le reporta a quién hoy? Roles típicos en una promotoría SMNYL: Promotor (tú, Antonio — director general), Gerente(s) de ventas o de zona, Asesores de seguros en diferentes niveles, Reclutador(es), Asistente(s) administrativo(s), Colaboradores de soporte. Consideren si hay roles que una misma persona desempeña (ej: tú como promotor y como gerente). Eso está bien documentarlo, pero es importante reconocerlo para planificar el crecimiento. Formato recomendado: organigrama vertical con nombre del puesto, nombre de la persona que lo ocupa, y si el puesto está vacante." },
        { text:"Definir líneas de reporte y autoridad", guide:"Para cada puesto en el organigrama, establezcan: ¿a quién reporta directamente? ¿A quién puede dar instrucciones? ¿Quién lo sustituye en caso de ausencia? ¿Qué decisiones puede tomar sin autorización? Esto es crítico para ISO porque la Cláusula 5.3 exige que los roles, responsabilidades y autoridades estén asignados, comunicados y entendidos dentro de la organización. Documenten también la relación con SMNYL — el promotor tiene una línea de reporte funcional hacia la aseguradora." },
        { text:"Gap analysis — puestos actuales vs. necesarios", guide:"Comparen su organigrama actual con lo que necesitarían para operar con calidad ISO. ¿Hay puestos que no existen pero deberían? (ej: un responsable de calidad, un coordinador de capacitación). ¿Hay puestos sobrecargados? ¿Hay funciones que nadie tiene asignadas formalmente? Esto genera un plan de contratación o redistribución de funciones con prioridades y tiempos." },
      ]},
      { title:"Descripciones de Puesto", items:[
        { text:"Promotor — Director General", guide:"Redacten una ficha completa con: Nombre del puesto | Objetivo general del puesto (en 1-2 oraciones) | Principales funciones y responsabilidades (listar 8-12) | Autoridad y alcance de decisión | Requisitos de formación y experiencia | Competencias técnicas requeridas | Competencias blandas requeridas | Indicadores de desempeño (3-5 KPIs) | A quién reporta (SMNYL) | A quién supervisa. Para el promotor, funciones clave incluyen: definir la estrategia de la promotoría, mantener la relación con SMNYL, asegurar el cumplimiento regulatorio, desarrollar y retener gerentes y asesores, gestionar el P&L de la promotoría, representar a GAMO ante clientes y comunidad." },
        { text:"Gerente de Ventas / Operaciones", guide:"Funciones clave: supervisar y dar coaching a asesores, dar seguimiento a metas de producción individuales y grupales, conducir juntas de ventas semanales, revisar y aprobar propuestas de asesores, escalar problemas operativos al promotor, colaborar en reclutamiento. KPIs sugeridos: prima nueva del equipo a cargo, tasa de retención de asesores, número de asesores que alcanzan meta mensual, satisfacción de asesores con el soporte recibido." },
        { text:"Asesor de Seguros — definir niveles", guide:"Es fundamental diferenciar niveles porque las expectativas y funciones cambian. Nivel Jr (0-2 años): enfocado en aprender, prospección básica, venta con acompañamiento del gerente. Nivel Sr (2-5 años): venta autónoma, cartera propia, empieza a desarrollar especialización. Nivel MDRT: asesor de alto desempeño, referente del equipo, puede empezar a mentorear juniors. Nivel COT/TOT: élite, estrategia patrimonial compleja, clientes HNW. Para cada nivel: funciones específicas, meta de producción, competencias requeridas, beneficios/comisiones diferenciadas." },
        { text:"Reclutador / Talent Acquisition", guide:"Esta es una función vital en una promotoría — el crecimiento depende directamente de la capacidad de atraer talento. Funciones: diseñar y ejecutar campañas de atracción, filtrar candidatos según perfil definido, conducir entrevistas iniciales, coordinar proceso de evaluación (pueden usar el flujo de CV analysis que ya diseñaron en LEGION), acompañar al candidato en su proceso de obtención de cédula CNSF, dar seguimiento a la inducción. KPIs: candidatos contactados/mes, tasa de conversión de candidato a asesor activo, retención a 6 meses de los reclutados." },
        { text:"Asistente Administrativo", guide:"El asistente es quien mantiene la operación diaria funcionando. Funciones típicas: gestionar trámites de emisión, endosos y cancelaciones con SMNYL, organizar expedientes de clientes y asesores, dar seguimiento a cobranza, coordinar requisitos médicos, generar reportes administrativos, atender llamadas y correos de clientes, mantener actualizado LEGION con datos de pólizas. KPIs: trámites procesados sin error, tiempo promedio de gestión, satisfacción de asesores con soporte administrativo." },
        { text:"Colaborador / Soporte", guide:"Puede haber diferentes tipos de colaboradores según el tamaño de la promotoría: auxiliar de cobranza (seguimiento a pagos vencidos), auxiliar de renovaciones (contactar clientes antes del vencimiento), recepcionista/atención telefónica, auxiliar de archivo y digitalización. Para cada uno, definir sus funciones específicas, herramientas que usa, y métricas de desempeño. En promotorias pequeñas, una persona puede cubrir varias de estas funciones." },
        { text:"Formato estándar para todas las descripciones", guide:"Creen una plantilla única que todas las descripciones de puesto sigan. Secciones sugeridas: (1) Identificación — nombre del puesto, área, reporta a, supervisa a, fecha de elaboración. (2) Objetivo del puesto — 1-2 oraciones. (3) Funciones principales — lista numerada de responsabilidades. (4) Autoridad — qué decisiones puede tomar, qué montos puede aprobar. (5) Perfil requerido — escolaridad, experiencia, certificaciones. (6) Competencias — técnicas y blandas con nivel requerido. (7) Indicadores — 3-5 KPIs con meta. (8) Condiciones de trabajo — horario, viajes, herramientas. Esta plantilla la reutilizarán en el Manual de Organización." },
      ]},
      { title:"Competencias y Perfiles", items:[
        { text:"Competencias técnicas por puesto", guide:"Para cada puesto, listen qué conocimientos técnicos específicos necesita. Ejemplos: conocimiento de productos SMNYL (vida, GMM, ahorro, retiro), uso de herramientas de cotización de SMNYL, regulación CNSF y tipos de cédulas (A, A1, B, C, F), fiscalidad de seguros en México, uso de LEGION, técnicas de venta consultiva (SPIN, needs-based selling), análisis financiero básico para planificación patrimonial. Clasifiquen cada competencia en niveles: básico, intermedio, avanzado, experto." },
        { text:"Competencias blandas por puesto", guide:"Las competencias blandas son igualmente importantes, especialmente en un negocio de relaciones. Consideren: comunicación efectiva (verbal y escrita), escucha activa, empatía, negociación, resiliencia y tolerancia a la frustración, autogestión del tiempo, trabajo en equipo, liderazgo (para gerentes), orientación a resultados, adaptabilidad. Para cada puesto, definan cuáles son las 4-5 competencias blandas más críticas y en qué nivel se requieren." },
        { text:"Matriz de competencias", guide:"Creen una tabla donde las filas son los puestos y las columnas son todas las competencias (técnicas + blandas). En cada celda, pongan el nivel requerido: 0 (no aplica), 1 (básico), 2 (intermedio), 3 (avanzado), 4 (experto). Esta matriz permite: identificar gaps de capacitación, planificar el desarrollo individual de cada persona, evaluar candidatos en reclutamiento, y cumplir con la Cláusula 7.2 de ISO 9001 que exige demostrar que el personal es competente." },
        { text:"Plan de capacitación por puesto", guide:"Con base en la matriz de competencias, diseñen un plan de capacitación que indique: ¿qué temas necesita cada puesto? ¿en qué modalidad? (presencial, en línea, on-the-job, mentoría), ¿con qué frecuencia?, ¿quién es el instructor o facilitador?, ¿cómo se evalúa que la capacitación fue efectiva? ISO 9001 no solo pide que capaciten — pide que demuestren que la capacitación funcionó (registros de asistencia, evaluaciones, cambio en indicadores)." },
      ]},
    ]
  },
  { id:"p2", phase:"Fase 2", title:"Mapeo de Procesos Clave", iconKey:"gears",
    desc:"ISO 9001 es un sistema basado en procesos. Hay que mapear todo lo que hace GAMO.",
    sections:[
      { title:"Procesos Estratégicos — Dirección", items:[
        { text:"PE-01  Planeación Estratégica", guide:"Este proceso define cómo GAMO establece su rumbo cada año. Incluye: revisión del FODA, actualización de objetivos estratégicos, definición de presupuesto, asignación de recursos a iniciativas prioritarias. Frecuencia: anual con revisiones trimestrales. Participantes: Promotor + Gerentes. Entradas: resultados del año anterior, tendencias del mercado, directrices de SMNYL. Salidas: plan estratégico anual, objetivos y metas aprobados, presupuesto. Registros: acta de planeación, plan aprobado." },
        { text:"PE-02  Revisión por la Dirección", guide:"La Cláusula 9.3 de ISO 9001 exige que la alta dirección revise el SGC periódicamente (recomendado: trimestral). Entradas obligatorias de la revisión: estado de acciones de revisiones previas, cambios en contexto externo/interno, desempeño de procesos y conformidad de servicios, satisfacción del cliente, auditorías internas, no conformidades y acciones correctivas, tendencias de indicadores, oportunidades de mejora. Salidas: decisiones sobre mejoras, cambios en el SGC, necesidades de recursos. Documenten cada revisión en un acta formal." },
        { text:"PE-03  Gestión de Riesgos y Oportunidades", guide:"ISO 9001:2015 introdujo el 'pensamiento basado en riesgos' (Cláusula 6.1). No exige un método específico, pero GAMO debe demostrar que: identifica riesgos que podrían afectar la calidad de sus servicios, evalúa la probabilidad e impacto de cada riesgo, define acciones para mitigarlos o aprovechar oportunidades, da seguimiento a esas acciones. Herramienta sugerida: una matriz de riesgos simple (riesgo | probabilidad | impacto | acción | responsable | estatus). Aplíquenla a cada proceso operativo." },
      ]},
      { title:"Procesos Operativos — Core", items:[
        { text:"PO-01  Reclutamiento y Selección de Asesores", guide:"Documenten paso a paso: (1) Definición de perfil del candidato ideal, (2) Publicación y difusión de vacante (OCC, LinkedIn, referidos), (3) Recepción y filtrado de CVs (pueden usar el análisis de CV con IA que ya tienen en LEGION), (4) Entrevista inicial por reclutador, (5) Entrevista de validación por gerente/promotor, (6) Evaluación de competencias, (7) Oferta y firma de contrato de prestación de servicios, (8) Inicio de trámite de cédula CNSF, (9) Inscripción en programa de inducción. KPIs: tiempo promedio del proceso, tasa de conversión, calidad de los reclutados (retención a 6 meses)." },
        { text:"PO-02  Inducción y Capacitación", guide:"El programa de inducción es lo que convierte a un candidato en un asesor funcional. Documenten: semana 1-2 (conocimiento de SMNYL, productos básicos, regulación, uso de herramientas), semana 3-4 (técnicas de prospección y venta, role-plays, acompañamiento en campo), mes 2-3 (primeras ventas con supervisión, retroalimentación continua). Capacitación continua: programa mensual de actualización de productos, talleres de técnicas avanzadas, preparación para certificaciones. Registren: asistencia, evaluaciones, resultados de ventas post-capacitación." },
        { text:"PO-03  Prospección y Venta Consultiva", guide:"Este es EL proceso core de la promotoría. Fases: (1) Identificación del prospecto (referidos, campañas, networking), (2) Contacto inicial y agenda de cita, (3) Entrevista de diagnóstico — levantamiento de necesidades (la 'línea de vida' que ya usan es excelente), (4) Análisis y diseño de propuesta personalizada, (5) Presentación de propuesta, (6) Manejo de objeciones, (7) Cierre y solicitud de póliza, (8) Solicitud de referidos. Para cada fase documenten: qué debe hacer el asesor, qué herramientas usa, qué registro genera, qué criterios de calidad debe cumplir." },
        { text:"PO-04  Trámites y Emisión de Pólizas", guide:"Desde que el cliente dice 'sí' hasta que tiene su póliza en mano: (1) Llenado de solicitud (verificar que esté completa y sin errores), (2) Recopilación de documentos (INE, comprobante, etc.), (3) Programación de exámenes médicos si aplica, (4) Envío de solicitud a SMNYL, (5) Seguimiento a proceso de suscripción, (6) Resolución de observaciones o rechazos, (7) Emisión de póliza, (8) Entrega de póliza al cliente con explicación de coberturas, (9) Primer cobro. KPIs: tasa de solicitudes rechazadas, tiempo de emisión, errores por solicitud." },
        { text:"PO-05  Servicio Post-Venta y Conservación", guide:"El servicio post-venta es lo que diferencia a una promotoría profesional. Incluye: cobros subsecuentes (seguimiento mensual/trimestral/anual según frecuencia), renovaciones anuales (contactar al cliente 30-60 días antes), revisiones periódicas de cobertura (mínimo una vez al año), atención a solicitudes del cliente (cambios de beneficiario, domicilio, forma de pago), comunicación relacional (felicitaciones de cumpleaños, aniversario de póliza — ya tienen esto diseñado en el módulo de email de LEGION). KPI principal: tasa de conservación de cartera (meta >85%)." },
        { text:"PO-06  Gestión de Siniestros", guide:"Cuando un cliente necesita hacer válido su seguro, la calidad del acompañamiento es crítica. Pasos: (1) Recepción del aviso de siniestro, (2) Orientación al cliente sobre documentación requerida, (3) Recopilación y revisión de documentos, (4) Envío de reclamación a SMNYL, (5) Seguimiento al proceso de dictamen, (6) Comunicación de resolución al cliente, (7) Apoyo en caso de inconformidad. Este proceso es donde se construye la lealtad más profunda — documenten tiempos de respuesta esperados en cada paso." },
        { text:"PO-07  Desarrollo y Retención de Asesores", guide:"Cómo GAMO ayuda a sus asesores a crecer y los mantiene en la organización. Incluye: plan de carrera definido (niveles Jr → Sr → MDRT → COT → TOT), programa de mentoría (asesores experimentados apadrinan a nuevos), sistema de reconocimientos (el programa de 25 Puntos que ya tienen en LEGION), juntas de coaching individuales periódicas, convenciones y eventos de integración, plan de compensación competitivo y transparente. KPIs: retención a 12/24 meses, progresión en niveles, satisfacción del asesor." },
      ]},
      { title:"Procesos de Soporte", items:[
        { text:"PS-01  Gestión Administrativa y Documental", guide:"Todo el backoffice: manejo de expedientes de clientes y asesores, archivo físico y digital, generación de reportes para SMNYL (AG2 y otros), conciliación de comisiones, control de correspondencia. Definan: qué documentos se generan, dónde se almacenan, quién tiene acceso, cuánto tiempo se conservan, cómo se protegen (esto último es importante por LFPDPPP que ya trabajaron)." },
        { text:"PS-02  Gestión de Tecnología — LEGION", guide:"LEGION es la columna vertebral tecnológica de GAMO. Documenten: qué módulos están activos y cuáles en desarrollo, quién es responsable de administrar la plataforma, cómo se gestionan las actualizaciones, cómo se capacita a los usuarios, plan de respaldo y recuperación de datos, gestión de accesos y permisos por rol (ya tienen esto con los roles de LEGION: promotor, gerente, asesor, etc.), cómo se reportan y resuelven incidencias." },
        { text:"PS-03  Comunicación Interna y Externa", guide:"Interna: ¿cómo se comunican las decisiones, los cambios, los resultados? ¿Hay juntas periódicas? ¿Qué canales usan (WhatsApp, email, LEGION)? Formalicen: junta semanal de equipo, comunicados mensuales de resultados, canal de anuncios. Externa: ¿cómo se comunica GAMO con clientes? ¿Con SMNYL? ¿Con el público general? Página web, redes sociales, email marketing. ISO 9001 Cláusula 7.4 exige que se determinen las comunicaciones pertinentes al SGC." },
        { text:"PS-04  Gestión de Proveedores", guide:"¿Quiénes son los proveedores de GAMO? No solo de productos — piensen en servicios: renta de oficina, sistemas de cómputo, servicios de impresión, contabilidad externa, servicios legales, plataformas de capacitación. ISO 9001 Cláusula 8.4 exige evaluar y seleccionar proveedores. Creen un catálogo de proveedores con: nombre, servicio que provee, criterios de evaluación (calidad, precio, cumplimiento), calificación periódica, acuerdos de servicio." },
        { text:"PS-05  Control de Información Documentada", guide:"ISO 9001 Cláusula 7.5 es fundamental. Definan: cómo se crean documentos nuevos (plantilla, revisión, aprobación), cómo se identifican y codifican (ej: GAMO-PO-03 = Procedimiento Operativo #3), cómo se controlan las versiones (para que nadie use una versión obsoleta), dónde se almacenan (LEGION, carpeta compartida, nube), quién aprueba cambios, cuánto tiempo se conservan los registros. Creen un 'Lista Maestra de Documentos' que centralice todo." },
      ]},
      { title:"Documentación por Proceso", items:[
        { text:"Ficha de proceso para cada uno", guide:"La ficha de proceso es un resumen ejecutivo de una página. Contenido: nombre y código del proceso, objetivo, alcance (dónde inicia y dónde termina), responsable (dueño del proceso), entradas (qué necesita para iniciar), salidas (qué produce), recursos necesarios (personas, herramientas, información), indicadores de desempeño (1-3 KPIs), procesos relacionados, documentos asociados (procedimientos, formatos, registros). Hagan una ficha para cada uno de los 15 procesos identificados." },
        { text:"Diagrama de flujo para cada proceso", guide:"El diagrama de flujo muestra visualmente el paso a paso del proceso. Usen simbología estándar: rectángulo = actividad, rombo = decisión, óvalo = inicio/fin, flecha = flujo. Incluyan: quién ejecuta cada paso (usar swimlanes si son varios roles), puntos de decisión (ej: '¿Solicitud completa? Sí → continuar, No → devolver al asesor'), registros que se generan en cada punto. Herramientas: pueden hacerlos en LEGION, Mermaid, Lucidchart, o incluso en PowerPoint." },
        { text:"Procedimiento escrito paso a paso", guide:"Para cada proceso, redacten un procedimiento que cualquier persona nueva pueda seguir. Estructura: (1) Objetivo del procedimiento, (2) Alcance, (3) Definiciones y abreviaturas, (4) Responsabilidades, (5) Desarrollo — paso a paso detallado con instrucciones claras, (6) Registros generados, (7) Control de cambios. El nivel de detalle debe ser suficiente para que alguien sin experiencia previa pueda ejecutar el proceso correctamente." },
        { text:"Registros y evidencias por proceso", guide:"ISO 9001 exige 'información documentada' como evidencia de que los procesos se ejecutan correctamente. Para cada proceso, identifiquen: ¿qué formatos se llenan? ¿qué reportes se generan? ¿qué emails o comunicaciones quedan como evidencia? ¿qué datos se capturan en LEGION? Creen una tabla: Proceso | Registro | Formato | Responsable de generar | Lugar de almacenamiento | Tiempo de retención." },
        { text:"Mapa de procesos general de GAMO", guide:"El mapa de procesos es una vista de pájaro de toda la organización. Formato clásico de tres bloques horizontales: arriba los procesos estratégicos (PE), en medio los operativos (PO — son los que generan valor directamente), abajo los de soporte (PS). Con flechas mostrando cómo se relacionan entre sí. A la izquierda: el cliente y sus necesidades. A la derecha: el cliente satisfecho. Este mapa se convierte en la 'página principal' del Manual de Calidad." },
      ]},
    ]
  },
  { id:"p3", phase:"Fase 3", title:"Documentación del SGC", iconKey:"clipboard",
    desc:"Los documentos que ISO 9001:2015 exige, más los que GAMO necesita para operar con calidad.",
    sections:[
      { title:"Documentos Obligatorios ISO 9001:2015", items:[
        { text:"Alcance del SGC (Cláusula 4.3)", guide:"Definan exactamente qué actividades de GAMO están cubiertas por el SGC. Deben considerar: los servicios que ofrecen (asesoría en seguros de vida y GMM, planificación patrimonial), las partes interesadas relevantes (clientes, asesores, SMNYL, CNSF), la ubicación geográfica de operación, y si hay exclusiones justificadas de algún requisito de la norma. Redacten un párrafo claro: 'El SGC de GAMO aplica a: reclutamiento y desarrollo de asesores de seguros, asesoría y venta consultiva de productos de vida y gastos médicos mayores, trámites y gestión de pólizas, y servicio post-venta, operando desde El Marqués, Querétaro.'" },
        { text:"Política de Calidad (Cláusula 5.2)", guide:"Ya la definieron en la Fase 0. Ahora formalícenla como documento controlado del SGC con su código, versión, fecha de aprobación y firma del promotor. Debe estar disponible como información documentada, comunicarse dentro de la organización, y estar disponible para las partes interesadas si lo requieren. Imprímanla y colóquenla en un lugar visible de la oficina." },
        { text:"Objetivos de Calidad (Cláusula 6.2)", guide:"Formalicen los objetivos definidos en la Fase 0 como documento controlado. Para cada objetivo: qué se va a hacer, qué recursos se necesitan, quién es responsable, cuándo se completará, y cómo se evaluarán los resultados. Revísenlos al menos una vez al año en la revisión por la dirección." },
        { text:"Criterios de evaluación de proveedores (Cláusula 8.4)", guide:"Creen un procedimiento que establezca: cómo seleccionan proveedores nuevos (criterios mínimos), cómo evalúan a proveedores existentes (periódicamente — anual o semestral), qué criterios usan (calidad, cumplimiento, precio, servicio), qué acciones toman cuando un proveedor no cumple. Un formato simple de evaluación con escala 1-5 en cada criterio es suficiente para iniciar." },
        { text:"Información documentada de operaciones (Cláusula 8.1)", guide:"Esto es la suma de todos los procedimientos, instrucciones de trabajo, formatos y registros que ya documentaron en la Fase 2. Asegúrense de que estén completos, codificados, y controlados bajo el procedimiento de control de documentos (PS-05)." },
      ]},
      { title:"Registros Obligatorios", items:[
        { text:"Competencia del personal", guide:"Mantengan un expediente por cada miembro del equipo que incluya: CV o solicitud de empleo, copia de cédulas CNSF vigentes, certificados de capacitación (interna y externa), constancias de cursos SMNYL, evaluaciones de desempeño, plan de desarrollo individual. LEGION puede ser el repositorio digital de estos expedientes." },
        { text:"Revisión de requisitos del cliente", guide:"Cada vez que un asesor diseña una propuesta, está 'revisando los requisitos del cliente'. Documenten: la ficha de necesidades del cliente (qué protección necesita, qué presupuesto tiene, qué situación familiar tiene), la propuesta presentada, la aceptación del cliente. Si usan la metodología de 'línea de vida', esa herramienta ya es una forma excelente de documentar este proceso." },
        { text:"Evaluación de proveedores", guide:"Registro anual de evaluación de cada proveedor contra los criterios definidos. Incluyan: nombre del proveedor, servicio/producto, calificación por criterio, calificación global, decisión (mantener, buscar alternativa, dar retroalimentación), firma del evaluador." },
        { text:"No conformidades y acciones correctivas", guide:"Cuando algo sale mal (un trámite rechazado, una queja de cliente, un error en emisión), debe registrarse: descripción de la no conformidad, análisis de causa raíz (¿por qué pasó? — usen los '5 porqués'), acción correctiva implementada, responsable y fecha, verificación de efectividad (¿se resolvió realmente?). Este registro es uno de los más revisados en auditorías ISO." },
        { text:"Auditorías internas", guide:"Registros de cada auditoría: programa anual de auditorías, plan de cada auditoría (alcance, criterios, equipo auditor), informe de hallazgos (conformidades, no conformidades, observaciones, oportunidades de mejora), plan de acciones correctivas para hallazgos, seguimiento al cierre de hallazgos." },
        { text:"Revisión por la dirección", guide:"Acta de cada revisión que documente: fecha, participantes, temas tratados (todos los que exige la Cláusula 9.3), decisiones tomadas, acciones asignadas con responsable y fecha, firma del promotor." },
        { text:"Satisfacción del cliente", guide:"Resultados de encuestas de satisfacción, análisis de tendencias, acciones tomadas con base en retroalimentación. Conserven tanto los datos crudos (respuestas individuales) como los análisis agregados (promedios, tendencias, comparativos)." },
      ]},
      { title:"Manuales Internos", items:[
        { text:"Manual de Calidad", guide:"Aunque ISO 9001:2015 ya no lo exige como obligatorio, es la guía maestra de todo el SGC. Contenido sugerido: presentación de GAMO (historia, ubicación, servicios), alcance del SGC, política de calidad, mapa de procesos, descripción general de cada proceso, referencias a procedimientos detallados, estructura organizacional, exclusiones justificadas si las hay. Extensión: 20-40 páginas. Debe ser un documento vivo que se actualice conforme evoluciona el SGC." },
        { text:"Manual de Organización", guide:"Contiene: organigrama actualizado de GAMO, todas las descripciones de puesto elaboradas en la Fase 1, matriz de competencias, perfiles de puesto. Es el documento de referencia para reclutamiento, inducción, evaluación de desempeño y planes de sucesión." },
        { text:"Manual de Procedimientos Operativos", guide:"Compilación de todos los procedimientos documentados en la Fase 2. Organizado por tipo de proceso (estratégicos, operativos, soporte) con un índice maestro. Cada procedimiento con su diagrama de flujo, instrucciones detalladas, y formatos/registros asociados." },
        { text:"Manual de Inducción para asesores", guide:"Guía para que un asesor nuevo conozca todo lo necesario en sus primeras semanas. Contenido: bienvenida y presentación de GAMO, misión/visión/valores, estructura organizacional, su descripción de puesto y expectativas, introducción a SMNYL y productos, proceso de obtención de cédula CNSF, uso de LEGION, proceso de ventas de GAMO, programa de capacitación, políticas internas, contactos clave." },
        { text:"Manual de Identidad y Código de Ética", guide:"Define las reglas de conducta profesional en GAMO: cómo tratar a clientes (transparencia, honestidad, no venta presionada), cómo manejar información confidencial, política de conflicto de intereses, uso de marca GAMO y SMNYL, código de vestimenta si aplica, consecuencias por incumplimiento. Esto refuerza la cultura de calidad y es apreciado por los auditores ISO." },
      ]},
    ]
  },
  { id:"p4", phase:"Fase 4", title:"Implementación y Cultura de Calidad", iconKey:"rocket",
    desc:"Poner en práctica todo lo anterior y construir la cultura de mejora continua.",
    sections:[
      { title:"Comunicación y Concientización", items:[
        { text:"Comunicar política de calidad al equipo", guide:"No basta con pegarla en la pared. Organicen una sesión formal de lanzamiento donde el promotor presente personalmente: qué es el SGC y por qué GAMO lo está implementando, la política de calidad (léanla juntos), los objetivos de calidad y cómo cada rol contribuye, qué cambiará en el día a día. Después, verifiquen que cada persona puede explicar la política con sus propias palabras. ISO 9001 Cláusula 7.3 exige que todos sean conscientes de la política, los objetivos, su contribución, y las consecuencias de no cumplir." },
        { text:"Capacitar al equipo en calidad e ISO", guide:"No necesitan que todos sean expertos en ISO, pero sí que entiendan: qué es un sistema de gestión de calidad (en lenguaje simple), qué significa 'proceso' y por qué documentar es importante, qué es una no conformidad y cómo reportarla, qué es una auditoría interna y qué esperar, su rol específico dentro del SGC. Pueden hacer una capacitación de 2-3 horas con ejemplos prácticos del día a día de la promotoría." },
        { text:"Asignar Responsable del SGC", guide:"Alguien debe ser el 'dueño' del sistema de gestión. En una promotoría del tamaño de GAMO, probablemente seas tú mismo inicialmente, Antonio, o un gerente con afinidad por procesos. Responsabilidades: mantener la documentación actualizada, coordinar auditorías internas, dar seguimiento a no conformidades y acciones correctivas, preparar la información para la revisión por la dirección, ser el enlace con el organismo certificador. A medida que crezcan, este podría convertirse en un puesto dedicado." },
        { text:"Canales de comunicación interna formales", guide:"Definan y documenten: junta semanal de equipo (agenda estándar: resultados de la semana, pendientes, anuncios, espacio para problemas), comunicado mensual de resultados (puede ser un dashboard en LEGION), canal de WhatsApp/Slack solo para comunicaciones de trabajo (separado de lo social), buzón de sugerencias y mejoras (puede ser digital en LEGION), tablero físico o digital con indicadores clave visibles para todos." },
      ]},
      { title:"Medición y Análisis", items:[
        { text:"Encuestas de satisfacción del asegurado", guide:"Diseñen una encuesta breve (5-7 preguntas máximo) que mida: satisfacción general, calidad de la asesoría recibida, claridad en la explicación del producto, facilidad del proceso de contratación, disposición a recomendar (NPS). Momentos de aplicación: después de la emisión de póliza (30 días), después de un siniestro, en la renovación anual. Pueden usar Google Forms integrado con LEGION, o un módulo propio en LEGION. Lo importante es que se haga sistemáticamente, no solo cuando se acuerden." },
        { text:"Satisfacción del asesor — cliente interno", guide:"Los asesores son clientes internos de la promotoría. Midan: satisfacción con el soporte administrativo, calidad de la capacitación, efectividad del coaching del gerente, herramientas y tecnología disponibles, ambiente de trabajo, plan de compensación. Frecuencia: semestral. Esto les dará información valiosa para mejorar la retención de asesores, que es uno de los retos más grandes de cualquier promotoría." },
        { text:"Tablero de indicadores en LEGION", guide:"LEGION puede convertirse en el centro de comando del SGC. Visualicen en un dashboard: producción (prima nueva y en vigor), actividad comercial (citas, propuestas, cierres), calidad (satisfacción del cliente, no conformidades), desarrollo humano (asesores activos, capacitaciones, progresión). Esto reemplaza la necesidad de reportes manuales y permite tomar decisiones basadas en datos en tiempo real. Si aún no tienen este módulo en LEGION, es un excelente caso de desarrollo prioritario." },
        { text:"Periodicidad de medición y análisis", guide:"Establezcan un calendario formal: diario (actividad comercial básica), semanal (resultados de ventas por asesor, seguimiento a pendientes), mensual (indicadores clave, comparativo vs. meta, análisis de tendencias), trimestral (revisión por la dirección — ISO obligatorio), semestral (satisfacción del asesor, evaluación de proveedores), anual (planeación estratégica, auditoría interna, revisión del FODA)." },
      ]},
      { title:"Mejora Continua", items:[
        { text:"Proceso de no conformidades y acciones correctivas", guide:"Creen un procedimiento formal: (1) Cualquier persona puede reportar una no conformidad (error en trámite, queja de cliente, incumplimiento de procedimiento), (2) Se registra en un formato estándar o en LEGION, (3) El responsable del proceso afectado analiza la causa raíz (técnica de los '5 Porqués' o diagrama de Ishikawa), (4) Se define una acción correctiva con responsable y fecha, (5) Se implementa la acción, (6) Se verifica que fue efectiva (¿el problema se repitió?), (7) Se cierra la no conformidad. Este ciclo es el motor de la mejora continua." },
        { text:"Canal de sugerencias y mejora", guide:"Faciliten que cualquier miembro del equipo proponga mejoras. Puede ser: un formulario simple en LEGION, un espacio fijo en la junta semanal ('¿alguien tiene una idea de mejora?'), un buzón físico o digital. Lo importante: que cada sugerencia reciba respuesta (aunque sea 'no podemos implementarla ahora por X razón'). Reconozcan públicamente las mejores sugerencias implementadas. Esto construye la cultura de mejora continua que ISO valora tanto." },
        { text:"Primera auditoría interna", guide:"La auditoría interna (Cláusula 9.2) verifica que el SGC funciona como está documentado. Para la primera vez: seleccionen un auditor interno (puede ser alguien del equipo capacitado, o un consultor externo), definan el alcance (recomiendo empezar con 2-3 procesos, no todos), usen un checklist basado en las cláusulas de ISO 9001, realicen la auditoría (revisar documentos, entrevistar al equipo, observar la operación), documenten hallazgos, definan acciones correctivas. La primera auditoría siempre es de aprendizaje — no se asusten si encuentran muchas áreas de mejora." },
        { text:"Primera revisión por la dirección", guide:"Reúnan a la dirección (promotor + gerentes) y revisen formalmente: ¿cómo van los indicadores de calidad?, ¿qué resultados tuvo la encuesta de satisfacción?, ¿cuántas no conformidades se han registrado y cerrado?, ¿hay cambios en el contexto que requieran ajustar el SGC?, ¿qué recursos adicionales se necesitan? Documenten todo en un acta. Esta reunión se convierte en un hábito trimestral que les dará control total sobre la calidad de la operación." },
        { text:"Ciclo PDCA para cada proceso", guide:"Planificar-Hacer-Verificar-Actuar es la filosofía central de ISO 9001. Para cada proceso: PLANIFICAR (definir cómo debería funcionar, con qué indicadores), HACER (ejecutar el proceso según lo documentado), VERIFICAR (medir resultados, comparar contra meta, analizar desviaciones), ACTUAR (implementar mejoras, actualizar procedimientos si es necesario). Cada ciclo completo genera aprendizaje. Después de un año de operación, verán mejoras significativas en cada proceso." },
      ]},
      { title:"Rumbo a la Certificación", items:[
        { text:"Seleccionar organismo certificador", guide:"Investiguen y soliciten cotización a 2-3 organismos reconocidos: BSI (British Standards Institution), TÜV (alemán, muy respetado), Bureau Veritas, SGS, ANCE (mexicano). Criterios de selección: costo de la certificación y auditorías de seguimiento, experiencia en el sector servicios/financiero, disponibilidad de auditores en la zona de Querétaro, reputación y reconocimiento del certificado, tiempos de proceso. El costo típico para una organización del tamaño de GAMO puede estar entre $80,000 y $180,000 MXN para la certificación inicial." },
        { text:"Pre-auditoría o gap analysis", guide:"Antes de la auditoría real, hagan un simulacro. Opciones: contratar un consultor ISO que haga un gap analysis formal, hacer una auto-evaluación con un checklist de ISO 9001 (hay muchos disponibles en línea), pedirle al auditor interno que haga una revisión completa. El resultado será una lista de brechas que necesitan cerrar antes de presentarse a certificación. Esto evita la vergüenza y el costo de reprobar la auditoría." },
        { text:"Cerrar hallazgos de pre-auditoría", guide:"Tomen cada brecha identificada y conviértanla en un proyecto con: descripción del hallazgo, acción requerida, responsable, fecha límite, evidencia de cierre. Prioricen: primero las no conformidades mayores (incumplimientos directos de la norma), después las menores (deficiencias parciales), por último las oportunidades de mejora (sugerencias de optimización)." },
        { text:"Auditoría de certificación Fase 1 — documental", guide:"El organismo certificador revisará toda su documentación: manual de calidad, procedimientos, registros, política, objetivos. Verificarán que todo está alineado con ISO 9001:2015 y que no hay vacíos. Esta fase suele ser remota o de un día en sitio. Resultado: informe con observaciones que deben resolverse antes de la Fase 2." },
        { text:"Auditoría de certificación Fase 2 — in situ", guide:"El auditor visitará las instalaciones de GAMO por 1-3 días (depende del tamaño). Observará la operación real, entrevistará al equipo, revisará registros, verificará que lo documentado se practica en el día a día. Preparen al equipo: que sepan explicar qué hacen, cómo lo hacen, y dónde están las evidencias. La actitud correcta es: 'somos transparentes y estamos orgullosos de nuestro sistema', no 'tenemos que impresionar al auditor'." },
        { text:"Cerrar no conformidades", guide:"Si la auditoría detecta no conformidades (es normal que haya algunas), tendrán un plazo (típicamente 30-90 días) para corregirlas y enviar evidencia al organismo certificador. El auditor verificará que las correcciones son adecuadas. Si todo está bien, procede la emisión del certificado." },
        { text:"Obtener certificado ISO 9001:2015", guide:"El certificado tiene vigencia de 3 años, con auditorías de seguimiento anuales (más pequeñas que la inicial). Después de 3 años, se hace una auditoría de recertificación. La certificación no es el fin — es el inicio de un ciclo permanente de mejora. Comuníquenla con orgullo: en su sitio web, en sus materiales, en LEGION, en sus firmas de correo. GAMO sería probablemente la primera promotoría ISO 9001 en el sistema SMNYL — un diferenciador enorme." },
      ]},
    ]
  },
];

// Init done flags
PHASES.forEach(p=>p.sections.forEach(s=>s.items.forEach(i=>{i.done=false})));

const CTX = [
  {s:"Promotoría de Seguros",t:"Persona física o moral con contrato de prestación de servicios con una aseguradora. Misión: atraer, reclutar, seleccionar, acompañar, desarrollar y retener agentes."},
  {s:"SMNYL",t:"Seguros Monterrey New York Life. Vida y GMM, +80 años, respaldo New York Life, ~383 promotores, +6,000 asesores, ~3M asegurados."},
  {s:"GAMO",t:"Promotoría SMNYL en El Marqués, Querétaro. 44 años, +20,000 familias, +110 asesores. Miembros MDRT, COT y TOT."},
  {s:"¿Por qué ISO 9001?",t:"Profesionalizar, documentar, escalar, diferenciarse en SMNYL, alinear con LEGION."},
];

/* ───── App ───── */
export default function App(){
  const [data,setData]=useState(PHASES);
  const [active,setActive]=useState("p0");
  const [ctx,setCtx]=useState(false);
  const [col,setCol]=useState({});
  const [openGuide,setOpenGuide]=useState({});
  const [openWork,setOpenWork]=useState({});
  const [workText,setWorkText]=useState({});
  const [saved,setSaved]=useState({});
  const [loading,setLoading]=useState(true);

  // Load from Supabase and listen to realtime updates
  useEffect(()=>{
    let subscription;
    (async()=>{
      try {
        // Initial load
        const { data: dbData, error } = await supabase.from('app_state').select('data').eq('id', 1).single();
        if(dbData && dbData.data && Object.keys(dbData.data).length > 0) {
          const s = dbData.data;
          if(s.checks) {
            setData(prev=>{
              const n=JSON.parse(JSON.stringify(prev));
              Object.entries(s.checks).forEach(([k,v])=>{
                const [pi,si,ii]=k.split("-").map(Number);
                if(n[pi]&&n[pi].sections[si]&&n[pi].sections[si].items[ii]) n[pi].sections[si].items[ii].done=v;
              });
              return n;
            });
          }
          if(s.work) setWorkText(s.work);
          if(s.active) setActive(s.active);
        }
        
        // Subscribe to realtime changes
        subscription = supabase
          .channel('app_state_changes')
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_state', filter: 'id=eq.1' }, payload => {
            const s = payload.new.data;
            if(s.checks) {
              setData(prev=>{
                const n=JSON.parse(JSON.stringify(prev));
                Object.entries(s.checks).forEach(([k,v])=>{
                  const [pi,si,ii]=k.split("-").map(Number);
                  if(n[pi]&&n[pi].sections[si]&&n[pi].sections[si].items[ii]) n[pi].sections[si].items[ii].done=v;
                });
                return n;
              });
            }
            if(s.work) setWorkText(s.work);
            if(s.active) setActive(s.active);
          })
          .subscribe();
      } catch(e){ console.log("Error loading state", e); }
      setLoading(false);
    })();
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  },[]);

  // Save to Supabase
  const persist = useCallback(async (d,w,a)=>{
    const checks={};
    d.forEach((p,pi)=>p.sections.forEach((s,si)=>s.items.forEach((it,ii)=>{
      if(it.done) checks[`${pi}-${si}-${ii}`]=true;
    })));
    try{
      const payload = {checks,work:w,active:a};
      await supabase.from('app_state').update({ data: payload }).eq('id', 1);
    }catch(e){console.log("Save error",e)}
  },[]);

  const tog=(pi,si,ii)=>{
    setData(prev=>{
      const n=JSON.parse(JSON.stringify(prev));
      n[pi].sections[si].items[ii].done=!n[pi].sections[si].items[ii].done;
      persist(n,workText,active);
      return n;
    });
  };

  const saveWork=(key,val)=>{
    const nw={...workText,[key]:val};
    setWorkText(nw);
    setSaved(p=>({...p,[key]:true}));
    persist(data,nw,active);
    setTimeout(()=>setSaved(p=>({...p,[key]:false})),1500);
  };

  const cnt=(p)=>{let d=0,t=0;p.sections.forEach(s=>s.items.forEach(i=>{t++;if(i.done)d++;}));return{d,t};};
  const glob=()=>{let d=0,t=0;data.forEach(p=>p.sections.forEach(s=>s.items.forEach(i=>{t++;if(i.done)d++;})));return{d,t};};

  const ai=data.findIndex(p=>p.id===active);
  const ap=data[ai];
  const th=TH[ai];
  const{d:gd,t:gt}=glob();

  if(loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",fontFamily:"'Montserrat',sans-serif",color:P.s500}}>Cargando...</div>;

  return(
    <div style={{minHeight:"100vh",background:P.bg,fontFamily:"'Montserrat',sans-serif",color:P.s800}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::selection{background:#5a726033}
        .row:hover{background:${P.s50}}
        .tab{cursor:pointer;transition:all .2s;border:none;outline:none;font-family:'Montserrat',sans-serif}
        .tab:hover{transform:translateY(-1px)}
        .sh{cursor:pointer;user-select:none;transition:opacity .15s}
        .sh:hover{opacity:.8}
        .togbtn{cursor:pointer;border:none;outline:none;font-family:'Montserrat',sans-serif;transition:all .15s}
        .togbtn:hover{opacity:.85}
        @keyframes si{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}
        .anim{animation:si .2s ease}
        textarea{font-family:'Montserrat',sans-serif;resize:vertical}
        textarea:focus{outline:none;border-color:${P.s400}}
        ::-webkit-scrollbar{height:4px;width:6px}
        ::-webkit-scrollbar-thumb{background:${P.s300};border-radius:3px}
        
        /* Responsive Classes */
        .app-header { padding: 32px 24px 24px; }
        .app-nav { padding: 16px 24px 0; }
        .app-main { padding: 20px 24px 48px; }
        .header-title { font-size: 19px; }
        .action-btns { padding: 0 16px 6px 46px; }
        .panel { margin: 0 16px 8px 46px; padding: 12px 14px; }

        @media (max-width: 600px) {
          .app-header { padding: 24px 16px 20px; }
          .app-nav { padding: 16px 16px 0; }
          .app-main { padding: 20px 16px 48px; }
          .header-title { font-size: 17.5px; }
          .action-btns { padding: 0 12px 8px 36px; flex-wrap: wrap; }
          .panel { margin: 0 12px 10px 36px; padding: 12px 12px; }
        }
      `}</style>

      {/* Header */}
      <header className="app-header" style={{background:P.s900,color:P.s50}}>
        <div style={{maxWidth:860,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:22}}>
            <div style={{width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,#5a7260,#7a9680)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 10px rgba(90,114,96,.35)"}}>{I.layers("#fff")}</div>
            <div>
              <h1 className="header-title" style={{fontWeight:800,letterSpacing:"-.03em",lineHeight:1.15}}>GAMO &rarr; ISO 9001</h1>
              <p style={{fontSize:11.5,color:P.s400,marginTop:2,fontWeight:500}}>Roadmap de profesionalización organizacional</p>
            </div>
          </div>
          <div style={{background:"rgba(255,255,255,.04)",borderRadius:10,padding:"14px 16px",border:"1px solid rgba(255,255,255,.05)"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10,fontSize:11.5,fontWeight:600}}>
              <span style={{color:P.s400}}>Progreso general</span>
              <span style={{fontFamily:"'DM Mono',monospace",color:P.s300}}>{gd} de {gt} tareas</span>
            </div>
            <div style={{height:3,borderRadius:2,background:"rgba(255,255,255,.07)"}}>
              <div style={{height:"100%",borderRadius:2,width:`${gt===0?0:(gd/gt)*100}%`,background:"linear-gradient(90deg,#5a7260,#7a9680)",transition:"width .5s cubic-bezier(.25,.46,.45,.94)"}}/>
            </div>
          </div>
          <button onClick={()=>setCtx(!ctx)} style={{marginTop:8,width:"100%",textAlign:"left",background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:8,padding:"9px 13px",color:P.s400,fontSize:11.5,fontWeight:500,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:"'Montserrat',sans-serif"}}>
            <span style={{display:"flex",alignItems:"center",gap:7}}>{I.info(P.s500)} Contexto — Promotoría SMNYL y GAMO</span>
            {I.chev(P.s500,ctx)}
          </button>
          {ctx&&<div style={{marginTop:4,background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.05)",borderRadius:10,padding:"16px 14px",fontSize:12,lineHeight:1.65,color:P.s300}}>
            {CTX.map((c,i)=><div key={i} style={{marginBottom:i<CTX.length-1?12:0}}><span style={{fontWeight:700,color:"#7a9680"}}>{c.s}</span><p style={{marginTop:2}}>{c.t}</p></div>)}
          </div>}
        </div>
      </header>

      {/* Tabs */}
      <nav className="app-nav" style={{maxWidth:860,margin:"0 auto",display:"flex",gap:5,overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
        {data.map((p,i)=>{
          const{d,t}=cnt(p);const on=p.id===active;const c=TH[i];
          return <button key={p.id} className="tab" onClick={()=>{setActive(p.id);persist(data,workText,p.id);}} style={{flexShrink:0,padding:"11px 14px",borderRadius:10,background:on?c.main:"#fff",color:on?"#fff":P.s500,fontSize:11.5,fontWeight:600,boxShadow:on?`0 3px 14px ${c.main}20`:"0 1px 2px rgba(0,0,0,.04)",border:on?"none":`1px solid ${P.border}`,display:"flex",flexDirection:"column",alignItems:"center",gap:5,minWidth:76}}>
            <div style={{opacity:on?1:.55}}>{I[p.iconKey](on?"#fff":c.main)}</div>
            <span>{p.phase}</span>
            <span style={{fontSize:9.5,fontFamily:"'DM Mono',monospace",opacity:.65}}>{d}/{t}</span>
          </button>;
        })}
      </nav>

      {/* Content */}
      {ap&&<main className="app-main" style={{maxWidth:860,margin:"0 auto"}}>
        <div style={{marginBottom:18}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:5}}>
            {I[ap.iconKey](th.main)}
            <h2 style={{fontSize:16,fontWeight:800,color:th.main,letterSpacing:"-.02em"}}>{ap.title}</h2>
          </div>
          <p style={{fontSize:12.5,color:P.s500,lineHeight:1.55,marginBottom:12,paddingLeft:32}}>{ap.desc}</p>
          <div style={{paddingLeft:32,display:"flex",alignItems:"center",gap:12}}>
            <div style={{flex:1,height:3,borderRadius:2,background:P.s200}}>
              <div style={{width:`${cnt(ap).t===0?0:(cnt(ap).d/cnt(ap).t)*100}%`,height:"100%",borderRadius:2,background:th.acc,transition:"width .5s"}}/>
            </div>
            <span style={{fontSize:11.5,fontWeight:600,color:th.acc,fontFamily:"'DM Mono',monospace",minWidth:34,textAlign:"right"}}>{cnt(ap).t===0?0:Math.round((cnt(ap).d/cnt(ap).t)*100)}%</span>
          </div>
        </div>

        {ap.sections.map((sec,si)=>{
          const k=`${active}-${si}`;const open=col[k]!==true;const sd=sec.items.filter(i=>i.done).length;
          return <div key={si} style={{background:"#fff",borderRadius:12,marginBottom:7,border:`1px solid ${P.border}`,overflow:"hidden"}}>
            <div className="sh" onClick={()=>setCol(p=>({...p,[k]:!p[k]}))} style={{padding:"13px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:open?`1px solid ${P.borderL}`:"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                {I.chev(th.main,open)}
                <span style={{fontSize:13,fontWeight:700,color:th.main}}>{sec.title}</span>
              </div>
              <span style={{fontSize:10.5,fontWeight:600,color:P.s400,fontFamily:"'DM Mono',monospace",background:P.s100,padding:"2px 9px",borderRadius:20}}>{sd}/{sec.items.length}</span>
            </div>
            {open&&<div style={{padding:"4px 0"}}>
              {sec.items.map((item,ii)=>{
                const gk=`g-${ai}-${si}-${ii}`;
                const wk=`w-${ai}-${si}-${ii}`;
                const gOpen=openGuide[gk];
                const wOpen=openWork[wk];
                const wVal=workText[wk]||"";
                const isSaved=saved[wk];
                return <div key={ii} style={{borderBottom:ii<sec.items.length-1?`1px solid ${P.borderL}`:"none"}}>
                  {/* Main row */}
                  <div className="row" onClick={()=>tog(ai,si,ii)} style={{padding:"10px 16px",display:"flex",gap:11,alignItems:"flex-start",cursor:"pointer",borderRadius:0,transition:"background .12s"}}>
                    <div style={{width:19,height:19,borderRadius:5,flexShrink:0,marginTop:1,border:item.done?"none":`1.5px solid ${P.s300}`,background:item.done?th.acc:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>{item.done&&I.chk("#fff")}</div>
                    <span style={{textAlign:"left",fontSize:12.5,lineHeight:1.55,fontWeight:500,color:item.done?P.s400:P.s700,textDecoration:item.done?"line-through":"none",flex:1}}>{item.text}</span>
                  </div>

                  {/* Action buttons */}
                  <div className="action-btns" style={{display:"flex",gap:6}}>
                    <button className="togbtn" onClick={()=>setOpenGuide(p=>({...p,[gk]:!p[gk]}))} style={{
                      padding:"5px 10px",borderRadius:6,fontSize:11,fontWeight:600,
                      background:gOpen?th.lt:"transparent",color:gOpen?th.main:P.s400,
                      display:"flex",alignItems:"center",gap:5,
                      border:`1px solid ${gOpen?th.acc+"30":P.s200}`
                    }}>
                      {I.book(gOpen?th.main:P.s400)} Guía
                    </button>
                    <button className="togbtn" onClick={()=>setOpenWork(p=>({...p,[wk]:!p[wk]}))} style={{
                      padding:"5px 10px",borderRadius:6,fontSize:11,fontWeight:600,
                      background:wOpen?"#fef9ef":"transparent",color:wOpen?"#92613a":P.s400,
                      display:"flex",alignItems:"center",gap:5,
                      border:`1px solid ${wOpen?"#d4a86020":P.s200}`
                    }}>
                      {I.edit(wOpen?"#92613a":P.s400)} Espacio de trabajo {wVal?"·":""}
                      {wVal&&<span style={{width:6,height:6,borderRadius:3,background:"#92613a",opacity:.6}}/>}
                    </button>
                  </div>

                  {/* Guide panel */}
                  {gOpen&&<div className="anim panel" style={{background:th.lt,borderRadius:8,borderLeft:`3px solid ${th.acc}40`,fontSize:12,lineHeight:1.7,color:P.s600}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6,fontWeight:700,fontSize:11.5,color:th.main,textTransform:"uppercase",letterSpacing:".04em"}}>
                      {I.hint(th.acc)} Guía detallada
                    </div>
                    {item.guide}
                  </div>}

                  {/* Work panel */}
                  {wOpen&&<div className="anim panel" style={{background:"#fefcf6",borderRadius:8,borderLeft:"3px solid #d4a86030",fontSize:12}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,fontWeight:700,fontSize:11.5,color:"#92613a",textTransform:"uppercase",letterSpacing:".04em"}}>
                        {I.edit("#92613a")} Tu trabajo
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        {isSaved&&<span style={{fontSize:10,color:"#5a7260",fontWeight:600,animation:"si .2s ease"}}>Guardado</span>}
                        <button className="togbtn" onClick={()=>saveWork(wk,wVal)} style={{
                          padding:"4px 10px",borderRadius:5,fontSize:10.5,fontWeight:600,
                          background:"#92613a",color:"#fff",display:"flex",alignItems:"center",gap:4,border:"none"
                        }}>{I.save("#fff")} Guardar</button>
                      </div>
                    </div>
                    <textarea
                      value={wVal}
                      onChange={e=>{const v=e.target.value;setWorkText(p=>({...p,[wk]:v}));}}
                      onClick={e=>e.stopPropagation()}
                      placeholder="Escribe aquí tus notas, borradores, definiciones..."
                      style={{
                        width:"100%",minHeight:100,padding:"10px 12px",borderRadius:6,
                        border:`1px solid ${P.s200}`,background:"#fff",fontSize:12.5,
                        lineHeight:1.65,color:P.s700
                      }}
                    />
                  </div>}
                </div>;
              })}
            </div>}
          </div>;
        })}
      </main>}
    </div>
  );
}
