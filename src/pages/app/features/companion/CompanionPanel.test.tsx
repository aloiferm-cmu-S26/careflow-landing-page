import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect } from 'react'
import { useAppStore } from '../../state/hooks'
import { AppStoreProvider } from '../../state/store'
import { CompanionPanel } from './CompanionPanel'
import { matchAnswer } from './companionContent'
import { resetCompanionStore } from './companionStore'

/** Stand-in for the shell: an opener button plus the panel, opened on mount. */
function Harness() {
  const { state, dispatch } = useAppStore()
  useEffect(() => dispatch({ type: 'setCompanion', companion: 'open' }), [dispatch])
  return (
    <>
      {state.companion !== 'open' ? (
        <button
          type="button"
          data-companion-opener
          onClick={() => dispatch({ type: 'setCompanion', companion: 'open' })}
        >
          Ask Companion
        </button>
      ) : null}
      <CompanionPanel />
    </>
  )
}

const renderPanel = () =>
  render(
    <AppStoreProvider>
      <Harness />
    </AppStoreProvider>,
  )

const ANSWER_WAIT = { timeout: 2000 }

describe('CompanionPanel', () => {
  beforeEach(() => act(() => resetCompanionStore()))

  it('answers a suggested prompt, shows its source and goes back', async () => {
    renderPanel()
    const user = userEvent.setup()
    const panel = screen.getByRole('dialog', { name: 'Nurse Companion' })
    expect(panel).toHaveFocus()

    await user.click(screen.getByRole('button', { name: 'What should I know about warfarin?' }))
    expect(screen.getByRole('status', { name: 'Companion is answering' })).toBeInTheDocument()
    expect(
      await screen.findByText(/Warfarin raises bleeding risk/, {}, ANSWER_WAIT),
    ).toBeInTheDocument()
    expect(screen.getByText('Source: FDA drug label · Warfarin (illustrative)')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'View source' }))
    expect(
      screen.getByRole('heading', { name: 'Warfarin · bleeding precautions' }),
    ).toBeInTheDocument()
    expect(screen.queryByLabelText('Ask a question')).not.toBeInTheDocument()
    const back = screen.getByRole('button', { name: 'Back to conversation' })
    expect(back).toHaveFocus()

    await user.click(back)
    expect(screen.getByRole('button', { name: 'View source' })).toHaveFocus()

    await user.click(screen.getByRole('button', { name: 'Ask another question' }))
    expect(screen.getByRole('heading', { name: 'Ask a clinical question' })).toBeInTheDocument()
  })

  it('matches typed questions and keeps the conversation for follow-ups', async () => {
    renderPanel()
    const user = userEvent.setup()
    const input = screen.getByLabelText('Ask a question')

    await user.type(input, 'What should I know about warfarin?{Enter}')
    await screen.findByText(/Warfarin raises bleeding risk/, {}, ANSWER_WAIT)

    await user.type(screen.getByLabelText('Ask a question'), 'What are its common side effects?')
    await user.click(screen.getByRole('button', { name: 'Send' }))
    expect(
      await screen.findByText(
        /More serious bleeding symptoms require prompt clinical attention/,
        {},
        ANSWER_WAIT,
      ),
    ).toBeInTheDocument()

    const conversation = screen.getByRole('list', { name: 'Conversation' })
    expect(within(conversation).getAllByRole('listitem')).toHaveLength(2)
  })

  it('minimizes to a reopen button, keeps the conversation, and closes with Escape', async () => {
    renderPanel()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Does Alex have any allergies?' }))
    await screen.findByText(/Penicillin allergy, recorded by Other hospital/, {}, ANSWER_WAIT)

    await user.click(screen.getByRole('button', { name: 'Minimize Companion' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    const reopen = screen.getByRole('button', { name: 'Reopen Nurse Companion' })
    expect(reopen).toHaveFocus()

    await user.click(reopen)
    expect(screen.getByText(/Penicillin allergy, recorded by Other hospital/)).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ask Companion' })).toHaveFocus()
  })
})

describe('matchAnswer', () => {
  it.each([
    ['Tell me about metformin', 'metformin'],
    ['What are the common side effects of metformin?', 'metforminSideEffects'],
    ['lisinopril?', 'lisinopril'],
    ['Is ketorolac ok?', 'ketorolac'],
    ['acetaminophen max', 'acetaminophen'],
    ['Why is warfarin with ketorolac a concern?', 'warfarinKetorolac'],
    ["Summarise Alex's history", 'history'],
    ["Should I stop this patient's warfarin?", 'boundaries'],
    ['What dose of ketorolac?', 'boundaries'],
    ['What is the exact protocol for this procedure at our hospital?', 'uncertain'],
  ])('%s -> %s', (question, expected) => {
    expect(matchAnswer(question)).toBe(expected)
  })
})
