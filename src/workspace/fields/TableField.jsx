/**
 * TableField — generic editable table.
 *
 * Config:
 *   { columns: [{ key, label, type: 'text'|'number'|'select'|'date', options?, width? }] }
 *
 * Value:
 *   { rows: [ { [colKey]: value, ... }, ... ] }
 */

const P = {
  border: "#e8e6e1",
  s100: "#f5f5f4",
  s200: "#e7e5e4",
  s400: "#a8a29e",
  s500: "#78716c",
  s700: "#44403c",
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
};

const headerCellStyle = {
  padding: "8px 10px",
  textAlign: "left",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: ".04em",
  color: P.s500,
  background: P.s100,
  borderBottom: `1px solid ${P.s200}`,
};

const cellStyle = {
  padding: "6px 8px",
  borderBottom: `1px solid ${P.border}`,
  verticalAlign: "top",
};

function emptyRow(columns) {
  const row = {};
  columns.forEach((c) => {
    row[c.key] = c.type === "number" ? "" : "";
  });
  return row;
}

function CellEditor({ column, value, onChange }) {
  if (column.type === "select" && Array.isArray(column.options)) {
    return (
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        style={{ ...inputStyle, cursor: "pointer" }}
      >
        <option value="">—</option>
        {column.options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }
  if (column.type === "number") {
    return (
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        style={inputStyle}
      />
    );
  }
  if (column.type === "date") {
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
  return (
    <textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      rows={1}
      style={{ ...inputStyle, resize: "vertical", minHeight: 28, lineHeight: 1.4 }}
    />
  );
}

function TableEditor({ value, onChange, config }) {
  const columns = config?.columns || [];
  const rows = value?.rows || [];

  const updateRow = (idx, colKey, next) => {
    const newRows = rows.map((r, i) => (i === idx ? { ...r, [colKey]: next } : r));
    onChange({ ...(value || {}), rows: newRows });
  };

  const addRow = () => {
    onChange({ ...(value || {}), rows: [...rows, emptyRow(columns)] });
  };

  const removeRow = (idx) => {
    onChange({ ...(value || {}), rows: rows.filter((_, i) => i !== idx) });
  };

  return (
    <div style={{ background: "#fff", border: `1px solid ${P.s200}`, borderRadius: 6, overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={{ ...headerCellStyle, width: c.width }}>{c.label}</th>
            ))}
            <th style={{ ...headerCellStyle, width: 40 }}></th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length + 1} style={{ ...cellStyle, textAlign: "center", color: P.s400, fontStyle: "italic", padding: "16px" }}>
                Sin filas todavía. Agrega la primera abajo.
              </td>
            </tr>
          )}
          {rows.map((row, idx) => (
            <tr key={idx}>
              {columns.map((c) => (
                <td key={c.key} style={cellStyle}>
                  <CellEditor column={c} value={row[c.key]} onChange={(v) => updateRow(idx, c.key, v)} />
                </td>
              ))}
              <td style={{ ...cellStyle, textAlign: "center" }}>
                <button
                  onClick={() => removeRow(idx)}
                  title="Eliminar fila"
                  style={{ background: "transparent", border: "none", color: P.s400, cursor: "pointer", fontSize: 14, padding: "4px 6px" }}
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ padding: "8px 10px", borderTop: `1px solid ${P.s200}`, background: P.s100 }}>
        <button
          onClick={addRow}
          style={{
            padding: "6px 12px",
            fontSize: 11.5,
            fontWeight: 600,
            background: "#fff",
            color: "#92613a",
            border: `1px solid ${P.s200}`,
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          + Agregar fila
        </button>
      </div>
    </div>
  );
}

function TablePrinter({ value, config, accentColor }) {
  const columns = config?.columns || [];
  const rows = value?.rows || [];
  if (rows.length === 0) return null;
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11.5px", border: `1px solid ${P.s200}`, borderLeft: `3px solid ${accentColor}` }}>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key} style={{ padding: "6px 8px", textAlign: "left", background: "#f5f5f4", borderBottom: `1px solid ${P.s200}`, fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase", color: P.s500 }}>
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={idx}>
            {columns.map((c) => (
              <td key={c.key} style={{ padding: "6px 8px", borderBottom: `1px solid ${P.border}`, color: P.s700, verticalAlign: "top", whiteSpace: "pre-wrap" }}>
                {row[c.key] || ""}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export const TableField = {
  Editor: TableEditor,
  Printer: TablePrinter,
  defaultValue: { rows: [] },
};
