/**
 * TimelineField — measurement/review cadence calendar grouped by frequency.
 *
 * Config (optional): { cadences?: [{ key, label, color, hint? }] }
 *
 * Value: { events: [{ id, name, cadence, responsible, deliverable }] }
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

const DEFAULT_CADENCES = [
  { key: "daily", label: "Diaria", color: "#5a7260", hint: "Indicadores básicos de actividad — checar todos los días." },
  { key: "weekly", label: "Semanal", color: "#577080", hint: "Resultados de ventas por asesor, seguimiento de pendientes." },
  { key: "monthly", label: "Mensual", color: "#6b5f75", hint: "Indicadores clave, comparativo vs. meta, tendencias." },
  { key: "quarterly", label: "Trimestral", color: "#8a6e4e", hint: "Revisión por la dirección (ISO obligatorio)." },
  { key: "semiannual", label: "Semestral", color: "#92613a", hint: "Satisfacción del asesor, evaluación de proveedores." },
  { key: "yearly", label: "Anual", color: "#85412e", hint: "Planeación estratégica, auditoría interna, revisión FODA." },
];

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

function CadenceColumn({ cadence, events, onChange, onAdd, onRemove }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${P.s200}`, borderTop: `3px solid ${cadence.color}`, borderRadius: 6, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8, minHeight: 160 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: cadence.color, textTransform: "uppercase", letterSpacing: ".05em" }}>
          {cadence.label}
        </div>
        {cadence.hint && (
          <div style={{ fontSize: 10.5, color: P.s500, fontStyle: "italic", marginTop: 3, lineHeight: 1.4 }}>
            {cadence.hint}
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {events.length === 0 && (
          <div style={{ fontSize: 11, color: P.s400, fontStyle: "italic", textAlign: "center", padding: "8px 0" }}>—</div>
        )}
        {events.map((event) => (
          <div key={event.id} style={{ background: P.s100, borderRadius: 5, padding: "7px 9px", display: "flex", flexDirection: "column", gap: 4, position: "relative" }}>
            <button
              onClick={() => onRemove(event.id)}
              title="Eliminar"
              style={{ position: "absolute", right: 4, top: 4, background: "transparent", border: "none", color: P.s400, cursor: "pointer", fontSize: 13 }}
            >×</button>
            <input
              type="text"
              placeholder="Evento / actividad"
              value={event.name}
              onChange={(e) => onChange(event.id, { name: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              style={inputStyle({ fontWeight: 600 })}
            />
            <input
              type="text"
              placeholder="Responsable"
              value={event.responsible || ""}
              onChange={(e) => onChange(event.id, { responsible: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              style={inputStyle()}
            />
            <input
              type="text"
              placeholder="Entregable / output"
              value={event.deliverable || ""}
              onChange={(e) => onChange(event.id, { deliverable: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              style={inputStyle()}
            />
          </div>
        ))}
      </div>
      <button
        onClick={onAdd}
        style={{ alignSelf: "stretch", padding: "6px 10px", fontSize: 11, fontWeight: 600, background: "#fff", color: cadence.color, border: `1px dashed ${cadence.color}`, borderRadius: 5, cursor: "pointer" }}
      >
        + Agregar evento
      </button>
    </div>
  );
}

function TimelineEditor({ value, onChange, config }) {
  const cadences = config?.cadences || DEFAULT_CADENCES;
  const events = Array.isArray(value?.events) ? value.events : [];

  const updateEvent = (id, patch) => {
    onChange({ ...(value || {}), events: events.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
  };
  const addEvent = (cadenceKey) => {
    const id = `e${Date.now()}`;
    onChange({ ...(value || {}), events: [...events, { id, cadence: cadenceKey, name: "", responsible: "", deliverable: "" }] });
  };
  const removeEvent = (id) => {
    onChange({ ...(value || {}), events: events.filter((e) => e.id !== id) });
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
      {cadences.map((cad) => {
        const cadEvents = events.filter((e) => e.cadence === cad.key);
        return (
          <CadenceColumn
            key={cad.key}
            cadence={cad}
            events={cadEvents}
            onChange={updateEvent}
            onAdd={() => addEvent(cad.key)}
            onRemove={removeEvent}
          />
        );
      })}
    </div>
  );
}

function TimelinePrinter({ value, config, accentColor }) {
  const cadences = config?.cadences || DEFAULT_CADENCES;
  const events = Array.isArray(value?.events) ? value.events : [];
  if (events.length === 0) return null;
  return (
    <div style={{ borderLeft: `3px solid ${accentColor}`, paddingLeft: 12, fontSize: "11.5px" }}>
      {cadences.map((cad) => {
        const cadEvents = events.filter((e) => e.cadence === cad.key && (e.name || e.responsible || e.deliverable));
        if (cadEvents.length === 0) return null;
        return (
          <div key={cad.key} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: "10.5px", fontWeight: 700, color: cad.color, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4, borderBottom: `1px solid ${cad.color}30`, paddingBottom: 3 }}>
              {cad.label}
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
              <tbody>
                {cadEvents.map((e) => (
                  <tr key={e.id}>
                    <td style={{ padding: "3px 6px", color: P.s700, fontWeight: 600, width: "30%" }}>{e.name}</td>
                    <td style={{ padding: "3px 6px", color: P.s600, width: "30%" }}>{e.responsible}</td>
                    <td style={{ padding: "3px 6px", color: P.s600 }}>{e.deliverable}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

export const TimelineField = {
  Editor: TimelineEditor,
  Printer: TimelinePrinter,
  defaultValue: { events: [] },
};
