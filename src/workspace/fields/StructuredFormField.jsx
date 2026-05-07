/**
 * StructuredFormField — guided form with sections + typed fields.
 *
 * Config:
 *   {
 *     sections: [
 *       {
 *         key, label, hint?,
 *         fields: [
 *           { key, label, type: 'text'|'textarea'|'date'|'select'|'list-string',
 *             placeholder?, options?, hint? }
 *         ]
 *       }
 *     ]
 *   }
 *
 * Value:
 *   { [sectionKey]: { [fieldKey]: value } }
 *   - For 'list-string', value is an array of strings.
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

const inputStyle = {
  width: "100%",
  padding: "7px 9px",
  fontSize: 12.5,
  border: `1px solid ${P.s200}`,
  borderRadius: 5,
  background: "#fff",
  color: P.s700,
  fontFamily: "inherit",
  boxSizing: "border-box",
  lineHeight: 1.5,
};

function ListStringEditor({ value, onChange, placeholder }) {
  const items = Array.isArray(value) ? value : [];
  const update = (idx, next) => onChange(items.map((it, i) => (i === idx ? next : it)));
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));
  const add = () => onChange([...items, ""]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {items.map((it, idx) => (
        <div key={idx} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
          <span style={{ fontSize: 11, color: P.s400, marginTop: 8, minWidth: 18, textAlign: "right" }}>{idx + 1}.</span>
          <textarea
            value={it}
            onChange={(e) => update(idx, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder={placeholder}
            rows={1}
            style={{ ...inputStyle, resize: "vertical", minHeight: 30 }}
          />
          <button
            onClick={() => remove(idx)}
            title="Eliminar"
            style={{ background: "transparent", border: "none", color: P.s400, cursor: "pointer", fontSize: 16, padding: "2px 6px" }}
          >×</button>
        </div>
      ))}
      <button
        onClick={add}
        style={{
          alignSelf: "flex-start",
          marginTop: 4,
          padding: "5px 10px",
          fontSize: 11,
          fontWeight: 600,
          background: "#fff",
          color: "#92613a",
          border: `1px solid ${P.s200}`,
          borderRadius: 5,
          cursor: "pointer",
        }}
      >
        + Agregar
      </button>
    </div>
  );
}

function FieldEditor({ field, value, onChange }) {
  if (field.type === "textarea") {
    return (
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        placeholder={field.placeholder}
        rows={3}
        style={{ ...inputStyle, resize: "vertical", minHeight: 60 }}
      />
    );
  }
  if (field.type === "date") {
    return (
      <input
        type="date"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        style={inputStyle}
      />
    );
  }
  if (field.type === "select" && Array.isArray(field.options)) {
    return (
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        style={{ ...inputStyle, cursor: "pointer" }}
      >
        <option value="">—</option>
        {field.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    );
  }
  if (field.type === "list-string") {
    return <ListStringEditor value={value} onChange={onChange} placeholder={field.placeholder} />;
  }
  return (
    <input
      type="text"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      placeholder={field.placeholder}
      style={inputStyle}
    />
  );
}

function StructuredFormEditor({ value, onChange, config }) {
  const sections = config?.sections || [];
  const v = value || {};
  const updateField = (sKey, fKey, next) => {
    onChange({
      ...v,
      [sKey]: { ...(v[sKey] || {}), [fKey]: next },
    });
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {sections.map((section) => (
        <div
          key={section.key}
          style={{
            background: "#fff",
            border: `1px solid ${P.s200}`,
            borderRadius: 6,
            padding: "12px 14px",
          }}
        >
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#92613a",
            textTransform: "uppercase",
            letterSpacing: ".05em",
            marginBottom: section.hint ? 4 : 10,
          }}>
            {section.label}
          </div>
          {section.hint && (
            <div style={{ fontSize: 11.5, color: P.s500, marginBottom: 10, lineHeight: 1.5 }}>
              {section.hint}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {section.fields.map((field) => (
              <div key={field.key}>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: P.s600, marginBottom: 4 }}>
                  {field.label}
                </label>
                <FieldEditor
                  field={field}
                  value={(v[section.key] || {})[field.key]}
                  onChange={(next) => updateField(section.key, field.key, next)}
                />
                {field.hint && (
                  <div style={{ fontSize: 10.5, color: P.s400, marginTop: 3, fontStyle: "italic", lineHeight: 1.4 }}>
                    {field.hint}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function StructuredFormPrinter({ value, config, accentColor }) {
  const sections = config?.sections || [];
  const v = value || {};
  return (
    <div style={{ borderLeft: `3px solid ${accentColor}`, paddingLeft: 12, fontSize: "12px" }}>
      {sections.map((section) => {
        const sv = v[section.key] || {};
        const hasContent = section.fields.some((f) => {
          const val = sv[f.key];
          if (Array.isArray(val)) return val.some((x) => x && String(x).trim());
          return val && String(val).trim();
        });
        if (!hasContent) return null;
        return (
          <div key={section.key} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: P.s500, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 6 }}>
              {section.label}
            </div>
            {section.fields.map((field) => {
              const val = sv[field.key];
              if (field.type === "list-string") {
                if (!Array.isArray(val) || val.length === 0) return null;
                return (
                  <div key={field.key} style={{ marginBottom: 6 }}>
                    <div style={{ fontWeight: 600, color: P.s700, fontSize: "11.5px" }}>{field.label}</div>
                    <ul style={{ margin: "4px 0 0 18px", padding: 0, color: P.s700 }}>
                      {val.map((item, i) => item ? <li key={i} style={{ marginBottom: 2 }}>{item}</li> : null)}
                    </ul>
                  </div>
                );
              }
              if (!val || !String(val).trim()) return null;
              return (
                <div key={field.key} style={{ marginBottom: 6 }}>
                  <div style={{ fontWeight: 600, color: P.s700, fontSize: "11.5px" }}>{field.label}</div>
                  <div style={{ color: P.s700, whiteSpace: "pre-wrap", fontSize: "11.5px" }}>{val}</div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export const StructuredFormField = {
  Editor: StructuredFormEditor,
  Printer: StructuredFormPrinter,
  defaultValue: {},
};
