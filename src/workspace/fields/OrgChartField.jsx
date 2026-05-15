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
 * The tree is laid out by a shared algorithm (computeLayout) that powers
 * both the editable on-screen canvas and the SVG print rendering. The print
 * renderer uses an SVG with viewBox so the chart auto-fits the page width
 * regardless of how many nodes/branches the user has.
 */

import { useMemo, useState, useCallback } from "react";

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

// Layout constants — used identically for screen and print.
const CARD_W = 150;
const CARD_H = 52;
const H_GAP = 16;
const V_GAP = 36;

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

/* ───────── Tree helpers ───────── */

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

/**
 * True if `candidateId` is the same as `ancestorId` or appears anywhere in
 * the subtree rooted at `ancestorId`. Used to reject drag-and-drop that
 * would create a cycle (dropping a node onto its own descendant).
 */
function isSelfOrDescendant(ancestorId, candidateId, nodes) {
  if (ancestorId === candidateId) return true;
  const childrenByParent = new Map();
  nodes.forEach((n) => {
    if (!n.parentId) return;
    const list = childrenByParent.get(n.parentId) || [];
    list.push(n.id);
    childrenByParent.set(n.parentId, list);
  });
  const stack = [ancestorId];
  while (stack.length) {
    const id = stack.pop();
    const children = childrenByParent.get(id) || [];
    for (const c of children) {
      if (c === candidateId) return true;
      stack.push(c);
    }
  }
  return false;
}

/**
 * Two-pass tree layout. Returns absolute (x, y) coordinates for every
 * node card plus the total width/height of the bounding box. The
 * algorithm centers each subtree under its parent and packs siblings
 * tightly with H_GAP horizontal spacing.
 */
function computeLayout(roots) {
  const positions = new Map();
  const links = [];
  if (roots.length === 0) return { positions, totalWidth: 0, totalHeight: 0, links, depth: 0 };

  // Pass 1: subtree widths (post-order).
  const widths = new Map();
  function widthOf(node) {
    if (widths.has(node.id)) return widths.get(node.id);
    let w;
    if (!node.children || node.children.length === 0) {
      w = CARD_W;
    } else {
      const childWs = node.children.map(widthOf);
      const sum = childWs.reduce((s, x) => s + x, 0) + (childWs.length - 1) * H_GAP;
      w = Math.max(CARD_W, sum);
    }
    widths.set(node.id, w);
    return w;
  }
  roots.forEach(widthOf);

  // Pass 2: positions (pre-order).
  let maxLevel = 0;
  function place(node, originX, level) {
    if (level > maxLevel) maxLevel = level;
    const w = widthOf(node);
    const cardX = originX + (w - CARD_W) / 2;
    const cardY = level * (CARD_H + V_GAP);
    positions.set(node.id, { x: cardX, y: cardY, width: CARD_W, height: CARD_H });

    if (node.children && node.children.length > 0) {
      let childX = originX;
      node.children.forEach((child) => {
        place(child, childX, level + 1);
        links.push({ fromId: node.id, toId: child.id });
        childX += widthOf(child) + H_GAP;
      });
    }
  }

  let cursor = 0;
  roots.forEach((root) => {
    place(root, cursor, 0);
    cursor += widthOf(root) + H_GAP;
  });

  const totalWidth = Math.max(cursor - H_GAP, CARD_W);
  const totalHeight = (maxLevel + 1) * CARD_H + maxLevel * V_GAP;

  return { positions, totalWidth, totalHeight, links, depth: maxLevel + 1 };
}

