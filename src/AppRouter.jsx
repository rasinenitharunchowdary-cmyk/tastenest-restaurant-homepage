import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronDown, Grid2X2, X } from 'lucide-react'
import { CartProvider } from './commerce/index.js'
import {
  CartPage,
  CatalogPage,
  CheckoutPage,
  CommerceCartDrawer,
  commerceTitles,
  OrderConfirmationPage,
  ProductDetailPage,
} from './commerce/CommercePages.jsx'

const HomeFour = lazy(() => import('./HomeFour.jsx'))
const HomeFive = lazy(() => import('./App.jsx'))
const FigmaScreenRouter = lazy(() =>
  import('./screens/index.js').then((module) => ({ default: module.FigmaScreenRouter })),
)

const routeEntries = [
  { path: '/purchase', label: 'Purchase', caption: 'Premium previews' },
  { path: '/home-1', label: 'Home 1', caption: 'Dark table' },
  { path: '/home-2', label: 'Home 2', caption: 'Airy collage' },
  { path: '/home-3', label: 'Home 3', caption: 'King burger' },
  { path: '/home-4', label: 'Home 4', caption: 'Red burger' },
  { path: '/home-5', label: 'Home 5', caption: 'TasteNest original' },
  { path: '/home-6', label: 'Home 6', caption: 'Pizza red' },
  { path: '/home-7', label: 'Home 7', caption: 'Pink chicken' },
  { path: '/home-8', label: 'Home 8', caption: 'White burger' },
  { path: '/home-9', label: 'Home 9', caption: 'Aqua feast' },
  { path: '/home-10', label: 'Home 10', caption: 'Dark teal' },
  { path: '/home-coffee', label: 'Home Coffee', caption: 'Coffee house' },
]

const routeNames = Object.fromEntries(routeEntries.map(({ path, label }) => [path, label]))

function normalizePath(pathname) {
  if (!pathname || pathname === '/') return '/'
  return pathname.replace(/\/+$/, '') || '/'
}

function decodeRouteSegment(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function LoadingScreen() {
  return (
    <div className="collection-loader" role="status" aria-live="polite">
      <span aria-hidden="true">TN</span>
      <p>Loading screen…</p>
    </div>
  )
}

function NotFound({ onNavigate }) {
  return (
    <main className="collection-not-found">
      <p>404 · SCREEN NOT FOUND</p>
      <h1>That template is not on the board.</h1>
      <button type="button" onClick={() => onNavigate('/designs')}>Open all screens</button>
    </main>
  )
}

function ScreenNavigator({ pathname, onNavigate }) {
  const [open, setOpen] = useState(false)
  const currentPath = pathname === '/' || pathname === '/designs' ? '/purchase' : pathname
  const current = routeEntries.find((entry) => entry.path === currentPath) ?? routeEntries[0]

  useEffect(() => {
    if (!open) return undefined
    const close = (event) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [open])

  return (
    <div className={`collection-switcher ${open ? 'is-open' : ''}`}>
      <button
        className="collection-switcher__toggle"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="screen-switcher-menu"
        onClick={() => setOpen((value) => !value)}
      >
        <Grid2X2 size={16} />
        <span><small>Figma screens</small>{current.label}</span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <div className="collection-switcher__panel" id="screen-switcher-menu" role="dialog" aria-label="Open a Figma screen">
          <div className="collection-switcher__head"><span>Restaurant UI collection</span><button type="button" onClick={() => setOpen(false)} aria-label="Close screen menu"><X size={16} /></button></div>
          <div className="collection-switcher__list">
            {routeEntries.map((entry, index) => (
              <button
                type="button"
                className={entry.path === currentPath ? 'is-current' : ''}
                key={entry.path}
                onClick={() => {
                  setOpen(false)
                  onNavigate(entry.path)
                }}
              >
                <span>{String(index).padStart(2, '0')}</span>
                <strong>{entry.label}</strong>
                <small>{entry.caption}</small>
              </button>
            ))}
          </div>
          <p>Every item opens as its own route.</p>
        </div>
      )}
    </div>
  )
}

