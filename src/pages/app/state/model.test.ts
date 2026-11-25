import { ALEX_ID } from './data'
import { hashToRoute, initialState, reducer, routeToHash } from './model'

describe('routing', () => {
  it('round-trips patient screens through the URL hash', () => {
    const route = { screen: 'chart' as const, patientId: ALEX_ID }
    expect(routeToHash(route)).toBe(`#/patients/${ALEX_ID}/chart`)
    expect(hashToRoute(routeToHash(route))).toEqual(route)
  })

  it('falls back to the dashboard for unknown hashes', () => {
    expect(hashToRoute('')).toEqual({ screen: 'dashboard' })
    expect(hashToRoute('#/patients/PT-1/nope')).toEqual({ screen: 'dashboard' })
  })
})

describe('reducer', () => {
  it('updates one patient status and leaves the others alone', () => {
    const next = reducer(initialState, { type: 'setPatientStatus', id: ALEX_ID, status: 'done' })
    expect(next.patients.find((p) => p.id === ALEX_ID)?.status).toBe('done')
    expect(next.patients.filter((p) => p.status === 'done')).toHaveLength(2)
  })

  it('replaces a notification with the same id instead of duplicating it', () => {
    const n = { id: 'x', title: 'T', body: 'B', route: { screen: 'dashboard' as const } }
    let s = reducer(initialState, { type: 'notify', notification: n })
    s = reducer(s, { type: 'notify', notification: n })
    expect(s.notifications).toHaveLength(1)
    expect(s.notifications[0]?.read).toBe(false)
  })
})
