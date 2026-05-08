/**
 * OrgChartField — hierarchical organization chart.
 *
 * Value:
 *   {
 *     nodes: [{
 *       id, role, name?, parentId?,
 *       isVacant?, reportsExternally? (e.g., to SMNYL)
 *     }]
 *   }
 *
 * Visual: top-down tree rendered with HTML/CSS (no external diagram lib).
 */

const P = {
  border: "#e8e6e1",
  borderL: "#f0eeea",
  s100: "#f5f5f4",
  s200: "#e7e5e4",
  s300: "#d6d3d1",
  s400: "#a8a29e",
  s500: "#78716c",
  s600: "#57534e",
  s700: "#44403c",
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

function buildTree(nodes) {
  const byId = new Map(nodes.map((n) => [n.id, { ...n, children: [] }]));
  const roots = [];
  byId.forEach((n) => {
    if (n.parentId && byId.has(n.parentId)) {
      byId.get(n.parentId).children.push(n);
    } else {
      roots.push(n);
    }
  });
  return roots;
}

function NodeCard({ node, isPrint }) {
  return (
    <div
      style={{
        background: node.isVacant ? "#fff7e6" : "#fff",
        border: `1px solid ${node.isVacant ? "#f0d9a8" : P.s300}`,
        borderRadius: 6,
        padding: isPrint ? "5px 8px" : "8px 11px",
        textAlign: "center",
        minWidth: 130,
        display: "inline-block",
      }}
    >
      <div style={{ fontSize: isPrint ? "10.5px" : 11.5, fontWeight: 700, color: P.s700, lineHeight: 1.3 }}>
        {node.role || "—"}
      </div>
      {node.name && (
        <div style={{ fontSize: isPrint ? "10px" : 10.5, color: P.s500, marginTop: 2 }}>{node.name}</div>
      )}
      {node.isVacant && (
        <div style={{ fontSize: 9, color: "#92613a", fontWeight: 600, textTransform: "uppercase", marginTop: 2 }}>Vacante</div>
      )}
      {node.reportsExternally && (
        <div style={{ fontSize: 9, color: P.s500, marginTop: 2, fontStyle: "italic" }}>↑ {node.reportsExternally}</div>
      )}
    </div>
  );
}

function TreeBranch({ node, level, isPrint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <NodeCard node={node} isPrint={isPrint} />
      {node.children && node.children.length > 0 && (
        <>
          <div style={{ width: 1, height: 14, background: P.s300 }} />
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start", borderTop: node.children.length > 1 ? `1px solid ${P.s300}` : "none", paddingTop: 14 }}>
            {node.children.map((child) => (
              <TreeBranch key={child.id} node={child} level={level + 1} isPrint={isPrint} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TreeView({ nodes, isPrint }) {
  const roots = buildTree(nodes);
  if (roots.length === 0) return null;
  // width:max-content + margin:0 auto centers the tree when it fits the
  // scrollable parent and aligns it to the start when it overflows — fixing
  // the case where justify-content:center hid the leftmost branches behind
  // the unscrollable origin.
  return (
    <div style={{
      display: "flex",
      gap: 18,
      padding: isPrint ? "8px 0" : "16px 0",
      width: isPrint ? "100%" : "max-content",
      margin: isPrint ? 0 : "0 auto",
      flexWrap: isPrint ? "wrap" : "nowrap",
      justifyContent: isPrint ? "center" : "flex-start",
    }}>
      {roots.map((root) => <TreeBranch key={root.id} node={root} level={0} isPrint={isPrint} />)}
    </div>
  );
}

function NodeListEditor({ nodes, onChange }) {
  const update = (id, patch) => onChange(nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  const remove = (id) => {
    const filtered = nodes.filter((n) => n.id !== id);
    const orphansAdjusted = filtered.map((n) => (n.parentId === id ? { ...n, parentId: null } : n));
    onChange(orphansAdjusted);
  };
  const add = () => {
    const id = `n${Date.now()}`;
    onChange([...nodes, { id, role: "", name: "", parentId: null, isVacant: false, reportsExternally: "" }]);
  };

  return (
    <div style={{ background: "#fff", border: `1px solid ${P.s200}`, borderRadius: 6, overflow: "hidden" }}>
      <div style={{ padding: "8px 12px", background: P.s100, borderBottom: `1px solid ${P.s200}`, fontSize: 11, fontWeight: 700, color: P.s500, textTransform: "uppercase", letterSpacing: ".04em" }}>
        Nodos del organigrama
      </div>
      {nodes.length === 0 && (
        <div style={{ padding: 14, textAlign: "center", color: P.s400, fontStyle: "italic", fontSize: 12 }}>
          Sin nodos. Agrega el primer puesto abajo.
        </div>
      )}
      {nodes.map((node) => {
        const possibleParents = nodes.filter((n) => n.id !== node.id);
        return (
          <div key={node.id} style={{ borderBottom: `1px solid ${P.borderL}`, padding: "10px 12px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 110px 30px", gap: 6, alignItems: "center" }}>
            <input type="text" placeholder="Puesto / rol" value={node.role || ""} onChange={(e) => update(node.id, { role: e.target.value })} onClick={(e) => e.stopPropagation()} style={inputStyle({ fontWeight: 600 })} />
            <input type="text" placeholder="Nombre (opcional)" value={node.name || ""} onChange={(e) => update(node.id, { name: e.target.value })} onClick={(e) => e.stopPropagation()} style={inputStyle()} />
            <select value={node.parentId || ""} onChange={(e) => update(node.id, { parentId: e.target.value || null })} onClick={(e) => e.stopPropagation()} style={inputStyle({ cursor: "pointer" })}>
              <option value="">— Sin jefe (raíz) —</option>
              {possibleParents.map((p) => (
                <option key={p.id} value={p.id}>{p.role || "(sin nombre)"}</option>
              ))}
            </select>
            <label style={{ fontSize: 11, color: P.s500, display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
              <input type="checkbox" checked={!!node.isVacant} onChange={(e) => update(node.id, { isVacant: e.target.checked })} onClick={(e) => e.stopPropagation()} />
              Vacante
            </label>
            <button onClick={() => remove(node.id)} title="Eliminar" style={{ background: "transparent", border: "none", color: P.s400, cursor: "pointer", fontSize: 14 }}>×</button>
          </div>
        );
      })}
      <div style={{ padding: "8px 12px", borderTop: `1px solid ${P.s200}`, background: P.s100 }}>
        <button onClick={add} style={{ padding: "5px 11px", fontSize: 11.5, fontWeight: 600, background: "#fff", color: "#92613a", border: `1px solid ${P.s200}`, borderRadius: 5, cursor: "pointer" }}>
          + Agregar puesto
        </button>
      </div>
    </div>
  );
}

function OrgChartEditor({ value, onChange }) {
  const nodes = Array.isArray(value?.nodes) ? value.nodes : [];
  const setNodes = (next) => onChange({ ...(value || {}), nodes: next });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ background: "#fff", border: `1px solid ${P.s200}`, borderRadius: 6, padding: 12 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.s500, textTransform: "uppercase", letterSpacing: ".04em" }}>
            Vista preliminar
          </div>
          {nodes.length > 0 && (
            <div style={{ fontSize: 10, color: P.s400, fontStyle: "italic" }}>
              Desplázate horizontalmente si el organigrama es muy ancho ↔
            </div>
          )}
        </div>
        {nodes.length === 0 ? (
          <div style={{ padding: 18, textAlign: "center", color: P.s400, fontStyle: "italic", fontSize: 12 }}>
            La estructura aparecerá aquí conforme agregues puestos.
          </div>
        ) : (
          <div
            style={{
              overflowX: "auto",
              border: `1px solid ${P.borderL || "#f0eeea"}`,
              borderRadius: 4,
              background: "#fafaf9",
            }}
          >
            <TreeView nodes={nodes} isPrint={false} />
          </div>
        )}
        <div style={{ marginTop: 6, fontSize: 10.5, color: P.s500 }}>
          {nodes.length > 0 && <span>{nodes.length} puesto{nodes.length === 1 ? "" : "s"} en el organigrama. Todos aparecen en la lista editable abajo. ↓</span>}
        </div>
      </div>
      <NodeListEditor nodes={nodes} onChange={setNodes} />
    </div>
  );
}

function maxBranchWidth(roots) {
  let max = 0;
  function visit(node) {
    if (!node.children || node.children.length === 0) return;
    if (node.children.length > max) max = node.children.length;
    node.children.forEach(visit);
  }
  roots.forEach(visit);
  return max;
}

function IndentedListView({ nodes }) {
  const roots = buildTree(nodes);
  function renderNode(node, level) {
    return (
      <div key={node.id} style={{ marginLeft: level * 14, marginBottom: 3 }}>
        <div style={{
          display: "inline-block",
          background: node.isVacant ? "#fff7e6" : "#fff",
          border: `1px solid ${node.isVacant ? "#f0d9a8" : "#d6d3d1"}`,
          borderRadius: 4,
          padding: "3px 8px",
          fontSize: "10pt",
        }}>
          <span style={{ fontWeight: 700, color: "#44403c" }}>{node.role || "—"}</span>
          {node.name && <span style={{ color: "#78716c", marginLeft: 6 }}>· {node.name}</span>}
          {node.isVacant && <span style={{ fontSize: "8pt", fontWeight: 700, color: "#92613a", marginLeft: 6 }}>VACANTE</span>}
        </div>
        {node.children && node.children.map((c) => renderNode(c, level + 1))}
      </div>
    );
  }
  return <div>{roots.map((r) => renderNode(r, 0))}</div>;
}

function OrgChartPrinter({ value, accentColor }) {
  const nodes = Array.isArray(value?.nodes) ? value.nodes : [];
  if (nodes.length === 0) return null;
  const roots = buildTree(nodes);
  const widest = maxBranchWidth(roots);
  // For wide trees (>4 siblings at any level) the centered horizontal layout
  // overflows A4 even after CSS scaling — fall back to an indented list.
  const useIndented = widest > 4 || nodes.length > 12;
  return (
    <div style={{ borderLeft: `3px solid ${accentColor}`, paddingLeft: 12 }}>
      {useIndented ? <IndentedListView nodes={nodes} /> : <TreeView nodes={nodes} isPrint={true} />}
    </div>
  );
}

export const OrgChartField = {
  Editor: OrgChartEditor,
  Printer: OrgChartPrinter,
  defaultValue: { nodes: [] },
};
