import { useEffect, useState } from 'react';

export interface ChartColors {
  text: string;
  grid: string;
  primary: string;
  muted: string;
  positive: string;
  negative: string;
}

function readColors(): ChartColors {
  const css = (name: string) => getComputedStyle(document.body).getPropertyValue(name).trim();
  return {
    text: css('--text'),
    grid: css('--border'),
    primary: css('--md-sys-color-primary'),
    muted: css('--text-muted'),
    positive: css('--color-positive'),
    negative: css('--md-sys-color-error'),
  };
}

export function useChartColors(): ChartColors {
  const [colors, setColors] = useState<ChartColors>(readColors);
  useEffect(() => {
    const obs = new MutationObserver(() => setColors(readColors()));
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return colors;
}
