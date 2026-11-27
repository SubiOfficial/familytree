import { formatGen } from './GenerationDialog.jsx';

export default function TableView({ nodes, generations }) {
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
            const childCount = nodes.filter(c => c.parentId === n.id).length;
            return (
              <tr key={n.id} style={{ background: gen?.color ? gen.color + '25' : '' }}>
                <td><span className="tv-gen" style={{ background: gen?.color || '#eee' }}>{gen ? formatGen(gen.number, gen.format) : '-'}</span></td>
                <td className="tv-name">{n.people[0]?.name}</td>
                <td className="tv-partner">{n.people[1]?.name || '—'}</td>
                <td><span className={`tv-gender tv-${n.gender}`}>{n.gender === 'male' ? 'M' : n.gender === 'female' ? 'F' : '—'}</span></td>
                <td className="tv-center">{childCount || '—'}</td>
                <td className="tv-desc">{n.description || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
