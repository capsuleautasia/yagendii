import { useEffect, useState } from 'react'
import { CalendarCheck2, X } from 'lucide-react'
import type { PosibleVenta } from '../types/models'
import { todayISO } from '../utils/date'

type ConvertModalProps = {
  record: PosibleVenta | null
  loading: boolean
  onClose: () => void
  onConfirm: (fecha: string) => Promise<void>
}

export function ConvertModal({ record, loading, onClose, onConfirm }: ConvertModalProps) {
  const [fecha, setFecha] = useState(todayISO())

  useEffect(() => {
    if (record) setFecha(todayISO())
  }, [record])

  if (!record) return null

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="confirm-dialog convert-dialog" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" className="icon-button confirm-dialog__close" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
        <span className="confirm-dialog__icon confirm-dialog__icon--success"><CalendarCheck2 size={24} /></span>
        <h2>Convertir en venta</h2>
        <p><strong>{record.nombre_cliente}</strong> saldrá de Posibles ventas y se guardará automáticamente en Ventas.</p>
        <label className="field">
          <span>Fecha de venta</span>
          <input type="date" value={fecha} onChange={(event) => setFecha(event.target.value)} />
        </label>
        <div className="confirm-dialog__actions">
          <button type="button" className="secondary-button" onClick={onClose} disabled={loading}>Cancelar</button>
          <button type="button" className="primary-button" onClick={() => onConfirm(fecha)} disabled={loading || !fecha}>{loading ? 'Convirtiendo…' : 'Confirmar venta'}</button>
        </div>
      </section>
    </div>
  )
}
