import { useRef, useState } from 'react';
import { CameraIcon } from './Icons.jsx';

export default function Person({ nodeId, index, person, photoLabel, locked = false, onChange, onGenderDetect }) {
  const fileRef = useRef(null);
  const nameRef = useRef(null);
  const [editing, setEditing] = useState(false);

  const pickPhoto = () => {
    if (!locked) fileRef.current?.click();
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange?.({ ...person, img: reader.result });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const startEdit = (e) => {
    if (locked) return;
    e.stopPropagation();
    setEditing(true);
    requestAnimationFrame(() => {
      const el = nameRef.current;
      if (!el) return;
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    });
  };

  const finishEdit = (e) => {
    setEditing(false);
    let raw = e.currentTarget.innerText.trim() || 'Unknown';
    let gender = null;
    const genderMatch = raw.match(/\s*\((m|f)\)\s*$/i);
    if (genderMatch) {
      gender = genderMatch[1].toLowerCase() === 'm' ? 'male' : 'female';
      raw = raw.replace(/\s*\((m|f)\)\s*$/i, '').trim() || 'Unknown';
    }
    e.currentTarget.innerText = raw;
    onChange?.({ ...person, name: raw });
    if (gender) onGenderDetect?.(gender);
  };

  return (
    <div className="person">
      <div
        className="photo"
        aria-label={photoLabel}
        style={person.img ? { backgroundImage: `url(${person.img})` } : undefined}
        onClick={pickPhoto}
      >
        {person.img ? null : <CameraIcon />}
      </div>
      <div
        ref={nameRef}
        className="nm"
        data-ph="Name"
        contentEditable={editing}
        suppressContentEditableWarning
        onDoubleClick={startEdit}
        onBlur={finishEdit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
      >
        {person.name}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        id={`file-${nodeId}-${index}`}
        hidden
        onChange={onFile}
      />
    </div>
  );
}
