type LogoProps = {
  compact?: boolean
}

export function Logo({ compact = false }: LogoProps) {
  return (
    <div className={`brand ${compact ? 'brand--compact' : ''}`} aria-label="Yagendii">
      <span className="brand__mark" aria-hidden="true">
        <svg viewBox="0 0 64 64" role="img">
          <defs>
            <linearGradient id="brandGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#0a84ff" />
              <stop offset="1" stopColor="#30d5c8" />
            </linearGradient>
          </defs>
          <rect x="9" y="12" width="46" height="43" rx="14" fill="url(#brandGradient)" />
          <rect x="16" y="22" width="32" height="25" rx="8" fill="white" fillOpacity="0.96" />
          <rect x="18" y="7" width="7" height="14" rx="3.5" fill="#063970" />
          <rect x="39" y="7" width="7" height="14" rx="3.5" fill="#063970" />
          <path d="M23 35.5l6 6L42.5 28" fill="none" stroke="#0a84ff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="brand__text">
        Yagend<span>ii</span>
      </span>
    </div>
  )
}
