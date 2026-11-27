import { useState } from 'react';
import { formatGen } from './GenerationDialog.jsx';

export default function TableView({ nodes, generations }) {
  const [expandedId, setExpandedId] = useState(null);

  const sorted = [...nodes].sort((a, b) => {
    const ga = a.generationId || 0;
    const gb = b.generationId || 0;
    if (ga !== gb) return ga - gb;
    return a.id - b.id;
  });

  return (
    <div className="table-view">
      <table className="tv-table">
        <thead>
          <tr>
            <th>Gen</th>
            <th>Name</th>
            <th>Partner</th>
            <th>Gender</th>
            <th>Children</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(n => {
            const gen = n.generationId ? generations.find(g => g.id === n.generationId) : null;
            const children = nodes.filter(c => c.parentId === n.id);
            const parent = n.parentId ? nodes.find(p => p.id === n.parentId) : null;
            const isOpen = expandedId === n.id;
            return (
              <>
                <tr key={n.id} className={isOpen ? 'tv-row-active' : ''} style={{ background: gen?.color ? gen.color + '25' : '' }}>
                  <td><span className="tv-gen" style={{ background: gen?.color || '#eee' }}>{gen ? formatGen(gen.number, gen.format) : '-'}</span></td>
                  <td className="tv-name tv-clickable" onClick={() => setExpandedId(isOpen ? null : n.id)}>{n.people[0]?.name}</td>
                  <td className="tv-partner">{n.people[1]?.name || '—'}</td>
                  <td><span className={`tv-gender tv-${n.gender}`}>{n.gender === 'male' ? 'M' : n.gender === 'female' ? 'F' : '—'}</span></td>
                  <td className="tv-center">{children.length || '—'}</td>
                  <td className="tv-desc">{n.description || '—'}</td>
                </tr>
                {isOpen && (
                  <tr key={`${n.id}-detail`} className="tv-detail-row" style={{ background: gen?.color ? gen.color + '15' : '#fafafa' }}>
                    <td colSpan={6}>
                      <div className="tv-detail">
                        <div className="tv-detail-header">
                          <div className="tv-detail-avatar">{n.people[0]?.img ? <img src={n.people[0].img} alt="" /> : '👤'}</div>
                          <div>
                            <div className="tv-detail-name">{n.people[0]?.name}</div>
                            {n.people[1] && <div className="tv-detail-partner">♥ {n.people[1].name}</div>}
                          </div>
                          {gen && <span className="tv-detail-gen" style={{ background: gen.color }}>Generation {formatGen(gen.number, gen.format)}</span>}
                        </div>
                        <div className="tv-detail-grid">
                          <div className="tv-detail-item">
                            <span className="tv-detail-label">Gender</span>
                            <span className={`tv-detail-value tv-${n.gender}`}>{n.gender === 'male' ? '♂ Male' : n.gender === 'female' ? '♀ Female' : 'Not set'}</span>
                          </div>
                          <div className="tv-detail-item">
                            <span className="tv-detail-label">Parent</span>
                            <span className="tv-detail-value">{parent ? parent.people[0]?.name : '— (Root)'}</span>
                          </div>
                          <div className="tv-detail-item">
                            <span className="tv-detail-label">Type</span>
                            <span className="tv-detail-value">{n.type === 'partner' ? 'Partner card' : 'Single'}{n.isRoot ? ' (Root)' : ''}</span>
                          </div>
                          <div className="tv-detail-item">
                            <span className="tv-detail-label">Group</span>
                            <span className="tv-detail-value">{n.group || '—'}</span>
                          </div>
                        </div>
                        {n.description && (
                          <div className="tv-detail-desc">
                            <span className="tv-detail-label">Description</span>
                            <p>{n.description}</p>
                          </div>
                        )}
                        {children.length > 0 && (
                          <div className="tv-detail-children">
                            <span className="tv-detail-label">Children ({children.length})</span>
                            <div className="tv-detail-child-list">
                              {children.map(c => (
                                <span key={c.id} className="tv-detail-child-tag" onClick={() => setExpandedId(c.id)}>
                                  {c.people[0]?.name}{c.people[1] ? ` & ${c.people[1].name}` : ''}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
