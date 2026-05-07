/**
 * ProcessMapField — top-level process map with three swim-lanes:
 * Estratégicos (top), Operativos (middle), Soporte (bottom).
 *
 * Value:
 *   {
 *     processes: [{
 *       id, code, name, layer: 'strategic'|'operational'|'support'
 *     }]
 *   }
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

const LAYERS = [
  { key: "strategic", label: "Procesos Estratégicos", hint: "Definen la dirección y planeación de la organización", color: "#577080", bg: "#eaf0f4" },
  { key: "operational", label: "Procesos Operativos (core)", hint: "Generan valor directamente al cliente", color: "#5a7260", bg: "#ecf1ed" },
  { key: "support", label: "Procesos de Soporte", hint: "Apoyan la ejecución de los procesos core", color: "#8a6e4e", bg: "#f4efe7" },
];

const inputStyle = (extra = {}) => ({
  padding: "5px 8px",
  fontSize: 12,
  border: `1px solid ${P.s200}`,
  borderRadius: 4,
  background: "#fff",
  color: P.s700,
  fontFamily: "inherit",
  boxSizing: "border-box",
  ...extra,
});

function ProcessCard({ process, onChange, onRemove, isPrint }) {
  if (isPrint) {
    return (
      <div style={{ background: "#fff", border: `1px solid ${P.s300}`, borderRadius: 4, padding: "5px 8px", minWidth: 110 }}>
        <div style={{ fontSize: "10px", fontWeight: 700, color: P.s500, letterSpacing: ".03em" }}>{process.code}</div>
        <div style={{ fontSize: "10.5px", color: P.s700, lineHeight: 1.2, marginTop: 2 }}>{process.name}</div>
      </div>
    );
  }
  return (
    <div style={{ background: "#fff", border: `1px solid ${P.s300}`, borderRadius: 5, padding: "6px 9px", display: "flex", flexDirection: "column", gap: 3, minWidth: 130, position: "relative" }}>
      <button onClick={onRemove} title="Eliminar" style={{ position: "absolute", top: 2, right: 4, background: "transparent", border: "none", color: P.s400, cursor: "pointer", fontSize: 13 }}>×</button>
      <input type="text" placeholder="Código" value={process.code || ""} onChange={(e) => onChange({ ...process, code: e.target.value })} onClick={(e) => e.stopPropagation()} style={inputStyle({ fontSize: 10.5, fontWeight: 700, color: P.s500, padding: "3px 5px" })} />
      <input type="text" placeholder="Nombre del proceso" value={process.name || ""} onChange={(e) => onChange({ ...process, name: e.target.value })} onClick={(e) => e.stopPropagation()} style={inputStyle({ fontSize: 11.5 })} />
    </div>
  );
}

function Lane({ layer, processes, onChangeProcess, onRemoveProcess, onAddProcess, onMoveProcess, isPrint }) {
  return (
    <div style={{ background: layer.bg, border: `1px solid ${layer.color}30`, borderLeft: `4px solid ${layer.color}`, borderRadius: 6, padding: isPrint ? "8px 10px" : "10px 12px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: isPrint ? "10.5px" : 11.5, fontWeight: 700, color: layer.color, textTransform: "uppercase", letterSpacing: ".05em" }}>
            {layer.label}
          </div>
          {!isPrint && (
            <div style={{ fontSize: 10.5, color: P.s500, fontStyle: "italic", marginTop: 2 }}>{layer.hint}</div>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "stretch" }}>
        {processes.map((proc) => (
          <div key={proc.id} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <ProcessCard process={proc} onChange={(p) => onChangeProcess(proc.id, p)} onRemove={() => onRemoveProcess(proc.id)} isPrint={isPrint} />
            {!isPrint && onMoveProcess && (
              <div style={{ display: "flex", gap: 3, justifyContent: "center" }}>
                <button onClick={() => onMoveProcess(proc.id, "strategic")} title="Mover a Estratégicos" style={{ background: "transparent", border: "none", color: P.s400, cursor: "pointer", fontSize: 9 }}>↑</button>
                <button onClick={() => onMoveProcess(proc.id, "operational")} title="Mover a Operativos" style={{ background: "transparent", border: "none", color: P.s400, cursor: "pointer", fontSize: 9 }}>·</button>
                <button onClick={() => onMoveProcess(proc.id, "support")} title="Mover a Soporte" style={{ background: "transparent", border: "none", color: P.s400, cursor: "pointer", fontSize: 9 }}>↓</button>
              </div>
            )}
          </div>
        ))}
        {!isPrint && (
          <button
            onClick={onAddProcess}
            style={{ background: "#fff", border: `1px dashed ${layer.color}`, borderRadius: 5, padding: "6px 12px", color: layer.color, cursor: "pointer", fontSize: 11, fontWeight: 600, alignSelf: "flex-start" }}
          >
            + Proceso
          </button>
        )}
      </div>
    </div>
  );
}

function ProcessMapEditor({ value, onChange }) {
  const processes = Array.isArray(value?.processes) ? value.processes : [];
  const setProcesses = (next) => onChange({ ...(value || {}), processes: next });

  const updateProcess = (id, patch) => setProcesses(processes.map((p) => (p.id === id ? patch : p)));
  const removeProcess = (id) => setProcesses(processes.filter((p) => p.id !== id));
  const moveProcess = (id, layer) => setProcesses(processes.map((p) => (p.id === id ? { ...p, layer } : p)));
  const addProcess = (layer) => {
    const id = `p${Date.now()}`;
    setProcesses([...processes, { id, code: "", name: "", layer }]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {LAYERS.map((layer) => (
        <Lane
          key={layer.key}
          layer={layer}
          processes={processes.filter((p) => p.layer === layer.key)}
          onChangeProcess={updateProcess}
          onRemoveProcess={removeProcess}
          onAddProcess={() => addProcess(layer.key)}
          onMoveProcess={moveProcess}
          isPrint={false}
        />
      ))}
    </div>
  );
}

function ProcessMapPrinter({ value, accentColor }) {
  const processes = Array.isArray(value?.processes) ? value.processes : [];
  if (processes.length === 0) return null;
  return (
    <div style={{ borderLeft: `3px solid ${accentColor}`, paddingLeft: 12, display: "flex", flexDirection: "column", gap: 6 }}>
      {LAYERS.map((layer) => {
        const layerProcs = processes.filter((p) => p.layer === layer.key);
        if (layerProcs.length === 0) return null;
        return (
          <Lane
            key={layer.key}
            layer={layer}
            processes={layerProcs}
            onChangeProcess={() => {}}
            onRemoveProcess={() => {}}
            onAddProcess={null}
            onMoveProcess={null}
            isPrint={true}
          />
        );
      })}
    </div>
  );
}

export const ProcessMapField = {
  Editor: ProcessMapEditor,
  Printer: ProcessMapPrinter,
  defaultValue: { processes: [] },
};
