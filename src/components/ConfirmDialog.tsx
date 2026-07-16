import { AlertTriangle, X } from 'lucide-react'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  tone?: 'danger' | 'success'
  loading?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({ open, title, description, confirmLabel, tone = 'danger', loading = false, onCancel, onConfirm }: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onCancel}>
      <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title" onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" className="icon-button confirm-dialog__close" onClick={onCancel} aria-label="Cerrar"><X size={18} /></button>
        <span className={`confirm-dialog__icon confirm-dialog__icon--${tone}`}><AlertTriangle size={23} /></span>
        <h2 id="confirm-title">{title}</h2>
        <p>{description}</p>
        <div className="confirm-dialog__actions">
          <button type="button" className="secondary-button" onClick={onCancel} disabled={loading}>Cancelar</button>
          <button type="button" className={tone === 'danger' ? 'danger-button' : 'primary-button'} onClick={onConfirm} disabled={loading}>
            {loading ? 'Procesando…' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  )
}
