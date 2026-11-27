// Shared SVG symbols (#cam, #hrt) — rendered once, referenced with <use>.
export function IconSprite() {
  return (
    <svg aria-hidden="true" style={{ display: 'none' }}>
      <symbol id="cam" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
        <circle cx="12" cy="14" r="3.4" />
      </symbol>
      <symbol id="hrt" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21C10 19 3 14.5 3 9.2 3 6.3 5.1 4 7.8 4c1.9 0 3.4 1 4.2 2.5C12.8 5 14.3 4 16.2 4 18.9 4 21 6.3 21 9.2 21 14.5 14 19 12 21z" />
      </symbol>
    </svg>
  );
}

export function CameraIcon() {
  return (
    <svg aria-hidden="true">
      <use href="#cam" />
    </svg>
  );
}

export function HeartIcon() {
  return (
    <svg className="heart" width="16" height="16" aria-hidden="true">
      <use href="#hrt" />
    </svg>
  );
}
