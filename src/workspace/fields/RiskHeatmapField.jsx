/**
 * RiskHeatmapField — 5×5 risk matrix (Probabilidad × Impacto) with risk list.
 *
 * Config (optional):
 *   { probabilityLabels?: string[5], impactLabels?: string[5] }
 *
 * Value:
 *   { risks: [{ id, name, probability:1-5, impact:1-5, mitigation, owner, status }] }
 */

const P = {
  border: "#e8e6e1",
  borderL: "#f0eeea",
  s100: "#f5f5f4",
  s200: "#e7e5e4",
  s400: "#a8a29e",
  s500: "#78716c",
  s600: "#57534e",
  s700: "#44403c",
};

const STATUS_OPTIONS = ["Identificado", "En mitigación", "Aceptado", "Cerrado"];

const DEFAULT_PROB_LABELS = ["Muy baja", "Baja", "Media", "Alta", "Muy alta"];
const DEFAULT_IMPACT_LABELS = ["Insignificante", "Menor", "Moderado", "Mayor", "Crítico"];

function severityColor(score) {
  if (score >= 20) return "#c53b3b";
  if (score >= 13) return "#e89254";
  if (score >= 5) return "#e8c34a";
  if (score >= 1) return "#7aa07a";
  return "#f5f5f4";
}

function inputStyle(extra = {}) {
  return {
    width: "100%",
    padding: "6px 8px",
    fontSize: 12,
    border: `1px solid ${P.s200}`,
    borderRadius: 4,
    background: "#fff",
    color: P.s700,
    fontFamily: "inherit",
    boxSizing: "border-box",
    ...extra,
  };
}

function Heatmap({ risks, probabilityLabels, impactLabels }) {
  // Rows = probability (5 at top, 1 at bottom), Cols = impact (1 left → 5 right)
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto repeat(5, 1fr)", gap: 2, fontSize: 10.5 }}>
      <div></div>
      {impactLabels.map((label, i) => (
        <div key={i} style={{ textAlign: "center", color: P.s500, fontWeight: 600, padding: "2px 0", textTransform: "uppercase", letterSpacing: ".03em", fontSize: 9.5 }}>
          {i + 1}<br />{label}
        </div>
      ))}
      {[5, 4, 3, 2, 1].map((prob) => (
        <Row key={prob} prob={prob} probLabel={probabilityLabels[prob - 1]} risks={risks} />
      ))}
      <div></div>
      <div style={{ gridColumn: "2 / span 5", textAlign: "center", fontSize: 10, color: P.s500, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", marginTop: 4 }}>
        Impacto →
      </div>
    </div>
  );
}

function Row({ prob, probLabel, risks }) {
  return (
    <>
      <div style={{ padding: "0 6px", fontSize: 9.5, color: P.s500, fontWeight: 600, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "right" }}>
        <div>{prob}</div>
        <div style={{ textTransform: "uppercase", letterSpacing: ".03em" }}>{probLabel}</div>
      </div>
      {[1, 2, 3, 4, 5].map((impact) => {
        const score = prob * impact;
        const cellRisks = risks.filter((r) => Number(r.probability) === prob && Number(r.impact) === impact);
        return (
          <div
            key={impact}
            style={{
              minHeight: 50,
              background: severityColor(score),
              borderRadius: 4,
              padding: 4,
              display: "flex",
              flexWrap: "wrap",
              gap: 3,
              alignContent: "flex-start",
              opacity: 0.85,
            }}
          >
            {cellRisks.length === 0 ? (
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 700, alignSelf: "center", margin: "auto" }}>{score}</span>
            ) : (
              cellRisks.map((r, i) => (
                <span
                  key={r.id}
                  title={r.name}
                  style={{
                    background: "#fff",
                    color: P.s700,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 10,
                    border: `1px solid ${P.s300 || "#d6d3d1"}`,
                  }}
                >
                  {risks.indexOf(cellRisks[i]) + 1}
                </span>
              ))
            )}
          </div>
        );
      })}
    </>
  );
}

