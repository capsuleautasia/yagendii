import { Bell, RefreshCw } from 'lucide-react'
import { Logo } from './Logo'

type TopBarProps = {
  title: string
  subtitle: string
  onRefresh: () => void
  refreshing: boolean
}

export function TopBar({ title, subtitle, onRefresh, refreshing }: TopBarProps) {
  return (
    <header className="topbar">
      <div className="topbar__brand"><Logo compact /></div>
      <div className="topbar__copy">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="topbar__actions">
        <button type="button" className="icon-button" aria-label="Actualizar datos" onClick={onRefresh} disabled={refreshing}>
          <RefreshCw size={19} className={refreshing ? 'spin' : ''} />
        </button>
        <button type="button" className="icon-button icon-button--muted" aria-label="Notificaciones">
          <Bell size={19} />
        </button>
      </div>
    </header>
  )
}
