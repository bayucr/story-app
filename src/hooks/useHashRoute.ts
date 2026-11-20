import { useCallback, useEffect, useState } from 'react'

export type Route = '/' | '/profile'

function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, '')
  return path === '/profile' ? '/profile' : '/'
}

export function useHashRoute() {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash))

  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = useCallback((to: Route) => {
    if (window.location.hash !== `#${to}`) window.location.hash = to
  }, [])

  return { route, navigate }
}
