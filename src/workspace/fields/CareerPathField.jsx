/**
 * CareerPathField — vertical career-development ladder.
 *
 * Value:
 *   {
 *     personName?: string,
 *     currentStageId?: string,
 *     stages: [{
 *       id, role, requirements: string[], responsibilities: string[],
 *       skillsToBuild: string[], targetTimeMonths?: number,
 *     }]
 *   }
 */

const P = {
  border: "#e8e6e1",
  borderL: "#f0eeea",
  s100: "#f5f5f4",
  s200: "#e7e5e4",
  s300: "#d6d3d1",
  s400: "#a8a29e",
  s500: "#78716c",
  s600: "#57534e",
  s700: "#44403c",
};

const inputStyle = (extra = {}) => ({
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
});

function ListField({ label, items, onChange, placeholder, accentColor }) {
  const update = (idx, v) => onChange(items.map((it, i) => (i === idx ? v : it)));
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));
  const add = () => onChange([...items, ""]);
  return (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: accentColor, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>{label}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {items.map((it, idx) => (
          <div key={idx} style={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
            <span style={{ fontSize: 10, color: P.s400, marginTop: 8 }}>•</span>
            <textarea value={it} onChange={(e) => update(idx, e.target.value)} onClick={(e) => e.stopPropagation()} placeholder={placeholder} rows={1} style={{ ...inputStyle(), resize: "vertical", minHeight: 28 }} />
            <button onClick={() => remove(idx)} title="Eliminar" style={{ background: "transparent", border: "none", color: P.s400, cursor: "pointer", fontSize: 13 }}>×</button>
          </div>
        ))}
        <button onClick={add} style={{ alignSelf: "flex-start", padding: "3px 9px", fontSize: 10.5, fontWeight: 600, background: "#fff", color: accentColor, border: `1px solid ${P.s200}`, borderRadius: 4, cursor: "pointer", marginTop: 2 }}>+</button>
      </div>
    </div>
  );
}

