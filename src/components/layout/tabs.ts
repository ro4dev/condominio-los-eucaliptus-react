export type TabId =
  | 'home'
  | 'finanzas'
  | 'parcelas'
  | 'noticias'
  | 'documentos'
  | 'reclamos'
  | 'proveedores'
  | 'asambleas'
  | 'encuestas'
  | 'publicaciones'
  | 'config';

export interface TabDef {
  id: TabId;
  label: string;
  icon: string;
  implemented: boolean;
}

export const TABS: TabDef[] = [
  { id: 'home', label: 'Home', icon: 'home', implemented: true },
  { id: 'finanzas', label: 'Finanzas', icon: 'account_balance', implemented: true },
  { id: 'parcelas', label: 'Parcelas', icon: 'dashboard', implemented: true },
  { id: 'noticias', label: 'Noticias', icon: 'newspaper', implemented: true },
  { id: 'documentos', label: 'Documentos', icon: 'description', implemented: true },
  { id: 'reclamos', label: 'Comentarios', icon: 'forum', implemented: true },
  { id: 'proveedores', label: 'Proveedores', icon: 'engineering', implemented: true },
  { id: 'asambleas', label: 'Asambleas', icon: 'groups', implemented: true },
  { id: 'encuestas', label: 'Encuestas', icon: 'ballot', implemented: true },
  { id: 'publicaciones', label: 'Ventas', icon: 'sell', implemented: true },
  { id: 'config', label: 'Configuración', icon: 'settings', implemented: true },
];
