import { useState, useRef, useEffect, useMemo } from 'react';
import { IconSprite } from './components/Icons.jsx';
import SingleCard from './components/SingleCard.jsx';
import PartnerCard from './components/PartnerCard.jsx';
import ContextMenu from './components/ContextMenu.jsx';
import { initialNodes } from './data.js';

let nextId = 100;

function loadNodes() {
  try {
    const saved = localStorage.getItem('familytree-nodes');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length) {
        nextId = Math.max(...parsed.map(n => n.id)) + 1;
        return parsed;
      }
    }
  } catch {}
  return initialNodes;
}

function saveToServer(nodes) {
  fetch('/api/nodes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nodes),
  }).catch(() => {});
}

const CARD_W = 240;
const CARD_H = 220;

function resolveOverlaps(nodes, movedId) {
  const moved = nodes.find(n => n.id === movedId);
  if (!moved) return nodes;
  let result = [...nodes];
  for (let i = 0; i < result.length; i++) {
    const other = result[i];
    if (other.id === movedId) continue;
    if (Math.abs(moved.x - other.x) < CARD_W && Math.abs(moved.y - other.y) < CARD_H) {
      const dx = moved.x - other.x || 1;
      const dy = moved.y - other.y || 1;
      const overlapX = CARD_W - Math.abs(dx);
      const overlapY = CARD_H - Math.abs(dy);
      if (overlapX < overlapY) {
        result[i] = { ...other, x: other.x - Math.sign(dx) * overlapX };
      } else {
        result[i] = { ...other, y: other.y - Math.sign(dy) * overlapY };
      }
    }
  }
  return result;
}

function getDescendantIds(nodeId, nodes) {
  const ids = [];
  for (const n of nodes) {
    if (n.parentId === nodeId) {
      ids.push(n.id);
      ids.push(...getDescendantIds(n.id, nodes));
    }
  }
  return ids;
}

