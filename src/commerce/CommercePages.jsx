import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CreditCard,
  MapPin,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import {
  catalog,
  catalogCategories,
  CART_MAX_QUANTITY,
  findCatalogProducts,
  formatCurrency,
  getProductBySlug,
  getRelatedProducts,
  useCart,
} from './index.js'

const homeChoices = [
  ['Home 1', '/home-1'],
  ['Home 2', '/home-2'],
  ['Home 3', '/home-3'],
  ['Home 4', '/home-4'],
  ['Home 5', '/home-5'],
  ['Home 6', '/home-6'],
  ['Home 7', '/home-7'],
  ['Home 8', '/home-8'],
  ['Home 9', '/home-9'],
  ['Home 10', '/home-10'],
  ['Home Coffee', '/home-coffee'],
]

function RouteLink({ to, onNavigate, className = '', children, ...props }) {
  return (
    <a
      className={className}
      href={to}
      onClick={(event) => {
        if (!onNavigate || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        event.preventDefault()
        onNavigate(to)
      }}
      {...props}
    >
      {children}
    </a>
  )
}

export function HomeDropdown({ onNavigate, className = '', label = 'Home' }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const panelId = useId()

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return (
    <div className={`tn-home-dropdown ${className}`} ref={rootRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {label} <ChevronDown size={14} aria-hidden="true" />
      </button>
      {open && (
        <div className="tn-home-dropdown__panel" id={panelId} role="menu" aria-label="Choose a home page">
          <p>Choose a Home</p>
          <div>
            {homeChoices.map(([label, path], index) => (
              <RouteLink
                key={path}
                to={path}
                onNavigate={(target) => {
                  setOpen(false)
                  onNavigate?.(target)
                }}
                role="menuitem"
              >
                <span>{String(index + 1).padStart(2, '0')}</span>{label}<ArrowUpRight size={13} />
              </RouteLink>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CommerceBrand({ onNavigate }) {
  return (
    <RouteLink className="tn-commerce-brand" to="/home-4" onNavigate={onNavigate} aria-label="TasteNest Home 4">
      <span><UtensilsCrossed size={17} /></span>
      <b>Taste<span>Nest</span><small>Fast food restaurant</small></b>
    </RouteLink>
  )
}

function CommerceHeader({ onNavigate, onOpenCart }) {
  const { itemCount } = useCart()
  return (
    <header className="tn-commerce-header">
      <div className="tn-commerce-shell tn-commerce-header__inner">
        <CommerceBrand onNavigate={onNavigate} />
        <nav aria-label="Restaurant navigation">
          <HomeDropdown onNavigate={onNavigate} />
          <RouteLink to="/menu" onNavigate={onNavigate}>Explore food</RouteLink>
          <RouteLink to="/cart" onNavigate={onNavigate}>Your order</RouteLink>
        </nav>
        <div className="tn-commerce-header__actions">
          <HomeDropdown className="tn-commerce-header__mobile-home" onNavigate={onNavigate} />
          <RouteLink className="tn-commerce-header__search" to="/menu" onNavigate={onNavigate} aria-label="Search food"><Search size={17} /></RouteLink>
          <button type="button" className="tn-commerce-header__cart" onClick={onOpenCart} aria-label={`Open cart with ${itemCount} items`}>
            <ShoppingBag size={18} /><span>{itemCount}</span>
          </button>
        </div>
      </div>
    </header>
  )
}

function ProductTile({ product, onNavigate }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const add = (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (!addItem(product)) return
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1300)
  }

  return (
    <article className="tn-product-tile">
      <RouteLink className="tn-product-tile__media" to={`/product/${product.id}`} onNavigate={onNavigate} aria-label={`View ${product.name}`}>
        <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
        {product.badge && <span>{product.badge}</span>}
        <i><ArrowUpRight size={17} /></i>
      </RouteLink>
      <div className="tn-product-tile__body">
        <small>{product.category}</small>
        <RouteLink to={`/product/${product.id}`} onNavigate={onNavigate}><h2>{product.name}</h2></RouteLink>
        <p>{product.description}</p>
        <footer>
          <strong>{formatCurrency(product.priceCents)}</strong>
          <button type="button" onClick={add} aria-label={`Add ${product.name} to cart`} className={added ? 'is-added' : ''}>
            {added ? <Check size={17} /> : <Plus size={17} />}<span>{added ? 'Added' : 'Add'}</span>
          </button>
        </footer>
      </div>
    </article>
  )
}

export function CatalogPage({ onNavigate, onOpenCart }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const visibleProducts = useMemo(
    () => findCatalogProducts(query, { category: category === 'All' ? undefined : category }),
    [category, query],
  )

  return (
    <div className="tn-commerce-page tn-catalog-page">
      <CommerceHeader onNavigate={onNavigate} onOpenCart={onOpenCart} />
      <main>
        <section className="tn-catalog-hero">
          <div className="tn-commerce-shell">
            <p>Made fresh / delivered hot</p>
            <h1>Explore <em>Food</em> Items</h1>
            <span>Choose a dish, see the full detail, and build your order at your own pace.</span>
          </div>
        </section>
        <section className="tn-catalog-controls tn-commerce-shell" aria-label="Explore menu controls">
          <label className="tn-search-input"><Search size={17} /><span className="tn-sr-only">Search food</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search burgers, pizza, chicken…" /></label>
          <div className="tn-category-tabs" role="tablist" aria-label="Food categories">
            {['All', ...catalogCategories].map((item) => <button key={item} type="button" role="tab" aria-selected={category === item} className={category === item ? 'is-active' : ''} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
        </section>
        <section className="tn-commerce-shell tn-catalog-grid" aria-live="polite">
          {visibleProducts.map((product) => <ProductTile product={product} onNavigate={onNavigate} key={product.id} />)}
          {!visibleProducts.length && <div className="tn-empty-search"><Search size={28} /><h2>Nothing matches that craving yet.</h2><button type="button" onClick={() => { setQuery(''); setCategory('All') }}>Clear filters</button></div>}
        </section>
      </main>
    </div>
  )
}

function QuantityControl({ value, onChange, label = 'Quantity' }) {
  const safeValue = Math.min(CART_MAX_QUANTITY, Math.max(1, value))
  return (
    <div className="tn-quantity" aria-label={label}>
      <button type="button" onClick={() => onChange(Math.max(1, safeValue - 1))} aria-label="Decrease quantity"><Minus size={15} /></button>
      <strong>{safeValue}</strong>
      <button type="button" onClick={() => onChange(Math.min(CART_MAX_QUANTITY, safeValue + 1))} aria-label="Increase quantity"><Plus size={15} /></button>
    </div>
  )
}

export function ProductDetailPage({ productId, onNavigate, onOpenCart }) {
  const product = getProductBySlug(productId)
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  if (!product) {
    return (
      <div className="tn-commerce-page tn-product-page">
        <CommerceHeader onNavigate={onNavigate} onOpenCart={onOpenCart} />
        <main className="tn-missing-product tn-commerce-shell"><PackageCheck size={42} /><p>Menu item unavailable</p><h1>That dish is off the menu.</h1><RouteLink to="/menu" onNavigate={onNavigate}>Explore food <ArrowRight size={17} /></RouteLink></main>
      </div>
    )
  }

  const related = getRelatedProducts(product, 4)
  const add = () => {
    if (!addItem(product, quantity)) return
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1400)
  }

  return (
    <div className="tn-commerce-page tn-product-page">
      <CommerceHeader onNavigate={onNavigate} onOpenCart={onOpenCart} />
      <main>
        <section className="tn-product-detail tn-commerce-shell">
          <RouteLink className="tn-back-link" to="/menu" onNavigate={onNavigate}><ArrowLeft size={16} /> Back to food items</RouteLink>
          <div className="tn-product-detail__grid">
            <div className="tn-product-detail__image"><img src={product.image} alt={product.name} fetchPriority="high" /><span>{product.badge || 'Kitchen favourite'}</span></div>
            <div className="tn-product-detail__content">
              <p>{product.category}</p>
              <h1>{product.name}</h1>
              <div className="tn-product-detail__rating">★★★★★ <span>{product.rating ?? 4.8} / 5 guest favourite</span></div>
              <strong>{formatCurrency(product.priceCents)}</strong>
              <p className="tn-product-detail__description">{product.description} We cook every order fresh, then pack it to travel hot and crisp.</p>
              <div className="tn-product-detail__notes"><span>Made to order</span><span>30 min delivery</span><span>Kitchen fresh</span></div>
              <div className="tn-product-detail__actions"><QuantityControl value={quantity} onChange={setQuantity} /><button type="button" onClick={add} className={added ? 'is-added' : ''}>{added ? <><Check size={18} /> Added to order</> : <><ShoppingBag size={18} /> Add to cart · {formatCurrency(product.priceCents * quantity)}</>}</button></div>
              <button type="button" className="tn-product-detail__open-cart" onClick={onOpenCart}>View cart <ArrowRight size={17} /></button>
            </div>
          </div>
        </section>
        <section className="tn-related tn-commerce-shell">
          <header><p>Keep exploring</p><h2>You might also like</h2></header>
          <div>{related.map((item) => <ProductTile product={item} onNavigate={onNavigate} key={item.id} />)}</div>
        </section>
      </main>
    </div>
  )
}

function CartLine({ item }) {
  const { incrementItem, decrementItem, removeItem } = useCart()
  return (
    <article className="tn-cart-line">
      <img src={item.product.image} alt="" />
      <div><small>{item.product.category}</small><h3>{item.product.name}</h3><strong>{formatCurrency(item.product.priceCents)}</strong></div>
      <QuantityControl value={item.quantity} onChange={(quantity) => {
        if (quantity > item.quantity) incrementItem(item.product.id)
        else if (quantity < item.quantity) decrementItem(item.product.id)
      }} label={`Quantity for ${item.product.name}`} />
      <b>{formatCurrency(item.product.priceCents * item.quantity)}</b>
      <button type="button" aria-label={`Remove ${item.product.name}`} onClick={() => removeItem(item.product.id)}><Trash2 size={16} /></button>
    </article>
  )
}

function CartSummary({ onNavigate, compact = false }) {
  const { subtotalCents, totalCents, itemCount } = useCart()
  return (
    <aside className={`tn-cart-summary ${compact ? 'tn-cart-summary--compact' : ''}`}>
      <p>Order summary</p>
      <div><span>Items ({itemCount})</span><b>{formatCurrency(subtotalCents)}</b></div>
      <div><span>Delivery</span><b>Calculated at checkout</b></div>
      <strong><span>Food total</span><b>{formatCurrency(totalCents)}</b></strong>
      <button type="button" disabled={!itemCount} onClick={() => onNavigate('/checkout')}>Checkout <ArrowRight size={17} /></button>
      <small><ShieldCheck size={14} /> Secure demo checkout · no charge is made</small>
    </aside>
  )
}

export function CartPage({ onNavigate, onOpenCart }) {
  const { items, itemCount } = useCart()
  return (
    <div className="tn-commerce-page tn-cart-page">
      <CommerceHeader onNavigate={onNavigate} onOpenCart={onOpenCart} />
      <main className="tn-cart-page__main tn-commerce-shell">
        <header><p>Your order</p><h1>Your <em>Cart</em></h1><span>{itemCount ? `${itemCount} item${itemCount === 1 ? '' : 's'} ready for the kitchen.` : 'Your order is ready when you are.'}</span></header>
        {items.length ? <div className="tn-cart-page__grid"><section>{items.map((item) => <CartLine item={item} key={item.product.id} />)}</section><CartSummary onNavigate={onNavigate} /></div> : <EmptyCart onNavigate={onNavigate} />}
      </main>
    </div>
  )
}

function EmptyCart({ onNavigate, compact = false }) {
  return <div className={`tn-empty-cart ${compact ? 'tn-empty-cart--compact' : ''}`}><ShoppingBag size={compact ? 30 : 44} /><h2>Your cart is hungry.</h2><p>Add something fresh from the menu and it will stay here while you explore.</p><RouteLink to="/menu" onNavigate={onNavigate}>Explore food <ArrowRight size={17} /></RouteLink></div>
}

export function CheckoutPage({ onNavigate, onOpenCart }) {
  const { items, subtotalCents, completeOrder } = useCart()
  const [fulfilment, setFulfilment] = useState('delivery')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = (event) => {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    const customer = {
      name: values.get('name'),
      email: values.get('email'),
      phone: values.get('phone'),
      address: fulfilment === 'delivery' ? values.get('address') : 'TasteNest pickup counter',
    }
    if (!customer.name || !customer.email || !customer.phone || (fulfilment === 'delivery' && !customer.address)) {
      setError('Please complete your contact and delivery details before confirming the order.')
      return
    }
    setSubmitting(true)
    const result = completeOrder({ customer, fulfilment, notes: values.get('notes'), deliveryFeeCents: fulfilment === 'delivery' ? 399 : 0 })
    if (!result.ok) {
      setSubmitting(false)
      setError(result.error)
      return
    }
    onNavigate(`/order-confirmation/${result.order.id}`)
  }

  return (
    <div className="tn-commerce-page tn-checkout-page">
      <CommerceHeader onNavigate={onNavigate} onOpenCart={onOpenCart} />
      <main className="tn-checkout-main tn-commerce-shell">
        <header><p>One more step</p><h1>Checkout <em>Details</em></h1><span>This is a fully interactive local checkout. It records a demo order only; no payment is processed.</span></header>
        {!items.length ? <EmptyCart onNavigate={onNavigate} /> : <form onSubmit={submit} className="tn-checkout-grid">
          <section className="tn-checkout-form">
            <fieldset><legend>How would you like it?</legend><div className="tn-fulfilment-options"><label className={fulfilment === 'delivery' ? 'is-selected' : ''}><input type="radio" name="fulfilment" checked={fulfilment === 'delivery'} onChange={() => setFulfilment('delivery')} /> <MapPin size={18} /><span><b>Delivery</b><small>Hot food to your door</small></span></label><label className={fulfilment === 'pickup' ? 'is-selected' : ''}><input type="radio" name="fulfilment" checked={fulfilment === 'pickup'} onChange={() => setFulfilment('pickup')} /> <PackageCheck size={18} /><span><b>Pickup</b><small>Collect from TasteNest</small></span></label></div></fieldset>
            <fieldset><legend>Contact details</legend><div className="tn-field-grid"><label>Full name<input name="name" autoComplete="name" placeholder="Your name" /></label><label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" /></label><label>Phone number<input name="phone" type="tel" autoComplete="tel" placeholder="+1 555 000 0000" /></label><label className={fulfilment === 'delivery' ? '' : 'is-muted'}>Delivery address<input name="address" autoComplete="street-address" disabled={fulfilment !== 'delivery'} placeholder={fulfilment === 'delivery' ? 'Street, apartment, area' : 'Pickup selected'} /></label></div></fieldset>
            <fieldset><legend>Payment & note</legend><label className="tn-payment-note"><CreditCard size={20} /><span><b>Payment on delivery / demo card</b><small>No real payment is collected in this frontend demo.</small></span></label><label>Kitchen note <textarea name="notes" rows="3" placeholder="Allergies, delivery instructions, or a note for the kitchen" /></label></fieldset>
            {error && <p className="tn-checkout-error" role="alert">{error}</p>}
          </section>
          <aside className="tn-checkout-summary"><p>Order summary</p>{items.map((item) => <div key={item.product.id}><span>{item.quantity}× {item.product.name}</span><b>{formatCurrency(item.product.priceCents * item.quantity)}</b></div>)}<div><span>Subtotal</span><b>{formatCurrency(subtotalCents)}</b></div><div><span>Delivery</span><b>{fulfilment === 'delivery' ? '$3.99' : 'Free pickup'}</b></div><strong><span>Total</span><b>{formatCurrency(subtotalCents + (fulfilment === 'delivery' ? 399 : 0))}</b></strong><button type="submit" disabled={submitting}>{submitting ? 'Confirming…' : <>Confirm demo order <ArrowRight size={17} /></>}</button><small><ShieldCheck size={14} /> Your details stay on this device.</small></aside>
        </form>}
      </main>
    </div>
  )
}

export function OrderConfirmationPage({ orderId, onNavigate, onOpenCart }) {
  const { lastOrder } = useCart()
  const order = lastOrder?.id === orderId ? lastOrder : null
  return (
    <div className="tn-commerce-page tn-confirmation-page">
      <CommerceHeader onNavigate={onNavigate} onOpenCart={onOpenCart} />
      <main className="tn-confirmation tn-commerce-shell">
        <div className="tn-confirmation__check"><Check size={40} /></div>
        <p>Order confirmed</p>
        <h1>Your food is<br /><em>on its way.</em></h1>
        {order ? <><span>Order <b>{order.id}</b> · {order.fulfilment === 'pickup' ? 'Pickup at TasteNest' : 'Delivery in about 30 minutes'}</span><section><h2>Receipt</h2>{order.items.map((item) => <div key={item.productId}><span>{item.quantity}× {item.name}</span><b>{formatCurrency(item.lineTotalCents)}</b></div>)}<strong><span>Total</span><b>{formatCurrency(order.totals.totalCents)}</b></strong></section></> : <span>Your confirmation has been saved locally. Start a fresh order whenever you are ready.</span>}
        <div><RouteLink to="/menu" onNavigate={onNavigate}>Order more food <ArrowRight size={17} /></RouteLink><RouteLink to="/home-4" onNavigate={onNavigate}>Back home</RouteLink></div>
      </main>
    </div>
  )
}

export function CommerceCartDrawer({ open, onClose, onNavigate }) {
  const { items, itemCount, subtotalCents } = useCart()
  useEffect(() => {
    if (!open) return undefined
    const closeOnEscape = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose, open])

  return (
    <>
      {open && <button className="tn-cart-backdrop" type="button" aria-label="Close cart" onClick={onClose} />}
      <aside className={`tn-cart-drawer ${open ? 'is-open' : ''}`} aria-label="Shopping cart" aria-hidden={!open} inert={open ? undefined : ''}>
        <header><div><small>Your order</small><h2>{itemCount ? `${itemCount} tasty item${itemCount === 1 ? '' : 's'}` : 'Your cart'}</h2></div><button type="button" onClick={onClose} aria-label="Close cart"><X size={19} /></button></header>
        <div className="tn-cart-drawer__body">{items.length ? items.map((item) => <CartLine item={item} key={item.product.id} />) : <EmptyCart onNavigate={(path) => { onClose(); onNavigate(path) }} compact />}</div>
        {items.length > 0 && <footer><div><span>Subtotal</span><b>{formatCurrency(subtotalCents)}</b></div><button type="button" onClick={() => { onClose(); onNavigate('/checkout') }}>Checkout <ArrowRight size={17} /></button><button type="button" onClick={() => { onClose(); onNavigate('/cart') }}>View full cart</button></footer>}
      </aside>
    </>
  )
}

export function isCommercePath(pathname) {
  return pathname === '/menu' || pathname === '/cart' || pathname === '/checkout' || pathname.startsWith('/product/') || pathname.startsWith('/order-confirmation/')
}

export const commerceTitles = {
  '/menu': 'Explore Food',
  '/cart': 'Your Cart',
  '/checkout': 'Checkout',
}

export { catalog }
