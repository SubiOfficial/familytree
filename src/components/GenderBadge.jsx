const LABELS = {
  male: 'Male',
  female: 'Female',
  unknown: 'Gender not set',
};

export default function GenderBadge({ gender = 'unknown' }) {
  return <span className={`gender-badge gender-${gender}`}>{LABELS[gender] ?? LABELS.unknown}</span>;
}
