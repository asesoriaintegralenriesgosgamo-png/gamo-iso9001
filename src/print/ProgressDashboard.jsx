/**
 * ProgressDashboard — single-page executive summary.
 *
 * Includes:
 *   - Overall progress (%)
 *   - Days remaining vs. target date
 *   - Per-phase horizontal bars (count + %)
 *   - Coverage table by section (total / done / filled / %)
 *   - State badge (BORRADOR / REVISIÓN / FINAL)
 */

import { REPORT_METADATA, PRINT_PALETTE, PHASE_THEMES } from "./printStyles.js";
import { daysUntil, documentState } from "./helpers/progress.js";

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      flex: 1,
      background: PRINT_PALETTE.cream,
      border: `1px solid ${PRINT_PALETTE.rule}`,
      borderTop: `3pt solid ${color}`,
      borderRadius: "5pt",
      padding: "12pt 14pt",
    }}>
      <div style={{
        fontSize: "8.5pt",
        fontWeight: 700,
        color: PRINT_PALETTE.muted,
        textTransform: "uppercase",
        letterSpacing: ".06em",
      }}>{label}</div>
      <div style={{
        fontSize: "26pt",
        fontWeight: 800,
        color: PRINT_PALETTE.ink,
        lineHeight: 1.1,
        marginTop: "4pt",
      }}>{value}</div>
      {sub && (
        <div style={{ fontSize: "9pt", color: PRINT_PALETTE.muted, marginTop: "4pt" }}>{sub}</div>
      )}
    </div>
  );
}

function PhaseBar({ phase, theme }) {
  return (
    <div style={{ marginBottom: "10pt" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3pt" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8pt" }}>
          <span style={{
            fontSize: "8.5pt",
            fontWeight: 800,
            color: theme.main,
            background: theme.lt,
            padding: "2pt 7pt",
            borderRadius: "3pt",
            letterSpacing: ".05em",
            textTransform: "uppercase",
          }}>{phase.phase}</span>
          <span style={{ fontSize: "10pt", fontWeight: 600, color: PRINT_PALETTE.ink }}>{phase.title}</span>
        </div>
        <span style={{ fontSize: "9.5pt", fontWeight: 700, color: theme.main }}>
          {phase.pct}% · {phase.done}/{phase.total}
        </span>
      </div>
      <div style={{
        height: "8pt",
        background: PRINT_PALETTE.ruleSoft,
        borderRadius: "999pt",
        overflow: "hidden",
        position: "relative",
      }}>
        <div style={{
          width: `${phase.pct}%`,
          height: "100%",
          background: theme.main,
        }} />
        {phase.filled > phase.done && (
          <div style={{
            position: "absolute",
            top: 0,
            left: `${phase.pct}%`,
            width: `${Math.min(100 - phase.pct, ((phase.filled - phase.done) / phase.total) * 100)}%`,
            height: "100%",
            background: theme.acc,
            opacity: 0.45,
          }} />
        )}
      </div>
      {phase.filled > phase.done && (
        <div style={{ fontSize: "8.5pt", color: PRINT_PALETTE.muted, marginTop: "2pt", fontStyle: "italic" }}>
          + {phase.filled - phase.done} con evidencia documentada (sin marcar como completado)
        </div>
      )}
    </div>
  );
}

