import { Fragment } from 'react';
import Person from './Person.jsx';
import GenderBadge from './GenderBadge.jsx';
import { HeartIcon } from './Icons.jsx';

export default function PartnerCard({ node, style, onUpdatePerson, onUpdateGender, onDelete, onAddChild, onToggleBranch, onDragStart, onContextMenu, onFocusNode }) {
  const names = node.people.map((p) => p.name).join(' and ');
  const expanded = !node.collapsed;

  const classes = ['unit', 'partner-node'];
  if (node.isRoot) classes.push('root-node');
  if (node.isFocused) classes.push('focused');
  if (node.isBlurred) classes.push('blurred');

  return (
    <article
      className={classes.join(' ')}
      aria-label={`Family tree partner card for ${names}`}
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
      {node.genLabel && <span className="gen-badge" style={{ background: node.genColor, borderColor: node.genColor }}>{node.genLabel}</span>}
      <div className="people paired">
        {node.people.map((p, i) => (
          <Fragment key={i}>
            {i > 0 && <HeartIcon />}
            <Person
              nodeId={node.id}
              index={i}
              person={p}
              photoLabel={`${p.name} profile photo placeholder`}
              onChange={(np) => onUpdatePerson?.(node.id, i, np)}
              onGenderDetect={(g) => onUpdateGender?.(node.id, g)}
            />
          </Fragment>
        ))}
      </div>
      {node.isFocused && node.description && (() => {
        const d = typeof node.description === 'object' ? node.description : { en: node.description, ta: '' };
        return (d.en || d.ta) ? (
          <div className="card-desc-expanded">
            {d.en && <div>{d.en}</div>}
            {d.ta && <div className="card-desc-ta">{d.ta}</div>}
          </div>
        ) : null;
      })()}
      {node.isFocused && node.group && (
        <div className="card-details">
          {node.group && <span className="detail-tag">Group: {node.group}</span>}
        </div>
      )}
      <div className="actions">
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
