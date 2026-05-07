/**
 * Default workspace field — free-form textarea.
 * Mirrors the original behavior in App.jsx (lines 481-491 prior to refactor)
 * so the ~157 exercises without a fieldType render unchanged.
 */

const P = {
  s200: "#e7e5e4",
  s700: "#44403c",
};

/**
 * @param {object} props
 * @param {string} props.value
 * @param {(next: string) => void} props.onChange
 */
function TextareaEditor({ value, onChange }) {
  return (
    <textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      placeholder="Escribe aquí tus notas, borradores, definiciones..."
      style={{
        width: "100%",
        minHeight: 100,
        padding: "10px 12px",
        borderRadius: 6,
        border: `1px solid ${P.s200}`,
        background: "#fff",
        fontSize: 12.5,
        lineHeight: 1.65,
        color: P.s700,
      }}
    />
  );
}

/**
 * Print-time renderer — preserves whitespace from the original textarea.
 * @param {{ value: string, accentColor: string }} props
 */
function TextareaPrinter({ value, accentColor }) {
  return (
    <div
      style={{
        fontSize: "12.5px",
        whiteSpace: "pre-wrap",
        color: "#44403c",
        background: "#fdfdfd",
        padding: "12px 16px",
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: "0 8px 8px 0",
        lineHeight: 1.6,
      }}
    >
      {value}
    </div>
  );
}

export const TextareaField = {
  Editor: TextareaEditor,
  Printer: TextareaPrinter,
  defaultValue: "",
};
