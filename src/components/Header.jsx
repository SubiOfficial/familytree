import { useState } from 'react';

const VIEWS = [
  { key: 'canvas', label: 'Canvas', icon: '⊞' },
  { key: 'table', label: 'Table View', icon: '▦' },
];

export default function Header({ treeName, viewMode, onViewChange, generations, activeGen, onGenFilter }) {
  const [showModes, setShowModes] = useState(false);
  const [showGens, setShowGens] = useState(false);

  return (
    <header className="app-header">
      <h1 className="header-title">{treeName}</h1>
      <div className="header-actions">
        <div className="header-dropdown-wrap">
          <button className="header-btn" onClick={() => { setShowGens(g => !g); setShowModes(false); }}>
            {activeGen ? `Gen ${activeGen}` : 'All Gens'}
          </button>
          {showGens && (
            <div className="header-dropdown">
              <button className={`hd-item ${!activeGen ? 'active' : ''}`} onClick={() => { onGenFilter(null); setShowGens(false); }}>All Generations</button>
              {generations.map(g => (
                <button key={g.id} className={`hd-item ${activeGen === g.number ? 'active' : ''}`} onClick={() => { onGenFilter(g.number); setShowGens(false); }}>
                  <span className="hd-dot" style={{ background: g.color }} />
                  Generation {g.number}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="header-dropdown-wrap">
          <button className="header-btn" onClick={() => { setShowModes(m => !m); setShowGens(false); }}>
            {VIEWS.find(v => v.key === viewMode)?.icon} Mode
          </button>
          {showModes && (
            <div className="header-dropdown">
              {VIEWS.map(v => (
                <button key={v.key} className={`hd-item ${viewMode === v.key ? 'active' : ''}`} onClick={() => { onViewChange(v.key); setShowModes(false); }}>
                  <span className="hd-icon">{v.icon}</span> {v.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
