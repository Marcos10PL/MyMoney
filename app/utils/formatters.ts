export const formatNumber = (
  value?: number | null,
  options?: { fractionDigits?: number }
) => {
  if (!value) return '--'

  const { fractionDigits } = options || {}

  return new Intl.NumberFormat('pl-PL', {
    minimumFractionDigits: fractionDigits ?? 0,
    maximumFractionDigits: fractionDigits ?? 2,
  }).format(value)
}

export const formatCurrency = (
  amount?: number | null,
  options?: {
    currency?: string
    fractionDigits?: number
    includeZero?: boolean
  }
) => {
  const { currency = 'PLN', fractionDigits, includeZero } = options || {}

  if (amount == null) return '--'

  const normalized = Math.round(amount * 100) / 100 || 0
  if (!normalized && !includeZero) return '--'

  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency,
    ...(fractionDigits != null && {
      minimumFractionDigits: Math.min(2, fractionDigits),
      maximumFractionDigits: fractionDigits,
    }),
  }).format(normalized)
}

export const formatPercent = (value: number, fractionDigits = 1) =>
  value.toLocaleString('pl-PL', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })

export const formatQuantity = (value?: number | string | null) => {
  if (value == null) return '--'

  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '--'

  return new Intl.NumberFormat('pl-PL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  }).format(num)
}

export const formatDate = (
  date?: string | Date | null,
  options?: { withTime?: boolean }
) => {
  const { withTime } = options || {}

  if (!date) return '--'

  return new Date(date).toLocaleString('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime && { hour: '2-digit', minute: '2-digit' }),
  })
}
