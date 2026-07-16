import type { LucideIcon } from 'lucide-react'

type StatCardProps = {
  label: string
  value: number | string
  detail: string
  icon: LucideIcon
  tone: 'blue' | 'green' | 'orange'
}

export function StatCard({ label, value, detail, icon: Icon, tone }: StatCardProps) {
  return (
    <article className={`stat-card stat-card--${tone}`}>
      <div className="stat-card__icon"><Icon size={21} /></div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{detail}</span>
      </div>
    </article>
  )
}
