export function parseFecha(s?: string | number): number {
  if (!s) return 0;
  let str = String(s);
  if (str.indexOf('T') !== -1) str = str.split('T')[0];
  const p = str.split('-');
  if (p.length === 3 && p[0].length === 4) return new Date(+p[0], +p[1] - 1, +p[2]).getTime();
  const q = str.split('/');
  if (q.length === 3) return new Date(+q[2], +q[1] - 1, +q[0]).getTime();
  return 0;
}

export function formatMoney(v: number | string | null | undefined): string {
  const n = parseFloat(String(v ?? 0)) || 0;
  const negative = n < 0;
  const s = Math.round(Math.abs(n)).toString();
  let result = '';
  let count = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    if (count > 0 && count % 3 === 0) result = '.' + result;
    result = s.charAt(i) + result;
    count++;
  }
  return (negative ? '-$' : '$') + result;
}

export function formatPeriodo(p?: string | null): string {
  if (!p) return '';
  let s = String(p);
  if (s.indexOf('T') !== -1) s = s.slice(0, 7);
  const parts = s.split('-');
  if (parts.length >= 2) return parts[1] + '/' + parts[0];
  return s;
}

export function formatDate(d?: string | null): string {
  if (!d) return '';
  let s = String(d);
  if (s.indexOf('T') !== -1) s = s.split('T')[0];
  const parts = s.split('-');
  if (parts.length === 3) return parts[2] + '/' + parts[1] + '/' + parts[0];
  const q = s.split('/');
  if (q.length === 3) return q[0] + '/' + q[1] + '/' + q[2];
  return s;
}

export function formatDateCorta(d?: string | null): string {
  const s = formatDate(d);
  if (s.length === 10) return s.slice(0, 6) + s.slice(8);
  return s;
}

export function escHtml(str: unknown): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function nl2br(text: unknown): string {
  return escHtml(text || '').replace(/\n/g, '<br>');
}

export function safeUrl(u?: string | null): string {
  if (!u) return '';
  const s = String(u).replace(/[\u0000-\u0020]/g, '').trim();
  if (/^(javascript|vbscript|file):/i.test(s)) return '';
  if (/^data:/i.test(s) && !/^data:image\//i.test(s)) return '';
  return s;
}

export function mesDeFecha(fecha?: string | null): string {
  if (!fecha) return '';
  let s = String(fecha);
  if (s.indexOf('T') !== -1) s = s.split('T')[0];
  const m = s.split('-');
  if (m.length === 3 && m[0].length === 4) return m[0] + '-' + m[1];
  const p = s.split('/');
  if (p.length === 3) return p[2] + '-' + (p[1].length === 1 ? '0' + p[1] : p[1]);
  return '';
}

export function getTimeRemaining(fechaStr?: string): string | null {
  if (!fechaStr) return null;
  const parts = fechaStr.split('T')[0].split('-');
  const now = new Date();
  if (+parts[0] !== now.getFullYear() || +parts[1] !== now.getMonth() + 1 || +parts[2] !== now.getDate()) return null;
  const fin = new Date(+parts[0], +parts[1] - 1, +parts[2], 23, 59, 59);
  const diff = fin.getTime() - now.getTime();
  if (diff <= 0) return null;
  const horas = Math.floor(diff / 3600000);
  const minutos = Math.floor((diff % 3600000) / 60000);
  return horas + 'h ' + minutos + 'm';
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function numeroDeParcela(numero?: string | null): number {
  return parseInt((numero || '').replace(/\D/g, '')) || 0;
}
