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
  nombre: string;
  email?: string;
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
}

export interface CuotaCalculada {
  monto: number;
  fondo_reserva: number;
  total: number;
}
