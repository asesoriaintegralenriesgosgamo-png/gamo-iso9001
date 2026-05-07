/**
 * Print styles + report metadata for the PDF export.
 *
 * Editing the cover page / footer / header text? Update REPORT_METADATA below.
 */

export const REPORT_METADATA = {
  orgShortName: "GAMO",
  orgFullName: "Asesoría Integral en Riesgos GAMO",
  orgGiro: "Promotoría de seguros — SMNYL (Seguros Monterrey New York Life)",
  orgLocation: "El Marqués, Querétaro · México",
  orgSince: "1981",
  documentTitle: "Documentación del Sistema de Gestión de Calidad",
  documentSubtitle: "Manual integral de implementación y evidencias",
  documentVersion: "1.0",
  documentStatus: "Borrador",
  isoStandard: "ISO 9001:2015",
  responsableSGC: "Director General — Antonio De La Mora",
  procedureRef: "PS-05 — Control de información documentada",
  targetDateISO: "2026-08-04",
  signatureRoles: [
    { role: "Elaborado por", who: "" },
    { role: "Revisado por", who: "" },
    { role: "Aprobado por", who: "" },
  ],
};

export const PRINT_PALETTE = {
  ink: "#1c1917",
  inkSoft: "#44403c",
  muted: "#78716c",
  mutedLight: "#a8a29e",
  rule: "#e7e5e4",
  ruleSoft: "#f0eeea",
  paper: "#fff",
  cream: "#fdfcfa",
  brand: "#5a7260",
  brandSoft: "#ecf1ed",
  accent: "#92613a",
  accentSoft: "#fef9ef",
  warn: "#c53b3b",
};

export const PHASE_THEMES = [
  { main: "#5b6770", acc: "#7b8a94", lt: "#eef1f3" },
  { main: "#5a7260", acc: "#7a9680", lt: "#ecf1ed" },
  { main: "#6b5f75", acc: "#8d8197", lt: "#f0ecf2" },
  { main: "#8a6e4e", acc: "#a9895e", lt: "#f4efe7" },
  { main: "#577080", acc: "#7591a3", lt: "#eaf0f4" },
];

/**
 * Returns the CSS string injected by PrintReport. Kept as a function so that
 * template-literal substitutions stay readable.
 */
export function buildPrintCSS() {
  return `
    /* ── Page geometry ─────────────────────────────────────────── */
    @page {
      size: A4;
      margin: 1.8cm 1.5cm 2.2cm 1.5cm;
      @bottom-right {
        content: counter(page) " / " counter(pages);
        font-family: -apple-system, system-ui, sans-serif;
        font-size: 9pt;
        color: ${PRINT_PALETTE.muted};
      }
      @bottom-left {
        content: "${REPORT_METADATA.orgShortName} · ${REPORT_METADATA.isoStandard}";
        font-family: -apple-system, system-ui, sans-serif;
        font-size: 9pt;
        color: ${PRINT_PALETTE.muted};
      }
      @top-right {
        content: "v${REPORT_METADATA.documentVersion} · ${REPORT_METADATA.documentStatus}";
        font-family: -apple-system, system-ui, sans-serif;
        font-size: 8.5pt;
        color: ${PRINT_PALETTE.mutedLight};
      }
    }

    /* Cover page: no header/footer */
    @page :first {
      margin: 0;
      @top-right { content: ""; }
      @bottom-right { content: ""; }
      @bottom-left { content: ""; }
    }

    @media print {
      /* Honor backgrounds and colors (severity, category chips) */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      body {
        background: ${PRINT_PALETTE.paper} !important;
        color: ${PRINT_PALETTE.ink} !important;
        font-family: -apple-system, "SF Pro Text", system-ui, sans-serif;
        font-size: 10.5pt;
        line-height: 1.45;
      }

      /* Avoid orphan/widow lines breaking awkwardly */
      p, li, td, th, h1, h2, h3, h4 { orphans: 3; widows: 3; }

      /* Section / page break utilities */
      .print-cover     { page-break-after: always; break-after: page; }
      .print-dashboard { page-break-after: always; break-after: page; }
      .print-toc       { page-break-after: always; break-after: page; }
      .print-phase     { page-break-before: always; break-before: page; }
      .print-phase:first-child { page-break-before: auto; break-before: auto; }
      .print-section   { page-break-inside: avoid; break-inside: avoid-page; }
      .print-item      { page-break-inside: avoid; break-inside: avoid-page; }
      .print-keep      { page-break-inside: avoid; break-inside: avoid-page; }

      /* Headings should stay with following content */
      h1, h2, h3, h4 { page-break-after: avoid; break-after: avoid-page; }

      /* Cover: full bleed background possible */
      .print-cover { padding: 2.4cm 2cm; }
    }
  `;
}
