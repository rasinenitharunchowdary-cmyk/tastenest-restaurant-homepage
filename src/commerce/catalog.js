import { menuItems } from '../data.js'
import { products as figmaProducts } from '../screens/screenData.js'
import { fromCents, toCents } from './money.js'

const homeFourProducts = [
  { id: 'h4-delicious-burger', name: 'Delicious Burger', category: 'Burger', price: '$59.00', old: '$76.00', image: '/assets/burger.webp', badge: '20% off' },
  { id: 'h4-grilled-chicken', name: 'Grilled Chicken', category: 'Chicken', price: '$54.00', old: '$72.00', image: '/assets/grilled-chicken.webp', badge: '25% off' },
  { id: 'h4-ruti-chicken', name: 'Ruti With Chicken', category: 'Chicken', price: '$49.00', old: '$69.00', image: '/assets/food-table.webp', badge: '15% off' },
  { id: 'h4-fast-food-combo', name: 'Fast Food Combo', category: 'Combo', price: '$64.00', old: '$84.00', image: '/assets/burger-fries.webp', badge: '20% off' },
  { id: 'h4-chicago-deep-pizza', name: 'Chicago Deep Pizza', category: 'Pizza', price: '$53.00', old: '$69.00', image: '/assets/cheese-pizza.webp', badge: '23% off' },
  { id: 'h4-chinese-pasta', name: 'Chinese Pasta', category: 'Pasta', price: '$39.00', old: '$49.00', image: '/assets/pasta.webp', badge: '15% off' },
  { id: 'h4-whopper-burger', name: 'Whopper Burger King', category: 'Burger', price: '$62.00', old: '$82.00', image: '/assets/burger-fries.webp', badge: '25% off' },
  { id: 'h4-ruti-beef', name: 'Ruti With Beef Slice', category: 'Grill', price: '$57.00', old: '$73.00', image: '/assets/tacos.webp', badge: '18% off' },
]

function slugify(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function displayPrice(product) {
  if (product?.priceCents != null) return fromCents(product.priceCents)
  return fromCents(toCents(product?.price))
}

/**
 * Turn products from the individual Figma screens into a consistent item shape.
 * The original price is preserved as a display-friendly dollar number and the
 * cart always uses the integer `priceCents` value.
 */
export function normalizeProduct(product, { source = 'custom', fallbackId } = {}) {
  if (!product || typeof product !== 'object') return null

  const name = String(product.name ?? product.title ?? 'TasteNest special').trim()
  const sourceId = product.id ?? fallbackId ?? slugify(name)
  const id = slugify(sourceId) || `${slugify(source)}-special`
  const priceCents = product.priceCents == null ? toCents(product.price) : Math.max(0, Math.round(Number(product.priceCents) || 0))
  const compareAtPriceCents = product.compareAtPriceCents == null
    ? toCents(product.old ?? product.oldPrice)
    : Math.max(0, Math.round(Number(product.compareAtPriceCents) || 0))

  return Object.freeze({
    id,
    source,
    name,
    slug: slugify(name),
    category: String(product.category ?? 'House special'),
    description: String(product.description ?? 'Prepared fresh by the TasteNest kitchen.'),
    image: String(product.image ?? '/assets/food-table.webp'),
    badge: String(product.badge ?? ''),
    rating: Number.isFinite(Number(product.rating)) ? Number(product.rating) : null,
    price: displayPrice({ ...product, priceCents }),
    priceCents,
    compareAtPriceCents: compareAtPriceCents > priceCents ? compareAtPriceCents : null,
    available: product.available !== false,
  })
}

function normalizeCollection(products, source) {
  return products
    .map((product, index) => normalizeProduct(product, {
      source,
      fallbackId: `${source}-${product?.id ?? (slugify(product?.name) || index + 1)}`,
    }))
    .filter(Boolean)
}

export const catalog = Object.freeze([
  ...normalizeCollection(figmaProducts, 'figma'),
  ...normalizeCollection(menuItems, 'main-menu'),
  ...normalizeCollection(homeFourProducts, 'home-4'),
])

const catalogById = new Map(catalog.map((product) => [product.id, product]))
const catalogByName = new Map(catalog.map((product) => [product.slug, product]))

export const catalogCategories = Object.freeze([
  ...new Set(catalog.map((product) => product.category)),
])

export function getCatalogProduct(productOrId) {
  if (typeof productOrId === 'string') {
    const key = slugify(productOrId)
    return catalogById.get(key) ?? catalogByName.get(key) ?? null
  }

  if (!productOrId || typeof productOrId !== 'object') return null
  const known = productOrId.id && catalogById.get(slugify(productOrId.id))
  return known ?? normalizeProduct(productOrId, { source: productOrId.source ?? 'custom' })
}

export function getProductBySlug(slug) {
  const key = slugify(slug)
  return catalogByName.get(key) ?? catalogById.get(key) ?? null
}

export function findCatalogProducts(query = '', { category, limit } = {}) {
  const normalizedQuery = String(query).trim().toLowerCase()
  const normalizedCategory = category ? String(category).toLowerCase() : ''
  const matches = catalog.filter((product) => {
    const categoryMatches = !normalizedCategory || product.category.toLowerCase() === normalizedCategory
    const text = `${product.name} ${product.category} ${product.description}`.toLowerCase()
    return categoryMatches && (!normalizedQuery || text.includes(normalizedQuery))
  })

  return typeof limit === 'number' ? matches.slice(0, Math.max(0, limit)) : matches
}

export function getRelatedProducts(productOrId, limit = 4) {
  const product = getCatalogProduct(productOrId)
  if (!product) return []

  const categoryMatches = catalog.filter((candidate) => candidate.id !== product.id && candidate.category === product.category)
  const fallbackMatches = catalog.filter((candidate) => candidate.id !== product.id && !categoryMatches.includes(candidate))
  return [...categoryMatches, ...fallbackMatches].slice(0, Math.max(0, limit))
}

export const FEATURED_PRODUCT_IDS = Object.freeze(catalog.slice(0, 8).map((product) => product.id))
