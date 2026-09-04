type ChipTone = 'positive' | 'warning' | 'error' | 'primary' | 'neutral';

const toneClass: Record<ChipTone, string> = {
  positive: 'chip-positive',
  warning: 'chip-warning',
  error: 'chip-error',
  primary: 'chip-primary',
  neutral: 'chip-neutral',
};

export function Chip({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: ChipTone }) {
  return <span className={'chip ' + toneClass[tone]}>{children}</span>;
}
