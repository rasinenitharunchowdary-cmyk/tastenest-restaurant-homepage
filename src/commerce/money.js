export const DEFAULT_CURRENCY = 'USD'
export const DEFAULT_LOCALE = 'en-US'

/**
 * Convert a display price such as "$18.50", "18.50", or 18.5 into integer
 * cents. Keeping money in cents prevents the rounding drift that comes from
 * adding floating-point dollar values in the cart.
 */
export function toCents(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value * 100)

  if (typeof value === 'string') {
    const normalized = value.trim().replace(/[^0-9,.-]/g, '').replace(/,/g, '')
    const parsed = Number.parseFloat(normalized)
    if (Number.isFinite(parsed)) return Math.round(parsed * 100)
  }

  return 0
}

export function fromCents(cents) {
  const value = Number(cents)
  return Number.isFinite(value) ? Math.round(value) / 100 : 0
}

export function normalizeCents(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0
}

export function normalizeQuantity(value, { min = 0, max = 99 } = {}) {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) return min
  return Math.min(max, Math.max(min, parsed))
}

export function formatMoney(cents, { currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE } = {}) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(fromCents(cents))
}

// A plain-language alias for UI components.
export const formatCurrency = formatMoney

export function calculateLineTotal(item) {
  if (!item) return 0
  return normalizeCents(item.product?.priceCents ?? item.priceCents) * normalizeQuantity(item.quantity)
}

export function calculateOrderTotals(
  items,
  {
    taxRate = 0,
    deliveryFeeCents = 0,
    discountCents = 0,
  } = {},
) {
  const subtotalCents = Array.isArray(items)
    ? items.reduce((total, item) => total + calculateLineTotal(item), 0)
    : 0
  const safeDiscountCents = Math.min(subtotalCents, normalizeCents(discountCents))
  const taxableCents = Math.max(0, subtotalCents - safeDiscountCents)
  const safeTaxRate = Number.isFinite(Number(taxRate)) ? Math.max(0, Number(taxRate)) : 0
  const taxCents = Math.round(taxableCents * safeTaxRate)
  const safeDeliveryFeeCents = normalizeCents(deliveryFeeCents)

  return Object.freeze({
    subtotalCents,
    discountCents: safeDiscountCents,
    taxableCents,
    taxCents,
    deliveryFeeCents: safeDeliveryFeeCents,
    totalCents: taxableCents + taxCents + safeDeliveryFeeCents,
  })
}
