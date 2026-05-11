/**
 * WorkspaceField — switch component that renders the appropriate editor
 * for an exercise's `fieldType`. Owns the panel chrome plus the auto-save
 * pipeline: localStorage backup on every keystroke, debounced remote save,
 * status indicator, beforeunload flush, and recovery from local drafts.
 */

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { getFieldType } from "./fieldTypes.js";
import { parseWork, serializeWork, isFilled } from "./helpers/persistence.js";

const AUTOSAVE_DELAY_MS = 1500;
const SAVED_BADGE_MS = 2200;
const STORAGE_PREFIX = "iso9001-draft-";

const I = {
  edit: (c) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
};

const STATUS_STYLES = {
  idle: { color: "#a8a29e", text: "Auto-guardado activado" },
  dirty: { color: "#92613a", text: "● Cambios sin guardar..." },
  saving: { color: "#577080", text: "Guardando..." },
  saved: { color: "#5a7260", text: "✓ Guardado" },
  error: { color: "#c53b3b", text: "⚠ Error al guardar" },
};

function fmtTime(date) {
  if (!date) return "";
  return date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

/**
 * @param {object} props
 * @param {string} props.rawValue                           Stored string from workText[wk]
 * @param {string} [props.fieldType]                        Optional registered type key
 * @param {object} [props.fieldConfig]                      Type-specific configuration
 * @param {string} props.storageKey                         Unique key for localStorage backup (e.g., "w-0-1-2")
 * @param {(rawValue: string) => Promise<boolean>} props.onSave  Persists serialized value, returns success
 * @param {(rawValue: string) => void} [props.onLiveChange]      In-memory sync without persisting
 */
export function WorkspaceField({ rawValue, fieldType, fieldConfig, storageKey, onSave, onLiveChange }) {
  const handler = getFieldType(fieldType);
  const Editor = handler.Editor;
  const defaultValue = handler.defaultValue;
  const resolvedType = fieldType || "textarea";
  const localKey = storageKey ? `${STORAGE_PREFIX}${storageKey}` : null;

  const parsed = useMemo(
    () => parseWork(rawValue, resolvedType, defaultValue),
    [rawValue, resolvedType, defaultValue],
  );

  const [draft, setDraft] = useState(parsed.value);
  const [saveState, setSaveState] = useState("idle");
  const [savedAt, setSavedAt] = useState(null);

  const saveTimerRef = useRef(null);
  const savedBadgeTimerRef = useRef(null);
  const draftRef = useRef(draft);
  const onSaveRef = useRef(onSave);
  const saveStateRef = useRef(saveState);

  useEffect(() => { draftRef.current = draft; }, [draft]);
  useEffect(() => { onSaveRef.current = onSave; }, [onSave]);
  useEffect(() => { saveStateRef.current = saveState; }, [saveState]);

  // Sync draft when external rawValue changes (e.g., realtime push from another
  // tab) — but only if we don't have a pending unsaved change. That keeps the
  // user's in-progress edits from being clobbered by realtime updates that
  // arrive between keystrokes.
  useEffect(() => {
    if (saveStateRef.current === "dirty" || saveStateRef.current === "saving") return;
    setDraft(parsed.value);
  }, [parsed.value]);

  const writeBackup = useCallback((value) => {
    if (!localKey) return;
    try {
      localStorage.setItem(localKey, serializeWork(value, resolvedType));
    } catch { /* quota / private mode — ignore */ }
  }, [localKey, resolvedType]);

  const clearBackup = useCallback(() => {
    if (!localKey) return;
    try { localStorage.removeItem(localKey); } catch { /* ignore */ }
  }, [localKey]);

  const flushNow = useCallback(async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    setSaveState("saving");
    const serialized = serializeWork(draftRef.current, resolvedType);
    try {
      const result = await onSaveRef.current(serialized);
      if (result !== false) {
        clearBackup();
        setSaveState("saved");
        setSavedAt(new Date());
        if (savedBadgeTimerRef.current) clearTimeout(savedBadgeTimerRef.current);
        savedBadgeTimerRef.current = setTimeout(() => setSaveState("idle"), SAVED_BADGE_MS);
      } else {
        setSaveState("error");
      }
    } catch {
      setSaveState("error");
    }
  }, [resolvedType, clearBackup]);

  const scheduleSave = useCallback(() => {
    setSaveState("dirty");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      flushNow();
    }, AUTOSAVE_DELAY_MS);
  }, [flushNow]);

  const handleChange = useCallback(
    (next) => {
      setDraft(next);
      writeBackup(next); // Sync, immediate — survives crashes
      if (onLiveChange) onLiveChange(serializeWork(next, resolvedType));
      scheduleSave();
    },
    [onLiveChange, resolvedType, scheduleSave, writeBackup],
  );

  // Recovery: on mount, check if localStorage has a draft newer than what
  // came from Supabase. If so, restore it and schedule a save to sync.
  useEffect(() => {
    if (!localKey) return;
    try {
      const stored = localStorage.getItem(localKey);
      if (!stored || stored === rawValue) return;
      const storedParsed = parseWork(stored, resolvedType, defaultValue);
      if (isFilled(storedParsed.value, resolvedType)) {
        setDraft(storedParsed.value);
        scheduleSave();
      } else {
        clearBackup();
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Flush pending save before page unload (close, refresh, navigate away).
  // The browser may not always wait for async work but it gives the request
  // a chance to fire — combined with localStorage backup, data is safe.
  useEffect(() => {
    const onBeforeUnload = () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
        // Best-effort sync attempt; the actual network call may not complete.
        const serialized = serializeWork(draftRef.current, resolvedType);
        try { onSaveRef.current(serialized); } catch { /* ignore */ }
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [resolvedType]);

  // On unmount (panel collapsed): flush any pending save so collapsing the
  // workspace before debounce fires doesn't lose work.
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        const serialized = serializeWork(draftRef.current, resolvedType);
        try { onSaveRef.current(serialized); } catch { /* ignore */ }
      }
      if (savedBadgeTimerRef.current) clearTimeout(savedBadgeTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const status = STATUS_STYLES[saveState] || STATUS_STYLES.idle;
  const showRetry = saveState === "error";

  return (
    <div className="anim panel" style={{ background: "#fefcf6", borderRadius: 8, borderLeft: "3px solid #d4a86030", fontSize: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 11.5, color: "#92613a", textTransform: "uppercase", letterSpacing: ".04em" }}>
          {I.edit("#92613a")} Tu trabajo
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10.5 }}>
          <span style={{ color: status.color, fontWeight: 600 }}>{status.text}</span>
          {saveState === "saved" && savedAt && (
            <span style={{ color: "#a8a29e" }}>· {fmtTime(savedAt)}</span>
          )}
          {saveState === "idle" && savedAt && (
            <span style={{ color: "#a8a29e" }}>· último a las {fmtTime(savedAt)}</span>
          )}
          {showRetry && (
            <button
              onClick={flushNow}
              style={{
                padding: "3px 9px",
                borderRadius: 5,
                fontSize: 10,
                fontWeight: 700,
                background: "#c53b3b",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Reintentar
            </button>
          )}
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