function truncate(s, max) {
  if (!s) return "";
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

/* ───────── SVG renderer (used by print + as the canvas spine) ───────── */

function buildSvgConnectorPath(parent, child) {
  const parentX = parent.x + CARD_W / 2;
  const parentY = parent.y + CARD_H;
  const childX = child.x + CARD_W / 2;
  const childY = child.y;
  const midY = parentY + (childY - parentY) / 2;
  return `M ${parentX} ${parentY} V ${midY} H ${childX} V ${childY}`;
}

function OrgChartSvg({ nodes, accentColor = "#5a7260" }) {
  const { positions, totalWidth, totalHeight, links } = useMemo(
    () => computeLayout(buildTree(nodes)),
    [nodes],
  );
  if (positions.size === 0) return null;

  // Pad the viewBox so card borders aren't clipped at edges.
  const PAD = 4;
  const vbW = totalWidth + PAD * 2;
  const vbH = totalHeight + PAD * 2;

  return (
    <svg
      viewBox={`${-PAD} ${-PAD} ${vbW} ${vbH}`}
      width="100%"
      preserveAspectRatio="xMidYMin meet"
      style={{ display: "block", maxWidth: "100%", height: "auto" }}
    >
      {links.map((link, i) => {
        const parent = positions.get(link.fromId);
        const child = positions.get(link.toId);
        if (!parent || !child) return null;
        return (
          <path
            key={i}
            d={buildSvgConnectorPath(parent, child)}
            fill="none"
            stroke={P.s400}
            strokeWidth={1}
          />
        );
      })}
      {nodes.map((node) => {
        const pos = positions.get(node.id);
        if (!pos) return null;
        const fill = node.isVacant ? "#fff7e6" : "#fff";
        const stroke = node.isVacant ? "#f0d9a8" : P.s300;
        return (
          <g key={node.id}>
            <rect
              x={pos.x}
              y={pos.y}
              width={CARD_W}
              height={CARD_H}
              rx={5}
              fill={fill}
              stroke={stroke}
              strokeWidth={1}
            />
            <line
              x1={pos.x}
              y1={pos.y + 4}
              x2={pos.x + 3}
              y2={pos.y + 4}
              stroke={accentColor}
              strokeWidth={3}
            />
            <text
              x={pos.x + CARD_W / 2}
              y={pos.y + 18}
              textAnchor="middle"
              fontSize={10.5}
              fontWeight={700}
              fill={P.s700}
              fontFamily="-apple-system, system-ui, sans-serif"
            >
              {truncate(node.role || "—", 24)}
            </text>
            {node.name && (
              <text
                x={pos.x + CARD_W / 2}
                y={pos.y + 32}
                textAnchor="middle"
                fontSize={9}
                fill={P.s500}
                fontFamily="-apple-system, system-ui, sans-serif"
              >
                {truncate(node.name, 26)}
              </text>
            )}
            {node.isVacant && (
              <text
                x={pos.x + CARD_W / 2}
                y={pos.y + 45}
                textAnchor="middle"
                fontSize={7.5}
                fontWeight={700}
                fill="#92613a"
                fontFamily="-apple-system, system-ui, sans-serif"
                letterSpacing="0.5"
              >
                VACANTE
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ───────── On-screen canvas: SVG connectors + draggable HTML cards ───────── */

function ScreenCard({ node, position, isDragSource, dropState, dragHandlers }) {
  const highlight =
    dropState === "valid" ? "#5a7260" :
    dropState === "invalid" ? "#c53b3b" :
    null;
  return (
    <div
      draggable
      onDragStart={(e) => dragHandlers.onDragStart(e, node.id)}
      onDragEnd={dragHandlers.onDragEnd}
      onDragOver={(e) => dragHandlers.onDragOver(e, node.id)}
      onDragLeave={() => dragHandlers.onDragLeave(node.id)}
      onDrop={(e) => dragHandlers.onDrop(e, node.id)}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: CARD_W,
        height: CARD_H,
        background: node.isVacant ? "#fff7e6" : "#fff",
        border: `1px solid ${node.isVacant ? "#f0d9a8" : P.s300}`,
        borderLeft: `3px solid ${node.isVacant ? "#d4a860" : P.s400}`,
        borderRadius: 5,
        padding: "5px 9px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        textAlign: "center",
        cursor: "grab",
        opacity: isDragSource ? 0.35 : 1,
        boxShadow: highlight ? `0 0 0 2px ${highlight}` : "0 1px 2px rgba(0,0,0,.04)",
        transition: "box-shadow .12s, opacity .12s",
        userSelect: "none",
      }}
    >
      <div style={{ fontSize: 11.5, fontWeight: 700, color: P.s700, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {node.role || "—"}
      </div>
      {node.name && (
        <div style={{ fontSize: 10, color: P.s500, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {node.name}
        </div>
      )}
      {node.isVacant && (
        <div style={{ fontSize: 8.5, color: "#92613a", fontWeight: 700, letterSpacing: ".05em", marginTop: 1 }}>VACANTE</div>
      )}
    </div>
  );
}

function ConnectorLayer({ links, positions, totalWidth, totalHeight }) {
  if (links.length === 0) return null;
  return (
    <svg
      width={totalWidth}
      height={totalHeight}
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
    >
      {links.map((link, i) => {
        const parent = positions.get(link.fromId);
        const child = positions.get(link.toId);
        if (!parent || !child) return null;
        return (
          <path
            key={i}
            d={buildSvgConnectorPath(parent, child)}
            fill="none"
            stroke={P.s400}
            strokeWidth={1}
          />
        );
      })}
    </svg>
  );
}

function RootDropZone({ totalWidth, dropState, onDragOver, onDragLeave, onDrop }) {
  const highlight =
    dropState === "valid" ? "#5a7260" :
    dropState === "invalid" ? "#c53b3b" :
    null;
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        width: Math.max(totalWidth, 320),
        marginBottom: 12,
        padding: "8px 12px",
        border: `1.5px dashed ${highlight || P.s300}`,
        background: highlight ? `${highlight}10` : "transparent",
        borderRadius: 5,
        textAlign: "center",
        fontSize: 10.5,
        fontWeight: 600,
        color: highlight || P.s400,
        textTransform: "uppercase",
        letterSpacing: ".05em",
        transition: "all .12s",
      }}
    >
      Soltar aquí para hacer raíz (sin jefe)
    </div>
  );
}

function OrgChartCanvas({ nodes, onSetParent }) {
  const layout = useMemo(() => computeLayout(buildTree(nodes)), [nodes]);
  const [draggingId, setDraggingId] = useState(null);
  const [overTarget, setOverTarget] = useState(null); // null | "root" | nodeId

  const isInvalidDrop = useCallback((targetId) => {
    if (!draggingId) return false;
    return isSelfOrDescendant(draggingId, targetId, nodes);
  }, [draggingId, nodes]);

  const handleDragStart = (e, id) => {
    setDraggingId(id);
    try {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", id);
    } catch { /* some browsers throw on dataTransfer in HTML5 dnd */ }
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setOverTarget(null);
  };

  const handleNodeDragOver = (e, targetId) => {
    if (!draggingId) return;
    e.preventDefault();
    const invalid = isInvalidDrop(targetId);
    e.dataTransfer.dropEffect = invalid ? "none" : "move";
    setOverTarget(targetId);
  };

  const handleNodeDragLeave = (targetId) => {
    if (overTarget === targetId) setOverTarget(null);
  };

  const handleNodeDrop = (e, targetId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggingId) return;
    if (!isInvalidDrop(targetId)) {
      onSetParent(draggingId, targetId);
    }
    setDraggingId(null);
    setOverTarget(null);
  };

  const handleRootDragOver = (e) => {
    if (!draggingId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverTarget("root");
  };

  const handleRootDragLeave = () => {
    if (overTarget === "root") setOverTarget(null);
  };

  const handleRootDrop = (e) => {
    e.preventDefault();
    if (!draggingId) return;
    onSetParent(draggingId, null);
    setDraggingId(null);
    setOverTarget(null);
  };

  const dragHandlers = {
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    onDragOver: handleNodeDragOver,
    onDragLeave: handleNodeDragLeave,
    onDrop: handleNodeDrop,
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "inline-block", padding: "4px 6px 12px 6px", minWidth: "100%" }}>
        <RootDropZone
          totalWidth={layout.totalWidth}
          dropState={overTarget === "root" ? "valid" : null}
          onDragOver={handleRootDragOver}
          onDragLeave={handleRootDragLeave}
          onDrop={handleRootDrop}
        />
        <div style={{
          position: "relative",
          width: layout.totalWidth,
          height: layout.totalHeight,
          margin: "0 auto",
        }}>
          <ConnectorLayer
            links={layout.links}
            positions={layout.positions}
            totalWidth={layout.totalWidth}
            totalHeight={layout.totalHeight}
          />
          {nodes.map((node) => {
            const pos = layout.positions.get(node.id);
            if (!pos) return null;
            const dropState =
              overTarget === node.id
                ? (isInvalidDrop(node.id) ? "invalid" : "valid")
                : null;
            return (
              <ScreenCard
                key={node.id}
                node={node}
                position={pos}
                isDragSource={draggingId === node.id}
                dropState={dropState}
                dragHandlers={dragHandlers}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ───────── Editable list (unchanged data shape, kept as the secondary editor) ───────── */

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

/* ───────── Editor + Printer ───────── */

function OrgChartEditor({ value, onChange }) {
  const nodes = Array.isArray(value?.nodes) ? value.nodes : [];
  const setNodes = (next) => onChange({ ...(value || {}), nodes: next });
  const setParent = (childId, newParentId) => {
    setNodes(nodes.map((n) => (n.id === childId ? { ...n, parentId: newParentId } : n)));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ background: "#fff", border: `1px solid ${P.s200}`, borderRadius: 6, padding: 12 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.s500, textTransform: "uppercase", letterSpacing: ".04em" }}>
            Vista preliminar — arrastra cajas para reorganizar
          </div>
          {nodes.length > 0 && (
            <div style={{ fontSize: 10, color: P.s400, fontStyle: "italic" }}>
              {nodes.length} puesto{nodes.length === 1 ? "" : "s"}
            </div>
          )}
        </div>
        {nodes.length === 0 ? (
          <div style={{ padding: 18, textAlign: "center", color: P.s400, fontStyle: "italic", fontSize: 12 }}>
            La estructura aparecerá aquí conforme agregues puestos en la lista de abajo.
          </div>
        ) : (
          <div
            style={{
              border: `1px solid ${P.borderL}`,
              borderRadius: 4,
              background: "#fafaf9",
              padding: "8px 0",
            }}
          >
            <OrgChartCanvas nodes={nodes} onSetParent={setParent} />
          </div>
        )}
      </div>
      <NodeListEditor nodes={nodes} onChange={setNodes} />
    </div>
  );
}

function OrgChartPrinter({ value, accentColor }) {
  const nodes = Array.isArray(value?.nodes) ? value.nodes : [];
  if (nodes.length === 0) return null;
  return (
    <div style={{ borderLeft: `3px solid ${accentColor}`, paddingLeft: 12 }}>
      <OrgChartSvg nodes={nodes} accentColor={accentColor} />
    </div>
  );
}

export const OrgChartField = {
  Editor: OrgChartEditor,
  Printer: OrgChartPrinter,
  defaultValue: { nodes: [] },
};
