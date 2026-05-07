/**
 * IshikawaField — fishbone (cause-effect) diagram for root-cause analysis.
 *
 * Config (optional): { categories?: [{ key, label }] }
 *   Defaults to the 6Ms adapted for service organizations.
 *
 * Value:
 *   {
 *     problem: string,
 *     causes: { [categoryKey]: string[] }
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

const DEFAULT_CATEGORIES = [
  { key: "personas", label: "Personas", color: "#5a7260" },
  { key: "proceso", label: "Proceso / Métodos", color: "#577080" },
  { key: "tecnologia", label: "Tecnología / Sistemas", color: "#6b5f75" },
  { key: "materiales", label: "Materiales / Información", color: "#8a6e4e" },
  { key: "entorno", label: "Entorno", color: "#7a8a94" },
  { key: "medicion", label: "Medición / Control", color: "#85412e" },
];

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
};

function CategoryBox({ category, causes, onChange }) {
  const update = (idx, next) => onChange(causes.map((c, i) => (i === idx ? next : c)));
  const remove = (idx) => onChange(causes.filter((_, i) => i !== idx));
  const add = () => onChange([...causes, ""]);

  return (
    <div style={{ background: "#fff", border: `1px solid ${P.s200}`, borderTop: `3px solid ${category.color}`, borderRadius: 6, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: category.color, textTransform: "uppercase", letterSpacing: ".05em" }}>
        {category.label}
      </div>
      {causes.map((cause, idx) => (
        <div key={idx} style={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
          <span style={{ fontSize: 10, color: P.s400, marginTop: 8, fontWeight: 600 }}>•</span>
          <textarea
            value={cause}
            onChange={(e) => update(idx, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="Causa identificada..."
            rows={1}
            style={{ ...inputStyle, resize: "vertical", minHeight: 28, lineHeight: 1.4 }}
          />
          <button onClick={() => remove(idx)} title="Eliminar" style={{ background: "transparent", border: "none", color: P.s400, cursor: "pointer", fontSize: 14, padding: "2px 4px" }}>×</button>
        </div>
      ))}
      <button
        onClick={add}
        style={{ alignSelf: "flex-start", marginTop: 2, padding: "4px 9px", fontSize: 10.5, fontWeight: 600, background: "#fff", color: category.color, border: `1px solid ${P.s200}`, borderRadius: 4, cursor: "pointer" }}
      >
        + Causa
      </button>
    </div>
  );
}

function IshikawaEditor({ value, onChange, config }) {
  const categories = config?.categories || DEFAULT_CATEGORIES;
  const v = value || {};
  const causes = v.causes || {};

  const setProblem = (s) => onChange({ ...v, problem: s, causes });
  const setCategoryCauses = (key, next) => onChange({ ...v, causes: { ...causes, [key]: next } });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ background: "#fff7e6", border: "1px solid #f0d9a8", borderRadius: 6, padding: "10px 12px" }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#92613a", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 5 }}>
          Problema / efecto a analizar
        </label>
        <textarea
          value={v.problem || ""}
          onChange={(e) => setProblem(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          placeholder="Describe el problema, no conformidad o efecto que se está investigando..."
          rows={2}
          style={{ ...inputStyle, resize: "vertical", minHeight: 50 }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
        {categories.map((cat) => (
          <CategoryBox
            key={cat.key}
            category={cat}
            causes={Array.isArray(causes[cat.key]) ? causes[cat.key] : []}
            onChange={(next) => setCategoryCauses(cat.key, next)}
          />
        ))}
      </div>
    </div>
  );
}

function IshikawaPrinter({ value, config, accentColor }) {
  const categories = config?.categories || DEFAULT_CATEGORIES;
  const v = value || {};
  const causes = v.causes || {};
  if (!v.problem && !categories.some((c) => (causes[c.key] || []).some((x) => x && x.trim()))) return null;

  return (
    <div style={{ borderLeft: `3px solid ${accentColor}`, paddingLeft: 12, fontSize: "11.5px" }}>
      {v.problem && (
        <div style={{ background: "#fff7e6", padding: "8px 12px", borderLeft: "3px solid #d4a860", borderRadius: "0 4px 4px 0", marginBottom: 10 }}>
          <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#92613a", textTransform: "uppercase", letterSpacing: ".04em" }}>Problema</div>
          <div style={{ color: P.s700, marginTop: 3 }}>{v.problem}</div>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
        {categories.map((cat) => {
          const items = (causes[cat.key] || []).filter((x) => x && x.trim());
          if (items.length === 0) return null;
          return (
            <div key={cat.key} style={{ borderTop: `2px solid ${cat.color}`, padding: "4px 0 0 0" }}>
              <div style={{ fontSize: "10.5px", fontWeight: 700, color: cat.color, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>
                {cat.label}
              </div>
              <ul style={{ margin: 0, padding: "0 0 0 16px", color: P.s700 }}>
                {items.map((c, i) => <li key={i} style={{ marginBottom: 2 }}>{c}</li>)}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const IshikawaField = {
  Editor: IshikawaEditor,
  Printer: IshikawaPrinter,
  defaultValue: { problem: "", causes: {} },
};
