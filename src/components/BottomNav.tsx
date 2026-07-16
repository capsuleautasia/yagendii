import { CircleDollarSign, LayoutDashboard, Settings, UsersRound } from 'lucide-react'
import type { Section } from '../types/models'

type BottomNavProps = {
  section: Section
  onChange: (section: Section) => void
}

const items: Array<{ id: Section; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'inicio', label: 'Inicio', icon: LayoutDashboard },
  { id: 'ventas', label: 'Ventas', icon: CircleDollarSign },
  { id: 'posibles', label: 'Posibles', icon: UsersRound },
  { id: 'cuenta', label: 'Cuenta', icon: Settings },
]

export function BottomNav({ section, onChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {items.map((item) => {
        const Icon = item.icon
        const active = item.id === section
        return (
          <button key={item.id} type="button" className={active ? 'is-active' : ''} onClick={() => onChange(item.id)}>
            <span className="bottom-nav__icon"><Icon size={21} strokeWidth={active ? 2.5 : 2} /></span>
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
