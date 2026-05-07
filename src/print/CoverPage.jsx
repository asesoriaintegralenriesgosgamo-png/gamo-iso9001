/**
 * CoverPage — formal ISO 9001 manual-style cover.
 *
 * Layout (single A4 page, 100% bleed via .print-cover):
 *   - Top band (brand color)
 *   - Centered title block with ISO standard reference
 *   - Organization details
 *   - Document metadata table
 *   - Approval signatures
 *   - Footer with controlled-document reference
 */

import { REPORT_METADATA, PRINT_PALETTE } from "./printStyles.js";
import { documentState } from "./helpers/progress.js";

function MetaRow({ label, value }) {
  return (
    <tr>
      <td style={{
        fontSize: "9pt",
        fontWeight: 700,
        color: PRINT_PALETTE.muted,
        textTransform: "uppercase",
        letterSpacing: ".05em",
        padding: "8pt 14pt 8pt 0",
        borderBottom: `1px solid ${PRINT_PALETTE.ruleSoft}`,
        verticalAlign: "top",
        width: "38%",
      }}>{label}</td>
      <td style={{
        fontSize: "11pt",
        color: PRINT_PALETTE.ink,
        padding: "8pt 0",
        borderBottom: `1px solid ${PRINT_PALETTE.ruleSoft}`,
        fontWeight: 500,
      }}>{value}</td>
    </tr>
  );
}

function SignatureSlot({ role }) {
  return (
    <div style={{ flex: 1, textAlign: "center" }}>
      <div style={{ borderBottom: `1px solid ${PRINT_PALETTE.ink}`, height: "44pt" }} />
      <div style={{
        fontSize: "8.5pt",
        fontWeight: 700,
        color: PRINT_PALETTE.muted,
        textTransform: "uppercase",
        letterSpacing: ".05em",
        marginTop: "6pt",
      }}>{role}</div>
      <div style={{ fontSize: "8pt", color: PRINT_PALETTE.mutedLight, marginTop: "2pt" }}>
        Firma · Nombre · Fecha
      </div>
    </div>
  );
}

export function CoverPage({ summary }) {
  const meta = REPORT_METADATA;
  const generated = new Date().toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const state = documentState(summary?.pct ?? 0);

  return (
    <div className="print-cover" style={{
      minHeight: "29.7cm",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      background: PRINT_PALETTE.paper,
      color: PRINT_PALETTE.ink,
      position: "relative",
      boxSizing: "border-box",
    }}>
      {/* Top brand band */}
      <div style={{
        background: PRINT_PALETTE.brand,
        color: "#fff",
        padding: "1.6cm 2cm 1.4cm 2cm",
        position: "relative",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12pt" }}>
          <div style={{
            width: "44pt",
            height: "44pt",
            borderRadius: "10pt",
            background: "rgba(255,255,255,.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "11pt", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", opacity: 0.85 }}>
              {meta.orgShortName}
            </div>
            <div style={{ fontSize: "9.5pt", opacity: 0.85, marginTop: "2pt" }}>
              {meta.orgFullName}
            </div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{
              border: `1.5pt solid #fff`,
              padding: "5pt 12pt",
              borderRadius: "4pt",
              fontSize: "9pt",
              fontWeight: 800,
              letterSpacing: ".08em",
            }}>
              {meta.isoStandard}
            </div>
          </div>
        </div>
      </div>

      {/* Center title block */}
      <div style={{ flex: 1, padding: "2.4cm 2cm 0 2cm", display: "flex", flexDirection: "column", gap: "1cm" }}>
        <div>
          <div style={{
            fontSize: "10pt",
            fontWeight: 700,
            color: PRINT_PALETTE.muted,
            textTransform: "uppercase",
            letterSpacing: ".15em",
            marginBottom: "10pt",
          }}>
            Sistema de Gestión de Calidad
          </div>
          <h1 style={{
            fontSize: "30pt",
            fontWeight: 800,
            lineHeight: 1.15,
            color: PRINT_PALETTE.ink,
            margin: 0,
            letterSpacing: "-.02em",
          }}>
            {meta.documentTitle}
          </h1>
          <p style={{
            fontSize: "13pt",
            color: PRINT_PALETTE.muted,
            marginTop: "10pt",
            lineHeight: 1.4,
          }}>
            {meta.documentSubtitle}
          </p>
        </div>

        {/* State badge */}
        <div>
          <span style={{
            display: "inline-block",
            background: state.color,
            color: "#fff",
            padding: "5pt 14pt",
            borderRadius: "999pt",
            fontSize: "9.5pt",
            fontWeight: 800,
            letterSpacing: ".1em",
            textTransform: "uppercase",
          }}>
            {state.label} · {summary?.pct ?? 0}% completado
          </span>
        </div>

        {/* Metadata table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "12pt" }}>
          <tbody>
            <MetaRow label="Organización" value={meta.orgFullName} />
            <MetaRow label="Giro" value={meta.orgGiro} />
            <MetaRow label="Ubicación" value={meta.orgLocation} />
            <MetaRow label="Trayectoria" value={`Desde ${meta.orgSince}`} />
            <MetaRow label="Versión del documento" value={`v${meta.documentVersion} — ${meta.documentStatus}`} />
            <MetaRow label="Fecha de generación" value={generated} />
            <MetaRow label="Responsable del SGC" value={meta.responsableSGC} />
          </tbody>
        </table>
      </div>

      {/* Signatures */}
      <div style={{ padding: "0 2cm 1.6cm 2cm" }}>
        <div style={{
          fontSize: "9pt",
          fontWeight: 700,
          color: PRINT_PALETTE.muted,
          textTransform: "uppercase",
          letterSpacing: ".06em",
          marginBottom: "14pt",
        }}>
          Aprobaciones
        </div>
        <div style={{ display: "flex", gap: "20pt", marginBottom: "20pt" }}>
          {meta.signatureRoles.map((s) => <SignatureSlot key={s.role} role={s.role} />)}
        </div>

        {/* Bottom note */}
        <div style={{
          borderTop: `1px solid ${PRINT_PALETTE.rule}`,
          paddingTop: "10pt",
          fontSize: "8.5pt",
          color: PRINT_PALETTE.mutedLight,
          textAlign: "center",
          fontStyle: "italic",
        }}>
          Documento controlado bajo el procedimiento {meta.procedureRef}.<br />
          Su reproducción parcial o total sin autorización del responsable del SGC no está permitida.
        </div>
      </div>
    </div>
  );
}
