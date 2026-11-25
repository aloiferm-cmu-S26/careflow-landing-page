import { useEffect } from 'react'
import { ALEX_ID } from '../../state/data'
import { useAppStore } from '../../state/hooks'

/** How long the simulated physician takes to answer, in ms. */
export const PHYSICIAN_REPLY_DELAY = 4000

export const PHYSICIAN_REPLY = {
  id: 'physician-reply',
  title: 'Dr. Patel replied',
  body: 'Medication review for Alex Morgan: do not give ketorolac. See the new order.',
}

/**
 * Pretends Dr. Patel answers a few seconds after the review is sent. The timer
 * only runs while this screen is open, so coming back to the screen with the
 * review still pending starts it again.
 */
export function usePhysicianReply() {
  const { state, dispatch } = useAppStore()
  const pending = state.alex.medication === 'sent'

  useEffect(() => {
    if (!pending) return
    const timer = window.setTimeout(() => {
      dispatch({
        type: 'notify',
        notification: { ...PHYSICIAN_REPLY, route: { screen: 'medication', patientId: ALEX_ID } },
      })
      dispatch({ type: 'updateAlex', patch: { medication: 'replied' } })
    }, PHYSICIAN_REPLY_DELAY)
    return () => window.clearTimeout(timer)
  }, [pending, dispatch])
}
