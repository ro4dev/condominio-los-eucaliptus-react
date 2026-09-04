export interface Gasto {
  id: string;
  periodo: string;
  monto: number | string;
  descripcion: string;
  parcela_id: string;
  archivo?: string;
  pagado?: 'Sí' | 'No';
  concepto?: string;
  created_at?: string;
}

export interface Pago {
  id: string;
  gasto_id: string;
  parcela_id: string;
  periodo: string;
  monto: number | string;
  fecha: string;
  comprobante?: string;
  created_at?: string;
}

export interface Parcela {
  id: string;
  numero: string;
  rol?: string;
  metros?: string;
  estado?: string;
}

export interface Propietario {
  id: string;
  parcela_id: string;
  nombre_completo?: string;
  rut?: string;
  telefono?: string;
  email?: string;
  tipo?: 'Propietario' | 'Inquilino' | 'Administrador';
}

export interface Movimiento {
  id: string;
  tipo: 'Ingreso' | 'Egreso';
  monto: number | string;
  fecha: string;
  concepto: string;
  descripcion?: string;
  registrado_por?: string;
}

export interface PeriodoConfig {
  periodo: string;
  monto: number;
  fondo_reserva?: number;
}

export interface DatosPago {
  banco?: string;
  tipo_cuenta?: string;
  numero_cuenta?: string;
  rut?: string;
  titular?: string;
  email?: string;
  qr?: string;
}

export interface Config {
  categorias_documentos?: string[];
  rubros_proveedores?: string[];
  conceptos_flujo?: string[];
  datos_pago?: DatosPago;
  periodos?: PeriodoConfig[];
  parcelas_prefijo?: string;
  parcelas_cantidad?: number;
}

export interface CuotaCalculada {
  monto: number;
  fondo_reserva: number;
  total: number;
}

export interface Noticia {
  id: string;
  titulo: string;
  descripcion: string;
  fecha?: string;
  fecha_hasta?: string;
  pinned?: boolean;
  archivo?: string;
  created_at?: string;
}

export interface Documento {
  id: string;
  nombre: string;
  categoria?: string;
  descripcion?: string;
  archivo?: string;
  fecha?: string;
  created_at?: string;
}

export interface Reclamo {
  id: string;
  tipo: 'Reclamo' | 'Sugerencia';
  asunto: string;
  descripcion: string;
  parcela_id?: string | null;
  fecha?: string;
  created_at?: string;
}

export interface Proveedor {
  id: string;
  rubro: string;
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  web_instagram?: string;
  observaciones?: string;
}

export interface Asamblea {
  id: string;
  fecha: string;
  tipo: 'Ordinaria' | 'Extraordinaria';
  temario: string;
  acuerdos?: string;
  created_at?: string;
}

export interface AsambleaAsistente {
  id: string;
  asamblea_id: string;
  parcela_id: string;
}

export interface Encuesta {
  id: string;
  titulo: string;
  descripcion: string;
  alternativas?: string[];
  fecha_termino?: string | null;
  quorum?: number | null;
  created_at?: string;
}

export interface VotoEncuesta {
  id: string;
  encuesta_id: string;
  parcela_id: string;
  seleccion: string;
  created_at?: string;
}

export interface Publicacion {
  id: string;
  titulo: string;
  descripcion?: string;
  categoria: 'Producto' | 'Servicio';
  precio?: number | string | null;
  contacto?: string;
  parcela_id?: string;
  estado: 'Disponible' | 'Vendido';
  usuario?: string;
  foto?: string;
  created_at?: string;
}

export interface AuditEntry {
  id?: string;
  tabla: string;
  accion: 'INSERT' | 'UPDATE' | 'DELETE';
  registro_id?: string | null;
  datos?: Record<string, unknown>;
  usuario?: string;
  created_at?: string;
}
