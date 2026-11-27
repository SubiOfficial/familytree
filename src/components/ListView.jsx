import { formatGen } from './GenerationDialog.jsx';

function TreeNode({ node, nodes, generations, depth, isLast }) {
  const children = nodes.filter(n => n.parentId === node.id);
  const gen = node.generationId ? generations.find(g => g.id === node.generationId) : null;
  const names = node.people[0]?.name || '';
  const partner = node.people[1]?.name;

  return (
    <li className="lv-item">
      <div className="lv-card" style={{ borderLeftColor: gen?.color || 'var(--border)' }}>
        <div className="lv-main">
          <div className="lv-avatar">{node.people[0]?.img ? <img src={node.people[0].img} alt="" /> : <span className="lv-avatar-icon">👤</span>}</div>
          <div className="lv-content">
            <div className="lv-name-row">
              <span className="lv-name">{names}</span>
              {partner && <span className="lv-partner">♥ {partner}</span>}
            </div>
            <div className="lv-meta">
              {node.gender !== 'unknown' && <span className={`lv-tag lv-${node.gender}`}>{node.gender === 'male' ? '♂ Male' : '♀ Female'}</span>}
              {gen && <span className="lv-tag lv-gen-tag" style={{ background: gen.color, borderColor: gen.color }}>Gen {formatGen(gen.number, gen.format)}</span>}
              {children.length > 0 && <span className="lv-tag lv-children-tag">{children.length} children</span>}
            </div>
            {node.description && <div className="lv-desc">{node.description}</div>}
          </div>
        </div>
      </div>
      {children.length > 0 && (
        <ul className="lv-children">
          {children.map((c, i) => (
            <TreeNode key={c.id} node={c} nodes={nodes} generations={generations} depth={depth + 1} isLast={i === children.length - 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function ListView({ nodes, generations }) {
  const roots = nodes.filter(n => !n.parentId);
  return (
    <div className="list-view">
      <ul className="lv-tree">
        {roots.map((r, i) => (
          <TreeNode key={r.id} node={r} nodes={nodes} generations={generations} depth={0} isLast={i === roots.length - 1} />
        ))}
      </ul>
    </div>
  );
}
