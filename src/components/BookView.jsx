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
      <div className="bv-book">
        {sortedGens.map(gid => {
          const gen = generations.find(g => g.id === Number(gid));
          const members = genGroups[gid];
          return (
            <div key={gid} className="bv-page" style={{ borderLeftColor: gen?.color || '#ddd' }}>
              <h2 className="bv-gen-title" style={{ color: gen?.color ? '#5a4a3a' : '#888' }}>
                {gen ? `Generation ${formatGen(gen.number, gen.format)}` : 'Unassigned'}
              </h2>
              <div className="bv-members">
                {members.map(n => {
                  const names = n.people.map(p => p.name);
                  return (
                    <div key={n.id} className="bv-member">
                      <div className="bv-photo">{n.people[0]?.img ? <img src={n.people[0].img} alt="" /> : '👤'}</div>
                      <div className="bv-info">
                        <div className="bv-name">{names[0]}</div>
                        {names[1] && <div className="bv-partner">♥ {names[1]}</div>}
                        {n.gender !== 'unknown' && <span className={`bv-gender bv-${n.gender}`}>{n.gender}</span>}
                        {n.description && <div className="bv-desc">{n.description}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
