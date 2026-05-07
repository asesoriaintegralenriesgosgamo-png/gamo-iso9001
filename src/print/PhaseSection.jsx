/**
 * PhaseSection — renders one ISO phase (5 total) with its sections and items.
 *
 * Each phase forces a page break (.print-phase) so each fase begins fresh.
 */

import { ItemBlock } from "./ItemBlock.jsx";
import { PRINT_PALETTE, PHASE_THEMES } from "./printStyles.js";
import { getFieldType } from "../workspace/fieldTypes.js";
import { parseWork, isFilled } from "../workspace/helpers/persistence.js";

function hasAnyContent(phase, phaseIndex, workText) {
  return phase.sections.some((sec, si) =>
    sec.items.some((item, ii) => {
      if (item.done === true) return true;
      const wk = `w-${phaseIndex}-${si}-${ii}`;
      const raw = workText[wk];
      if (!raw) return false;
      const fieldType = item.fieldType || "textarea";
      const handler = getFieldType(fieldType);
      const parsed = parseWork(raw, fieldType, handler.defaultValue);
      return isFilled(parsed.value, fieldType) || Boolean(parsed.legacyText);
    })
  );
}

function sectionStats(section, phaseIndex, sectionIndex, workText) {
  let total = 0, done = 0, filled = 0;
  section.items.forEach((item, ii) => {
    total++;
    if (item.done) done++;
    const wk = `w-${phaseIndex}-${sectionIndex}-${ii}`;
    const raw = workText[wk];
    if (!raw) return;
    const fieldType = item.fieldType || "textarea";
    const handler = getFieldType(fieldType);
    const parsed = parseWork(raw, fieldType, handler.defaultValue);
    if (isFilled(parsed.value, fieldType) || Boolean(parsed.legacyText)) filled++;
  });
  return { total, done, filled };
}

export function PhaseSection({ phase, phaseIndex, workText }) {
  if (!hasAnyContent(phase, phaseIndex, workText)) return null;
  const theme = PHASE_THEMES[phaseIndex] || PHASE_THEMES[0];

  return (
    <section className="print-phase" style={{ marginBottom: "20pt" }}>
      {/* Phase header — full bleed band */}
      <header style={{
        background: theme.main,
        color: "#fff",
        padding: "14pt 16pt",
        marginBottom: "16pt",
        borderRadius: "4pt",
      }}>
        <div style={{ fontSize: "9.5pt", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", opacity: 0.85 }}>
          {phase.phase}
        </div>
        <h2 style={{ fontSize: "18pt", fontWeight: 800, margin: "2pt 0 0 0", lineHeight: 1.2 }}>
          {phase.title}
        </h2>
        {phase.desc && (
          <p style={{ fontSize: "10pt", margin: "6pt 0 0 0", opacity: 0.92, fontStyle: "italic", lineHeight: 1.45 }}>
            {phase.desc}
          </p>
        )}
      </header>

      {phase.sections.map((sec, si) => {
        const stats = sectionStats(sec, phaseIndex, si, workText);
        const visibleItems = sec.items.map((item, ii) => (
          <ItemBlock
            key={ii}
            item={item}
            phaseIndex={phaseIndex}
            sectionIndex={si}
            itemIndex={ii}
            workText={workText}
            theme={theme}
          />
        )).filter(Boolean);

        const hasVisible = visibleItems.some((i) => i !== null);
        if (!hasVisible) return null;

        return (
          <div key={si} className="print-section" style={{ marginBottom: "18pt" }}>
            <h3 style={{
              fontSize: "12pt",
              fontWeight: 700,
              color: theme.main,
              borderBottom: `1pt solid ${theme.acc}40`,
              paddingBottom: "5pt",
              marginBottom: "10pt",
              textTransform: "uppercase",
              letterSpacing: ".04em",
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: "10pt",
            }}>
              <span>{sec.title}</span>
              <span style={{
                fontSize: "8.5pt",
                fontWeight: 600,
                letterSpacing: ".03em",
                color: PRINT_PALETTE.muted,
                textTransform: "none",
              }}>
                {stats.done}/{stats.total} completados · {stats.filled}/{stats.total} con evidencia
              </span>
            </h3>
            {visibleItems}
          </div>
        );
      })}
    </section>
  );
}
