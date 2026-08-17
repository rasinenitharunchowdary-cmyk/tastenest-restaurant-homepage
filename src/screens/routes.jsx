/* This module intentionally exposes the route table alongside its route renderer. */
/* eslint-disable react-refresh/only-export-components */
import {
  Home1Screen,
  Home2Screen,
  Home3Screen,
  Home4Screen,
  Home6Screen,
  Home7Screen,
  Home8Screen,
  Home9Screen,
  Home10Screen,
  HomeCoffeeScreen,
  PurchaseScreen,
} from './FigmaScreens'

export const screenRoutes = Object.freeze([
  { id: 'purchase', frame: 'Purchase', path: '/designs', aliases: ['/purchase'], Component: PurchaseScreen },
  { id: 'home-1', frame: 'Home-1', path: '/home-1', aliases: [], Component: Home1Screen },
  { id: 'home-2', frame: 'Home-2', path: '/home-2', aliases: [], Component: Home2Screen },
  { id: 'home-3', frame: 'Home-3', path: '/home-3', aliases: [], Component: Home3Screen },
  { id: 'home-4', frame: 'Home-4', path: '/home-4', aliases: [], Component: Home4Screen },
  { id: 'home-6', frame: 'Home-6', path: '/home-6', aliases: [], Component: Home6Screen },
  { id: 'home-7', frame: 'Home-7', path: '/home-7', aliases: [], Component: Home7Screen },
  { id: 'home-8', frame: 'Home-8', path: '/home-8', aliases: [], Component: Home8Screen },
  { id: 'home-9', frame: 'Home-9', path: '/home-9', aliases: [], Component: Home9Screen },
  { id: 'home-10', frame: 'Home-10', path: '/home-10', aliases: [], Component: Home10Screen },
  { id: 'home-coffee', frame: 'Home coffee', path: '/home-coffee', aliases: [], Component: HomeCoffeeScreen },
])

export const screenRouteAliases = Object.freeze(
  Object.fromEntries(screenRoutes.flatMap((route) => route.aliases.map((alias) => [alias, route.path]))),
)

function normalizePath(pathname) {
  if (typeof pathname !== 'string' || !pathname) return '/'
  const cleanPath = pathname.split(/[?#]/, 1)[0]
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) return cleanPath.slice(0, -1)
  return cleanPath
}

export function matchFigmaScreen(pathname) {
  const requestedPath = normalizePath(pathname)
  const canonicalPath = screenRouteAliases[requestedPath] ?? requestedPath
  return screenRoutes.find((route) => route.path === canonicalPath) ?? null
}

export function FigmaScreenRouter({
  pathname = typeof window === 'undefined' ? '/' : window.location.pathname,
  onNavigate,
  onOpenCart,
}) {
  const route = matchFigmaScreen(pathname)
  if (!route) return null
  const Screen = route.Component
  return <Screen onNavigate={onNavigate} onOpenCart={onOpenCart} />
}
