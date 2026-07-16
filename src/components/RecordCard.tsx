import { CalendarDays, Check, Clock3, Edit3, MoreHorizontal, Phone, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { PosibleVenta, Venta } from '../types/models'
import { formatDate, formatTime, isToday } from '../utils/date'

type RecordCardProps =
  | {
      kind: 'venta'
      record: Venta
      onEdit: () => void
      onDelete: () => void
      onConvert?: never
    }
  | {
      kind: 'posible'
      record: PosibleVenta
      onEdit: () => void
      onDelete: () => void
      onConvert: () => void
    }

export function RecordCard(props: RecordCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { record, kind, onEdit, onDelete } = props
  const date = kind === 'venta' ? record.fecha_venta : record.fecha_agendada

  return (
    <article className="record-card">
      <div className="record-card__head">
        <div className={`avatar avatar--${kind}`} aria-hidden="true">
          {record.nombre_cliente.trim().slice(0, 1).toUpperCase() || 'C'}
        </div>
        <div className="record-card__identity">
          <h3>{record.nombre_cliente}</h3>
          <p>Cliente #{record.numero_cliente}</p>
        </div>
        <div className="record-card__menu-wrap">
          <button type="button" className="icon-button icon-button--small" onClick={() => setMenuOpen((value) => !value)} aria-label="Opciones">
            <MoreHorizontal size={19} />
          </button>
          {menuOpen && (
            <div className="record-menu">
              <button type="button" onClick={() => { setMenuOpen(false); onEdit() }}><Edit3 size={16} /> Editar</button>
              <button type="button" className="danger" onClick={() => { setMenuOpen(false); onDelete() }}><Trash2 size={16} /> Eliminar</button>
            </div>
          )}
        </div>
      </div>

      <div className="record-card__details">
        <span><CalendarDays size={16} /> {formatDate(date)} {isToday(date) && <em>Hoy</em>}</span>
        {kind === 'posible' && <span><Clock3 size={16} /> {formatTime(record.hora_agendada)}</span>}
        <a href={`tel:${record.telefono}`}><Phone size={16} /> {record.telefono}</a>
      </div>

      {record.observaciones && <p className="record-card__note">{record.observaciones}</p>}

      {kind === 'posible' && (
        <button type="button" className="convert-button" onClick={props.onConvert}>
          <Check size={18} /> Convertir en venta
        </button>
      )}
    </article>
  )
}
