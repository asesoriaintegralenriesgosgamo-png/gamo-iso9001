/**
 * Default workspace field — free-form textarea.
 * Mirrors the original behavior in App.jsx (lines 481-491 prior to refactor)
 * so the ~157 exercises without a fieldType render unchanged.
 */

import { useLayoutEffect, useRef } from "react";

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
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      placeholder="Escribe aquí tus notas, borradores, definiciones..."
      rows={4}
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
        overflow: "hidden",
        resize: "none",
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
