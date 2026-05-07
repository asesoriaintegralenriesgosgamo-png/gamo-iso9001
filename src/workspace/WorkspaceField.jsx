/**
 * WorkspaceField — single switch component that renders the appropriate
 * editor for an exercise's `fieldType`. Owns the chrome that used to live
 * inline in App.jsx (header bar, save button, save indicator, panel
 * background, legacy-text fallback notice).
 */

import { useMemo, useState, useEffect, useCallback } from "react";
import { getFieldType } from "./fieldTypes.js";
import { parseWork, serializeWork } from "./helpers/persistence.js";

const I = {
  edit: (c) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  save: (c) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),
};

/**
 * @param {object} props
 * @param {string} props.rawValue              Stored string from workText[wk]
 * @param {string} [props.fieldType]           Optional registered type key
 * @param {object} [props.fieldConfig]         Type-specific configuration
 * @param {(rawValue: string) => void} props.onSave         Persists serialized value
 * @param {(rawValue: string) => void} [props.onLiveChange] In-memory sync without persisting
 * @param {boolean} props.isSaved              Toggle "Guardado" indicator
 */
export function WorkspaceField({ rawValue, fieldType, fieldConfig, onSave, onLiveChange, isSaved }) {
  const handler = getFieldType(fieldType);
  const Editor = handler.Editor;
  const defaultValue = handler.defaultValue;
  const resolvedType = fieldType || "textarea";

  const parsed = useMemo(
    () => parseWork(rawValue, resolvedType, defaultValue),
    [rawValue, resolvedType, defaultValue],
  );

  const [draft, setDraft] = useState(parsed.value);

  // Sync draft when external rawValue changes (e.g., realtime update from
  // another tab) without clobbering in-progress local edits if equal.
  useEffect(() => {
    setDraft(parsed.value);
  }, [parsed.value]);

  const handleChange = useCallback(
    (next) => {
      setDraft(next);
      if (onLiveChange) {
        onLiveChange(serializeWork(next, resolvedType));
      }
    },
    [onLiveChange, resolvedType],
  );

  const handleSave = useCallback(() => {
    const serialized = serializeWork(draft, resolvedType);
    onSave(serialized);
  }, [draft, resolvedType, onSave]);

  return (
    <div className="anim panel" style={{ background: "#fefcf6", borderRadius: 8, borderLeft: "3px solid #d4a86030", fontSize: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 11.5, color: "#92613a", textTransform: "uppercase", letterSpacing: ".04em" }}>
          {I.edit("#92613a")} Tu trabajo
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {isSaved && <span style={{ fontSize: 10, color: "#5a7260", fontWeight: 600, animation: "si .2s ease" }}>Guardado</span>}
          <button
            className="togbtn"
            onClick={handleSave}
            style={{
              padding: "4px 10px",
              borderRadius: 5,
              fontSize: 10.5,
              fontWeight: 600,
              background: "#92613a",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 4,
              border: "none",
            }}
          >
            {I.save("#fff")} Guardar
          </button>
        </div>
      </div>

      {parsed.legacyText && (
        <div
          style={{
            background: "#fff7e6",
            border: "1px solid #f0d9a8",
            borderRadius: 6,
            padding: "8px 10px",
            marginBottom: 8,
            fontSize: 11.5,
            color: "#7a5a1f",
            lineHeight: 1.5,
          }}
        >
          <strong>Texto previo (formato libre):</strong>
          <div style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>{parsed.legacyText}</div>
        </div>
      )}

      <Editor value={draft} onChange={handleChange} config={fieldConfig} />
    </div>
  );
}
