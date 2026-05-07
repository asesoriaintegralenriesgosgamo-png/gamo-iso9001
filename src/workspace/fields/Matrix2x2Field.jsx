/**
 * Matrix2x2Field — 2×2 cuadrant matrix with a list of items per cell.
 *
 * Config:
 *   {
 *     quadrants: {
 *       q1: { label, hint? },  // top-left
 *       q2: { label, hint? },  // top-right
 *       q3: { label, hint? },  // bottom-left
 *       q4: { label, hint? },  // bottom-right
 *     }
 *   }
 *
 * Value: { q1: [string], q2: [string], q3: [string], q4: [string] }
 */

const QUADRANT_KEYS = ["q1", "q2", "q3", "q4"];

const P = {
  border: "#e8e6e1",
  s100: "#f5f5f4",
  s200: "#e7e5e4",
  s400: "#a8a29e",
  s500: "#78716c",
  s700: "#44403c",
};

const COLORS = {
  q1: { bg: "#f0f6f0", border: "#cfe1cf", label: "#3f6748" },
  q2: { bg: "#f3f0f6", border: "#dbd0e3", label: "#5e4878" },
  q3: { bg: "#fef9ef", border: "#f0d9a8", label: "#92613a" },
  q4: { bg: "#fdf0ee", border: "#f0c8c2", label: "#85412e" },
};

const inputStyle = {
  width: "100%",
  padding: "6px 8px",
  fontSize: 12,
  border: `1px solid ${P.s200}`,
  borderRadius: 4,
  background: "#fff",
  color: P.s700,
  fontFamily: "inherit",
  boxSizing: "border-box",
  resize: "vertical",
  minHeight: 30,
  lineHeight: 1.4,
};

function Quadrant({ qKey, label, hint, items, onChange }) {
  const c = COLORS[qKey];
  const update = (idx, next) => onChange(items.map((it, i) => (i === idx ? next : it)));
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));
  const add = () => onChange([...items, ""]);

  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 6, padding: "10px 12px", display: "flex", flexDirection: "column", minHeight: 160 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: c.label, textTransform: "uppercase", letterSpacing: ".05em" }}>
        {label}
      </div>
      {hint && (
        <div style={{ fontSize: 10.5, color: P.s500, fontStyle: "italic", marginTop: 3, marginBottom: 6, lineHeight: 1.4 }}>
          {hint}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: hint ? 0 : 8, flex: 1 }}>
        {items.map((it, idx) => (
          <div key={idx} style={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
            <span style={{ fontSize: 10, color: c.label, marginTop: 8, fontWeight: 600 }}>{idx + 1}.</span>
            <textarea
              value={it}
              onChange={(e) => update(idx, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              rows={1}
              style={inputStyle}
            />
            <button
              onClick={() => remove(idx)}
              title="Eliminar"
              style={{ background: "transparent", border: "none", color: P.s400, cursor: "pointer", fontSize: 14, padding: "2px 4px" }}
            >×</button>
          </div>
        ))}
        <button
          onClick={add}
          style={{
            alignSelf: "flex-start",
            marginTop: 4,
            padding: "4px 9px",
            fontSize: 10.5,
            fontWeight: 600,
            background: "#fff",
            color: c.label,
            border: `1px solid ${c.border}`,
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          + Estrategia
        </button>
      </div>
    </div>
  );
}

function Matrix2x2Editor({ value, onChange, config }) {
  const quadrants = config?.quadrants || {};
  const v = value || {};
  const setQuadrant = (qKey, next) => onChange({ ...v, [qKey]: next });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {QUADRANT_KEYS.map((q) => {
        const qConfig = quadrants[q] || { label: q.toUpperCase() };
        const items = Array.isArray(v[q]) ? v[q] : [];
        return (
          <Quadrant
            key={q}
            qKey={q}
            label={qConfig.label}
            hint={qConfig.hint}
            items={items}
            onChange={(next) => setQuadrant(q, next)}
          />
        );
      })}
    </div>
  );
}

function Matrix2x2Printer({ value, config, accentColor }) {
  const quadrants = config?.quadrants || {};
  const v = value || {};
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, borderLeft: `3px solid ${accentColor}`, paddingLeft: 12 }}>
      {QUADRANT_KEYS.map((q) => {
        const qConfig = quadrants[q] || { label: q.toUpperCase() };
        const items = Array.isArray(v[q]) ? v[q].filter((x) => x && String(x).trim()) : [];
        const c = COLORS[q];
        return (
          <div key={q} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 4, padding: "8px 10px" }}>
            <div style={{ fontSize: "10.5px", fontWeight: 700, color: c.label, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>
              {qConfig.label}
            </div>
            {items.length === 0 ? (
              <div style={{ fontSize: "11px", color: P.s400, fontStyle: "italic" }}>—</div>
            ) : (
              <ul style={{ margin: 0, padding: "0 0 0 16px", fontSize: "11px", color: P.s700 }}>
                {items.map((it, i) => <li key={i} style={{ marginBottom: 2 }}>{it}</li>)}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

export const Matrix2x2Field = {
  Editor: Matrix2x2Editor,
  Printer: Matrix2x2Printer,
  defaultValue: { q1: [], q2: [], q3: [], q4: [] },
};