function AppRouterContent() {
  const [pathname, setPathname] = useState(() => normalizePath(window.location.pathname))
  const [cartOpen, setCartOpen] = useState(false)

  const navigate = useCallback((nextPath) => {
    const url = new URL(nextPath, window.location.origin)
    const next = normalizePath(url.pathname)
    if (next !== normalizePath(window.location.pathname)) window.history.pushState({}, '', next)
    setPathname(next)
    setCartOpen(false)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  useEffect(() => {
    document.body.classList.toggle('tn-commerce-scroll-lock', cartOpen)
    return () => document.body.classList.remove('tn-commerce-scroll-lock')
  }, [cartOpen])

  useEffect(() => {
    const onPopState = () => setPathname(normalizePath(window.location.pathname))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const canonicalPath = pathname === '/' || pathname === '/designs' ? '/purchase' : pathname
  const productMatch = canonicalPath.match(/^\/product\/([^/]+)$/)
  const confirmationMatch = canonicalPath.match(/^\/order-confirmation\/([^/]+)$/)
  const pageName = routeNames[canonicalPath]
    ?? commerceTitles[canonicalPath]
    ?? (productMatch ? 'Food details' : confirmationMatch ? 'Order confirmed' : undefined)
  const metadata = useMemo(() => {
    if (!pageName) return { title: 'Screen not found | TasteNest', description: 'The requested TasteNest screen could not be found.' }
    return { title: `${pageName} | TasteNest Restaurant Collection`, description: `${pageName} from the complete TasteNest Figma collection.` }
  }, [pageName])

  useEffect(() => {
    document.title = metadata.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', metadata.description)
  }, [metadata])

  useEffect(() => {
    const onDocumentClick = (event) => {
      const anchor = event.target.closest('a[data-route]')
      if (!anchor || event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const href = anchor.getAttribute('href')
      if (!href?.startsWith('/')) return
      event.preventDefault()
      navigate(href)
    }
    document.addEventListener('click', onDocumentClick)
    return () => document.removeEventListener('click', onDocumentClick)
  }, [navigate])

  let screen = <NotFound onNavigate={navigate} />
  if (canonicalPath === '/menu') screen = <CatalogPage onNavigate={navigate} onOpenCart={() => setCartOpen(true)} />
  else if (canonicalPath === '/cart') screen = <CartPage onNavigate={navigate} onOpenCart={() => setCartOpen(true)} />
  else if (canonicalPath === '/checkout') screen = <CheckoutPage onNavigate={navigate} onOpenCart={() => setCartOpen(true)} />
  else if (productMatch) screen = <ProductDetailPage productId={decodeRouteSegment(productMatch[1])} onNavigate={navigate} onOpenCart={() => setCartOpen(true)} />
  else if (confirmationMatch) screen = <OrderConfirmationPage orderId={decodeRouteSegment(confirmationMatch[1])} onNavigate={navigate} onOpenCart={() => setCartOpen(true)} />
  else if (canonicalPath === '/home-4') screen = <HomeFour onNavigate={navigate} onOpenCart={() => setCartOpen(true)} />
  else if (canonicalPath === '/home-5') screen = <HomeFive onNavigate={navigate} onOpenCart={() => setCartOpen(true)} />
  else if (routeEntries.some((entry) => entry.path === canonicalPath && entry.path !== '/home-4' && entry.path !== '/home-5')) {
    screen = <FigmaScreenRouter pathname={canonicalPath} onNavigate={navigate} onOpenCart={() => setCartOpen(true)} />
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      {screen}
      {routeNames[canonicalPath] && <ScreenNavigator pathname={pathname} onNavigate={navigate} />}
      <CommerceCartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onNavigate={navigate} />
    </Suspense>
  )
}

export default function AppRouter() {
  return <CartProvider><AppRouterContent /></CartProvider>
}
