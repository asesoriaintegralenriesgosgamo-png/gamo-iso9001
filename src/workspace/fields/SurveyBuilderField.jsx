/**
 * SurveyBuilderField — design satisfaction surveys with typed questions.
 *
 * Config (optional): no config required.
 *
 * Value:
 *   {
 *     title: string,
 *     intro?: string,
 *     audience?: string,
 *     questions: [{
 *       id, type: 'likert'|'choice'|'nps'|'open',
 *       text, required?,
 *       scale?: { min, max, minLabel, maxLabel },   // likert
 *       options?: string[]                            // choice
 *     }]
 *   }
 */

const P = {
  border: "#e8e6e1",
  borderL: "#f0eeea",
  s100: "#f5f5f4",
  s200: "#e7e5e4",
  s400: "#a8a29e",
  s500: "#78716c",
  s600: "#57534e",
  s700: "#44403c",
};

const TYPE_LABELS = {
  likert: "Escala Likert (1-5)",
  choice: "Opción múltiple",
  nps: "NPS (0-10)",
  open: "Respuesta abierta",
};

const inputStyle = (extra = {}) => ({
  width: "100%",
  padding: "6px 8px",
  fontSize: 12,
  border: `1px solid ${P.s200}`,
  borderRadius: 4,
  background: "#fff",
  color: P.s700,
  fontFamily: "inherit",
  boxSizing: "border-box",
  ...extra,
});

function newQuestion(type = "likert") {
  const base = { id: `q${Date.now()}`, type, text: "", required: true };
  if (type === "likert") base.scale = { min: 1, max: 5, minLabel: "Muy insatisfecho", maxLabel: "Muy satisfecho" };
  if (type === "choice") base.options = ["Opción 1", "Opción 2"];
  return base;
}

