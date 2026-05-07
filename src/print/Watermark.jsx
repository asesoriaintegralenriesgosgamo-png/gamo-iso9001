/**
 * Watermark — diagonal "BORRADOR" text overlaid on every page when the
 * document is incomplete. Uses position: fixed which most browsers honor
 * in print mode (Chromium repeats fixed elements per printed page).
 */

export function Watermark({ text = "BORRADOR" }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%) rotate(-32deg)",
        fontSize: "120pt",
        fontWeight: 900,
        color: "rgba(146, 97, 58, 0.08)",
        letterSpacing: ".1em",
        pointerEvents: "none",
        zIndex: 0,
        whiteSpace: "nowrap",
        userSelect: "none",
      }}
    >
      {text}
    </div>
  );
}
