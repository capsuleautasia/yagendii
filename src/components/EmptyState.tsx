import { Inbox } from 'lucide-react'

type EmptyStateProps = {
  title: string
  description: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span><Inbox size={25} /></span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}
