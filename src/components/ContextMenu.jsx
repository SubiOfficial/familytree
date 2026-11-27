import { useState, useRef, useEffect } from 'react';

const COLORS = [
  { label: 'None', value: '' },
  { label: 'Blue', value: '#dbeafe' },
  { label: 'Green', value: '#dcfce7' },
  { label: 'Yellow', value: '#fef9c3' },
  { label: 'Pink', value: '#fce7f3' },
  { label: 'Purple', value: '#f3e8ff' },
  { label: 'Orange', value: '#ffedd5' },
  { label: 'Red', value: '#fee2e2' },
  { label: 'Teal', value: '#ccfbf1' },
];

export default function ContextMenu({ x, y, node, groups, onClose, onDelete, onEdit, onSetColor, onSetDescription, onSetGroup, onSetGeneration }) {
  const [sub, setSub] = useState(null);
  const existing = typeof node.description === 'object' && node.description ? node.description : { en: node.description || '', ta: '' };
  const [descEn, setDescEn] = useState(existing.en);
  const [descTa, setDescTa] = useState(existing.ta);
  const [descTab, setDescTab] = useState('en');
  const [groupName, setGroupName] = useState('');
  const colorRef = useRef(null);

  useEffect(() => {
    const el = colorRef.current;
    if (!el) return;
    const handler = (e) => { onSetColor(node.id, e.target.value); onClose(); };
    el.addEventListener('change', handler);
    return () => el.removeEventListener('change', handler);
  }, [sub, node.id, onSetColor, onClose]);

  const handleDescSave = () => {
    onSetDescription(node.id, { en: descEn, ta: descTa });
    onClose();
  };

  const handleGroupSelect = (g) => {
    onSetGroup(node.id, g);
    onClose();
  };

  const handleNewGroup = (e) => {
    e.preventDefault();
    if (groupName.trim()) {
      onSetGroup(node.id, groupName.trim());
      onClose();
    }
  };

  return (
    <div className="ctx-overlay" onMouseDown={onClose}>
      <div className="ctx-menu" style={{ left: x, top: y }} onMouseDown={(e) => e.stopPropagation()}>
        {sub === null && (
          <>
            <button className="ctx-item" onClick={() => { onEdit(node.id); onClose(); }}>Edit Name</button>
            <button className="ctx-item" onClick={() => { onDelete(node.id); onClose(); }}>Delete</button>
            <button className="ctx-item" onClick={() => setSub('color')}>Color</button>
            {(existing.en || existing.ta) ? (
              <>
                <button className="ctx-item" onClick={() => setSub('desc')}>Edit Description</button>
                <button className="ctx-item ctx-danger" onClick={() => { onSetDescription(node.id, { en: '', ta: '' }); onClose(); }}>Delete Description</button>
              </>
            ) : (
              <button className="ctx-item" onClick={() => setSub('desc')}>Add Description</button>
            )}
            <button className="ctx-item" onClick={() => setSub('group')}>Group</button>
            <button className="ctx-item" onClick={() => { onSetGeneration(node.id); onClose(); }}>Set Generation</button>
          </>
        )}

        {sub === 'color' && (
          <>
            <div className="ctx-header">
              <button className="ctx-back" onClick={() => setSub(null)}>&larr;</button>
              <span>Pick Color</span>
            </div>
            <div className="ctx-colors">
              {COLORS.map(c => (
                <button
                  key={c.label}
                  className={`ctx-swatch ${node.color === c.value ? 'active' : ''}`}
                  style={{ background: c.value || 'var(--card)' }}
                  title={c.label}
                  onClick={() => { onSetColor(node.id, c.value); onClose(); }}
                />
              ))}
              <label className="ctx-swatch ctx-custom-color" title="Custom color">
                <span>+</span>
                <input
                  ref={colorRef}
                  type="color"
                  defaultValue={node.color || '#ffffff'}
                />
              </label>
            </div>
          </>
        )}

        {sub === 'desc' && (
          <>
            <div className="ctx-header">
              <button className="ctx-back" onClick={() => setSub(null)}>&larr;</button>
              <span>Description</span>
            </div>
            <div className="ctx-desc-tabs">
              <button className={`ctx-desc-tab ${descTab === 'en' ? 'active' : ''}`} onClick={() => setDescTab('en')}>English</button>
              <button className={`ctx-desc-tab ${descTab === 'ta' ? 'active' : ''}`} onClick={() => setDescTab('ta')}>தமிழ்</button>
            </div>
            {descTab === 'en' && (
              <textarea
                className="ctx-textarea"
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                placeholder="Add description in English..."
                rows={3}
                autoFocus
              />
            )}
            {descTab === 'ta' && (
              <textarea
                className="ctx-textarea"
                value={descTa}
                onChange={(e) => setDescTa(e.target.value)}
                placeholder="தமிழில் விவரணை சேர்க்கவும்..."
                rows={3}
                autoFocus
              />
            )}
            <button className="ctx-item ctx-save" onClick={handleDescSave}>Save</button>
          </>
        )}

        {sub === 'group' && (
          <>
            <div className="ctx-header">
              <button className="ctx-back" onClick={() => setSub(null)}>&larr;</button>
              <span>Group</span>
            </div>
            {node.group && (
              <button className="ctx-item" onClick={() => handleGroupSelect('')}>Remove from group</button>
            )}
            {groups.filter(g => g).map(g => (
              <button
                key={g}
                className={`ctx-item ${node.group === g ? 'active' : ''}`}
                onClick={() => handleGroupSelect(g)}
              >{g}</button>
            ))}
            <form className="ctx-new-group" onSubmit={handleNewGroup}>
              <input
                className="ctx-input"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="New group name..."
                autoFocus
              />
              <button type="submit" className="ctx-item ctx-save" disabled={!groupName.trim()}>Add</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
