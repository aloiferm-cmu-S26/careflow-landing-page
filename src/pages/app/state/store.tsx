import { useEffect, useMemo, useReducer } from 'react'
import type { ReactNode } from 'react'
import { StoreContext } from './hooks'
import { hashToRoute, initialState, reducer, routeToHash } from './model'
import type { AppState } from './model'

export function AppStoreProvider({
  children,
  initial = initialState,
}: {
  children: ReactNode
  initial?: AppState
}) {
  const [state, dispatch] = useReducer(reducer, initial, (s) => ({
    ...s,
    route: typeof window === 'undefined' ? s.route : hashToRoute(window.location.hash),
  }))

  useEffect(() => {
    const hash = routeToHash(state.route)
    if (window.location.hash !== hash) window.history.pushState(null, '', hash)
  }, [state.route])

  useEffect(() => {
    const onPop = () => dispatch({ type: 'navigate', route: hashToRoute(window.location.hash) })
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
