import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'

const HomeFive = lazy(() => import('./App.jsx'))
const FigmaScreenRouter = lazy(() =>
  import('./screens/index.js').then((module) => ({ default: module.FigmaScreenRouter })),
)

const collectionPaths = new Set([
  '/designs',
  '/purchase',
  '/home-1',
  '/home-2',
  '/home-3',
  '/home-4',
  '/home-6',
  '/home-7',
  '/home-8',
  '/home-9',
  '/home-10',
  '/home-coffee',
])

const screenNames = {
  '/': 'Home 5',
  '/home-5': 'Home 5',
  '/designs': 'Homepage Collection',
  '/purchase': 'Homepage Collection',
  '/home-1': 'Home 1',
  '/home-2': 'Home 2',
  '/home-3': 'Home 3',
  '/home-4': 'Home 4',
  '/home-6': 'Home 6',
  '/home-7': 'Home 7',
  '/home-8': 'Home 8',
  '/home-9': 'Home 9',
  '/home-10': 'Home 10',
  '/home-coffee': 'Home Coffee',
}

function normalizePath(pathname) {
  if (!pathname || pathname === '/') return '/'
  return pathname.replace(/\/+$/, '') || '/'
}

function LoadingScreen() {
  return (
    <div className="route-loader" role="status" aria-live="polite">
      <span className="route-loader__mark" aria-hidden="true">T</span>
      <p>Preparing your table…</p>
    </div>
  )
}

function NotFound({ onNavigate }) {
  return (
    <main className="route-not-found">
      <p className="route-not-found__eyebrow">404 · Table not found</p>
      <h1>This page is not on tonight’s menu.</h1>
      <p>Explore every homepage from the original Figma collection or return to the featured design.</p>
      <div className="route-not-found__actions">
        <button type="button" onClick={() => onNavigate('/designs')}>View all designs</button>
        <button type="button" className="is-ghost" onClick={() => onNavigate('/')}>Go home</button>
      </div>
    </main>
  )
}

export default function AppRouter() {
  const [pathname, setPathname] = useState(() => normalizePath(window.location.pathname))

  const navigate = useCallback((nextPath) => {
    const url = new URL(nextPath, window.location.origin)
    const normalized = normalizePath(url.pathname)
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`
    const next = `${normalized}${url.search}${url.hash}`

    if (current !== next) window.history.pushState({}, '', next)
    setPathname(normalized)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  useEffect(() => {
    const onPopState = () => setPathname(normalizePath(window.location.pathname))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const screenName = screenNames[pathname]
  const metadata = useMemo(() => {
    if (!screenName) {
      return {
        title: 'Page not found | TasteNest',
        description: 'The requested TasteNest page could not be found.',
      }
    }
    return {
      title: `${screenName} | TasteNest Restaurant Collection`,
      description: `${screenName} from the responsive TasteNest restaurant homepage collection.`,
    }
  }, [screenName])

  useEffect(() => {
    document.title = metadata.title
    const description = document.querySelector('meta[name="description"]')
    description?.setAttribute('content', metadata.description)
  }, [metadata])

  useEffect(() => {
    const onDocumentClick = (event) => {
      const anchor = event.target.closest('a[data-route]')
      if (!anchor || event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const href = anchor.getAttribute('href')
      if (!href || !href.startsWith('/')) return
      event.preventDefault()
      navigate(href)
    }

    document.addEventListener('click', onDocumentClick)
    return () => document.removeEventListener('click', onDocumentClick)
  }, [navigate])

  let screen = <NotFound onNavigate={navigate} />
  if (pathname === '/' || pathname === '/home-5') screen = <HomeFive />
  if (collectionPaths.has(pathname)) {
    screen = <FigmaScreenRouter pathname={pathname} onNavigate={navigate} />
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      {screen}
    </Suspense>
  )
}
