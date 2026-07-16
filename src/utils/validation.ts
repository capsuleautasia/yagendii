export function normalizePhone(value: string): string {
  return value.replace(/[^\d+\s()-]/g, '').slice(0, 24)
}

export function validateRequired(value: string, label: string): string | null {
  return value.trim() ? null : `Ingresa ${label.toLowerCase()}.`
}

export function validatePhone(value: string): string | null {
  const digits = value.replace(/\D/g, '')
  if (!digits) return 'Ingresa el número de teléfono.'
  if (digits.length < 8) return 'El teléfono debe tener al menos 8 dígitos.'
  return null
}
