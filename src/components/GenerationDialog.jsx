import { useState } from 'react';

function toRoman(n) {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
  let r = '';
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) { r += syms[i]; n -= vals[i]; }
  }
  return r;
}

function toAlpha(n) {
  let r = '';
  while (n > 0) { n--; r = String.fromCharCode(65 + (n % 26)) + r; n = Math.floor(n / 26); }
  return r;
}

function formatGen(number, format) {
  if (format === 'roman') return toRoman(number);
  if (format === 'alpha') return toAlpha(number);
  return String(number);
}

const PRESETS = [
  '#d4a574', '#c9a96e', '#b8956a', '#a0845e',
  '#dbeafe', '#dcfce7', '#fef9c3', '#fce7f3',
  '#f3e8ff', '#ffedd5', '#fee2e2', '#ccfbf1',
];

export default function GenerationDialog({ node, generations, allNodes, onSave, onClose }) {
  const existing = node.generationId ? generations.find(g => g.id === node.generationId) : null;
  const [format, setFormat] = useState(existing?.format || 'numeric');
  const [selectedGenId, setSelectedGenId] = useState(existing?.id || null);
  const [createNew, setCreateNew] = useState(!existing);
  const [color, setColor] = useState(existing?.color || '#d4a574');
  const [hexInput, setHexInput] = useState(existing?.color || '#d4a574');
  const siblings = node.parentId ? allNodes.filter(n => n.parentId === node.parentId) : [node];
  const [selectedNodeIds, setSelectedNodeIds] = useState(siblings.map(n => n.id));

  const toggleNode = (id) => {
    setSelectedNodeIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const nextNumber = generations.length > 0 ? Math.max(...generations.map(g => g.number)) + 1 : 1;

  const handleColorChange = (c) => {
    setColor(c);
    setHexInput(c);
  };

  const handleHexChange = (e) => {
    const v = e.target.value;
    setHexInput(v);
    if (/^#[0-9a-fA-F]{6}$/.test(v)) setColor(v);
  };

  const handleSave = () => {
    if (createNew) {
      onSave({ id: Date.now(), number: nextNumber, format, color }, true, selectedNodeIds);
    } else if (selectedGenId) {
      const gen = generations.find(g => g.id === selectedGenId);
      onSave({ ...gen, format, color }, false, selectedNodeIds);
    }
    onClose();
  };

  const selectedGen = selectedGenId ? generations.find(g => g.id === selectedGenId) : null;
  const previewLabel = createNew
    ? `Generation ${formatGen(nextNumber, format)}`
    : selectedGen
      ? `Generation ${formatGen(selectedGen.number, format)}`
      : 'Select a generation';

  return (
    <div className="gen-overlay" onMouseDown={onClose}>
      <div className="gen-dialog" onMouseDown={e => e.stopPropagation()}>
        <h3 className="gen-title">Set Generation</h3>

        <div className="gen-section">
          <label className="gen-label">Numbering Format</label>
          <div className="gen-formats">
            {[
              { key: 'numeric', label: '1, 2, 3', example: '1' },
              { key: 'roman', label: 'I, II, III', example: 'I' },
              { key: 'alpha', label: 'A, B, C', example: 'A' },
            ].map(f => (
              <button
                key={f.key}
                className={`gen-format-btn ${format === f.key ? 'active' : ''}`}
                onClick={() => setFormat(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="gen-section">
          <label className="gen-label">Generation</label>
          <div className="gen-list">
            <button
              className={`gen-option ${createNew ? 'active' : ''}`}
              onClick={() => { setCreateNew(true); setSelectedGenId(null); }}
            >
              + New Generation ({formatGen(nextNumber, format)})
            </button>
            {generations.map(g => (
              <button
                key={g.id}
                className={`gen-option ${!createNew && selectedGenId === g.id ? 'active' : ''}`}
                onClick={() => { setCreateNew(false); setSelectedGenId(g.id); handleColorChange(g.color); }}
              >
                <span className="gen-option-dot" style={{ background: g.color }} />
                Generation {formatGen(g.number, format)}
              </button>
            ))}
          </div>
        </div>

        <div className="gen-section">
          <label className="gen-label">Color</label>
          <div className="gen-colors">
            {PRESETS.map(c => (
              <button
                key={c}
                className={`gen-swatch ${color === c ? 'active' : ''}`}
                style={{ background: c }}
                onClick={() => handleColorChange(c)}
              />
            ))}
            <label className="gen-swatch gen-custom-swatch" title="Custom">
              <span>+</span>
              <input
                type="color"
                value={color}
                onChange={e => handleColorChange(e.target.value)}
              />
            </label>
          </div>
          <div className="gen-hex-row">
            <label className="gen-hex-label">HEX</label>
            <input
              className="gen-hex-input"
              value={hexInput}
              onChange={handleHexChange}
              placeholder="#d4a574"
              maxLength={7}
            />
          </div>
        </div>

        <div className="gen-section">
          <label className="gen-label">Apply to Nodes</label>
          <div className="gen-node-list">
            {allNodes.map(n => {
              const name = n.people.map(p => p.name).join(' & ');
              const isSibling = siblings.some(s => s.id === n.id);
              return (
                <label key={n.id} className={`gen-node-item ${isSibling ? 'sibling' : ''}`}>
                  <input type="checkbox" checked={selectedNodeIds.includes(n.id)} onChange={() => toggleNode(n.id)} />
                  <span>{name}</span>
                  {isSibling && <span className="gen-sibling-tag">sibling</span>}
                </label>
              );
            })}
          </div>
        </div>

        <div className="gen-section">
          <label className="gen-label">Preview</label>
          <div className="gen-preview" style={{ background: color + '30', borderColor: color }}>
            <span className="gen-preview-badge" style={{ background: color }}>{previewLabel}</span>
            <span className="gen-preview-text">Node will look like this</span>
          </div>
        </div>

        <div className="gen-actions">
          <button className="gen-btn gen-cancel" onClick={onClose}>Cancel</button>
          <button className="gen-btn gen-save" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

export { formatGen };
