import { useState } from 'react';

export default function DescDisplay({ desc }) {
  const [lang, setLang] = useState('en');
  const hasEn = !!desc.en;
  const hasTa = !!desc.ta;
  const hasBoth = hasEn && hasTa;

  return (
    <div className="card-desc-expanded">
      {hasBoth && (
        <div className="desc-tabs">
          <button className={`desc-tab ${lang === 'en' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setLang('en'); }}>EN</button>
          <button className={`desc-tab ${lang === 'ta' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setLang('ta'); }}>தமிழ்</button>
        </div>
      )}
      <div className="desc-text">
        {lang === 'en' && hasEn && desc.en}
        {lang === 'ta' && hasTa && desc.ta}
        {lang === 'en' && !hasEn && hasTa && desc.ta}
        {lang === 'ta' && !hasTa && hasEn && desc.en}
      </div>
    </div>
  );
}
