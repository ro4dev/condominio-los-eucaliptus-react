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
  implemented: boolean;
}

export const TABS: TabDef[] = [
  { id: 'home', label: 'Home', implemented: true },
  { id: 'finanzas', label: 'Finanzas', implemented: true },
  { id: 'parcelas', label: 'Parcelas', implemented: true },
  { id: 'noticias', label: 'Noticias', implemented: false },
  { id: 'documentos', label: 'Documentos', implemented: false },
  { id: 'reclamos', label: 'Comentarios', implemented: false },
  { id: 'proveedores', label: 'Proveedores', implemented: false },
  { id: 'asambleas', label: 'Asambleas', implemented: false },
  { id: 'encuestas', label: 'Encuestas', implemented: false },
  { id: 'publicaciones', label: 'Ventas', implemented: false },
  { id: 'config', label: 'Configuración', implemented: false },
];
