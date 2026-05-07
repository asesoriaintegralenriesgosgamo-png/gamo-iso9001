/**
 * Persistence helpers for specialized workspace fields.
 *
 * Contract: workText[wk] in Supabase remains a string.
 * Structured field types serialize their value to JSON.
 * Textarea (legacy/default) stores the raw string.
 */

/**
 * Parse a stored raw string into the runtime value for a given fieldType.
 * Returns { value, legacyText } where legacyText is set when raw is non-empty
 * but cannot be parsed as the expected structured shape (e.g., user previously
 * filled the field as plain textarea and the type changed afterward).
 *
 * @param {string} raw
 * @param {string} fieldType
 * @param {unknown} defaultValue
 * @returns {{ value: unknown, legacyText: string | null }}
 */
export function parseWork(raw, fieldType, defaultValue) {
  if (raw == null || raw === "") {
    return { value: defaultValue, legacyText: null };
  }

  if (fieldType === "textarea" || !fieldType) {
    return { value: raw, legacyText: null };
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.__fieldType === fieldType) {
      return { value: parsed.value, legacyText: null };
    }
    // JSON exists but isn't the expected structured shape — treat as legacy.
    return { value: defaultValue, legacyText: raw };
  } catch {
    // Not JSON at all — definitely legacy text from previous textarea usage.
    return { value: defaultValue, legacyText: raw };
  }
}

/**
 * Serialize a runtime value back to a string for storage.
 * Wraps structured values with a __fieldType marker so future loads can
 * distinguish them from raw textarea content.
 *
 * @param {unknown} value
 * @param {string} fieldType
 * @returns {string}
 */
export function serializeWork(value, fieldType) {
  if (fieldType === "textarea" || !fieldType) {
    return typeof value === "string" ? value : "";
  }
  return JSON.stringify({ __fieldType: fieldType, value });
}

/**
 * Returns true if the parsed value is considered "filled" (worth showing
 * the saved-content indicator dot in the toggle button).
 *
 * @param {unknown} value
 * @param {string} fieldType
 */
export function isFilled(value, fieldType) {
  if (value == null) return false;
  if (fieldType === "textarea" || !fieldType) {
    return typeof value === "string" && value.trim() !== "";
  }
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return Boolean(value);
}
