/**
 * FlowchartField — sequential process flowchart with ISO-standard shapes.
 *
 * Value:
 *   {
 *     processName?: string,
 *     steps: [{
 *       id, type: 'start'|'activity'|'decision'|'end',
 *       label, role?, // who executes it (swimlane proxy)
 *       yesNext?: string,  // for decisions: id or label of next step on YES
 *       noNext?: string,   // for decisions: id or label of next step on NO
 *     }]
 *   }
 *
 * Visual: vertical sequence with shape per type. Decisions show branching labels.
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

const TYPE_META = {
  start: { label: "Inicio", color: "#5a7260", shape: "oval" },
  activity: { label: "Actividad", color: "#577080", shape: "rect" },
  decision: { label: "Decisión", color: "#8a6e4e", shape: "diamond" },
  end: { label: "Fin", color: "#85412e", shape: "oval" },
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

function ShapeBox({ type, label, role, isPrint }) {
  const meta = TYPE_META[type] || TYPE_META.activity;
  const shapeStyle =
    meta.shape === "oval"
      ? { borderRadius: 999, padding: isPrint ? "6px 18px" : "10px 24px" }
      : meta.shape === "diamond"
      ? { transform: "rotate(45deg)", borderRadius: 6, padding: isPrint ? "20px 8px" : "28px 12px", width: 130, height: 130, display: "flex", alignItems: "center", justifyContent: "center" }
      : { borderRadius: 6, padding: isPrint ? "8px 12px" : "12px 18px" };

  const inner =
    meta.shape === "diamond" ? (
      <div style={{ transform: "rotate(-45deg)", textAlign: "center", lineHeight: 1.3, fontSize: isPrint ? 10 : 11.5 }}>{label || "(sin texto)"}</div>
    ) : (
      <div style={{ textAlign: "center", lineHeight: 1.3, fontSize: isPrint ? 10.5 : 12, fontWeight: meta.shape === "rect" ? 500 : 700 }}>
        {label || "(sin texto)"}
      </div>
    );

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <div
        style={{
          background: meta.shape === "diamond" ? "#fff" : meta.color === "#577080" ? "#fff" : `${meta.color}18`,
          color: P.s700,
          border: `2px solid ${meta.color}`,
          fontWeight: 600,
          ...shapeStyle,
        }}
      >
        {inner}
      </div>
      {role && (
        <div style={{ fontSize: isPrint ? 9 : 10, color: P.s500, fontStyle: "italic" }}>{role}</div>
      )}
    </div>
  );
}

function Connector({ label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, padding: "2px 0" }}>
      {label && <div style={{ fontSize: 10, fontWeight: 700, color: P.s600, background: P.s100, padding: "1px 7px", borderRadius: 8 }}>{label}</div>}
      <div style={{ width: 1, height: 14, background: P.s400 }} />
      <div style={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: `5px solid ${P.s400}` }} />
    </div>
  );
}

function FlowchartView({ steps, isPrint }) {
  if (steps.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: isPrint ? 8 : 16 }}>
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        return (
          <div key={step.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <ShapeBox type={step.type} label={step.label} role={step.role} isPrint={isPrint} />
            {step.type === "decision" && !isLast && (
              <div style={{ display: "flex", gap: 30, marginTop: 4 }}>
                <Connector label={`SÍ → ${step.yesNext || "siguiente"}`} />
                <Connector label={`NO → ${step.noNext || "saltar"}`} />
              </div>
            )}
            {step.type !== "decision" && !isLast && <Connector />}
          </div>
        );
      })}
    </div>
  );
}

function StepRow({ step, idx, total, onChange, onRemove, onMove }) {
  const meta = TYPE_META[step.type] || TYPE_META.activity;
  return (
    <div style={{ background: "#fff", border: `1px solid ${P.s200}`, borderLeft: `4px solid ${meta.color}`, borderRadius: 5, padding: "8px 10px", display: "grid", gridTemplateColumns: "30px 110px 1fr 120px 50px 50px 30px", gap: 6, alignItems: "center" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: P.s400, textAlign: "center" }}>{idx + 1}</div>
      <select value={step.type} onChange={(e) => onChange({ ...step, type: e.target.value })} onClick={(e) => e.stopPropagation()} style={inputStyle({ cursor: "pointer", fontWeight: 600 })}>
        {Object.entries(TYPE_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
      </select>
      <input type="text" placeholder="Descripción del paso" value={step.label || ""} onChange={(e) => onChange({ ...step, label: e.target.value })} onClick={(e) => e.stopPropagation()} style={inputStyle()} />
      <input type="text" placeholder="Rol / quién lo ejecuta" value={step.role || ""} onChange={(e) => onChange({ ...step, role: e.target.value })} onClick={(e) => e.stopPropagation()} style={inputStyle()} />
      <button onClick={() => onMove(-1)} disabled={idx === 0} title="Mover arriba" style={{ background: "transparent", border: `1px solid ${P.s200}`, borderRadius: 4, color: idx === 0 ? P.s400 : P.s600, cursor: idx === 0 ? "not-allowed" : "pointer", padding: "3px 6px", fontSize: 11 }}>↑</button>
      <button onClick={() => onMove(1)} disabled={idx === total - 1} title="Mover abajo" style={{ background: "transparent", border: `1px solid ${P.s200}`, borderRadius: 4, color: idx === total - 1 ? P.s400 : P.s600, cursor: idx === total - 1 ? "not-allowed" : "pointer", padding: "3px 6px", fontSize: 11 }}>↓</button>
      <button onClick={onRemove} title="Eliminar" style={{ background: "transparent", border: "none", color: P.s400, cursor: "pointer", fontSize: 14 }}>×</button>
      {step.type === "decision" && (
        <div style={{ gridColumn: "3 / span 2", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 2 }}>
          <input type="text" placeholder="Si SÍ → siguiente paso..." value={step.yesNext || ""} onChange={(e) => onChange({ ...step, yesNext: e.target.value })} onClick={(e) => e.stopPropagation()} style={inputStyle({ fontSize: 11 })} />
          <input type="text" placeholder="Si NO → siguiente paso..." value={step.noNext || ""} onChange={(e) => onChange({ ...step, noNext: e.target.value })} onClick={(e) => e.stopPropagation()} style={inputStyle({ fontSize: 11 })} />
        </div>
      )}
    </div>
  );
}

function FlowchartEditor({ value, onChange }) {
  const v = value || {};
  const steps = Array.isArray(v.steps) ? v.steps : [];
  const setProcessName = (s) => onChange({ ...v, processName: s, steps });

  const updateStep = (idx, patch) => onChange({ ...v, steps: steps.map((s, i) => (i === idx ? patch : s)) });
  const removeStep = (idx) => onChange({ ...v, steps: steps.filter((_, i) => i !== idx) });
  const moveStep = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= steps.length) return;
    const copy = [...steps];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    onChange({ ...v, steps: copy });
  };
  const addStep = (type = "activity") => {
    const id = `s${Date.now()}`;
    onChange({ ...v, steps: [...steps, { id, type, label: "", role: "" }] });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: P.s500, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>
          Nombre del proceso
        </label>
        <input type="text" value={v.processName || ""} onChange={(e) => setProcessName(e.target.value)} onClick={(e) => e.stopPropagation()} placeholder="Ej: PO-04 Trámites y Emisión de Pólizas" style={inputStyle({ fontWeight: 600 })} />
      </div>

      <div style={{ background: "#fff", border: `1px solid ${P.s200}`, borderRadius: 6, padding: 12, overflowX: "auto" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: P.s500, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 6 }}>
          Vista preliminar del flujo
        </div>
        {steps.length === 0 ? (
          <div style={{ padding: 18, textAlign: "center", color: P.s400, fontStyle: "italic", fontSize: 12 }}>
            El diagrama aparecerá aquí conforme agregues pasos.
          </div>
        ) : (
          <FlowchartView steps={steps} isPrint={false} />
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {steps.map((step, idx) => (
          <StepRow key={step.id} step={step} idx={idx} total={steps.length} onChange={(p) => updateStep(idx, p)} onRemove={() => removeStep(idx)} onMove={(d) => moveStep(idx, d)} />
        ))}
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {Object.entries(TYPE_META).map(([key, meta]) => (
          <button
            key={key}
            onClick={() => addStep(key)}
            style={{ padding: "6px 12px", fontSize: 11.5, fontWeight: 600, background: "#fff", color: meta.color, border: `1px solid ${meta.color}`, borderRadius: 5, cursor: "pointer" }}
          >
            + {meta.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function FlowchartPrinter({ value, accentColor }) {
  const v = value || {};
  const steps = Array.isArray(v.steps) ? v.steps : [];
  if (steps.length === 0 && !v.processName) return null;
  return (
    <div style={{ borderLeft: `3px solid ${accentColor}`, paddingLeft: 12 }}>
      {v.processName && (
        <div style={{ fontSize: "12px", fontWeight: 700, color: P.s700, marginBottom: 4 }}>{v.processName}</div>
      )}
      <FlowchartView steps={steps} isPrint={true} />
    </div>
  );
}

export const FlowchartField = {
  Editor: FlowchartEditor,
  Printer: FlowchartPrinter,
  defaultValue: { processName: "", steps: [] },
};