export default function App() {
  const [nodes, setNodes] = useState(loadNodes);
  const readyToSave = useRef(false);

  useEffect(() => {
    fetch('/api/nodes')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length) {
          nextId = Math.max(...data.map(n => n.id)) + 1;
          setNodes(data);
          try { localStorage.setItem('familytree-nodes', JSON.stringify(data)); } catch {}
        }
        readyToSave.current = true;
      })
      .catch(() => { readyToSave.current = true; });
  }, []);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [ctxMenu, setCtxMenu] = useState(null);
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [focusedNodeId, setFocusedNodeId] = useState(null);
  const [nearOverlapEdges, setNearOverlapEdges] = useState({});
  const dragRef = useRef(null);
  const panRef = useRef(null);

  useEffect(() => {
    if (!readyToSave.current) return;
    try { localStorage.setItem('familytree-nodes', JSON.stringify(nodes)); } catch {}
    saveToServer(nodes);
  }, [nodes]);

  const update = (id, fn) => setNodes(ns => ns.map(n => (n.id === id ? fn(n) : n)));

  const groups = useMemo(() => [...new Set(nodes.map(n => n.group).filter(Boolean))], [nodes]);

  const handleDragStart = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setNodes(ns => {
      const node = ns.find(n => n.id === id);
      if (!node) return ns;
      const descIds = getDescendantIds(id, ns);
      const allIds = [id, ...descIds];
      const positions = {};
      for (const n of ns) {
        if (allIds.includes(n.id)) positions[n.id] = { x: n.x, y: n.y };
      }
      dragRef.current = {
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        positions,
      };
      return ns;
    });
  };

  const handleCanvasMouseDown = (e) => {
    if (e.target.closest('.unit') || e.target.closest('.ctx-menu')) return;
    setFocusedNodeId(null);
    panRef.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startPanX: pan.x,
      startPanY: pan.y,
    };
    e.preventDefault();
  };

  const handleContextMenu = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ id, x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const onMove = (e) => {
      if (panRef.current) {
        const dx = e.clientX - panRef.current.startMouseX;
        const dy = e.clientY - panRef.current.startMouseY;
        setPan({
          x: panRef.current.startPanX + dx,
          y: panRef.current.startPanY + dy,
        });
        document.body.classList.add('panning');
        return;
      }
      if (dragRef.current) {
        const { startMouseX, startMouseY, positions } = dragRef.current;
        const dx = e.clientX - startMouseX;
        const dy = e.clientY - startMouseY;
        setNodes(ns => {
          const updated = ns.map(n =>
            positions[n.id]
              ? { ...n, x: positions[n.id].x + dx, y: positions[n.id].y + dy }
              : n
          );
          const draggedIds = Object.keys(positions).map(Number);
          const edges = {};
          const NEAR = 10;
          const addEdge = (id, side) => {
            if (!edges[id]) edges[id] = new Set();
            edges[id].add(side);
          };
          for (const did of draggedIds) {
            const d = updated.find(n => n.id === did);
            if (!d) continue;
            for (const o of updated) {
              if (draggedIds.includes(o.id)) continue;
              const dx = d.x - o.x;
              const dy = d.y - o.y;
              const gapX = Math.abs(dx) - CARD_W;
              const gapY = Math.abs(dy) - CARD_H;
              if (gapX < NEAR && gapY < 0) {
                if (dx > 0) { addEdge(did, 'left'); addEdge(o.id, 'right'); }
                else { addEdge(did, 'right'); addEdge(o.id, 'left'); }
              }
              if (gapY < NEAR && gapX < 0) {
                if (dy > 0) { addEdge(did, 'top'); addEdge(o.id, 'bottom'); }
                else { addEdge(did, 'bottom'); addEdge(o.id, 'top'); }
              }
            }
          }
          const edgeObj = {};
          for (const [id, sides] of Object.entries(edges)) {
            edgeObj[id] = [...sides];
          }
          setNearOverlapEdges(edgeObj);
          return updated;
        });
      }
    };
    const onUp = () => {
      if (dragRef.current) {
        const draggedIds = Object.keys(dragRef.current.positions).map(Number);
        setNodes(ns => {
          let result = ns;
          for (const id of draggedIds) {
            result = resolveOverlaps(result, id);
          }
          return result;
        });
      }
      dragRef.current = null;
      panRef.current = null;
      setNearOverlapEdges({});
      document.body.classList.remove('panning');
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const handlers = {
    onUpdatePerson: (id, idx, person) =>
      update(id, n => ({ ...n, people: n.people.map((p, i) => (i === idx ? person : p)) })),
    onUpdateGender: (id, gender) =>
      update(id, n => ({ ...n, gender })),
    onDelete: (id) =>
      setNodes(ns => {
        const toRemove = new Set([id, ...getDescendantIds(id, ns)]);
        return ns.filter(n => !toRemove.has(n.id));
      }),
    onAddChild: (parentId) =>
      setNodes(ns => {
        const parent = ns.find(n => n.id === parentId);
        if (!parent) return ns;
        const siblings = ns.filter(n => n.parentId === parentId);
        const count = siblings.length;
        const spacing = 260;
        let offsetX;
        if (count === 0) offsetX = 0;
        else if (count % 2 === 1) offsetX = Math.ceil(count / 2) * spacing;
        else offsetX = -(count / 2) * spacing;
        const newId = nextId++;
        const newNodes = [
          ...ns,
          {
            id: newId,
            type: 'single',
            gender: 'unknown',
            isRoot: false,
            parentId,
            collapsed: false,
            x: parent.x + offsetX,
            y: parent.y + 250,
            people: [{ name: 'Child', img: '' }],
            color: '',
            description: '',
            group: '',
          },
        ];
        return resolveOverlaps(newNodes, newId);
      }),
    onAddPartner: (id) =>
      update(id, n => ({
        ...n,
        type: 'partner',
        gender: 'unknown',
        collapsed: false,
        people: [...n.people, { name: 'Partner', img: '' }],
      })),
    onToggleBranch: (id) => update(id, n => ({ ...n, collapsed: !n.collapsed })),
    onDragStart: handleDragStart,
    onContextMenu: handleContextMenu,
    editingNodeId,
    onEditDone: () => setEditingNodeId(null),
    focusedNodeId,
    onFocusNode: (id) => setFocusedNodeId(prev => prev === id ? null : id),
  };

  const isHidden = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !node.parentId) return false;
    const parent = nodes.find(n => n.id === node.parentId);
    if (!parent) return false;
    if (parent.collapsed) return true;
    return isHidden(parent.id);
  };

  const visibleNodes = nodes.filter(n => !isHidden(n.id));

  const lines = [];
  for (const node of visibleNodes) {
    if (node.parentId) {
      const parent = nodes.find(n => n.id === node.parentId);
      if (parent) lines.push({ from: parent, to: node });
    }
  }

  const ctxNode = ctxMenu ? nodes.find(n => n.id === ctxMenu.id) : null;

  return (
    <>
      <IconSprite />
      <main
        className="canvas"
        style={{ backgroundPosition: `${pan.x}px ${pan.y}px` }}
        onMouseDown={handleCanvasMouseDown}
      >
        {focusedNodeId && <div className="focus-overlay" onMouseDown={() => setFocusedNodeId(null)} />}
        <div className="world" style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}>
          <svg className="connectors" width="1" height="1">
            {lines.map((line, i) => {
              const fromY = line.from.y;
              const toY = line.to.y;
              const midY = (fromY + toY) / 2;
              return (
                <path
                  key={i}
                  d={`M ${line.from.x} ${fromY} V ${midY} H ${line.to.x} V ${toY}`}
                  fill="none"
                  stroke="#c0c0c0"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />
              );
            })}
          </svg>
          {visibleNodes.map(node => {
            const childCount = nodes.filter(n => n.parentId === node.id).length;
            const isFocused = focusedNodeId === node.id;
            const isBlurred = focusedNodeId && !isFocused;
            const nearEdges = nearOverlapEdges[node.id] || null;
            const cardNode = { ...node, childCount, isFocused, isBlurred, nearEdges };
            const cardBg = node.color || undefined;
            const rootColor = node.isRoot && node.color ? node.color : undefined;
            const edgeShadows = [];
            if (nearEdges) {
              const c = '#e5d9a8';
              if (nearEdges.includes('left')) edgeShadows.push(`inset 3px 0 0 ${c}`);
              if (nearEdges.includes('right')) edgeShadows.push(`inset -3px 0 0 ${c}`);
              if (nearEdges.includes('top')) edgeShadows.push(`inset 0 3px 0 ${c}`);
              if (nearEdges.includes('bottom')) edgeShadows.push(`inset 0 -3px 0 ${c}`);
            }
            const style = {
              left: node.x,
              top: node.y,
              ...(cardBg && { background: cardBg }),
              ...(rootColor && {
                borderColor: rootColor,
                boxShadow: `0 0 0 4px ${rootColor}33, 0 4px 20px rgba(0,0,0,.08)`,
              }),
              ...(edgeShadows.length && !rootColor && {
                boxShadow: edgeShadows.join(', '),
              }),
              ...(edgeShadows.length && rootColor && {
                boxShadow: `0 0 0 4px ${rootColor}33, ${edgeShadows.join(', ')}`,
              }),
            };
            return node.type === 'partner' ? (
              <PartnerCard key={node.id} node={cardNode} style={style} {...handlers} />
            ) : (
              <SingleCard key={node.id} node={cardNode} style={style} {...handlers} />
            );
          })}
        </div>
      </main>
      {ctxNode && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          node={ctxNode}
          groups={groups}
          onClose={() => setCtxMenu(null)}
          onDelete={handlers.onDelete}
          onEdit={(id) => setEditingNodeId(id)}
          onSetColor={(id, color) => update(id, n => ({ ...n, color }))}
          onSetDescription={(id, description) => update(id, n => ({ ...n, description }))}
          onSetGroup={(id, group) => update(id, n => ({ ...n, group }))}
        />
      )}
    </>
  );
}