function SectionCoverageTable({ summary }) {
  const rows = [];
  summary.phases.forEach((phase, pi) => {
    const theme = PHASE_THEMES[pi] || PHASE_THEMES[0];
    phase.sectionStats.forEach((sec) => {
      rows.push({
        phaseLabel: phase.phase,
        phaseColor: theme.main,
        title: sec.title,
        total: sec.total,
        done: sec.done,
        filled: sec.filled,
        pct: sec.total === 0 ? 0 : Math.round((sec.done / sec.total) * 100),
      });
    });
  });

  return (
    <table style={{
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "9pt",
      marginTop: "12pt",
    }}>
      <thead>
        <tr>
          {["Fase", "Sección", "Total", "Completados", "Con evidencia", "% avance"].map((h, i) => (
            <th key={i} style={{
              textAlign: i < 2 ? "left" : "center",
              padding: "6pt 8pt",
              fontSize: "8pt",
              fontWeight: 700,
              color: PRINT_PALETTE.muted,
              textTransform: "uppercase",
              letterSpacing: ".05em",
              background: PRINT_PALETTE.cream,
              borderBottom: `1.5pt solid ${PRINT_PALETTE.rule}`,
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={idx}>
            <td style={{ padding: "5pt 8pt", borderBottom: `1px solid ${PRINT_PALETTE.ruleSoft}`, fontSize: "8.5pt", fontWeight: 700, color: row.phaseColor }}>
              {row.phaseLabel}
            </td>
            <td style={{ padding: "5pt 8pt", borderBottom: `1px solid ${PRINT_PALETTE.ruleSoft}`, color: PRINT_PALETTE.inkSoft }}>
              {row.title}
            </td>
            <td style={{ padding: "5pt 8pt", borderBottom: `1px solid ${PRINT_PALETTE.ruleSoft}`, textAlign: "center", color: PRINT_PALETTE.muted }}>
              {row.total}
            </td>
            <td style={{ padding: "5pt 8pt", borderBottom: `1px solid ${PRINT_PALETTE.ruleSoft}`, textAlign: "center", color: PRINT_PALETTE.ink, fontWeight: 600 }}>
              {row.done}
            </td>
            <td style={{ padding: "5pt 8pt", borderBottom: `1px solid ${PRINT_PALETTE.ruleSoft}`, textAlign: "center", color: PRINT_PALETTE.ink }}>
              {row.filled}
            </td>
            <td style={{ padding: "5pt 8pt", borderBottom: `1px solid ${PRINT_PALETTE.ruleSoft}`, textAlign: "center", fontWeight: 700, color: row.phaseColor }}>
              {row.pct}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ProgressDashboard({ summary }) {
  const days = daysUntil(REPORT_METADATA.targetDateISO);
  const state = documentState(summary.pct);

  return (
    <section className="print-dashboard" style={{ padding: "0", color: PRINT_PALETTE.ink }}>
      <header style={{ marginBottom: "16pt", borderBottom: `2pt solid ${PRINT_PALETTE.ink}`, paddingBottom: "8pt" }}>
        <div style={{
          fontSize: "9pt",
          fontWeight: 700,
          color: PRINT_PALETTE.muted,
          textTransform: "uppercase",
          letterSpacing: ".08em",
        }}>
          Resumen ejecutivo
        </div>
        <h2 style={{ fontSize: "20pt", fontWeight: 800, margin: "3pt 0 0 0" }}>
          Avance del Sistema de Gestión de Calidad
        </h2>
      </header>

      {/* Stat row */}
      <div style={{ display: "flex", gap: "10pt", marginBottom: "20pt" }}>
        <StatCard
          label="Avance global"
          value={`${summary.pct}%`}
          sub={`${summary.done} de ${summary.total} ejercicios`}
          color={state.color}
        />
        <StatCard
          label="Con evidencia"
          value={`${summary.pctFilled}%`}
          sub={`${summary.filled} ejercicios documentados`}
          color={PRINT_PALETTE.brand}
        />
        <StatCard
          label="Días restantes"
          value={days}
          sub={`Meta: ${new Date(REPORT_METADATA.targetDateISO).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}`}
          color="#577080"
        />
        <StatCard
          label="Estado"
          value={state.label}
          sub={`Versión v${REPORT_METADATA.documentVersion}`}
          color={state.color}
        />
      </div>

      {/* Per-phase bars */}
      <div style={{
        background: PRINT_PALETTE.cream,
        border: `1px solid ${PRINT_PALETTE.rule}`,
        borderRadius: "5pt",
        padding: "14pt 16pt",
        marginBottom: "16pt",
      }}>
        <div style={{
          fontSize: "9.5pt",
          fontWeight: 700,
          color: PRINT_PALETTE.muted,
          textTransform: "uppercase",
          letterSpacing: ".05em",
          marginBottom: "10pt",
        }}>
          Avance por fase
        </div>
        {summary.phases.map((phase, pi) => (
          <PhaseBar key={phase.id} phase={phase} theme={PHASE_THEMES[pi] || PHASE_THEMES[0]} />
        ))}
      </div>

      {/* Section coverage */}
      <div className="print-keep">
        <div style={{
          fontSize: "9.5pt",
          fontWeight: 700,
          color: PRINT_PALETTE.muted,
          textTransform: "uppercase",
          letterSpacing: ".05em",
          marginBottom: "4pt",
        }}>
          Cobertura por sección
        </div>
        <SectionCoverageTable summary={summary} />
      </div>
    </section>
  );
}