function RiskHeatmapEditor({ value, onChange, config }) {
  const probabilityLabels = config?.probabilityLabels || DEFAULT_PROB_LABELS;
  const impactLabels = config?.impactLabels || DEFAULT_IMPACT_LABELS;
  const risks = Array.isArray(value?.risks) ? value.risks : [];

  const updateRisk = (idx, patch) => {
    const next = risks.map((r, i) => (i === idx ? { ...r, ...patch } : r));
    onChange({ ...(value || {}), risks: next });
  };
  const addRisk = () => {
    const id = `r${Date.now()}`;
    onChange({ ...(value || {}), risks: [...risks, { id, name: "", probability: 3, impact: 3, mitigation: "", owner: "", status: "Identificado" }] });
  };
  const removeRisk = (idx) => onChange({ ...(value || {}), risks: risks.filter((_, i) => i !== idx) });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ background: "#fff", border: `1px solid ${P.s200}`, borderRadius: 6, padding: 12 }}>
        <Heatmap risks={risks} probabilityLabels={probabilityLabels} impactLabels={impactLabels} />
      </div>

      <div style={{ background: "#fff", border: `1px solid ${P.s200}`, borderRadius: 6, overflow: "hidden" }}>
        <div style={{ padding: "8px 12px", background: P.s100, borderBottom: `1px solid ${P.s200}`, fontSize: 11, fontWeight: 700, color: P.s500, textTransform: "uppercase", letterSpacing: ".04em" }}>
          Riesgos identificados
        </div>
        {risks.length === 0 && (
          <div style={{ padding: 14, textAlign: "center", color: P.s400, fontStyle: "italic", fontSize: 12 }}>
            Sin riesgos todavía. Agrega el primero abajo.
          </div>
        )}
        {risks.map((risk, idx) => {
          const score = (Number(risk.probability) || 0) * (Number(risk.impact) || 0);
          return (
            <div key={risk.id} style={{ borderBottom: idx < risks.length - 1 ? `1px solid ${P.borderL}` : "none", padding: "10px 12px", display: "grid", gridTemplateColumns: "30px 1fr 70px 70px 70px 1fr 130px 130px 30px", gap: 8, alignItems: "center", fontSize: 11.5 }}>
              <div style={{ background: severityColor(score), color: "#fff", fontWeight: 700, textAlign: "center", borderRadius: 4, padding: "4px 0", fontSize: 11 }}>
                {idx + 1}
              </div>
              <input type="text" placeholder="Nombre del riesgo" value={risk.name} onChange={(e) => updateRisk(idx, { name: e.target.value })} onClick={(e) => e.stopPropagation()} style={inputStyle()} />
              <select value={risk.probability} onChange={(e) => updateRisk(idx, { probability: Number(e.target.value) })} onClick={(e) => e.stopPropagation()} style={inputStyle({ cursor: "pointer" })} title="Probabilidad">
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>P:{n}</option>)}
              </select>
              <select value={risk.impact} onChange={(e) => updateRisk(idx, { impact: Number(e.target.value) })} onClick={(e) => e.stopPropagation()} style={inputStyle({ cursor: "pointer" })} title="Impacto">
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>I:{n}</option>)}
              </select>
              <div style={{ background: severityColor(score), color: "#fff", fontWeight: 700, textAlign: "center", borderRadius: 4, padding: "5px 0", fontSize: 11 }} title="Score = P × I">
                {score}
              </div>
              <input type="text" placeholder="Acción de mitigación" value={risk.mitigation || ""} onChange={(e) => updateRisk(idx, { mitigation: e.target.value })} onClick={(e) => e.stopPropagation()} style={inputStyle()} />
              <input type="text" placeholder="Responsable" value={risk.owner || ""} onChange={(e) => updateRisk(idx, { owner: e.target.value })} onClick={(e) => e.stopPropagation()} style={inputStyle()} />
              <select value={risk.status || "Identificado"} onChange={(e) => updateRisk(idx, { status: e.target.value })} onClick={(e) => e.stopPropagation()} style={inputStyle({ cursor: "pointer" })}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => removeRisk(idx)} title="Eliminar" style={{ background: "transparent", border: "none", color: P.s400, cursor: "pointer", fontSize: 14 }}>×</button>
            </div>
          );
        })}
        <div style={{ padding: "8px 12px", borderTop: `1px solid ${P.s200}`, background: P.s100 }}>
          <button onClick={addRisk} style={{ padding: "5px 11px", fontSize: 11.5, fontWeight: 600, background: "#fff", color: "#92613a", border: `1px solid ${P.s200}`, borderRadius: 5, cursor: "pointer" }}>
            + Agregar riesgo
          </button>
        </div>
      </div>
    </div>
  );
}

