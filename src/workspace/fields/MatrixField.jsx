/**
 * MatrixField — rows × cols grid with typed cells.
 *
 * Config:
 *   {
 *     rows: [{ key, label }],
 *     cols: [{ key, label }],
 *     cellType: 'number-scale' | 'text' | 'select',
 *     cellConfig?: { min?, max?, options?, levelLabels? },
 *     allowAddRows?: boolean,   // default true
 *     allowAddCols?: boolean,   // default true
 *   }
 *
 * Value:
 *   {
 *     rows?: [{ key, label }],   // override config rows (user-added)
 *     cols?: [{ key, label }],   // override config cols
 *     cells: { [rowKey]: { [colKey]: value } }
 *   }
 *
 * For 'number-scale' the cell is rendered as a colored chip (0..max).
 */

const P = {
  border: "#e8e6e1",
  s100: "#f5f5f4",
  s200: "#e7e5e4",
  s300: "#d6d3d1",
  s400: "#a8a29e",
  s500: "#78716c",
  s600: "#57534e",
  s700: "#44403c",
};

const SCALE_COLORS = ["#f5f5f4", "#fde6c4", "#fbd58a", "#a3c39a", "#5a7260"];

function levelColor(level, max) {
  if (level == null || level === "") return P.s100;
  const n = Number(level);
  if (Number.isNaN(n)) return P.s100;
  const idx = Math.max(0, Math.min(SCALE_COLORS.length - 1, Math.round((n / max) * (SCALE_COLORS.length - 1))));
  return SCALE_COLORS[idx];
}

function NumberScaleCell({ value, max, onChange }) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "100%",
        padding: "6px 4px",
        fontSize: 12,
        fontWeight: 600,
        border: "none",
        background: levelColor(value, max),
        color: P.s700,
        textAlign: "center",
        cursor: "pointer",
      }}
    >
      <option value="">—</option>
      {Array.from({ length: max + 1 }, (_, i) => i).map((n) => (
        <option key={n} value={n}>{n}</option>
      ))}
    </select>
  );
}

function TextCell({ value, onChange }) {
  return (
    <input
      type="text"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "100%",
        padding: "5px 6px",
        fontSize: 12,
        border: "none",
        background: "transparent",
        color: P.s700,
        boxSizing: "border-box",
      }}
    />
  );
}

