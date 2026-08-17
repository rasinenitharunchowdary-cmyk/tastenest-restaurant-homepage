import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import { getCatalogProduct } from './catalog.js'
import { calculateOrderTotals, normalizeQuantity } from './money.js'
import { completeOrder as createCompletedOrder } from './order.js'

export const CART_STORAGE_KEY = 'tastenest:cart:v1'
export const CART_MAX_QUANTITY = 99

const CartContext = createContext(null)

function getStorage() {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function normalizeCartItem(value, maxQuantity = CART_MAX_QUANTITY) {
  const product = getCatalogProduct(value?.product ?? value)
  const quantity = normalizeQuantity(value?.quantity ?? 1, { min: 1, max: maxQuantity })
  return product && quantity ? Object.freeze({ product, quantity }) : null
}

function readCart(storageKey, maxQuantity) {
  const storage = getStorage()
  if (!storage) return { items: [], lastOrder: null }

  try {
    const saved = JSON.parse(storage.getItem(storageKey) ?? '{}')
    const items = Array.isArray(saved.items)
      ? saved.items.map((item) => normalizeCartItem(item, maxQuantity)).filter(Boolean)
      : []
    return { items, lastOrder: saved.lastOrder ?? null }
  } catch {
    return { items: [], lastOrder: null }
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const existingItem = state.items.find((item) => item.product.id === action.product.id)
      const items = existingItem
        ? state.items.map((item) => item.product.id === action.product.id
          ? { ...item, quantity: normalizeQuantity(item.quantity + action.quantity, { min: 1, max: action.maxQuantity }) }
          : item)
        : [...state.items, { product: action.product, quantity: action.quantity }]
      return { ...state, items }
    }
    case 'quantity': {
      const quantity = normalizeQuantity(action.quantity, { min: 0, max: action.maxQuantity })
      return {
        ...state,
        items: quantity
          ? state.items.map((item) => item.product.id === action.productId ? { ...item, quantity } : item)
          : state.items.filter((item) => item.product.id !== action.productId),
      }
    }
    case 'remove':
      return { ...state, items: state.items.filter((item) => item.product.id !== action.productId) }
    case 'clear':
      return { ...state, items: [] }
    case 'complete':
      return { ...state, items: [], lastOrder: action.order }
    default:
      return state
  }
}

function makeInitialState({ storageKey, maxQuantity }) {
  return readCart(storageKey, maxQuantity)
}

export function CartProvider({
  children,
  storageKey = CART_STORAGE_KEY,
  maxQuantity = CART_MAX_QUANTITY,
  taxRate = 0,
  deliveryFeeCents = 0,
  discountCents = 0,
}) {
  const safeMaxQuantity = normalizeQuantity(maxQuantity, { min: 1, max: CART_MAX_QUANTITY })
  const [state, dispatch] = useReducer(cartReducer, { storageKey, maxQuantity: safeMaxQuantity }, makeInitialState)

  useEffect(() => {
    const storage = getStorage()
    if (!storage) return
    try {
      storage.setItem(storageKey, JSON.stringify({ version: 1, items: state.items, lastOrder: state.lastOrder }))
    } catch {
      // A disabled or full browser storage should never block ordering.
    }
  }, [state, storageKey])

  const addItem = useCallback((productOrId, quantity = 1) => {
    const product = getCatalogProduct(productOrId)
    const safeQuantity = normalizeQuantity(quantity, { min: 1, max: safeMaxQuantity })
    if (!product || !product.available || !safeQuantity) return false
    dispatch({ type: 'add', product, quantity: safeQuantity, maxQuantity: safeMaxQuantity })
    return true
  }, [safeMaxQuantity])

  const updateQuantity = useCallback((productOrId, quantity) => {
    const product = getCatalogProduct(productOrId)
    const productId = product?.id ?? String(productOrId ?? '')
    if (!productId) return
    dispatch({ type: 'quantity', productId, quantity, maxQuantity: safeMaxQuantity })
  }, [safeMaxQuantity])

  const removeItem = useCallback((productOrId) => {
    const product = getCatalogProduct(productOrId)
    const productId = product?.id ?? String(productOrId ?? '')
    if (!productId) return
    dispatch({ type: 'remove', productId })
  }, [])

  const clearCart = useCallback(() => dispatch({ type: 'clear' }), [])

  const completeCartOrder = useCallback((details = {}) => {
    const result = createCompletedOrder({
      ...details,
      items: state.items,
      taxRate: details.taxRate ?? taxRate,
      deliveryFeeCents: details.deliveryFeeCents ?? deliveryFeeCents,
      discountCents: details.discountCents ?? discountCents,
    })
    if (result.ok) dispatch({ type: 'complete', order: result.order })
    return result
  }, [deliveryFeeCents, discountCents, state.items, taxRate])

  const value = useMemo(() => {
    const totals = calculateOrderTotals(state.items, { taxRate, deliveryFeeCents, discountCents })
    const itemCount = state.items.reduce((count, item) => count + item.quantity, 0)

    return Object.freeze({
      items: state.items,
      itemCount,
      isEmpty: !itemCount,
      lastOrder: state.lastOrder,
      ...totals,
      addItem,
      updateQuantity,
      incrementItem: (productOrId) => {
        const item = state.items.find((candidate) => candidate.product.id === (getCatalogProduct(productOrId)?.id ?? productOrId))
        if (item) updateQuantity(item.product.id, item.quantity + 1)
        else addItem(productOrId)
      },
      decrementItem: (productOrId) => {
        const item = state.items.find((candidate) => candidate.product.id === (getCatalogProduct(productOrId)?.id ?? productOrId))
        if (item) updateQuantity(item.product.id, item.quantity - 1)
      },
      removeItem,
      clearCart,
      completeOrder: completeCartOrder,
    })
  }, [addItem, clearCart, completeCartOrder, deliveryFeeCents, discountCents, removeItem, state.items, state.lastOrder, taxRate, updateQuantity])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside a CartProvider.')
  return context
}