function RiskHeatmapPrinter({ value, accentColor }) {
  const risks = Array.isArray(value?.risks) ? value.risks : [];
  if (risks.length === 0) return null;
  return (
    <div style={{ borderLeft: `3px solid ${accentColor}`, paddingLeft: 12, fontSize: "11px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ padding: "5px 7px", background: "#f5f5f4", textAlign: "left", fontSize: "10px", fontWeight: 700, color: P.s500, textTransform: "uppercase", borderBottom: `1px solid ${P.s200}` }}>#</th>
            <th style={{ padding: "5px 7px", background: "#f5f5f4", textAlign: "left", fontSize: "10px", fontWeight: 700, color: P.s500, textTransform: "uppercase", borderBottom: `1px solid ${P.s200}` }}>Riesgo</th>
            <th style={{ padding: "5px 7px", background: "#f5f5f4", textAlign: "center", fontSize: "10px", fontWeight: 700, color: P.s500, textTransform: "uppercase", borderBottom: `1px solid ${P.s200}` }}>P</th>
            <th style={{ padding: "5px 7px", background: "#f5f5f4", textAlign: "center", fontSize: "10px", fontWeight: 700, color: P.s500, textTransform: "uppercase", borderBottom: `1px solid ${P.s200}` }}>I</th>
            <th style={{ padding: "5px 7px", background: "#f5f5f4", textAlign: "center", fontSize: "10px", fontWeight: 700, color: P.s500, textTransform: "uppercase", borderBottom: `1px solid ${P.s200}` }}>Score</th>
            <th style={{ padding: "5px 7px", background: "#f5f5f4", textAlign: "left", fontSize: "10px", fontWeight: 700, color: P.s500, textTransform: "uppercase", borderBottom: `1px solid ${P.s200}` }}>Mitigación</th>
            <th style={{ padding: "5px 7px", background: "#f5f5f4", textAlign: "left", fontSize: "10px", fontWeight: 700, color: P.s500, textTransform: "uppercase", borderBottom: `1px solid ${P.s200}` }}>Responsable</th>
            <th style={{ padding: "5px 7px", background: "#f5f5f4", textAlign: "left", fontSize: "10px", fontWeight: 700, color: P.s500, textTransform: "uppercase", borderBottom: `1px solid ${P.s200}` }}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {risks.map((r, i) => {
            const score = (Number(r.probability) || 0) * (Number(r.impact) || 0);
            return (
              <tr key={r.id || i}>
                <td style={{ padding: "5px 7px", borderBottom: `1px solid ${P.border}`, fontWeight: 700 }}>{i + 1}</td>
                <td style={{ padding: "5px 7px", borderBottom: `1px solid ${P.border}` }}>{r.name}</td>
                <td style={{ padding: "5px 7px", borderBottom: `1px solid ${P.border}`, textAlign: "center" }}>{r.probability}</td>
                <td style={{ padding: "5px 7px", borderBottom: `1px solid ${P.border}`, textAlign: "center" }}>{r.impact}</td>
                <td style={{ padding: "5px 7px", borderBottom: `1px solid ${P.border}`, textAlign: "center", background: severityColor(score), color: "#fff", fontWeight: 700 }}>{score}</td>
                <td style={{ padding: "5px 7px", borderBottom: `1px solid ${P.border}` }}>{r.mitigation}</td>
                <td style={{ padding: "5px 7px", borderBottom: `1px solid ${P.border}` }}>{r.owner}</td>
                <td style={{ padding: "5px 7px", borderBottom: `1px solid ${P.border}` }}>{r.status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export const RiskHeatmapField = {
  Editor: RiskHeatmapEditor,
  Printer: RiskHeatmapPrinter,
  defaultValue: { risks: [] },
};
