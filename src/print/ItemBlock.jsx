/**
 * ItemBlock — renders a single exercise in the print report.
 *
 * Header: title + status badge + field-type badge + ISO clause (if found in guide).
 * Body: legacy free-text fallback (if any) + the appropriate Printer for the type.
 */

import { getFieldType, DEFAULT_FIELD_TYPE } from "../workspace/fieldTypes.js";
import { parseWork, isFilled } from "../workspace/helpers/persistence.js";
import { PRINT_PALETTE } from "./printStyles.js";

const FIELD_TYPE_LABEL = {
  textarea: null,
  table: "Tabla estructurada",
  "structured-form": "Formulario guiado",
  "matrix-2x2": "Matriz 2×2",
  matrix: "Matriz nivel",
  "risk-heatmap": "Matriz de riesgos",
  ishikawa: "Ishikawa (causa raíz)",
  timeline: "Calendario de cadencias",
  "survey-builder": "Encuesta",
  "org-chart": "Organigrama",
  flowchart: "Flujograma",
  "process-map": "Mapa de procesos",
  "career-path": "Ruta de carrera",
};

const ISO_CLAUSE_REGEX = /Cláusula\s+(\d+(?:\.\d+)*)/;

function StatusBadge({ done, filled }) {
  if (done && filled) return <Chip label="Completado" color="#5a7260" bg="#ecf1ed" />;
  if (done) return <Chip label="Completado" color="#5a7260" bg="#ecf1ed" />;
  if (filled) return <Chip label="En progreso" color="#92613a" bg="#fef9ef" />;
  return null;
}

function Chip({ label, color, bg }) {
  return (
    <span style={{
      display: "inline-block",
      fontSize: "8.5pt",
      fontWeight: 700,
      letterSpacing: ".04em",
      textTransform: "uppercase",
      color,
      background: bg,
      padding: "2px 8px",
      borderRadius: "10px",
      border: `1px solid ${color}30`,
      lineHeight: 1.4,
    }}>{label}</span>
  );
}

export function ItemBlock({ item, phaseIndex, sectionIndex, itemIndex, workText, theme }) {
  const wk = `w-${phaseIndex}-${sectionIndex}-${itemIndex}`;
  const raw = workText[wk];
  const fieldType = item.fieldType || DEFAULT_FIELD_TYPE;
  const handler = getFieldType(fieldType);
  const parsed = parseWork(raw, fieldType, handler.defaultValue);
  const filled = isFilled(parsed.value, fieldType) || Boolean(parsed.legacyText);
  const isDone = item.done === true;

  if (!filled && !isDone) return null;

  const Printer = handler.Printer;
  const typeLabel = FIELD_TYPE_LABEL[fieldType];
  const clauseMatch = item.guide && ISO_CLAUSE_REGEX.exec(item.guide);
  const clause = clauseMatch ? `Cláusula ${clauseMatch[1]}` : null;

  return (
    <div className="print-item" style={{ marginBottom: "16px", paddingBottom: "8px" }}>
      <div style={{
        display: "flex",
        alignItems: "baseline",
        gap: "8px",
        marginBottom: "8px",
        flexWrap: "wrap",
      }}>
        <span style={{ color: theme.main, fontSize: "11pt", lineHeight: 1, marginRight: "2px" }}>■</span>
        <h4 style={{
          fontSize: "11.5pt",
          fontWeight: 700,
          color: PRINT_PALETTE.ink,
          margin: 0,
          flex: 1,
          minWidth: "60%",
        }}>{item.text}</h4>
        <StatusBadge done={isDone} filled={filled} />
        {typeLabel && <Chip label={typeLabel} color={theme.main} bg={theme.lt} />}
        {clause && <Chip label={clause} color={PRINT_PALETTE.muted} bg={PRINT_PALETTE.ruleSoft} />}
      </div>

      {filled && parsed.legacyText && (
        <div style={{
          fontSize: "9.5pt",
          color: "#7a5a1f",
          background: "#fff7e6",
          border: "1px solid #f0d9a8",
          padding: "7px 10px",
          borderRadius: "4px",
          marginBottom: "8px",
          whiteSpace: "pre-wrap",
        }}>
          <strong style={{ fontSize: "8.5pt", textTransform: "uppercase", letterSpacing: ".05em" }}>
            Texto previo (formato libre)
          </strong>
          <div style={{ marginTop: 4 }}>{parsed.legacyText}</div>
        </div>
      )}

      {filled && (
        <Printer value={parsed.value} config={item.fieldConfig} accentColor={theme.acc} isPrint={true} />
      )}

      {!filled && isDone && (
        <div style={{ fontSize: "9.5pt", color: PRINT_PALETTE.muted, fontStyle: "italic" }}>
          Marcado como completado — pendiente de documentar evidencia.
        </div>
      )}
    </div>
  );
}