function QuestionEditor({ question, onChange, onRemove, onMove, isFirst, isLast }) {
  const setType = (newType) => onChange({ ...newQuestion(newType), id: question.id, text: question.text });
  return (
    <div style={{ background: "#fff", border: `1px solid ${P.s200}`, borderRadius: 6, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <select value={question.type} onChange={(e) => setType(e.target.value)} onClick={(e) => e.stopPropagation()} style={inputStyle({ width: 170, cursor: "pointer", fontWeight: 600 })}>
          {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <label style={{ fontSize: 11, color: P.s500, display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
          <input type="checkbox" checked={question.required ?? true} onChange={(e) => onChange({ ...question, required: e.target.checked })} onClick={(e) => e.stopPropagation()} />
          obligatoria
        </label>
        <button onClick={() => onMove(-1)} disabled={isFirst} title="Mover arriba" style={{ background: "transparent", border: `1px solid ${P.s200}`, borderRadius: 4, color: isFirst ? P.s400 : P.s600, cursor: isFirst ? "not-allowed" : "pointer", padding: "2px 7px", fontSize: 11 }}>↑</button>
        <button onClick={() => onMove(1)} disabled={isLast} title="Mover abajo" style={{ background: "transparent", border: `1px solid ${P.s200}`, borderRadius: 4, color: isLast ? P.s400 : P.s600, cursor: isLast ? "not-allowed" : "pointer", padding: "2px 7px", fontSize: 11 }}>↓</button>
        <button onClick={onRemove} title="Eliminar" style={{ background: "transparent", border: "none", color: P.s400, cursor: "pointer", fontSize: 14 }}>×</button>
      </div>
      <textarea
        value={question.text}
        onChange={(e) => onChange({ ...question, text: e.target.value })}
        onClick={(e) => e.stopPropagation()}
        placeholder="Texto de la pregunta..."
        rows={2}
        style={{ ...inputStyle(), resize: "vertical", minHeight: 50 }}
      />
      {question.type === "likert" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          <input type="text" placeholder="Etiqueta del mínimo" value={question.scale?.minLabel || ""} onChange={(e) => onChange({ ...question, scale: { ...question.scale, minLabel: e.target.value } })} onClick={(e) => e.stopPropagation()} style={inputStyle()} />
          <input type="text" placeholder="Etiqueta del máximo" value={question.scale?.maxLabel || ""} onChange={(e) => onChange({ ...question, scale: { ...question.scale, maxLabel: e.target.value } })} onClick={(e) => e.stopPropagation()} style={inputStyle()} />
        </div>
      )}
      {question.type === "choice" && (
        <ChoiceOptionsEditor
          options={question.options || []}
          onChange={(next) => onChange({ ...question, options: next })}
        />
      )}
      {question.type === "nps" && (
        <div style={{ fontSize: 10.5, color: P.s500, fontStyle: "italic" }}>
          Escala 0-10. ¿Qué tan probable es que recomiende GAMO a un amigo o familiar?
        </div>
      )}
    </div>
  );
}

function ChoiceOptionsEditor({ options, onChange }) {
  const update = (idx, v) => onChange(options.map((o, i) => (i === idx ? v : o)));
  const remove = (idx) => onChange(options.filter((_, i) => i !== idx));
  const add = () => onChange([...options, `Opción ${options.length + 1}`]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {options.map((opt, idx) => (
        <div key={idx} style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: P.s400, fontWeight: 600, minWidth: 18 }}>{idx + 1}.</span>
          <input type="text" value={opt} onChange={(e) => update(idx, e.target.value)} onClick={(e) => e.stopPropagation()} style={inputStyle()} />
          <button onClick={() => remove(idx)} title="Eliminar opción" style={{ background: "transparent", border: "none", color: P.s400, cursor: "pointer", fontSize: 13 }}>×</button>
        </div>
      ))}
      <button onClick={add} style={{ alignSelf: "flex-start", padding: "4px 10px", fontSize: 10.5, fontWeight: 600, background: "#fff", color: "#92613a", border: `1px solid ${P.s200}`, borderRadius: 4, cursor: "pointer", marginTop: 2 }}>
        + Agregar opción
      </button>
    </div>
  );
}

function SurveyBuilderEditor({ value, onChange }) {
  const v = value || {};
  const questions = Array.isArray(v.questions) ? v.questions : [];
  const setField = (key, val) => onChange({ ...v, [key]: val });
  const updateQ = (idx, patch) => onChange({ ...v, questions: questions.map((q, i) => (i === idx ? patch : q)) });
  const removeQ = (idx) => onChange({ ...v, questions: questions.filter((_, i) => i !== idx) });
  const addQ = () => onChange({ ...v, questions: [...questions, newQuestion()] });
  const moveQ = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= questions.length) return;
    const copy = [...questions];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    onChange({ ...v, questions: copy });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ background: "#fff", border: `1px solid ${P.s200}`, borderRadius: 6, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: P.s500, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>Título de la encuesta</label>
          <input type="text" value={v.title || ""} onChange={(e) => setField("title", e.target.value)} onClick={(e) => e.stopPropagation()} placeholder="Ej: Encuesta de satisfacción del asegurado" style={inputStyle({ fontWeight: 600 })} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: P.s500, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>A quién va dirigida</label>
          <input type="text" value={v.audience || ""} onChange={(e) => setField("audience", e.target.value)} onClick={(e) => e.stopPropagation()} placeholder="Ej: Clientes que recibieron emisión de póliza en últimos 30 días" style={inputStyle()} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: P.s500, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>Introducción / propósito</label>
          <textarea value={v.intro || ""} onChange={(e) => setField("intro", e.target.value)} onClick={(e) => e.stopPropagation()} placeholder="Mensaje breve para el cliente..." rows={2} style={{ ...inputStyle(), resize: "vertical", minHeight: 50 }} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {questions.length === 0 && (
          <div style={{ padding: 16, textAlign: "center", color: P.s400, fontStyle: "italic", fontSize: 12 }}>
            Sin preguntas todavía. Recomendado: 5-7 preguntas máximo.
          </div>
        )}
        {questions.map((q, idx) => (
          <QuestionEditor
            key={q.id}
            question={q}
            onChange={(next) => updateQ(idx, next)}
            onRemove={() => removeQ(idx)}
            onMove={(dir) => moveQ(idx, dir)}
            isFirst={idx === 0}
            isLast={idx === questions.length - 1}
          />
        ))}
      </div>

      <button
        onClick={addQ}
        style={{ alignSelf: "flex-start", padding: "7px 14px", fontSize: 12, fontWeight: 600, background: "#92613a", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer" }}
      >
        + Agregar pregunta
      </button>
    </div>
  );
}

function SurveyBuilderPrinter({ value, accentColor }) {
  const v = value || {};
  const questions = Array.isArray(v.questions) ? v.questions : [];
  if (!v.title && questions.length === 0) return null;
  return (
    <div style={{ borderLeft: `3px solid ${accentColor}`, paddingLeft: 12, fontSize: "11.5px" }}>
      {v.title && <div style={{ fontSize: "13px", fontWeight: 700, color: P.s700, marginBottom: 4 }}>{v.title}</div>}
      {v.audience && <div style={{ fontSize: "11px", color: P.s500, fontStyle: "italic", marginBottom: 4 }}>Dirigida a: {v.audience}</div>}
      {v.intro && <div style={{ fontSize: "11px", color: P.s600, marginBottom: 8 }}>{v.intro}</div>}
      <ol style={{ margin: 0, padding: "0 0 0 18px" }}>
        {questions.map((q) => (
          <li key={q.id} style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 600, color: P.s700 }}>
              {q.text || "(pregunta sin texto)"}
              {q.required && <span style={{ color: "#c53b3b", marginLeft: 4 }}>*</span>}
            </div>
            <div style={{ fontSize: "10.5px", color: P.s500, fontStyle: "italic", marginTop: 2 }}>
              {TYPE_LABELS[q.type]}
              {q.type === "likert" && q.scale && ` — ${q.scale.minLabel} (${q.scale.min}) → ${q.scale.maxLabel} (${q.scale.max})`}
              {q.type === "choice" && q.options && ` — opciones: ${q.options.join(", ")}`}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export const SurveyBuilderField = {
  Editor: SurveyBuilderEditor,
  Printer: SurveyBuilderPrinter,
  defaultValue: { title: "", audience: "", intro: "", questions: [] },
};