function MatrixEditor({ value, onChange, config }) {
  const cellType = config?.cellType || "text";
  const max = config?.cellConfig?.max ?? 4;
  const allowAddRows = config?.allowAddRows ?? true;
  const allowAddCols = config?.allowAddCols ?? true;

  const v = value || {};
  const rows = v.rows ?? config?.rows ?? [];
  const cols = v.cols ?? config?.cols ?? [];
  const cells = v.cells ?? {};

  const updateCell = (rKey, cKey, next) => {
    onChange({
      ...v,
      rows,
      cols,
      cells: { ...cells, [rKey]: { ...(cells[rKey] || {}), [cKey]: next } },
    });
  };

  const addRow = () => {
    const newKey = `r${Date.now()}`;
    onChange({ ...v, rows: [...rows, { key: newKey, label: "Nueva fila" }], cols, cells });
  };
  const renameRow = (idx, label) => {
    const newRows = rows.map((r, i) => (i === idx ? { ...r, label } : r));
    onChange({ ...v, rows: newRows, cols, cells });
  };
  const removeRow = (idx) => {
    const removed = rows[idx];
    const newRows = rows.filter((_, i) => i !== idx);
    const { [removed.key]: _omit, ...newCells } = cells;
    void _omit;
    onChange({ ...v, rows: newRows, cols, cells: newCells });
  };

  const addCol = () => {
    const newKey = `c${Date.now()}`;
    onChange({ ...v, rows, cols: [...cols, { key: newKey, label: "Nueva columna" }], cells });
  };
  const renameCol = (idx, label) => {
    const newCols = cols.map((c, i) => (i === idx ? { ...c, label } : c));
    onChange({ ...v, rows, cols: newCols, cells });
  };
  const removeCol = (idx) => {
    const removed = cols[idx];
    const newCols = cols.filter((_, i) => i !== idx);
    const newCells = {};
    Object.entries(cells).forEach(([rKey, rowCells]) => {
      const { [removed.key]: _omit, ...rest } = rowCells;
      void _omit;
      newCells[rKey] = rest;
    });
    onChange({ ...v, rows, cols: newCols, cells: newCells });
  };

  const renderCell = (rKey, col) => {
    const cellVal = (cells[rKey] || {})[col.key];
    if (cellType === "number-scale") {
      return <NumberScaleCell value={cellVal} max={max} onChange={(n) => updateCell(rKey, col.key, n)} />;
    }
    if (cellType === "select" && Array.isArray(config?.cellConfig?.options)) {
      return (
        <select
          value={cellVal || ""}
          onChange={(e) => updateCell(rKey, col.key, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          style={{ width: "100%", padding: "5px 6px", fontSize: 12, border: "none", background: "transparent", color: P.s700, cursor: "pointer" }}
        >
          <option value="">—</option>
          {config.cellConfig.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    }
    return <TextCell value={cellVal} onChange={(s) => updateCell(rKey, col.key, s)} />;
  };

  return (
    <div style={{ background: "#fff", border: `1px solid ${P.s200}`, borderRadius: 6, overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr>
            <th style={{ padding: "8px 10px", textAlign: "left", fontSize: 11, fontWeight: 700, color: P.s500, textTransform: "uppercase", background: P.s100, borderBottom: `1px solid ${P.s200}`, borderRight: `1px solid ${P.s200}`, minWidth: 140 }}></th>
            {cols.map((col, idx) => (
              <th key={col.key} style={{ padding: "6px 8px", textAlign: "center", background: P.s100, borderBottom: `1px solid ${P.s200}`, borderRight: idx < cols.length - 1 ? `1px solid ${P.borderL || "#f0eeea"}` : "none" }}>
                <input
                  type="text"
                  value={col.label}
                  onChange={(e) => renameCol(idx, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: "100%", border: "none", background: "transparent", fontSize: 11, fontWeight: 700, color: P.s600, textAlign: "center", textTransform: "uppercase", letterSpacing: ".03em", padding: 2 }}
                />
                {allowAddCols && (
                  <button
                    onClick={() => removeCol(idx)}
                    title="Quitar columna"
                    style={{ background: "transparent", border: "none", color: P.s400, cursor: "pointer", fontSize: 11, padding: 0 }}
                  >×</button>
                )}
              </th>
            ))}
            {allowAddCols && (
              <th style={{ padding: "6px 8px", background: P.s100, borderBottom: `1px solid ${P.s200}`, width: 50, textAlign: "center" }}>
                <button
                  onClick={addCol}
                  title="Agregar columna"
                  style={{ background: "#fff", border: `1px solid ${P.s200}`, borderRadius: 4, color: "#92613a", cursor: "pointer", padding: "2px 8px", fontSize: 14, fontWeight: 700 }}
                >+</button>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={cols.length + 2} style={{ padding: 16, textAlign: "center", color: P.s400, fontStyle: "italic" }}>
                Agrega filas y columnas para empezar.
              </td>
            </tr>
          )}
          {rows.map((row, rIdx) => (
            <tr key={row.key}>
              <td style={{ padding: "4px 8px", borderBottom: `1px solid ${P.border}`, borderRight: `1px solid ${P.s200}`, background: P.s100, position: "relative" }}>
                <input
                  type="text"
                  value={row.label}
                  onChange={(e) => renameRow(rIdx, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: "calc(100% - 22px)", border: "none", background: "transparent", fontSize: 12, fontWeight: 600, color: P.s700, padding: 2 }}
                />
                {allowAddRows && (
                  <button
                    onClick={() => removeRow(rIdx)}
                    title="Quitar fila"
                    style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: P.s400, cursor: "pointer", fontSize: 13 }}
                  >×</button>
                )}
              </td>
              {cols.map((col, cIdx) => (
                <td key={col.key} style={{ borderBottom: `1px solid ${P.border}`, borderRight: cIdx < cols.length - 1 ? `1px solid ${P.borderL || "#f0eeea"}` : "none", padding: 0 }}>
                  {renderCell(row.key, col)}
                </td>
              ))}
              {allowAddCols && <td style={{ borderBottom: `1px solid ${P.border}` }}></td>}
            </tr>
          ))}
        </tbody>
      </table>
      {allowAddRows && (
        <div style={{ padding: "8px 10px", borderTop: `1px solid ${P.s200}`, background: P.s100 }}>
          <button
            onClick={addRow}
            style={{
              padding: "5px 11px",
              fontSize: 11.5,
              fontWeight: 600,
              background: "#fff",
              color: "#92613a",
              border: `1px solid ${P.s200}`,
              borderRadius: 5,
              cursor: "pointer",
            }}
          >+ Agregar fila</button>
        </div>
      )}
      {cellType === "number-scale" && config?.cellConfig?.levelLabels && (
        <div style={{ padding: "6px 10px", borderTop: `1px solid ${P.s200}`, background: "#fafaf9", fontSize: 10.5, color: P.s500, display: "flex", gap: 12, flexWrap: "wrap" }}>
          {config.cellConfig.levelLabels.map((label, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: SCALE_COLORS[Math.min(SCALE_COLORS.length - 1, i)] }} />
              {i} — {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function MatrixPrinter({ value, config, accentColor }) {
  const cellType = config?.cellType || "text";
  const max = config?.cellConfig?.max ?? 4;
  const v = value || {};
  const rows = v.rows ?? config?.rows ?? [];
  const cols = v.cols ?? config?.cols ?? [];
  const cells = v.cells ?? {};
  if (rows.length === 0 || cols.length === 0) return null;

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", border: `1px solid ${P.s200}`, borderLeft: `3px solid ${accentColor}` }}>
      <thead>
        <tr>
          <th style={{ padding: "5px 7px", background: "#f5f5f4", borderBottom: `1px solid ${P.s200}` }}></th>
          {cols.map((col) => (
            <th key={col.key} style={{ padding: "5px 7px", background: "#f5f5f4", borderBottom: `1px solid ${P.s200}`, fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: P.s500, textAlign: "center" }}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key}>
            <td style={{ padding: "5px 7px", background: "#f5f5f4", borderBottom: `1px solid ${P.border}`, fontWeight: 600, color: P.s700 }}>{row.label}</td>
            {cols.map((col) => {
              const cellVal = (cells[row.key] || {})[col.key];
              const bg = cellType === "number-scale" ? levelColor(cellVal, max) : "transparent";
              return (
                <td key={col.key} style={{ padding: "5px 7px", borderBottom: `1px solid ${P.border}`, background: bg, color: P.s700, textAlign: cellType === "number-scale" ? "center" : "left", fontWeight: cellType === "number-scale" ? 600 : 400 }}>
                  {cellVal == null || cellVal === "" ? "" : String(cellVal)}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export const MatrixField = {
  Editor: MatrixEditor,
  Printer: MatrixPrinter,
  defaultValue: { rows: [], cols: [], cells: {} },
};
