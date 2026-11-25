import { ALEX_ID, INITIAL_PATIENTS } from './data'
import type { Patient, PatientStatus } from './data'

/**
 * App-wide state for the prototype. Each feature keeps its own step-by-step UI
 * state locally; only facts other screens need to see live here (for example,
 * the patient header shows the allergy once history records are saved).
 */

export type Screen = 'dashboard' | 'history' | 'medication' | 'chart' | 'summary'
export type Filter = 'all' | PatientStatus
export type CompanionState = 'closed' | 'open' | 'minimized'
export type MedicationStatus = 'none' | 'sent' | 'replied' | 'added'

export interface Route {
  screen: Screen
  patientId?: string
}

export interface AlexProgress {
  /** Set when the patient taps their phone on Patient History. */
  identityConfirmed: boolean
  /** Allergies known to the chart, shown as a tag in the patient header. */
  allergies: string[]
  historySaved: boolean
  chartSaved: boolean
  medication: MedicationStatus
}

export interface AppNotification {
  id: string
  title: string
  body: string
  /** Where tapping the notification takes the nurse. */
  route: Route
  read: boolean
}

export interface AppState {
  route: Route
  filter: Filter
  patients: Patient[]
  alex: AlexProgress
  companion: CompanionState
  notifications: AppNotification[]
}

export type Action =
  | { type: 'navigate'; route: Route }
  | { type: 'setFilter'; filter: Filter }
  | { type: 'updateAlex'; patch: Partial<AlexProgress> }
  | { type: 'setPatientStatus'; id: string; status: PatientStatus }
  | { type: 'setCompanion'; companion: CompanionState }
  | { type: 'notify'; notification: Omit<AppNotification, 'read'> }
  | { type: 'readNotification'; id: string }
  | { type: 'reset' }

export const initialState: AppState = {
  route: { screen: 'dashboard' },
  filter: 'all',
  patients: INITIAL_PATIENTS,
  alex: {
    identityConfirmed: false,
    allergies: [],
    historySaved: false,
    chartSaved: false,
    medication: 'none',
  },
  companion: 'closed',
  notifications: [],
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'navigate':
      return { ...state, route: action.route }
    case 'setFilter':
      return { ...state, filter: action.filter }
    case 'updateAlex':
      return { ...state, alex: { ...state.alex, ...action.patch } }
    case 'setPatientStatus':
      return {
        ...state,
        patients: state.patients.map((p) =>
          p.id === action.id ? { ...p, status: action.status } : p,
        ),
      }
    case 'setCompanion':
      return { ...state, companion: action.companion }
    case 'notify':
      return {
        ...state,
        notifications: [
          { ...action.notification, read: false },
          ...state.notifications.filter((n) => n.id !== action.notification.id),
        ],
      }
    case 'readNotification':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.id ? { ...n, read: true } : n,
        ),
      }
    case 'reset':
      return initialState
  }
}

/* Hash routing: #/patients, #/patients/PT-00482/history, ... */

const SCREEN_SLUG: Record<Exclude<Screen, 'dashboard'>, string> = {
  history: 'history',
  medication: 'medication',
  chart: 'chart',
  summary: 'summary',
}

export function routeToHash(route: Route): string {
  if (route.screen === 'dashboard') return '#/patients'
  return `#/patients/${route.patientId ?? ALEX_ID}/${SCREEN_SLUG[route.screen]}`
}

export function hashToRoute(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (parts[0] !== 'patients' || parts.length < 3) return { screen: 'dashboard' }
  const screen = (Object.keys(SCREEN_SLUG) as Exclude<Screen, 'dashboard'>[]).find(
    (s) => SCREEN_SLUG[s] === parts[2],
  )
  return screen ? { screen, patientId: parts[1] } : { screen: 'dashboard' }
}
