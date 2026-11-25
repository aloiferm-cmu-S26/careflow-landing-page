import { createContext, useContext } from 'react'
import type { Dispatch } from 'react'
import { ALEX_ID } from './data'
import type { Action, AppState, Screen } from './model'

export interface Store {
  state: AppState
  dispatch: Dispatch<Action>
}

export const StoreContext = createContext<Store | null>(null)

export function useAppStore(): Store {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useAppStore must be used inside AppStoreProvider')
  return store
}

/** Shortcut for the most common action. */
export function useNavigate() {
  const { dispatch } = useAppStore()
  return (screen: Screen, patientId: string = ALEX_ID) =>
    dispatch({ type: 'navigate', route: { screen, patientId } })
}
