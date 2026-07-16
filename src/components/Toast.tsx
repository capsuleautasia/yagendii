import { CheckCircle2, X, XCircle } from 'lucide-react'

type ToastProps = {
  message: string | null
  tone: 'success' | 'error'
  onClose: () => void
}

export function Toast({ message, tone, onClose }: ToastProps) {
  if (!message) return null
  return (
    <div className={`toast toast--${tone}`} role="status">
      {tone === 'success' ? <CheckCircle2 size={19} /> : <XCircle size={19} />}
      <span>{message}</span>
      <button type="button" onClick={onClose} aria-label="Cerrar"><X size={17} /></button>
    </div>
  )
}
