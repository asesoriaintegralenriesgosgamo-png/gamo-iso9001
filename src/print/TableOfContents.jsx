/**
 * TableOfContents — auto-generated from PHASES.
 *
 * Lists each fase with its sections and per-section coverage. CSS print
 * cannot resolve dynamic page numbers without extra JS, so we use the
 * fase code (F0..F4) as the navigation anchor since each fase begins on
 * a new page.
 */

import { PRINT_PALETTE, PHASE_THEMES } from "./printStyles.js";

function LeaderRow({ left, right, color }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "baseline",
      gap: "8pt",
      marginBottom: "4pt",
    }}>
      <div style={{ flexShrink: 0, color, fontWeight: 600 }}>{left}</div>
      <div style={{
        flex: 1,
        borderBottom: `1px dotted ${PRINT_PALETTE.mutedLight}`,
        margin: "0 4pt",
        position: "relative",
        top: "-3pt",
      }} />
      <div style={{ flexShrink: 0, fontWeight: 700, color, fontSize: "9.5pt" }}>{right}</div>
    </div>
  );
}

export function TableOfContents({ data, summary }) {
  return (
    <section className="print-toc" style={{ color: PRINT_PALETTE.ink }}>
      <header style={{ marginBottom: "16pt", borderBottom: `2pt solid ${PRINT_PALETTE.ink}`, paddingBottom: "8pt" }}>
        <div style={{
          fontSize: "9pt",
          fontWeight: 700,
          color: PRINT_PALETTE.muted,
          textTransform: "uppercase",
          letterSpacing: ".08em",
        }}>
          Tabla de contenidos
        </div>
        <h2 style={{ fontSize: "20pt", fontWeight: 800, margin: "3pt 0 0 0" }}>
          Estructura del documento
        </h2>
      </header>

      <div style={{ fontSize: "9.5pt", color: PRINT_PALETTE.muted, marginBottom: "20pt", fontStyle: "italic" }}>
        Cada fase inicia en una nueva página. Use los códigos F0–F4 al pie como referencia.
      </div>

      {/* Pre-content sections */}
      <div style={{ marginBottom: "16pt" }}>
        <LeaderRow left="Portada" right="i" color={PRINT_PALETTE.muted} />
        <LeaderRow left="Resumen ejecutivo · Avance del SGC" right="ii" color={PRINT_PALETTE.muted} />
        <LeaderRow left="Tabla de contenidos" right="iii" color={PRINT_PALETTE.muted} />
      </div>

      {/* Phases */}
      {data.map((phase, pi) => {
        const theme = PHASE_THEMES[pi] || PHASE_THEMES[0];
        const phaseSummary = summary.phases[pi];
        return (
          <div key={phase.id} className="print-keep" style={{ marginBottom: "14pt" }}>
            <div style={{
              display: "flex",
              alignItems: "baseline",
              gap: "10pt",
              marginBottom: "6pt",
              paddingBottom: "4pt",
              borderBottom: `1px solid ${PRINT_PALETTE.ruleSoft}`,
            }}>
              <div style={{
                background: theme.main,
                color: "#fff",
                padding: "3pt 9pt",
                borderRadius: "3pt",
                fontSize: "9pt",
                fontWeight: 800,
                letterSpacing: ".06em",
              }}>{phase.phase.replace("Fase ", "F")}</div>
              <div style={{ flex: 1, fontSize: "12pt", fontWeight: 700, color: PRINT_PALETTE.ink }}>
                {phase.phase}: {phase.title}
              </div>
              <div style={{ fontSize: "9pt", fontWeight: 700, color: theme.main }}>
                {phaseSummary.pct}% · {phaseSummary.done}/{phaseSummary.total}
              </div>
            </div>
            <div style={{ paddingLeft: "12pt" }}>
              {phase.sections.map((sec, si) => {
                const stats = phaseSummary.sectionStats[si];
                return (
                  <LeaderRow
                    key={si}
                    left={sec.title}
                    right={`${stats.done}/${stats.total}`}
                    color={PRINT_PALETTE.inkSoft}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}
