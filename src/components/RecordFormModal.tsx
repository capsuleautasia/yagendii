import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { CalendarDays, Clock3, Hash, MessageSquareText, Phone, UserRound, X } from 'lucide-react'
import type { EntityKind, FormMode, PosibleVenta, PosibleVentaInput, Venta, VentaInput } from '../types/models'
import { todayISO } from '../utils/date'
import { normalizePhone, validatePhone, validateRequired } from '../utils/validation'

type RecordFormModalProps = {
  open: boolean
  kind: EntityKind
  mode: FormMode
  record?: Venta | PosibleVenta | null
  loading?: boolean
  onClose: () => void
  onSubmit: (data: VentaInput | PosibleVentaInput) => Promise<void>
}

type FormState = {
  nombre_cliente: string
  numero_cliente: string
  fecha: string
  hora: string
  telefono: string
  observaciones: string
}

const initialState: FormState = {
  nombre_cliente: '',
  numero_cliente: '',
  fecha: todayISO(),
  hora: '09:00',
  telefono: '',
  observaciones: '',
}

export function RecordFormModal({ open, kind, mode, record, loading = false, onClose, onSubmit }: RecordFormModalProps) {
  const [form, setForm] = useState<FormState>(initialState)
  const [error, setError] = useState<string | null>(null)

  const title = useMemo(() => {
    if (kind === 'venta') return mode === 'create' ? 'Registrar venta' : 'Editar venta'
    return mode === 'create' ? 'Agregar posible venta' : 'Editar posible venta'
  }, [kind, mode])

  useEffect(() => {
    if (!open) return

    if (!record) {
      setForm({ ...initialState, fecha: todayISO() })
      setError(null)
      return
    }

    if (kind === 'venta' && 'fecha_venta' in record) {
      setForm({
        nombre_cliente: record.nombre_cliente,
        numero_cliente: record.numero_cliente,
        fecha: record.fecha_venta,
        hora: '09:00',
        telefono: record.telefono,
        observaciones: record.observaciones ?? '',
      })
    } else if (kind === 'posible' && 'fecha_agendada' in record) {
      setForm({
        nombre_cliente: record.nombre_cliente,
        numero_cliente: record.numero_cliente,
        fecha: record.fecha_agendada,
        hora: record.hora_agendada.slice(0, 5),
        telefono: record.telefono,
        observaciones: record.observaciones ?? '',
      })
    }
    setError(null)
  }, [kind, open, record])

  if (!open) return null

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationError =
      validateRequired(form.nombre_cliente, 'el nombre del cliente') ??
      validateRequired(form.numero_cliente, 'el número o índice del cliente') ??
      validateRequired(form.fecha, kind === 'venta' ? 'la fecha de venta' : 'la fecha agendada') ??
      (kind === 'posible' ? validateRequired(form.hora, 'la hora agendada') : null) ??
      validatePhone(form.telefono)

    if (validationError) {
      setError(validationError)
      return
    }

    const common = {
      nombre_cliente: form.nombre_cliente.trim(),
      numero_cliente: form.numero_cliente.trim(),
      telefono: form.telefono.trim(),
      observaciones: form.observaciones.trim() || null,
    }

    const payload: VentaInput | PosibleVentaInput =
      kind === 'venta'
        ? { ...common, fecha_venta: form.fecha }
        : { ...common, fecha_agendada: form.fecha, hora_agendada: form.hora }

    setError(null)
    await onSubmit(payload)
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="form-sheet" role="dialog" aria-modal="true" aria-labelledby="form-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="form-sheet__header">
          <div>
            <p className="section-kicker">{kind === 'venta' ? 'Ventas' : 'Oportunidades'}</p>
            <h2 id="form-title">{title}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Cerrar"><X size={19} /></button>
        </header>

        <form className="record-form" onSubmit={handleSubmit}>
          <label className="field field--icon">
            <span>Nombre del cliente</span>
            <div><UserRound size={18} /><input value={form.nombre_cliente} onChange={(event) => setField('nombre_cliente', event.target.value)} placeholder="Ej. Carolina Muñoz" autoFocus /></div>
          </label>

          <label className="field field--icon">
            <span>Número o índice del cliente</span>
            <div><Hash size={18} /><input value={form.numero_cliente} onChange={(event) => setField('numero_cliente', event.target.value)} placeholder="Ej. 0071" inputMode="text" /></div>
          </label>

          <div className={kind === 'posible' ? 'form-grid' : ''}>
            <label className="field field--icon">
              <span>{kind === 'venta' ? 'Fecha de venta' : 'Fecha agendada'}</span>
              <div><CalendarDays size={18} /><input type="date" value={form.fecha} onChange={(event) => setField('fecha', event.target.value)} /></div>
            </label>

            {kind === 'posible' && (
              <label className="field field--icon">
                <span>Hora agendada</span>
                <div><Clock3 size={18} /><input type="time" value={form.hora} onChange={(event) => setField('hora', event.target.value)} /></div>
              </label>
            )}
          </div>

          <label className="field field--icon">
            <span>Número de teléfono</span>
            <div><Phone size={18} /><input type="tel" value={form.telefono} onChange={(event) => setField('telefono', normalizePhone(event.target.value))} placeholder="Ej. +56 9 1234 5678" inputMode="tel" /></div>
          </label>

          <label className="field field--icon field--textarea">
            <span>Observaciones</span>
            <div><MessageSquareText size={18} /><textarea value={form.observaciones} onChange={(event) => setField('observaciones', event.target.value)} placeholder="Información útil para el seguimiento…" maxLength={700} /></div>
          </label>

          {error && <div className="inline-alert inline-alert--error">{error}</div>}

          <div className="form-sheet__actions">
            <button type="button" className="secondary-button" onClick={onClose} disabled={loading}>Cancelar</button>
            <button className="primary-button" disabled={loading}>{loading ? 'Guardando…' : mode === 'create' ? 'Guardar registro' : 'Guardar cambios'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}
