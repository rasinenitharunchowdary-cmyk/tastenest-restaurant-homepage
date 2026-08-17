import { calculateOrderTotals, normalizeCents, normalizeQuantity } from './money.js'

export const ORDER_STATUS = Object.freeze({
  CONFIRMED: 'confirmed',
  EMPTY: 'empty',
})

function safeDate(value) {
  const parsed = value instanceof Date ? value : new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

function createOrderId(date = new Date()) {
  const timestamp = safeDate(date).toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `TN-${timestamp}-${suffix}`
}

function normalizeOrderItem(item) {
  const product = item?.product ?? item
  if (!product?.id || !product?.name) return null

  const quantity = normalizeQuantity(item.quantity ?? 1, { min: 1, max: 99 })
  const priceCents = normalizeCents(product.priceCents ?? item.priceCents)
  if (!quantity || !priceCents) return null

  return Object.freeze({
    productId: String(product.id),
    name: String(product.name),
    image: String(product.image ?? ''),
    category: String(product.category ?? ''),
    quantity,
    priceCents,
    lineTotalCents: priceCents * quantity,
  })
}

function normalizeCustomer(customer = {}) {
  return Object.freeze({
    name: String(customer.name ?? '').trim(),
    email: String(customer.email ?? '').trim(),
    phone: String(customer.phone ?? '').trim(),
    address: String(customer.address ?? '').trim(),
  })
}

/**
 * Creates a local confirmation receipt. It intentionally does not charge a
 * card or send a network request; a production payment provider can consume
 * the returned, serializable `order` object at the checkout boundary.
 */
export function completeOrder({
  items = [],
  customer,
  fulfilment = 'delivery',
  notes = '',
  currency = 'USD',
  taxRate = 0,
  deliveryFeeCents = 0,
  discountCents = 0,
  orderId,
  createdAt = new Date(),
} = {}) {
  const normalizedItems = Array.isArray(items) ? items.map(normalizeOrderItem).filter(Boolean) : []
  if (!normalizedItems.length) {
    return Object.freeze({
      ok: false,
      error: 'Your cart is empty. Add a dish before completing the order.',
      order: null,
    })
  }

  const normalizedDate = safeDate(createdAt)
  const totals = calculateOrderTotals(normalizedItems, { taxRate, deliveryFeeCents, discountCents })
  const order = Object.freeze({
    id: orderId || createOrderId(normalizedDate),
    status: ORDER_STATUS.CONFIRMED,
    createdAt: normalizedDate.toISOString(),
    currency,
    fulfilment: fulfilment === 'pickup' ? 'pickup' : 'delivery',
    notes: String(notes).trim(),
    customer: normalizeCustomer(customer),
    items: Object.freeze(normalizedItems),
    totals,
  })

  return Object.freeze({ ok: true, error: null, order })
}
