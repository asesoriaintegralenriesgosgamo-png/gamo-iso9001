/**
 * Progress aggregation helpers shared by print components.
 *
 * Inputs:
 *   - phases: PHASES array (with { sections: [{ items: [{ done?, fieldType?, ...}] }] })
 *   - workText: { [`w-${pi}-${si}-${ii}`]: rawString }
 *   - getFieldType, parseWork, isFilled — from workspace helpers
 */

export function countItem(item, raw, helpers) {
  const { getFieldType, parseWork, isFilled } = helpers;
  const fieldType = item.fieldType || "textarea";
  const handler = getFieldType(fieldType);
  const parsed = parseWork(raw, fieldType, handler.defaultValue);
  const filled = isFilled(parsed.value, fieldType) || Boolean(parsed.legacyText);
  return {
    done: item.done === true,
    filled,
    hasContent: filled || item.done === true,
  };
}

export function summarizePhase(phase, pi, workText, helpers) {
  let total = 0;
  let done = 0;
  let filled = 0;
  const sectionStats = phase.sections.map((sec, si) => {
    let sTotal = 0, sDone = 0, sFilled = 0;
    sec.items.forEach((item, ii) => {
      total++; sTotal++;
      const wk = `w-${pi}-${si}-${ii}`;
      const raw = workText[wk];
      const stats = countItem(item, raw, helpers);
      if (stats.done) { done++; sDone++; }
      if (stats.filled) { filled++; sFilled++; }
    });
    return { title: sec.title, total: sTotal, done: sDone, filled: sFilled };
  });
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return { total, done, filled, pct, sectionStats };
}

export function summarizeAll(phases, workText, helpers) {
  const phaseSummaries = phases.map((p, pi) => ({
    id: p.id,
    phase: p.phase,
    title: p.title,
    ...summarizePhase(p, pi, workText, helpers),
  }));
  const total = phaseSummaries.reduce((s, p) => s + p.total, 0);
  const done = phaseSummaries.reduce((s, p) => s + p.done, 0);
  const filled = phaseSummaries.reduce((s, p) => s + p.filled, 0);
  return {
    total,
    done,
    filled,
    pct: total === 0 ? 0 : Math.round((done / total) * 100),
    pctFilled: total === 0 ? 0 : Math.round((filled / total) * 100),
    phases: phaseSummaries,
  };
}

export function daysUntil(targetDateISO) {
  const target = new Date(targetDateISO + "T00:00:00-06:00");
  const now = new Date();
  return Math.max(0, Math.ceil((target - now) / (1000 * 60 * 60 * 24)));
}

/**
 * Document state derived from completion %.
 *  - "BORRADOR"  if pct < 80
 *  - "REVISION"  if 80 <= pct < 100
 *  - "FINAL"     if pct == 100
 */
export function documentState(pct) {
  if (pct >= 100) return { label: "FINAL", color: "#5a7260" };
  if (pct >= 80) return { label: "REVISIÓN", color: "#577080" };
  return { label: "BORRADOR", color: "#92613a" };
}
