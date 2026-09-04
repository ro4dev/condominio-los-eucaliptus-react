// Modo demo y tema, persistidos en localStorage (equivalentes a config.js del original)

export function getDemoMode(): boolean {
  return localStorage.getItem('demoMode') !== 'false';
}

export function setDemoMode(value: boolean): void {
  localStorage.setItem('demoMode', String(value));
}

export function getDarkTheme(): boolean {
  return localStorage.getItem('theme') === 'dark';
}

export function setDarkTheme(value: boolean): void {
  localStorage.setItem('theme', value ? 'dark' : 'light');
}

export function periodOptions(offsetIni = -6, offsetFin = 12): { value: string; label: string }[] {
  const now = new Date();
  const meses: { value: string; label: string }[] = [];
  for (let i = offsetIni; i <= offsetFin; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const val = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    const label = d.toLocaleDateString('es-CL', { year: 'numeric', month: 'long' });
    meses.push({ value: val, label });
  }
  return meses;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
