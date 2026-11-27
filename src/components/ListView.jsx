import { formatGen } from './GenerationDialog.jsx';

function TreeNode({ node, nodes, generations, depth }) {
  const children = nodes.filter(n => n.parentId === node.id);
  const gen = node.generationId ? generations.find(g => g.id === node.generationId) : null;
  const names = node.people.map(p => p.name).join(' & ');

  return (
    <div className="lv-node" style={{ marginLeft: depth * 24 }}>
      <div className="lv-row">
        <span className="lv-line">{depth > 0 ? '├─' : ''}</span>
        <span className="lv-name">{names}</span>
        {node.gender !== 'unknown' && <span className={`lv-gender lv-${node.gender}`}>{node.gender === 'male' ? 'M' : 'F'}</span>}
        {gen && <span className="lv-gen" style={{ background: gen.color, borderColor: gen.color }}>Gen {formatGen(gen.number, gen.format)}</span>}
        {node.description && <span className="lv-desc">{node.description}</span>}
      </div>
      {children.map(c => (
        <TreeNode key={c.id} node={c} nodes={nodes} generations={generations} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function ListView({ nodes, generations }) {
  const roots = nodes.filter(n => !n.parentId);
  return (
    <div className="list-view">
      <div className="lv-container">
        {roots.map(r => (
          <TreeNode key={r.id} node={r} nodes={nodes} generations={generations} depth={0} />
        ))}
      </div>
    </div>
  );
}
