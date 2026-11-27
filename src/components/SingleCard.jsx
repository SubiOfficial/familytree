import { useEffect, useRef } from 'react';
import Person from './Person.jsx';
import GenderBadge from './GenderBadge.jsx';

export default function SingleCard({ node, style, onUpdatePerson, onUpdateGender, onDelete, onAddPartner, onAddChild, onToggleBranch, onDragStart, onContextMenu, editingNodeId, onEditDone, focusedNodeId, onFocusNode }) {
  const person = node.people[0];
  const expanded = !node.collapsed;
  const nameRef = useRef(null);

  useEffect(() => {
    if (editingNodeId === node.id && nameRef.current) {
      const el = nameRef.current.querySelector('.nm');
      if (el) {
        el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
        onEditDone?.();
      }
    }
  }, [editingNodeId, node.id, onEditDone]);

  const classes = ['unit', 'single-node'];
  if (node.isRoot) classes.push('root-node');
  if (node.isFocused) classes.push('focused');
  if (node.isBlurred) classes.push('blurred');

  return (
    <article
      className={classes.join(' ')}
      aria-label={`Family tree card for ${person.name}`}
      data-id={node.id}
      style={style}
      onContextMenu={(e) => onContextMenu?.(node.id, e)}
      onClick={(e) => { if (!e.target.closest('button') && !e.target.closest('.drag-handle') && !e.target.closest('.nm')) onFocusNode?.(node.id); }}
    >
      <GenderBadge gender={node.gender} />
      <div className="card-topbar">
        <div className="drag-handle" onMouseDown={(e) => onDragStart?.(node.id, e)}>
          <span className="dot" /><span className="dot" />
          <span className="dot" /><span className="dot" />
          <span className="dot" /><span className="dot" />
        </div>
        <button type="button" className="del" aria-label="Delete card" onClick={() => onDelete?.(node.id)}>&times;</button>
      </div>
      {node.isRoot && <span className="root-badge">Root node</span>}
      {node.group && <span className="group-badge">{node.group}</span>}
      <div className="people" ref={nameRef}>
        <Person
          nodeId={node.id}
          index={0}
          person={person}
          photoLabel="Profile photo placeholder"
          onChange={(p) => onUpdatePerson?.(node.id, 0, p)}
          onGenderDetect={(g) => onUpdateGender?.(node.id, g)}
        />
      </div>
      {node.isFocused && node.description && (
        <div className="card-desc-expanded">{node.description}</div>
      )}
      {node.isFocused && node.group && (
        <div className="card-details">
          {node.group && <span className="detail-tag">Group: {node.group}</span>}
        </div>
      )}
      <div className="actions">
        <button type="button" className="mini" onClick={() => onAddPartner?.(node.id)}>+ Partner</button>
        <button type="button" className="mini" onClick={() => onAddChild?.(node.id)}>+ Child ({node.childCount})</button>
        {node.childCount > 0 && (
          <button type="button" className="mini branch-toggle" aria-expanded={expanded} onClick={() => onToggleBranch?.(node.id)}>
            {expanded ? 'Collapse' : 'Expand'} ({node.childCount})
          </button>
        )}
      </div>
    </article>
  );
}
