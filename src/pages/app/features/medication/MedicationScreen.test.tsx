import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppStoreProvider } from '../../state/store'
import { initialState } from '../../state/model'
import { CHECK_DELAY, MedicationScreen } from './MedicationScreen'
import { PHYSICIAN_REPLY_DELAY } from './usePhysicianReply'

// The Companion panel is its own feature; keep this test about medication review.
vi.mock('../companion/CompanionPanel', () => ({ CompanionPanel: () => null }))

describe('MedicationScreen', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
  afterEach(() => vi.useRealTimers())

  const setup = (initial = initialState) => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(
      <AppStoreProvider initial={initial}>
        <MedicationScreen />
      </AppStoreProvider>,
    )
    return user
  }

  it('walks from the automatic check to the treatment plan', async () => {
    const user = setup()
    expect(screen.getByText(/Checking Ketorolac 30 mg IV/)).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(CHECK_DELAY))
    expect(screen.getByText('Possible drug interaction, review needed')).toBeInTheDocument()
    expect(screen.getByText('Not sent yet')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Send to care team' }))
    expect(screen.getByText('Sent to care team')).toBeInTheDocument()
    expect(screen.getByText('Pending physician review')).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(PHYSICIAN_REPLY_DELAY))
    expect(screen.getByText('Dr. Patel replied')).toBeInTheDocument()
    // The shell bell picks up the unread notification too.
    expect(screen.getByRole('button', { name: 'Notifications, 1 unread' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'View' }))
    expect(screen.queryByText('Dr. Patel replied')).not.toBeInTheDocument()
    expect(screen.getByText('Not approved by physician')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add to treatment plan' }))
    expect(screen.getByText('Treatment plan updated at 21:53')).toBeInTheDocument()
    expect(screen.getByText('Acetaminophen 1 g by mouth')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View visit summary' })).toBeInTheDocument()
  })

  it('restarts the physician reply timer when coming back while the review is pending', () => {
    setup({ ...initialState, alex: { ...initialState.alex, medication: 'sent' } })
    expect(screen.getByText('Pending physician review')).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(PHYSICIAN_REPLY_DELAY))
    expect(screen.getByText('Dr. Patel replied')).toBeInTheDocument()
  })
})
