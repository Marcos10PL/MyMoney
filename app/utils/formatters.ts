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

  if (amount == null || (!amount && !includeZero)) return '--'

  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency,
    ...(fractionDigits != null && {
      minimumFractionDigits: 2,
      maximumFractionDigits: fractionDigits,
    }),
  }).format(amount)
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
