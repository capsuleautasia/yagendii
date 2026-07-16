export type Venta = {
  id: string
  user_id: string
  nombre_cliente: string
  numero_cliente: string
  fecha_venta: string
  telefono: string
  observaciones: string | null
  origen_posible_venta_id: string | null
  created_at: string
  updated_at: string
}

export type PosibleVenta = {
  id: string
  user_id: string
  nombre_cliente: string
  numero_cliente: string
  fecha_agendada: string
  hora_agendada: string
  telefono: string
  observaciones: string | null
  created_at: string
  updated_at: string
}

export type VentaInput = Pick<
  Venta,
  'nombre_cliente' | 'numero_cliente' | 'fecha_venta' | 'telefono' | 'observaciones'
>

export type PosibleVentaInput = Pick<
  PosibleVenta,
  'nombre_cliente' | 'numero_cliente' | 'fecha_agendada' | 'hora_agendada' | 'telefono' | 'observaciones'
>

export type Section = 'inicio' | 'ventas' | 'posibles' | 'cuenta'
export type FormMode = 'create' | 'edit'
export type EntityKind = 'venta' | 'posible'
