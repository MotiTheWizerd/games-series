import { useEffect, useState } from 'react'

function readHash(): string {
  const h = window.location.hash.slice(1)
  return h || '/'
}

export function useHashRoute(): string {
  const [route, setRoute] = useState(readHash)
  useEffect(() => {
    const onHash = () => setRoute(readHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return route
}

export function navigate(to: string): void {
  window.location.hash = to
}
