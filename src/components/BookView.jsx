import { formatGen } from './GenerationDialog.jsx';

export default function BookView({ nodes, generations }) {
  const genGroups = {};
  nodes.forEach(n => {
    const gid = n.generationId || 0;
    if (!genGroups[gid]) genGroups[gid] = [];
    genGroups[gid].push(n);
  });

  const sortedGens = Object.keys(genGroups).sort((a, b) => a - b);

  return (
    <div className="book-view">
      {sortedGens.map((gid, idx) => {
        const gen = generations.find(g => g.id === Number(gid));
        const members = genGroups[gid];
        const isEven = idx % 2 === 0;
        return (
          <section key={gid} className={`bv-section ${isEven ? 'bv-left' : 'bv-right'}`}>
            <div className="bv-page" style={{ '--gen-color': gen?.color || '#ddd' }}>
              <div className="bv-page-header">
                <div className="bv-gen-num" style={{ background: gen?.color || '#eee' }}>
                  {gen ? formatGen(gen.number, gen.format) : '?'}
                </div>
                <div>
                  <h2 className="bv-gen-title">{gen ? `Generation ${formatGen(gen.number, gen.format)}` : 'Unassigned'}</h2>
                  <p className="bv-gen-count">{members.length} {members.length === 1 ? 'member' : 'members'}</p>
                </div>
              </div>
              <div className="bv-divider" style={{ background: gen?.color || '#eee' }} />
              <div className="bv-members">
                {members.map(n => {
                  const name = n.people[0]?.name;
                  const partner = n.people[1]?.name;
                  const parent = n.parentId ? nodes.find(p => p.id === n.parentId) : null;
                  const parentName = parent?.people[0]?.name;
                  return (
                    <div key={n.id} className="bv-member" style={{ borderLeftColor: gen?.color || '#ddd' }}>
                      <div className="bv-member-header">
                        <div className="bv-photo">{n.people[0]?.img ? <img src={n.people[0].img} alt="" /> : <span>👤</span>}</div>
                        <div className="bv-info">
                          <div className="bv-name">{name}</div>
                          {partner && <div className="bv-partner">♥ {partner}</div>}
                        </div>
                        {n.gender !== 'unknown' && (
                          <span className={`bv-gender bv-${n.gender}`}>{n.gender === 'male' ? '♂' : '♀'}</span>
                        )}
                      </div>
                      {parentName && <div className="bv-parent-line">Child of {parentName}</div>}
                      {n.description && <div className="bv-desc">"{n.description}"</div>}
                      {nodes.filter(c => c.parentId === n.id).length > 0 && (
                        <div className="bv-child-count">{nodes.filter(c => c.parentId === n.id).length} children →</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}
      <div className="bv-end">— End of Family Tree —</div>
    </div>
  );
}
