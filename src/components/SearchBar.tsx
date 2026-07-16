import { Search, X } from 'lucide-react'

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <label className="search-bar">
      <Search size={19} aria-hidden="true" />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} />
      {value && (
        <button type="button" onClick={() => onChange('')} aria-label="Limpiar búsqueda">
          <X size={17} />
        </button>
      )}
    </label>
  )
}