function StageEditor({ stage, idx, isCurrent, onChange, onRemove, onMove, isFirst, isLast, onSetCurrent }) {
  const accentColor = isCurrent ? "#92613a" : "#577080";
  return (
    <div style={{ background: "#fff", border: `1px solid ${P.s200}`, borderLeft: `4px solid ${accentColor}`, borderRadius: 6, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ background: accentColor, color: "#fff", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>{idx + 1}</div>
        <input type="text" placeholder="Rol / nivel (ej: Asesor Sr)" value={stage.role || ""} onChange={(e) => onChange({ ...stage, role: e.target.value })} onClick={(e) => e.stopPropagation()} style={inputStyle({ flex: 1, fontWeight: 700, fontSize: 13 })} />
        <input type="number" placeholder="Meses" value={stage.targetTimeMonths ?? ""} onChange={(e) => onChange({ ...stage, targetTimeMonths: e.target.value === "" ? null : Number(e.target.value) })} onClick={(e) => e.stopPropagation()} style={inputStyle({ width: 80 })} title="Meses estimados para alcanzar este nivel" />
        <label style={{ fontSize: 10.5, color: P.s500, display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
          <input type="radio" checked={isCurrent} onChange={onSetCurrent} onClick={(e) => e.stopPropagation()} />
          actual
        </label>
        <button onClick={() => onMove(-1)} disabled={isFirst} title="Subir" style={{ background: "transparent", border: `1px solid ${P.s200}`, borderRadius: 4, color: isFirst ? P.s400 : P.s600, cursor: isFirst ? "not-allowed" : "pointer", padding: "2px 7px", fontSize: 11 }}>↑</button>
        <button onClick={() => onMove(1)} disabled={isLast} title="Bajar" style={{ background: "transparent", border: `1px solid ${P.s200}`, borderRadius: 4, color: isLast ? P.s400 : P.s600, cursor: isLast ? "not-allowed" : "pointer", padding: "2px 7px", fontSize: 11 }}>↓</button>
        <button onClick={onRemove} title="Eliminar" style={{ background: "transparent", border: "none", color: P.s400, cursor: "pointer", fontSize: 14 }}>×</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <ListField label="Requisitos para entrar" items={stage.requirements || []} onChange={(next) => onChange({ ...stage, requirements: next })} placeholder="Requisito..." accentColor={accentColor} />
        <ListField label="Responsabilidades" items={stage.responsibilities || []} onChange={(next) => onChange({ ...stage, responsibilities: next })} placeholder="Responsabilidad clave..." accentColor={accentColor} />
        <ListField label="Brechas a desarrollar" items={stage.skillsToBuild || []} onChange={(next) => onChange({ ...stage, skillsToBuild: next })} placeholder="Habilidad a construir..." accentColor={accentColor} />
      </div>
    </div>
  );
}

function CareerPathEditor({ value, onChange }) {
  const v = value || {};
  const stages = Array.isArray(v.stages) ? v.stages : [];

  const updateStage = (idx, patch) => onChange({ ...v, stages: stages.map((s, i) => (i === idx ? patch : s)) });
  const removeStage = (idx) => onChange({ ...v, stages: stages.filter((_, i) => i !== idx) });
  const moveStage = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= stages.length) return;
    const copy = [...stages];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    onChange({ ...v, stages: copy });
  };
  const addStage = () => {
    const id = `s${Date.now()}`;
    onChange({ ...v, stages: [...stages, { id, role: "", requirements: [], responsibilities: [], skillsToBuild: [] }] });
  };
  const setCurrent = (id) => onChange({ ...v, currentStageId: id });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: P.s500, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>
          Persona / puesto a desarrollar
        </label>
        <input type="text" value={v.personName || ""} onChange={(e) => onChange({ ...v, personName: e.target.value })} onClick={(e) => e.stopPropagation()} placeholder="Nombre o puesto genérico (ej: Asesor de Seguros)" style={inputStyle({ fontWeight: 600 })} />
      </div>
      {stages.map((stage, idx) => (
        <StageEditor
          key={stage.id}
          stage={stage}
          idx={idx}
          isCurrent={v.currentStageId === stage.id}
          onChange={(p) => updateStage(idx, p)}
          onRemove={() => removeStage(idx)}
          onMove={(d) => moveStage(idx, d)}
          isFirst={idx === 0}
          isLast={idx === stages.length - 1}
          onSetCurrent={() => setCurrent(stage.id)}
        />
      ))}
      <button onClick={addStage} style={{ alignSelf: "flex-start", padding: "7px 14px", fontSize: 12, fontWeight: 600, background: "#92613a", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer" }}>
        + Agregar etapa
      </button>
    </div>
  );
}

function CareerPathPrinter({ value, accentColor }) {
  const v = value || {};
  const stages = Array.isArray(v.stages) ? v.stages : [];
  if (stages.length === 0) return null;
  return (
    <div style={{ borderLeft: `3px solid ${accentColor}`, paddingLeft: 12, fontSize: "11.5px" }}>
      {v.personName && <div style={{ fontSize: "12px", fontWeight: 700, color: P.s700, marginBottom: 6 }}>Plan de desarrollo: {v.personName}</div>}
      {stages.map((stage, idx) => {
        const isCurrent = v.currentStageId === stage.id;
        return (
          <div key={stage.id} style={{ marginBottom: 10, paddingLeft: 8, borderLeft: `2px solid ${isCurrent ? "#92613a" : "#577080"}` }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: isCurrent ? "#92613a" : P.s700 }}>
              {idx + 1}. {stage.role}{isCurrent ? "  (actual)" : ""}
              {stage.targetTimeMonths != null && stage.targetTimeMonths !== "" && <span style={{ color: P.s500, fontWeight: 400, marginLeft: 6 }}>· {stage.targetTimeMonths} meses</span>}
            </div>
            {(stage.requirements || []).filter(Boolean).length > 0 && (
              <div style={{ marginTop: 3 }}>
                <span style={{ fontSize: "10px", fontWeight: 700, color: P.s500, textTransform: "uppercase" }}>Requisitos: </span>
                <span style={{ color: P.s700 }}>{stage.requirements.filter(Boolean).join("; ")}</span>
              </div>
            )}
            {(stage.responsibilities || []).filter(Boolean).length > 0 && (
              <div style={{ marginTop: 2 }}>
                <span style={{ fontSize: "10px", fontWeight: 700, color: P.s500, textTransform: "uppercase" }}>Responsabilidades: </span>
                <span style={{ color: P.s700 }}>{stage.responsibilities.filter(Boolean).join("; ")}</span>
              </div>
            )}
            {(stage.skillsToBuild || []).filter(Boolean).length > 0 && (
              <div style={{ marginTop: 2 }}>
                <span style={{ fontSize: "10px", fontWeight: 700, color: P.s500, textTransform: "uppercase" }}>Brechas: </span>
                <span style={{ color: P.s700 }}>{stage.skillsToBuild.filter(Boolean).join("; ")}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export const CareerPathField = {
  Editor: CareerPathEditor,
  Printer: CareerPathPrinter,
  defaultValue: { personName: "", currentStageId: null, stages: [] },
};
