/**
 * PrintReport — root of the PDF export view.
 *
 * Composition order (each component handles its own page break):
 *   1. CoverPage         (page 1)
 *   2. ProgressDashboard (page 2)
 *   3. TableOfContents   (page 3)
 *   4. PhaseSection × 5  (one page break per fase)
 */

import { CoverPage } from "./CoverPage.jsx";
import { ProgressDashboard } from "./ProgressDashboard.jsx";
import { TableOfContents } from "./TableOfContents.jsx";
import { PhaseSection } from "./PhaseSection.jsx";
import { Watermark } from "./Watermark.jsx";
import { buildPrintCSS } from "./printStyles.js";
import { summarizeAll } from "./helpers/progress.js";
import { getFieldType } from "../workspace/fieldTypes.js";
import { parseWork, isFilled } from "../workspace/helpers/persistence.js";

const HELPERS = { getFieldType, parseWork, isFilled };

export function PrintReport({ data, workText }) {
  const summary = summarizeAll(data, workText, HELPERS);
  const isComplete = summary.pct >= 100;

  return (
    <>
      <style>{buildPrintCSS()}</style>
      {!isComplete && <Watermark text="BORRADOR" />}

      <CoverPage summary={summary} />
      <ProgressDashboard summary={summary} />
      <TableOfContents data={data} summary={summary} />

      {data.map((phase, pi) => (
        <PhaseSection
          key={phase.id}
          phase={phase}
          phaseIndex={pi}
          workText={workText}
        />
      ))}

      {summary.filled === 0 && summary.done === 0 && (
        <div style={{
          textAlign: "center",
          color: "#78716c",
          fontStyle: "italic",
          marginTop: "60pt",
          fontSize: "11pt",
        }}>
          Aún no hay información documentada en los espacios de trabajo.
        </div>
      )}
    </>
  );
}
